import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // API endpoint for Gemini image generation & editing
  app.post('/api/generate-image', async (req, res) => {
    try {
      const { prompt, aspectRatio = '16:9', inputImage } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel in AI Studio.' 
        });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Prepare contents payload: supports text-to-image or image-to-image (editing)
      let contentsPayload: any;
      if (inputImage) {
        let cleanData = inputImage;
        let mimeType = 'image/jpeg';
        if (inputImage.startsWith('data:')) {
          const match = inputImage.match(/^data:([^;]+);base64,(.*)$/);
          if (match) {
            mimeType = match[1];
            cleanData = match[2];
          }
        }
        contentsPayload = {
          parts: [
            {
              inlineData: {
                data: cleanData,
                mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        };
      } else {
        contentsPayload = {
          parts: [
            {
              text: prompt,
            },
          ],
        };
      }

      // Try image models in order of priority:
      // gemini-3.1-flash-image-preview -> gemini-3.1-flash-image -> gemini-3.1-flash-lite-image
      const modelsToTry = [
        'gemini-3.1-flash-image-preview',
        'gemini-3.1-flash-image',
        'gemini-3.1-flash-lite-image',
      ];

      let response: any = null;
      let lastError: any = null;
      let usedModel: string | null = null;

      for (const modelName of modelsToTry) {
        try {
          const config: any = {
            imageConfig: {
              aspectRatio: aspectRatio as any,
              ...(modelName !== 'gemini-3.1-flash-lite-image' ? { imageSize: '1K' } : {}),
            },
          };

          response = await ai.models.generateContent({
            model: modelName,
            contents: contentsPayload,
            config,
          });

          // Verify if response contains an image part
          const hasImagePart = response?.candidates?.[0]?.content?.parts?.some((p: any) => !!p.inlineData?.data);
          if (hasImagePart) {
            usedModel = modelName;
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`Model ${modelName} failed:`, err?.message || err);
        }
      }

      let imageUrl: string | null = null;
      if (response?.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            const mimeType = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!imageUrl) {
        const errMsg = lastError?.message || 'No image was returned by Gemini';
        const isQuota = errMsg.includes('429') || 
                        errMsg.includes('RESOURCE_EXHAUSTED') || 
                        errMsg.includes('Quota exceeded') ||
                        errMsg.includes('FreeTier');

        return res.status(isQuota ? 429 : 500).json({ 
          error: isQuota 
            ? 'Gemini image generation requires a paid API key or exceeded free-tier rate limits. You can still upload a custom photo or choose a curated automotive cover.' 
            : errMsg,
          isQuotaError: isQuota,
        });
      }

      return res.json({ imageUrl, model: usedModel });
    } catch (error: any) {
      console.error('Error in /api/generate-image:', error);
      const isQuota = (error?.message || '').includes('429') || 
                      (error?.message || '').includes('RESOURCE_EXHAUSTED') ||
                      (error?.message || '').includes('Quota exceeded');
      return res.status(isQuota ? 429 : 500).json({ 
        error: isQuota
          ? 'Gemini image generation requires a paid API key or exceeded free-tier rate limits. You can still upload a custom photo or choose a curated automotive cover.'
          : (error?.message || 'Failed to generate image with Gemini'),
        isQuotaError: isQuota
      });
    }
  });

  // Alias endpoint for image editing specifically
  app.post('/api/edit-image', async (req, res) => {
    // Forward to /api/generate-image logic
    req.url = '/api/generate-image';
    return app._router.handle(req, res, () => {});
  });

  // API endpoint for Rich URL Link Previews (YouTube & Websites)
  app.get('/api/link-preview', async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      if (!targetUrl) {
        return res.status(400).json({ error: 'url parameter is required' });
      }

      let parsed: URL;
      try {
        parsed = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
      } catch {
        return res.status(400).json({ error: 'Invalid URL provided' });
      }

      const fullUrl = parsed.toString();

      // 1. YouTube Detection
      const ytMatch = fullUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i);
      if (ytMatch) {
        const videoId = ytMatch[1];
        let ytTitle = 'YouTube Video';
        let author = 'YouTube';

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);
          const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(fullUrl)}&format=json`, {
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          if (oembedRes.ok) {
            const oembedData: any = await oembedRes.json();
            if (oembedData?.title) ytTitle = oembedData.title;
            if (oembedData?.author_name) author = oembedData.author_name;
          }
        } catch {
          // fallback to standard defaults on timeout
        }

        return res.json({
          type: 'youtube',
          url: fullUrl,
          youtubeId: videoId,
          title: ytTitle,
          description: author ? `Uploaded by ${author} • Watch on YouTube` : 'Watch on YouTube',
          image: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          domain: 'youtube.com',
        });
      }

      // 2. Generic Website OpenGraph scraper with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      try {
        const response = await fetch(fullUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; GascancoGarage/1.0; +https://gascanco.com)',
            'Accept': 'text/html,application/xhtml+xml',
          },
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          return res.json({
            type: 'website',
            url: fullUrl,
            title: parsed.hostname,
            domain: parsed.hostname,
            image: `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`,
          });
        }

        const html = await response.text();

        // Extract OG Title, Description, Image
        const getMeta = (property: string): string | undefined => {
          const match = html.match(new RegExp(`<meta[^>]+(?:property|name)=["'](?:og:)?${property}["'][^>]+content=["']([^"']+)["']`, 'i')) ||
                        html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:)?${property}["']`, 'i'));
          return match ? match[1].trim() : undefined;
        };

        const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = getMeta('title') || (titleTagMatch ? titleTagMatch[1].trim() : parsed.hostname);
        const description = getMeta('description');
        let image = getMeta('image');

        if (image && !image.startsWith('http')) {
          try {
            image = new URL(image, fullUrl).toString();
          } catch {
            image = undefined;
          }
        }

        return res.json({
          type: 'website',
          url: fullUrl,
          title,
          description,
          image: image || `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`,
          domain: parsed.hostname,
        });
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        return res.json({
          type: 'website',
          url: fullUrl,
          title: parsed.hostname,
          domain: parsed.hostname,
          image: `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`,
        });
      }
    } catch (error: any) {
      return res.status(500).json({ error: error?.message || 'Failed to parse link preview' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // In development, hook Vite middleware
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
