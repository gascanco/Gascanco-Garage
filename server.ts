import express from 'express';
import { createServer as createViteServer } from 'vite';
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
