import React, { useState, useRef, useEffect } from 'react';
import { 
  Vehicle, VehicleCategory, Owner, BuildUpdate, 
  GarageEvent, CommunityPost 
} from '../../types/garage';
import { ImageUploadDropzone } from '../common/ImageUploadDropzone';
import { 
  X, Check, ArrowRight, ArrowLeft, Camera, Sparkles, 
  Wrench, Calendar, BookOpen, MessageSquare, Car, MapPin, 
  Clock, Tag, Flame, Plus, ChevronRight, Upload, Loader2, 
  Image as ImageIcon, RefreshCw, RotateCcw, AlertCircle, 
  Wand2, Sliders, Trash2, Play, Link2, ExternalLink, Globe, Youtube
} from 'lucide-react';

export type AddModalMode = 'select' | 'event' | 'vehicle' | 'post';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Owner;
  vehicles: Vehicle[];
  onVehicleAdded: (newVehicle: Vehicle) => void;
  onVehicleUpdated?: (updatedVehicle: Vehicle) => void;
  editingVehicle?: Vehicle | null;
  onBuildUpdateAdded?: (payload: { vehicleId: string; update: BuildUpdate }) => void;
  onEventAdded?: (newEvent: GarageEvent) => void;
  onPostAdded?: (newPost: CommunityPost) => void;
  initialMode?: AddModalMode;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  vehicles,
  onVehicleAdded,
  onVehicleUpdated,
  editingVehicle = null,
  onBuildUpdateAdded,
  onEventAdded,
  onPostAdded,
  initialMode = 'select',
}) => {
  const [mode, setMode] = useState<AddModalMode>(initialMode);

  // ----------------------------------------------------
  // 1. VEHICLE FORM STATE (Universal: SXSs, 4 Wheelers, Motos, Semis, Trucks & Cars)
  // ----------------------------------------------------
  const [vehicleStep, setVehicleStep] = useState<1 | 2 | 3>(1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [trim, setTrim] = useState('');
  const [nickname, setNickname] = useState('');
  const [buildLocation, setBuildLocation] = useState(currentUser.location || '');
  const [category, setCategory] = useState<string>('Side-by-Side (SXS / UTV)');
  const [color, setColor] = useState('');
  const [engine, setEngine] = useState('');
  const [transmission, setTransmission] = useState('');
  const [drivetrain, setDrivetrain] = useState<string>('4WD / 4x4');
  const [horsepower, setHorsepower] = useState('');
  const [buildStatus, setBuildStatus] = useState<string>('Daily');

  // Photo uploads: Up to 5 photos with primary selection
  const [vehiclePhotos, setVehiclePhotos] = useState<string[]>([]);
  const [primaryPhotoIndex, setPrimaryPhotoIndex] = useState<number>(0);
  const [isVehiclePhotoDragOver, setIsVehiclePhotoDragOver] = useState(false);
  const vehiclePhotoInputRef = useRef<HTMLInputElement | null>(null);

  // Sync mode and prepopulate vehicle data or user's location when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingVehicle) {
        setMode('vehicle');
        setVehicleStep(1);
        setCategory(editingVehicle.category || 'Side-by-Side (SXS / UTV)');
        setYear(editingVehicle.year || new Date().getFullYear());
        setMake(editingVehicle.make || '');
        setModel(editingVehicle.model || '');
        setTrim(editingVehicle.trim || '');
        setNickname(editingVehicle.nickname || '');
        setBuildLocation(editingVehicle.owner?.location || currentUser.location || '');
        setBuildStatus(editingVehicle.buildStatus || 'Daily');
        setColor(editingVehicle.color || '');
        setEngine(editingVehicle.engine || '');
        setTransmission(editingVehicle.transmission || '');
        setDrivetrain(editingVehicle.drivetrain || '4WD / 4x4');
        setHorsepower(editingVehicle.horsepower || '');

        const photos = editingVehicle.galleryImages && editingVehicle.galleryImages.length > 0
          ? [...editingVehicle.galleryImages]
          : (editingVehicle.primaryImage ? [editingVehicle.primaryImage] : []);
        setVehiclePhotos(photos);

        const primaryIdx = editingVehicle.primaryImage ? photos.indexOf(editingVehicle.primaryImage) : 0;
        setPrimaryPhotoIndex(primaryIdx >= 0 ? primaryIdx : 0);
      } else {
        setMode(initialMode);
        setVehicleStep(1);
        setCategory('Side-by-Side (SXS / UTV)');
        setYear(new Date().getFullYear());
        setMake('');
        setModel('');
        setTrim('');
        setNickname('');
        setBuildLocation(currentUser.location || '');
        setBuildStatus('Daily');
        setColor('');
        setEngine('');
        setTransmission('');
        setDrivetrain('4WD / 4x4');
        setHorsepower('');
        setVehiclePhotos([]);
        setPrimaryPhotoIndex(0);
      }
    }
  }, [isOpen, editingVehicle, initialMode, currentUser.location]);

  // Close modal when pressing ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // ----------------------------------------------------
  // 2. COMMUNITY POST & VEHICLES STATE
  // ----------------------------------------------------
  const userVehicles = vehicles.filter(v => v.owner.id === currentUser.id);

  // ----------------------------------------------------
  // 3. EVENT FORM STATE
  // ----------------------------------------------------
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<GarageEvent['eventType']>('Car Meet');
  const [eventDate, setEventDate] = useState('Saturday, Nov 16, 2024');
  const [eventTime, setEventTime] = useState('8:00 AM PST');
  const [eventLocation, setEventLocation] = useState('Old Town Plaza, Costa Mesa, CA');
  const [eventDescription, setEventDescription] = useState('');
  const [eventImage, setEventImage] = useState('/src/assets/images/mazda_rx7_fd_1791130533675.jpg');

  // Cover Image Source: 'upload' | 'gemini' | 'presets'
  const [eventCoverSource, setEventCoverSource] = useState<'upload' | 'gemini' | 'presets'>('upload');
  const [geminiPrompt, setGeminiPrompt] = useState('Cinematic sunrise mountain canyon cruise with high-performance sports cars, golden hour rim lighting, photorealistic 8k automotive photography');
  const [geminiAspectRatio, setGeminiAspectRatio] = useState<'16:9' | '4:3' | '1:1'>('16:9');
  const [isGeneratingGemini, setIsGeneratingGemini] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = useState(false);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const [uploadFileSize, setUploadFileSize] = useState<string | null>(null);
  const [originalUploadedImage, setOriginalUploadedImage] = useState<string | null>(null);
  const [isCoverImageGemini, setIsCoverImageGemini] = useState(false);
  const [isCoverImageEdited, setIsCoverImageEdited] = useState(false);
  const [geminiModelUsed, setGeminiModelUsed] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Image editing state with Gemini
  const [isEditingWithGemini, setIsEditingWithGemini] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [showEditSection, setShowEditSection] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Category fallback images
  const EVENT_CATEGORY_FALLBACKS: Record<GarageEvent['eventType'], string> = {
    'Canyon Cruise': '/src/assets/images/mazda_rx7_fd_1791130533675.jpg',
    'Track Day': '/src/assets/images/porsche_911_gt3_1791130508631.jpg',
    'Cars & Coffee': '/src/assets/images/bmw_m3_e30_1791130544159.jpg',
    'Car Meet': '/src/assets/images/skyline_r34_gtr_1791130465206.jpg',
    'Drag Night': '/src/assets/images/ford_f100_ratrod_1791130497932.jpg',
    'Overland Trek': '/src/assets/images/tacoma_trd_pro_1791130486225.jpg',
    'Dyno Day': '/src/assets/images/subaru_wrx_sti_1791130523919.jpg',
  };

  // Process uploaded image file
  const processUploadedFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setGeminiError('Please select a valid image file (PNG, JPG, WEBP)');
      return;
    }

    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;
    
    setUploadFileName(file.name);
    setUploadFileSize(sizeStr);
    setIsCoverImageGemini(false);
    setIsCoverImageEdited(false);
    setGeminiError(null);
    setIsQuotaError(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setEventImage(event.target.result);
        setOriginalUploadedImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // File upload input change
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Generate cover image with Gemini
  const handleGenerateGeminiCover = async () => {
    if (!geminiPrompt.trim() || isGeneratingGemini) return;
    setIsGeneratingGemini(true);
    setGeminiError(null);
    setIsQuotaError(false);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: geminiPrompt.trim(),
          aspectRatio: geminiAspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setIsQuotaError(!!data.isQuotaError);
        throw new Error(data.error || 'Failed to generate image with Gemini');
      }

      if (data.imageUrl) {
        setEventImage(data.imageUrl);
        setIsCoverImageGemini(true);
        setIsCoverImageEdited(false);
        setGeminiModelUsed(data.model || 'gemini-3.1-flash-image-preview');
        setUploadFileName(null);
      } else {
        throw new Error('No image was returned from Gemini');
      }
    } catch (err: any) {
      console.error('Gemini image generation error:', err);
      setGeminiError(err.message || 'Error creating image with Gemini. Please try again or upload a photo.');
    } finally {
      setIsGeneratingGemini(false);
    }
  };

  // Edit image with Gemini (takes current eventImage as reference input and prompts for modifications)
  const handleEditImageWithGemini = async () => {
    if (!editPrompt.trim() || isEditingWithGemini || !eventImage) return;
    setIsEditingWithGemini(true);
    setGeminiError(null);
    setIsQuotaError(false);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: editPrompt.trim(),
          inputImage: eventImage,
          aspectRatio: geminiAspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setIsQuotaError(!!data.isQuotaError);
        throw new Error(data.error || 'Failed to edit image with Gemini');
      }

      if (data.imageUrl) {
        setEventImage(data.imageUrl);
        setIsCoverImageEdited(true);
        setGeminiModelUsed(data.model || 'gemini-3.1-flash-image-preview');
        setEditPrompt('');
      } else {
        throw new Error('No image was returned from Gemini');
      }
    } catch (err: any) {
      console.error('Gemini image editing error:', err);
      setGeminiError(err.message || 'Error editing image with Gemini. Please try again or upload a photo.');
    } finally {
      setIsEditingWithGemini(false);
    }
  };

  // Curated category fallback helper
  const handleApplyCuratedFallback = () => {
    const fallback = EVENT_CATEGORY_FALLBACKS[eventType] || '/src/assets/images/skyline_r34_gtr_1791130465206.jpg';
    setEventImage(fallback);
    setGeminiError(null);
    setIsQuotaError(false);
    setIsCoverImageGemini(false);
    setIsCoverImageEdited(false);
    setUploadFileName(null);
  };

  // Revert edited image back to original upload
  const handleRevertToOriginal = () => {
    if (originalUploadedImage) {
      setEventImage(originalUploadedImage);
      setIsCoverImageEdited(false);
      setGeminiError(null);
    }
  };

  // Auto-fill prompt from event title and location
  const handleSuggestPrompt = () => {
    const t = eventTitle.trim() || 'Automotive Meet & Cruise';
    const loc = eventLocation.trim() || 'scenic mountain road';
    setGeminiPrompt(`Cinematic wide-angle automotive photography of ${t} (${eventType}) at ${loc}. High performance modified sports cars, golden hour rim lighting, photorealistic 8k, automotive magazine style.`);
  };

  // ----------------------------------------------------
  // 4. POST FORM STATE (Title & Category removed per user brief)
  // ----------------------------------------------------
  const [postContent, setPostContent] = useState('');
  const [postVehicleId, setPostVehicleId] = useState<string>('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [detectedLinkPreview, setDetectedLinkPreview] = useState<CommunityPost['linkPreview'] | null>(null);
  const [dismissedUrl, setDismissedUrl] = useState<string | null>(null);
  const [isPostDragOver, setIsPostDragOver] = useState(false);
  const postFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // URL extraction helper
  const extractUrlFromText = (text: string): string | null => {
    const match = text.match(/https?:\/\/[^\s]+/i);
    return match ? match[0] : null;
  };

  // Live URL detection for YouTube video or Website thumbnail
  React.useEffect(() => {
    const foundUrl = extractUrlFromText(postContent);
    if (!foundUrl) {
      setDetectedLinkPreview(null);
      return;
    }

    if (foundUrl === dismissedUrl) {
      return;
    }

    try {
      const parsed = new URL(foundUrl);
      const ytMatch = foundUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i);
      if (ytMatch) {
        const videoId = ytMatch[1];
        setDetectedLinkPreview({
          type: 'youtube',
          url: foundUrl,
          youtubeId: videoId,
          title: 'YouTube Video',
          image: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          domain: 'youtube.com',
        });
      } else {
        setDetectedLinkPreview({
          type: 'website',
          url: foundUrl,
          title: parsed.hostname,
          domain: parsed.hostname,
          image: `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`,
        });

        // Enrich with server metadata
        fetch(`/api/link-preview?url=${encodeURIComponent(foundUrl)}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data && data.url === foundUrl) {
              setDetectedLinkPreview(data);
            }
          })
          .catch(() => {});
      }
    } catch {
      setDetectedLinkPreview(null);
    }
  }, [postContent, dismissedUrl]);

  // Handle multiple photo uploads
  const handlePostFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setPostImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  const handlePostDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsPostDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setPostImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePostImage = (index: number) => {
    setPostImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  // Handle adding vehicle photos up to 5
  const handleAddVehiclePhotos = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const currentCount = vehiclePhotos.length;
    const remainingSlots = 5 - currentCount;
    if (remainingSlots <= 0) return;

    const validFiles = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, remainingSlots);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          const res = e.target.result;
          setVehiclePhotos(prev => {
            if (prev.length >= 5) return prev;
            return [...prev, res];
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveVehiclePhoto = (indexToRemove: number) => {
    setVehiclePhotos(prev => prev.filter((_, idx) => idx !== indexToRemove));
    if (primaryPhotoIndex === indexToRemove) {
      setPrimaryPhotoIndex(0);
    } else if (primaryPhotoIndex > indexToRemove) {
      setPrimaryPhotoIndex(prev => prev - 1);
    }
  };

  // Helper for category fallback image if no photo uploaded
  const getDefaultCategoryImage = (cat: string): string => {
    if (cat.includes('SXS') || cat.includes('UTV')) {
      return '/src/assets/images/tacoma_trd_pro_1791130486225.jpg';
    }
    if (cat.includes('4-Wheeler') || cat.includes('ATV') || cat.includes('Motorcycle') || cat.includes('Dirt Bike')) {
      return '/src/assets/images/crf450r_supermoto_1791130569915.jpg';
    }
    if (cat.includes('Tractor') || cat.includes('Trailer') || cat.includes('Heavy') || cat.includes('Hauler')) {
      return '/src/assets/images/ford_f100_ratrod_1791130497932.jpg';
    }
    if (cat.includes('Truck') || cat.includes('4x4')) {
      return '/src/assets/images/jeep_cherokee_xj_1791130559160.jpg';
    }
    return '/src/assets/images/skyline_r34_gtr_1791130465206.jpg';
  };

  // Submit Vehicle
  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const primaryImg = vehiclePhotos[primaryPhotoIndex] || vehiclePhotos[0] || (editingVehicle ? editingVehicle.primaryImage : getDefaultCategoryImage(category));
    const otherPhotos = vehiclePhotos.filter((_, idx) => idx !== primaryPhotoIndex);
    const allGalleryImages = vehiclePhotos.length > 0 ? [primaryImg, ...otherPhotos] : [primaryImg];

    if (editingVehicle && onVehicleUpdated) {
      const updatedVehicle: Vehicle = {
        ...editingVehicle,
        year,
        make: make.trim() || editingVehicle.make,
        model: model.trim() || editingVehicle.model,
        trim: trim.trim(),
        nickname: nickname.trim() || undefined,
        color: color.trim() || editingVehicle.color,
        engine: engine.trim() || editingVehicle.engine,
        transmission: transmission.trim() || editingVehicle.transmission,
        drivetrain,
        horsepower: horsepower.trim() || undefined,
        primaryImage: primaryImg,
        galleryImages: allGalleryImages,
        owner: {
          ...editingVehicle.owner,
          location: buildLocation.trim() || editingVehicle.owner.location || currentUser.location || 'Local',
        },
        category: category as any,
        buildStatus: buildStatus.trim() || editingVehicle.buildStatus,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      onVehicleUpdated(updatedVehicle);
    } else {
      const newVehicle: Vehicle = {
        id: `veh-${Date.now()}`,
        year,
        make: make.trim() || 'Custom',
        model: model.trim() || 'Rig',
        trim: trim.trim(),
        nickname: nickname.trim() || undefined,
        color: color.trim() || 'Standard',
        engine: engine.trim() || 'Standard',
        transmission: transmission.trim() || 'Standard',
        drivetrain,
        horsepower: horsepower.trim() || undefined,
        primaryImage: primaryImg,
        galleryImages: allGalleryImages,
        owner: {
          ...currentUser,
          location: buildLocation.trim() || currentUser.location || 'Local',
        },
        category: category as any,
        buildStatus: buildStatus.trim() || 'Daily',
        viewsCount: 1,
        likesCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        visibility: 'public',
        modifications: [],
        buildUpdates: []
      };
      onVehicleAdded(newVehicle);
    }

    handleCloseModal();
  };

  // Submit Event
  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: GarageEvent = {
      id: `evt-${Date.now()}`,
      title: eventTitle.trim() || 'Gascanco Community Meet',
      eventType,
      date: eventDate.trim(),
      time: eventTime.trim(),
      location: eventLocation.trim(),
      description: eventDescription.trim() || 'Join fellow builders, racers, and enthusiasts for an open automotive meetup.',
      coverImage: eventImage.trim() || '/src/assets/images/mazda_rx7_fd_1791130533675.jpg',
      organizer: currentUser,
      attendeesCount: 1,
      isAttending: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (onEventAdded) {
      onEventAdded(newEvent);
    }
    handleCloseModal();
  };

  // Submit Post
  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() && postImages.length === 0) return;

    const taggedVehicle = userVehicles.find(v => v.id === postVehicleId);
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      content: postContent.trim(),
      author: currentUser,
      dateStr: 'Just now',
      imageUrl: postImages[0] || undefined,
      images: postImages.length > 0 ? postImages : undefined,
      linkPreview: detectedLinkPreview || undefined,
      vehicleId: postVehicleId || undefined,
      vehicleName: taggedVehicle ? `${taggedVehicle.year} ${taggedVehicle.make} ${taggedVehicle.model}` : undefined,
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString()
    };

    if (onPostAdded) {
      onPostAdded(newPost);
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setMode('select');
    setVehicleStep(1);
    setEventTitle('');
    setEventDescription('');
    setPostContent('');
    setPostVehicleId('');
    setPostImages([]);
    setDetectedLinkPreview(null);
    setDismissedUrl(null);
    setVehiclePhotos([]);
    setPrimaryPhotoIndex(0);
    onClose();
  };

  // Quick preset images for picker
  const PRESET_GALLERY_IMAGES = [
    { label: 'R34 Skyline GT-R', url: '/src/assets/images/skyline_r34_gtr_1791130465206.jpg' },
    { label: 'E30 M3 Track', url: '/src/assets/images/bmw_m3_e30_1791130544159.jpg' },
    { label: 'EF9 Civic Si', url: '/src/assets/images/civic_si_ef9_1791130474543.jpg' },
    { label: '911 GT3 Touring', url: '/src/assets/images/porsche_911_gt3_1791130508631.jpg' },
    { label: 'FD3S RX-7', url: '/src/assets/images/mazda_rx7_fd_1791130533675.jpg' },
    { label: 'Tacoma TRD Pro', url: '/src/assets/images/tacoma_trd_pro_1791130486225.jpg' },
    { label: 'F-100 Rat Rod', url: '/src/assets/images/ford_f100_ratrod_1791130497932.jpg' },
    { label: 'CRF450R Supermoto', url: '/src/assets/images/crf450r_supermoto_1791130569915.jpg' },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 animate-fade-in cursor-pointer"
      onClick={handleCloseModal}
    >
      <div 
        className={`relative w-full ${mode === 'select' ? 'max-w-md' : 'max-w-xl md:max-w-4xl'} max-h-[94dvh] sm:max-h-[90vh] flex flex-col border border-[#444444] bg-[#222222] text-white shadow-2xl overflow-hidden my-auto cursor-default`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ========================================================
            MODAL HEADER (Only shown when inside a specific action form)
           ======================================================== */}
        {mode !== 'select' && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#383838] bg-[#282828] shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 bg-[#C8102E]" />
              <h2 className="font-['Oswald'] text-lg sm:text-2xl font-bold uppercase tracking-wide text-white">
                {mode === 'event' && 'ADD AN EVENT'}
                {mode === 'vehicle' && (editingVehicle ? 'EDIT VEHICLE' : 'ADD A VEHICLE')}
                {mode === 'post' && 'ADD A POST'}
              </h2>
            </div>

            <button
              type="button"
              onClick={handleCloseModal}
              className="p-1.5 text-[#aaaaaa] hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
              title="Close"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* ========================================================
            MODE: SELECT (Simplified: Icon + Title, Vertically Stacked, Visible "X")
           ======================================================== */}
        {mode === 'select' && (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Clearly Visible Top Bar with "X" to close */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#383838] bg-[#282828] shrink-0">
              <span className="font-['Oswald'] text-base font-bold uppercase tracking-wider text-[#cccccc] flex items-center gap-2">
                <span className="w-2 h-2 bg-[#C8102E]" />
                Select Action
              </span>

              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 text-[#aaaaaa] hover:text-white transition-colors cursor-pointer"
                aria-label="Close modal"
                title="Close"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Vertically Stacked 4 Options - Icon & Title Only, Compact for mobile */}
            <div className="p-3.5 sm:p-6 flex flex-col gap-2.5 sm:gap-3 flex-1 overflow-y-auto">
              {/* Option 1: Add an Event */}
              <button
                type="button"
                onClick={() => setMode('event')}
                className="group w-full flex items-center justify-between p-3.5 sm:p-5 bg-[#282828] hover:bg-[#303030] border border-[#3d3d3d] hover:border-[#C8102E] transition-all cursor-pointer text-left"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2.5 sm:p-3 bg-[#1e1e1e] group-hover:bg-[#C8102E] text-[#C8102E] group-hover:text-white transition-colors">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="font-['Oswald'] text-lg sm:text-2xl font-bold uppercase tracking-wide text-white group-hover:text-[#C8102E] transition-colors">
                    Add an Event
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-[#666666] group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>

              {/* Option 2: Add a Vehicle */}
              <button
                type="button"
                onClick={() => setMode('vehicle')}
                className="group w-full flex items-center justify-between p-3.5 sm:p-5 bg-[#282828] hover:bg-[#303030] border border-[#3d3d3d] hover:border-[#C8102E] transition-all cursor-pointer text-left"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2.5 sm:p-3 bg-[#1e1e1e] group-hover:bg-[#C8102E] text-[#C8102E] group-hover:text-white transition-colors">
                    <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="font-['Oswald'] text-lg sm:text-2xl font-bold uppercase tracking-wide text-white group-hover:text-[#C8102E] transition-colors">
                    Add a Vehicle
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-[#666666] group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>

              {/* Option 3: Add a Post */}
              <button
                type="button"
                onClick={() => setMode('post')}
                className="group w-full flex items-center justify-between p-3.5 sm:p-5 bg-[#282828] hover:bg-[#303030] border border-[#3d3d3d] hover:border-[#C8102E] transition-all cursor-pointer text-left"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2.5 sm:p-3 bg-[#1e1e1e] group-hover:bg-[#C8102E] text-[#C8102E] group-hover:text-white transition-colors">
                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="font-['Oswald'] text-lg sm:text-2xl font-bold uppercase tracking-wide text-white group-hover:text-[#C8102E] transition-colors">
                    Add a Post
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-[#666666] group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            MODE: ADD AN EVENT
           ======================================================== */}
        {mode === 'event' && (
          <form onSubmit={handleEventSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
                {/* Left Column: Event Details */}
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#aaaaaa] mb-1.5">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={eventTitle}
                      onChange={e => setEventTitle(e.target.value)}
                      placeholder="e.g. Angeles Crest Sunrise Dawn Patrol & Coffee"
                      className="w-full bg-[#1c1c1c] border border-[#444444] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C8102E]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#aaaaaa] mb-1.5">
                        Event Category
                      </label>
                      <select
                        value={eventType}
                        onChange={e => {
                          const newType = e.target.value as GarageEvent['eventType'];
                          setEventType(newType);
                          if (!uploadFileName && !isCoverImageGemini && !isCoverImageEdited) {
                            setEventImage(EVENT_CATEGORY_FALLBACKS[newType] || eventImage);
                          }
                        }}
                        className="w-full bg-[#1c1c1c] border border-[#444444] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C8102E]"
                      >
                        <option value="Car Meet">Car Meet</option>
                        <option value="Canyon Cruise">Canyon Cruise</option>
                        <option value="Track Day">Track Day</option>
                        <option value="Cars & Coffee">Cars & Coffee</option>
                        <option value="Drag Night">Drag Night</option>
                        <option value="Overland Trek">Overland Trek</option>
                        <option value="Dyno Day">Dyno Day</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#aaaaaa] mb-1.5">
                        Date
                      </label>
                      <input
                        type="text"
                        required
                        value={eventDate}
                        onChange={e => setEventDate(e.target.value)}
                        placeholder="e.g. Saturday, Nov 16, 2024"
                        className="w-full bg-[#1c1c1c] border border-[#444444] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C8102E]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#aaaaaa] mb-1.5">
                        Meetup Time
                      </label>
                      <input
                        type="text"
                        required
                        value={eventTime}
                        onChange={e => setEventTime(e.target.value)}
                        placeholder="e.g. 7:00 AM PST"
                        className="w-full bg-[#1c1c1c] border border-[#444444] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C8102E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#aaaaaa] mb-1.5">
                        Location / Staging Point
                      </label>
                      <input
                        type="text"
                        required
                        value={eventLocation}
                        onChange={e => setEventLocation(e.target.value)}
                        placeholder="e.g. Shell Station, 4522 Angeles Crest Hwy, La Cañada, CA"
                        className="w-full bg-[#1c1c1c] border border-[#444444] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C8102E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#aaaaaa] mb-1.5">
                      Event Description & Route Itinerary
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={eventDescription}
                      onChange={e => setEventDescription(e.target.value)}
                      placeholder="Share details on the cruise pace, radio frequencies, meet etiquette, or breakfast stop..."
                      className="w-full bg-[#1c1c1c] border border-[#444444] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C8102E]"
                    />
                  </div>
                </div>

                {/* Right Column: Cover Image Section */}
                <div className="md:col-span-5 space-y-4 pt-3 md:pt-0 border-t md:border-t-0 border-[#383838]">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#C8102E]" />
                        Event Cover Image *
                      </label>
                      <p className="text-[11px] text-[#888888] font-mono mt-0.5">
                        Choose to upload your own photo or use Gemini AI to create one
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#aaaaaa] px-2 py-0.5 bg-[#1e1e1e] border border-[#3d3d3d]">
                        {geminiAspectRatio}
                      </span>
                    </div>
                  </div>

              {/* Source Switcher Buttons: Upload Photo | Create with Gemini | Presets */}
              <div className="grid grid-cols-3 gap-1 bg-[#1a1a1a] p-1 border border-[#3d3d3d]">
                <button
                  type="button"
                  onClick={() => {
                    setEventCoverSource('upload');
                    setGeminiError(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-['Oswald'] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    eventCoverSource === 'upload'
                      ? 'bg-[#C8102E] text-white shadow'
                      : 'text-[#aaaaaa] hover:text-white hover:bg-[#252525]'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEventCoverSource('gemini');
                    setGeminiError(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-['Oswald'] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    eventCoverSource === 'gemini'
                      ? 'bg-[#C8102E] text-white shadow'
                      : 'text-[#aaaaaa] hover:text-white hover:bg-[#252525]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Use Gemini AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEventCoverSource('presets');
                    setGeminiError(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-['Oswald'] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    eventCoverSource === 'presets'
                      ? 'bg-[#C8102E] text-white shadow'
                      : 'text-[#aaaaaa] hover:text-white hover:bg-[#252525]'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Presets</span>
                </button>
              </div>

              {/* Live Preview Banner */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#181818] border border-[#444444] shadow-inner group">
                <img
                  src={eventImage}
                  alt="Event Cover Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                
                {/* Source Badge overlay */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-black/85 text-white border border-[#444444] backdrop-blur-xs flex items-center gap-1.5">
                    {isCoverImageEdited ? (
                      <>
                        <Wand2 className="w-3 h-3 text-[#ff4d6a]" />
                        <span>Edited with Gemini AI</span>
                      </>
                    ) : isCoverImageGemini ? (
                      <>
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Created with Gemini AI</span>
                      </>
                    ) : uploadFileName ? (
                      <>
                        <Upload className="w-3 h-3 text-[#ff4d6a]" />
                        <span className="truncate max-w-[150px]">{uploadFileName}</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3 h-3 text-[#888888]" />
                        <span>Cover Preview</span>
                      </>
                    )}
                  </span>

                  {geminiModelUsed && (isCoverImageGemini || isCoverImageEdited) && (
                    <span className="px-1.5 py-0.5 text-[9px] font-mono text-[#bbbbbb] bg-[#1a1a1a]/90 border border-[#383838]">
                      {geminiModelUsed}
                    </span>
                  )}
                </div>

                {/* Event overlay preview */}
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs font-mono text-white/95">
                  <div className="truncate pr-2">
                    <span className="font-['Oswald'] uppercase font-bold text-sm block tracking-wide truncate">
                      {eventTitle || 'Your Event Title'}
                    </span>
                    <span className="text-[11px] text-[#cccccc] opacity-80">
                      {eventDate} • {eventTime}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-['Oswald'] font-bold uppercase bg-[#C8102E] text-white shrink-0 shadow">
                    {eventType}
                  </span>
                </div>
              </div>

              {/* Error / Quota Notice Banner */}
              {geminiError && (
                <div className="p-3.5 bg-red-950/40 border border-red-800/80 text-xs font-mono space-y-2">
                  <div className="flex items-start gap-2 text-red-200">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold">{geminiError}</p>
                      {isQuotaError && (
                        <p className="text-[11px] text-red-300/80 mt-1">
                          Gemini image models (such as gemini-3.1-flash-image-preview) require an enabled API key with billing/quota in AI Studio secrets.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-red-900/40">
                    <button
                      type="button"
                      onClick={handleApplyCuratedFallback}
                      className="px-3 py-1 bg-[#C8102E] hover:bg-[#e01334] text-white text-[11px] font-['Oswald'] uppercase font-bold tracking-wider cursor-pointer"
                    >
                      Use Curated {eventType} Cover
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEventCoverSource('upload');
                        setGeminiError(null);
                      }}
                      className="px-3 py-1 bg-[#252525] hover:bg-[#333333] border border-[#555555] text-white text-[11px] font-mono cursor-pointer"
                    >
                      Upload a Photo Instead
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 1: UPLOAD PHOTO
                 ======================================================== */}
              {eventCoverSource === 'upload' && (
                <div className="p-4 bg-[#1a1a1a] border border-[#3d3d3d] space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Drag & Drop Zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      isDragOver
                        ? 'border-[#C8102E] bg-[#C8102E]/10'
                        : 'border-[#444444] hover:border-[#C8102E] bg-[#222222]'
                    }`}
                  >
                    <Upload className="w-8 h-8 text-[#C8102E]" />
                    <p className="font-['Oswald'] text-sm sm:text-base uppercase text-white font-bold">
                      Click or drag & drop a photo from your device
                    </p>
                    <p className="text-xs text-[#888888] font-mono">
                      Supports JPG, PNG, WEBP (Recommended aspect ratio: 16:9)
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="mt-1 px-4 py-2 bg-[#C8102E] hover:bg-[#e01334] text-white font-['Oswald'] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload Photo / Camera</span>
                    </button>
                  </div>

                  {/* Upload info & Actions */}
                  {uploadFileName && (
                    <div className="flex items-center justify-between text-xs font-mono text-[#bbbbbb] px-1 bg-[#242424] p-2.5 border border-[#333333]">
                      <div className="flex items-center gap-2 truncate">
                        <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                        <span className="truncate">File: <strong className="text-white">{uploadFileName}</strong></span>
                        {uploadFileSize && <span className="text-[#777777]">({uploadFileSize})</span>}
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[#C8102E] hover:underline cursor-pointer"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadFileName(null);
                            setUploadFileSize(null);
                            setOriginalUploadedImage(null);
                            handleApplyCuratedFallback();
                          }}
                          className="text-[#888888] hover:text-white cursor-pointer"
                          title="Remove uploaded photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Edit Uploaded Photo with Gemini AI Feature */}
                  <div className="pt-3 border-t border-[#333333] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase text-[#cccccc] flex items-center gap-1.5 font-bold">
                        <Wand2 className="w-3.5 h-3.5 text-[#C8102E]" />
                        Edit Uploaded Photo with Gemini AI
                      </span>
                      {isCoverImageEdited && originalUploadedImage && (
                        <button
                          type="button"
                          onClick={handleRevertToOriginal}
                          className="text-[11px] font-mono text-[#888888] hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Revert to Original
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-[#888888] font-mono">
                      Enhance this photo with Gemini image-to-image editing (e.g. add lighting, weather, or film aesthetics).
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder="e.g. Add golden hour rim lighting and rain reflections on asphalt..."
                        className="flex-1 bg-[#222222] border border-[#444444] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8102E] font-sans"
                      />
                      <button
                        type="button"
                        disabled={isEditingWithGemini || !editPrompt.trim()}
                        onClick={handleEditImageWithGemini}
                        className="px-4 py-2 bg-[#C8102E] hover:bg-[#e01334] disabled:opacity-50 text-white font-['Oswald'] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                      >
                        {isEditingWithGemini ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Editing...</span>
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>Apply Edit</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Quick photo edit suggestions */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        'Golden hour rim lighting',
                        'Wet asphalt reflections',
                        'Vintage 90s film aesthetic',
                        'Night meet with neon glows',
                        'Motion blur track action',
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setEditPrompt(preset)}
                          className="px-2 py-0.5 text-[10px] font-mono bg-[#252525] hover:bg-[#333333] text-[#cccccc] hover:text-white border border-[#444444] transition-colors cursor-pointer"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 2: CREATE WITH GEMINI AI
                 ======================================================== */}
              {eventCoverSource === 'gemini' && (
                <div className="p-4 bg-[#1a1a1a] border border-[#3d3d3d] space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#cccccc] flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      GEMINI PROMPT (gemini-3.1-flash-image-preview)
                    </span>
                    <button
                      type="button"
                      onClick={handleSuggestPrompt}
                      className="text-[11px] font-mono text-[#C8102E] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Auto-fill from Event Details
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    value={geminiPrompt}
                    onChange={(e) => setGeminiPrompt(e.target.value)}
                    placeholder="Describe the automotive scene (e.g. sports cars driving at sunrise through winding canyon roads, 8k automotive photography...)"
                    className="w-full bg-[#222222] border border-[#444444] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8102E] font-sans"
                  />

                  {/* Aspect Ratio & Model config */}
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#888888]">Banner Ratio:</span>
                    <div className="flex items-center gap-1.5">
                      {(['16:9', '4:3', '1:1'] as const).map((ratio) => (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => setGeminiAspectRatio(ratio)}
                          className={`px-2.5 py-1 text-[10px] font-mono border transition-colors cursor-pointer ${
                            geminiAspectRatio === ratio
                              ? 'bg-[#C8102E] text-white border-[#C8102E]'
                              : 'bg-[#222222] text-[#888888] border-[#444444] hover:text-white'
                          }`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preset prompt inspiration pills */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#777777] uppercase block">
                      Quick automotive scene presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Sunrise Canyon Run',
                        'Track Day Paddock',
                        'Night Street Meet & Neons',
                        'Cars & Coffee Overlook',
                        'Overland Mountain Trail',
                        'Dyno Day Garage Pull'
                      ].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setGeminiPrompt(`Cinematic wide-angle ${chip.toLowerCase()} with modified performance sports cars, golden hour rim lighting, photorealistic 8k automotive photography`)}
                          className="px-2 py-0.5 text-[10px] font-mono bg-[#252525] hover:bg-[#333333] text-[#cccccc] hover:text-white border border-[#444444] transition-colors cursor-pointer"
                        >
                          + {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    type="button"
                    disabled={isGeneratingGemini || !geminiPrompt.trim()}
                    onClick={handleGenerateGeminiCover}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#C8102E] hover:bg-[#e01334] disabled:opacity-50 text-white font-['Oswald'] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {isGeneratingGemini ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating Cover with Gemini AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Generate Cover with Gemini</span>
                      </>
                    )}
                  </button>

                  {/* If image was created with Gemini, show follow-up edit option */}
                  {isCoverImageGemini && (
                    <div className="pt-3 border-t border-[#333333] space-y-2">
                      <span className="text-[11px] font-mono text-[#bbbbbb] flex items-center gap-1.5">
                        <Wand2 className="w-3 h-3 text-[#C8102E]" />
                        Refine / Edit this Generated Cover:
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editPrompt}
                          onChange={(e) => setEditPrompt(e.target.value)}
                          placeholder="e.g. Add headlights turned on, make background rain wetter..."
                          className="flex-1 bg-[#222222] border border-[#444444] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C8102E]"
                        />
                        <button
                          type="button"
                          disabled={isEditingWithGemini || !editPrompt.trim()}
                          onClick={handleEditImageWithGemini}
                          className="px-3 py-1.5 bg-[#333333] hover:bg-[#444444] text-white text-[11px] font-mono uppercase cursor-pointer shrink-0 disabled:opacity-50"
                        >
                          {isEditingWithGemini ? 'Refining...' : 'Refine'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================
                  TAB 3: PRESETS & CUSTOM URL
                 ======================================================== */}
              {eventCoverSource === 'presets' && (
                <div className="p-4 bg-[#1a1a1a] border border-[#3d3d3d] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#888888]">
                      Select from community garage photography:
                    </span>
                    <button
                      type="button"
                      onClick={handleApplyCuratedFallback}
                      className="text-[11px] font-mono text-[#C8102E] hover:underline cursor-pointer"
                    >
                      Use Default for {eventType}
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_GALLERY_IMAGES.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setEventImage(p.url);
                          setIsCoverImageGemini(false);
                          setIsCoverImageEdited(false);
                          setUploadFileName(null);
                        }}
                        className={`relative aspect-video border overflow-hidden cursor-pointer ${
                          eventImage === p.url ? 'border-[#C8102E] ring-1 ring-[#C8102E]' : 'border-[#444444] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
                </div>
              </div>
            </div>

            {/* Modal Action: Publish Event */}
            <div className="p-3 sm:p-4 border-t border-[#383838] bg-[#222222] shrink-0 flex items-center justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-[#C8102E] hover:bg-[#e01334] text-white text-xs font-['Oswald'] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Publish Event</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================
            MODE: ADD A POST
           ======================================================== */}
        {mode === 'post' && (
          <form onSubmit={handlePostSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto overscroll-contain">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
                {/* Left Column: Post Content & Metadata */}
                <div className="md:col-span-7 space-y-3 sm:space-y-4">
                  {/* Tag Vehicle (Swapped above or below) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-[#aaaaaa] flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-[#C8102E]" />
                        <span>Tag Vehicle From Your Garage (Optional)</span>
                      </label>
                    </div>
                    <select
                      value={postVehicleId}
                      onChange={e => setPostVehicleId(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#444444] px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#C8102E]"
                    >
                      <option value="">None / General Post</option>
                      {userVehicles.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.year} {v.make} {v.model} {v.trim ? `• ${v.trim}` : ''} {v.nickname ? `("${v.nickname}")` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Post Content */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-[#aaaaaa]">
                        Post Content *
                      </label>
                    </div>
                    <textarea
                      rows={5}
                      required
                      value={postContent}
                      onChange={e => setPostContent(e.target.value)}
                      placeholder="Share updates, project photos, technical discussions, or build progress..."
                      className="w-full bg-[#1c1c1c] border border-[#444444] px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#C8102E] leading-relaxed resize-none"
                    />
                  </div>

                  {/* Live Detected Link Preview (YouTube or Website) */}
                  {detectedLinkPreview && (
                    <div className="bg-[#181818] border border-[#C8102E]/60 p-2 sm:p-2.5 space-y-1.5 relative transition-all animate-fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-mono text-[#ff8080]">
                          {detectedLinkPreview.type === 'youtube' ? (
                            <>
                              <Youtube className="w-3.5 h-3.5 text-[#FF0000]" />
                              <span className="font-bold uppercase tracking-wider text-white text-[11px]">YouTube Video Recognized</span>
                            </>
                          ) : (
                            <>
                              <Globe className="w-3.5 h-3.5 text-[#3b82f6]" />
                              <span className="font-bold uppercase tracking-wider text-white text-[11px]">Website Link Recognized</span>
                            </>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setDismissedUrl(detectedLinkPreview.url);
                            setDetectedLinkPreview(null);
                          }}
                          className="text-[#888888] hover:text-white p-0.5 transition-colors cursor-pointer"
                          title="Dismiss link preview"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2.5 bg-[#202020] border border-[#333333] p-1.5 sm:p-2">
                        {detectedLinkPreview.image && (
                          <div className="relative w-20 sm:w-28 aspect-video bg-black flex-shrink-0 overflow-hidden border border-[#3d3d3d]">
                            <img
                              src={detectedLinkPreview.image}
                              alt={detectedLinkPreview.title || 'Preview'}
                              className="w-full h-full object-cover"
                            />
                            {detectedLinkPreview.type === 'youtube' && (
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full bg-[#C8102E] text-white flex items-center justify-center shadow-lg">
                                  <Play className="w-3 h-3 fill-white ml-0.5" />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="text-xs font-['Oswald'] font-bold text-white uppercase tracking-wider truncate">
                            {detectedLinkPreview.title || detectedLinkPreview.domain}
                          </div>
                          {detectedLinkPreview.description && (
                            <p className="text-[11px] text-[#aaaaaa] line-clamp-1 leading-relaxed">
                              {detectedLinkPreview.description}
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-[10px] font-mono text-[#888888] truncate">
                            <Link2 className="w-3 h-3 text-[#aaaaaa] shrink-0" />
                            <span className="truncate">{detectedLinkPreview.url}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Photo Upload Feature */}
                <div className="md:col-span-5 space-y-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-[#383838]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#aaaaaa] flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-[#C8102E]" />
                      <span>Attach Photos</span>
                    </label>
                    {postImages.length > 0 && (
                      <span className="text-[10px] font-mono text-[#4ade80]">
                        {postImages.length} {postImages.length === 1 ? 'photo' : 'photos'} attached
                      </span>
                    )}
                  </div>

                  {/* Hidden multi-file input */}
                  <input
                    ref={postFileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePostFilesUpload}
                    className="hidden"
                  />

                  {/* Dropzone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsPostDragOver(true);
                    }}
                    onDragLeave={() => setIsPostDragOver(false)}
                    onDrop={handlePostDrop}
                    onClick={() => postFileInputRef.current?.click()}
                    className={`border border-dashed p-4 sm:p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      isPostDragOver
                        ? 'border-[#C8102E] bg-[#C8102E]/10'
                        : 'border-[#444444] hover:border-[#888888] bg-[#1a1a1a]'
                    }`}
                  >
                    <Upload className="w-6 h-6 text-[#C8102E]" />
                    <span className="text-xs font-['Oswald'] font-bold uppercase tracking-wider text-white">
                      {postImages.length > 0 ? 'Upload More Photos' : 'Click to browse or drop photos'}
                    </span>
                    <span className="text-[10px] font-mono text-[#777777]">
                      PNG, JPG up to 10MB
                    </span>
                  </div>

                  {/* Uploaded Photos Gallery Grid */}
                  {postImages.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {postImages.map((imgUrl, index) => (
                          <div
                            key={index}
                            className="group relative aspect-[4/3] bg-black border border-[#3d3d3d] overflow-hidden"
                          >
                            <img
                              src={imgUrl}
                              alt={`Uploaded post photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {/* Index badge */}
                            <div className="absolute top-1 left-1 bg-black/80 text-[9px] font-mono px-1 py-0.5 text-white border border-[#444444]">
                              #{index + 1}
                            </div>
                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePostImage(index);
                              }}
                              className="absolute top-1 right-1 w-5 h-5 bg-[#C8102E] hover:bg-[#e01334] text-white flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                              title="Remove photo"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}

                        {/* Add More Photos Card */}
                        <button
                          type="button"
                          onClick={() => postFileInputRef.current?.click()}
                          className="aspect-[4/3] border border-dashed border-[#444444] hover:border-white bg-[#1e1e1e] hover:bg-[#252525] flex flex-col items-center justify-center gap-0.5 text-[#aaaaaa] hover:text-white transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#C8102E]" />
                          <span className="text-[9px] font-mono uppercase tracking-wider">Add More</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Action: Publish Post */}
            <div className="p-3 sm:p-4 border-t border-[#383838] bg-[#222222] shrink-0 flex items-center justify-end">
              <button
                type="submit"
                disabled={!postContent.trim() && postImages.length === 0}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#C8102E] hover:bg-[#e01334] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-['Oswald'] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Publish Post</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================
            MODE: ADD A VEHICLE (Simplified Single-Word Fields & Up to 5 Photos)
           ======================================================== */}
        {mode === 'vehicle' && (
          <form onSubmit={handleVehicleSubmit}>
            {/* Step Indicators */}
            <div className="flex border-b border-[#383838] bg-[#1f1f1f]">
              <button
                type="button"
                onClick={() => setVehicleStep(1)}
                className={`flex-1 py-2.5 text-center text-xs font-mono tracking-wider transition-colors border-r border-[#383838] ${
                  vehicleStep === 1 ? 'bg-[#292929] text-[#C8102E] font-bold' : 'text-[#888888] hover:text-white'
                }`}
              >
                1. BASIC
              </button>
              <button
                type="button"
                onClick={() => setVehicleStep(2)}
                className={`flex-1 py-2.5 text-center text-xs font-mono tracking-wider transition-colors border-r border-[#383838] ${
                  vehicleStep === 2 ? 'bg-[#292929] text-[#C8102E] font-bold' : 'text-[#888888] hover:text-white'
                }`}
              >
                2. SPECS
              </button>
              <button
                type="button"
                onClick={() => setVehicleStep(3)}
                className={`flex-1 py-2.5 text-center text-xs font-mono tracking-wider transition-colors ${
                  vehicleStep === 3 ? 'bg-[#292929] text-[#C8102E] font-bold' : 'text-[#888888] hover:text-white'
                }`}
              >
                3. PHOTOS
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[68vh] overflow-y-auto">
              {/* Step 1: Basic */}
              {vehicleStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#aaaaaa] mb-1.5">
                        Classification *
                      </label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full bg-[#1c1c1c] border border-[#444444] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C8102E]"
                      >
                        <option value="Side-by-Side (SXS / UTV)">Side-by-Side</option>
                        <option value="4-Wheeler (ATV / Quad)">4-Wheeler</option>
                        <option value="Motorcycle & Dirt Bike">Motorcycle</option>
                        <option value="Tractor Trailer & Heavy Hauler">Tractor-Trailer</option>
                        <option value="Truck, SUV & 4x4">Truck</option>
                        <option value="Car / Sports Car">Car</option>
                        <option value="Van, Kei & Utility">Utility</option>
                        <option value="Custom / Other Build">Custom</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-[#aaaaaa] mb-1.5">
                          Year *
                        </label>
                        <input
                          type="number"
                          required
                          min={1920}
                          max={2030}
                          value={year}
                          onChange={e => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                          placeholder="2024"
                          className="w-full bg-[#1c1c1c] border border-[#444444] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#C8102E]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-[#aaaaaa] mb-1.5">
                          Manufacturer *
                        </label>
                        <input
                          type="text"
                          required
                          value={make}
                          onChange={e => setMake(e.target.value)}
                          placeholder="Can-Am"
                          className="w-full bg-[#1c1c1c] border border-[#444444] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#C8102E]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-[#aaaaaa] mb-1.5">
                          Model *
                        </label>
                        <input
                          type="text"
                          required
                          value={model}
                          onChange={e => setModel(e.target.value)}
                          placeholder="Maverick"
                          className="w-full bg-[#1c1c1c] border border-[#444444] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#C8102E]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-[#aaaaaa] mb-1.5">
                          Trim
                        </label>
                        <input
                          type="text"
                          value={trim}
                          onChange={e => setTrim(e.target.value)}
                          placeholder="Turbo"
                          className="w-full bg-[#1c1c1c] border border-[#444444] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#C8102E]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-[#aaaaaa] mb-1.5">
                          Nickname
                        </label>
                        <input
                          type="text"
                          value={nickname}
                          onChange={e => setNickname(e.target.value)}
                          placeholder="Beast"
                          className="w-full bg-[#1c1c1c] border border-[#444444] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#C8102E]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#aaaaaa] mb-1.5">
                        Location
                      </label>
                      <input
                        type="text"
                        value={buildLocation}
                        onChange={e => setBuildLocation(e.target.value)}
                        placeholder="Phoenix, AZ"
                        className="w-full bg-[#1c1c1c] border border-[#444444] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C8102E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#aaaaaa] mb-1.5">
                        Status *
                      </label>
                      <input
                        type="text"
                        required
                        value={buildStatus}
                        onChange={e => setBuildStatus(e.target.value)}
                        placeholder="Daily"
                        className="w-full bg-[#1c1c1c] border border-[#444444] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C8102E]"
                      />
                    </div>

                    <div className="p-3.5 bg-[#1a1a1a] border border-[#383838] text-xs font-mono text-[#888888] space-y-1">
                      <span className="text-[#C8102E] font-bold block uppercase tracking-wider">
                        GARAGE REGISTRY TIP
                      </span>
                      <p className="text-[11px] leading-relaxed text-[#aaaaaa]">
                        Vehicles added here are featured in your personal Garage and discoverable in community builds.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Specs */}
              {vehicleStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#aaaaaa] mb-1.5">
                        Engine
                      </label>
                      <input
                        type="text"
                        value={engine}
                        onChange={e => setEngine(e.target.value)}
                        placeholder="Rotax"
                        className="w-full bg-[#1c1c1c] border border-[#444444] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C8102E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#aaaaaa] mb-1.5">
                        Horsepower
                      </label>
                      <input
                        type="text"
                        value={horsepower}
                        onChange={e => setHorsepower(e.target.value)}
                        placeholder="200hp"
                        className="w-full bg-[#1c1c1c] border border-[#444444] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C8102E]"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#aaaaaa] mb-1.5">
                        Transmission
                      </label>
                      <input
                        type="text"
                        value={transmission}
                        onChange={e => setTransmission(e.target.value)}
                        placeholder="CVT"
                        className="w-full bg-[#1c1c1c] border border-[#444444] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C8102E]"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-[#aaaaaa] mb-1.5">
                          Drivetrain
                        </label>
                        <select
                          value={drivetrain}
                          onChange={e => setDrivetrain(e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#444444] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#C8102E]"
                        >
                          <option value="4WD / 4x4">4WD</option>
                          <option value="AWD">AWD</option>
                          <option value="RWD">RWD</option>
                          <option value="6x4 Tandem">6x4</option>
                          <option value="6x6 / 8x8">6x6</option>
                          <option value="Chain / Belt">Chain</option>
                          <option value="Shaft Drive">Shaft</option>
                          <option value="FWD">FWD</option>
                          <option value="Custom Drive">Custom</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-[#aaaaaa] mb-1.5">
                          Color
                        </label>
                        <input
                          type="text"
                          value={color}
                          onChange={e => setColor(e.target.value)}
                          placeholder="Black"
                          className="w-full bg-[#1c1c1c] border border-[#444444] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#C8102E]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Photos (Strictly Photos, up to 5, choose primary) */}
              {vehicleStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#383838] pb-3">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-white font-bold">
                        Photos
                      </label>
                      <p className="text-[11px] font-mono text-[#888888] mt-0.5">
                        Upload up to 5 photos. Select which one is primary.
                      </p>
                    </div>
                    <span className="text-xs font-mono text-[#aaaaaa] bg-[#1a1a1a] px-2.5 py-1 border border-[#3d3d3d]">
                      {vehiclePhotos.length} / 5
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start">
                    {/* Single Upload & Drag n' Drop Box */}
                    <div className={vehiclePhotos.length > 0 ? "md:col-span-5 space-y-3" : "md:col-span-12"}>
                      {vehiclePhotos.length < 5 ? (
                        <div>
                          <input
                            ref={vehiclePhotoInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                              handleAddVehiclePhotos(e.target.files);
                              if (e.target) e.target.value = '';
                            }}
                            className="hidden"
                          />
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsVehiclePhotoDragOver(true);
                            }}
                            onDragLeave={() => setIsVehiclePhotoDragOver(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsVehiclePhotoDragOver(false);
                              handleAddVehiclePhotos(e.dataTransfer.files);
                            }}
                            onClick={() => vehiclePhotoInputRef.current?.click()}
                            className={`border-2 border-dashed p-6 sm:p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                              isVehiclePhotoDragOver
                                ? 'border-[#C8102E] bg-[#C8102E]/10'
                                : 'border-[#444444] hover:border-[#C8102E] bg-[#1a1a1a] hover:bg-[#202020]'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[#C8102E]">
                              <Upload className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-['Oswald'] font-bold uppercase tracking-wider text-white">
                              Drop photos here or tap to upload
                            </span>
                            <span className="text-[11px] font-mono text-[#888888]">
                              {vehiclePhotos.length === 0 ? 'Upload up to 5 photos' : `Add up to ${5 - vehiclePhotos.length} more`}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-[#1a1a1a] border border-[#383838] text-center text-xs font-mono text-[#10b981]">
                          <Check className="w-5 h-5 mx-auto mb-1" />
                          <span>Maximum 5 photos uploaded</span>
                        </div>
                      )}
                    </div>

                    {/* Uploaded Photos Grid with Primary Selector and Remove */}
                    {vehiclePhotos.length > 0 && (
                      <div className="md:col-span-7 space-y-2">
                        <span className="text-[11px] font-mono uppercase text-[#aaaaaa] block mb-1">
                          Tap a photo to set it as Primary cover:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {vehiclePhotos.map((photo, index) => {
                            const isPrimary = primaryPhotoIndex === index;
                            return (
                              <div
                                key={index}
                                onClick={() => setPrimaryPhotoIndex(index)}
                                className={`group relative aspect-[4/3] bg-black border-2 overflow-hidden transition-all cursor-pointer ${
                                  isPrimary
                                    ? 'border-[#C8102E] ring-2 ring-[#C8102E]/50'
                                    : 'border-[#3d3d3d] hover:border-[#888888]'
                                }`}
                              >
                                <img
                                  src={photo}
                                  alt={`Vehicle photo ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />

                                {/* Primary Badge */}
                                {isPrimary ? (
                                  <div className="absolute top-1.5 left-1.5 bg-[#C8102E] text-white text-[10px] font-['Oswald'] font-bold uppercase tracking-wider px-2 py-0.5 shadow flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    <span>PRIMARY</span>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPrimaryPhotoIndex(index);
                                    }}
                                    className="absolute top-1.5 left-1.5 bg-black/75 hover:bg-[#C8102E] text-white text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 border border-white/20 transition-colors"
                                  >
                                    Set Primary
                                  </button>
                                )}

                                {/* Remove Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveVehiclePhoto(index);
                                  }}
                                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/80 hover:bg-[#C8102E] text-white flex items-center justify-center transition-colors shadow"
                                  title="Remove photo"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>

                                {/* Bottom index marker */}
                                <div className="absolute bottom-1 right-1 bg-black/80 text-[9px] font-mono px-1 py-0.5 text-[#aaaaaa]">
                                  #{index + 1}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step Controls */}
            <div className={`p-3 sm:px-6 sm:py-4 border-t border-[#383838] bg-[#282828] shrink-0 flex items-center ${vehicleStep > 1 ? 'justify-between' : 'justify-end'} gap-2`}>
              {vehicleStep > 1 && (
                <button
                  type="button"
                  onClick={() => setVehicleStep((vehicleStep - 1) as 1 | 2)}
                  className="px-4 py-2 text-xs font-mono text-[#aaaaaa] hover:text-white border border-[#444444] hover:border-white transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Previous
                </button>
              )}

              {vehicleStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setVehicleStep((vehicleStep + 1) as 2 | 3)}
                  className="px-6 py-2.5 bg-[#C8102E] hover:bg-[#e01334] text-white text-xs font-['Oswald'] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#C8102E] hover:bg-[#e01334] text-white text-xs font-['Oswald'] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  Finish
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
