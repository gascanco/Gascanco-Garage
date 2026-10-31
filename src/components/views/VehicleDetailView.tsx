import React, { useState, useMemo, useRef } from 'react';
import { 
  Vehicle, Owner, PostComment, BuildCrewOrSponsor, isHardAdmin,
  Modification, ModificationCategory, ModInstallStatus, PhotoMilestone,
  BuildUpdate
} from '../../types/garage';
import { 
  ArrowLeft, Share2, Wrench, ShieldCheck, Heart, ThumbsDown, 
  MapPin, Calendar, Gauge, Camera, Plus, ExternalLink, Trash2, 
  Check, Star, Sparkles, MessageSquare, BookOpen, Pencil, Link2,
  Zap, Disc, Sliders, CheckCircle2, Clock, AlertCircle, ChevronDown,
  Upload, Layers, X, ChevronLeft, ChevronRight, Image as ImageIcon
} from 'lucide-react';
import { ThreadedComments } from '../common/ThreadedComments';

interface VehicleDetailViewProps {
  vehicle: Vehicle;
  currentUser: Owner;
  onBack: () => void;
  onSelectOwner: (ownerId: string) => void;
  onEditVehicle: (vehicleId: string) => void;
  onUpdateVehicle?: (updatedVehicle: Vehicle) => void;
  onDeleteVehicle?: (vehicleId: string) => void;
  onAddUpdate?: (vehicleId: string) => void;
  onLikeToggle: (vehicleId: string) => void;
  onDislikeToggle?: (vehicleId: string) => void;
  isLiked: boolean;
  isDisliked?: boolean;
  onSelectRelated: (vehicleId: string) => void;
  allVehicles: Vehicle[];
  comments?: PostComment[];
  onAddComment?: (comment: Omit<PostComment, 'id' | 'createdAt'>) => void;
  onUpdateComment?: (commentId: string, content: string, photoUrl?: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onSetAsSpotlight?: (vehicleId: string) => void;
  isCurrentSpotlight?: boolean;
}

export const VehicleDetailView: React.FC<VehicleDetailViewProps> = ({
  vehicle,
  currentUser,
  onBack,
  onSelectOwner,
  onEditVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  onAddUpdate,
  onLikeToggle,
  onDislikeToggle,
  isLiked,
  isDisliked = false,
  onSelectRelated,
  allVehicles,
  comments = [],
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onSetAsSpotlight,
  isCurrentSpotlight = false,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'sheet' | 'photos' | 'updates' | 'about' | 'discussion'>('sheet');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFollowing, setIsFollowing] = useState(vehicle.owner.isFollowing || false);

  // Mod category filter
  const [selectedModCategory, setSelectedModCategory] = useState<string>('All');
  const [isAddModOpen, setIsAddModOpen] = useState(false);
  const [newModCategory, setNewModCategory] = useState<ModificationCategory>('Engine & Performance');
  const [newModBrand, setNewModBrand] = useState('');
  const [newModPartName, setNewModPartName] = useState('');
  const [newModStatus, setNewModStatus] = useState<ModInstallStatus>('installed');
  const [newModNotes, setNewModNotes] = useState('');
  const [newModPhoto, setNewModPhoto] = useState<string>('');
  const newModFileInputRef = useRef<HTMLInputElement | null>(null);

  // Editing existing modification state
  const [editingModId, setEditingModId] = useState<string | null>(null);
  const [editModBrand, setEditModBrand] = useState('');
  const [editModPartName, setEditModPartName] = useState('');
  const [editModCategory, setEditModCategory] = useState<ModificationCategory>('Engine & Performance');
  const [editModNotes, setEditModNotes] = useState('');
  const [editModPhoto, setEditModPhoto] = useState<string>('');
  const editModFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleModPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        if (isEdit) {
          setEditModPhoto(ev.target.result);
        } else {
          setNewModPhoto(ev.target.result);
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Add Pure Photo to Gallery state
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // Vehicle Update state (separate from pure photo gallery)
  const [isAddUpdateOpen, setIsAddUpdateOpen] = useState(false);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateDate, setUpdateDate] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [updatePhotoUrl, setUpdatePhotoUrl] = useState('');
  const [installModWithUpdate, setInstallModWithUpdate] = useState(false);
  const [updateModCategory, setUpdateModCategory] = useState<ModificationCategory>('Engine & Performance');
  const [updateModBrand, setUpdateModBrand] = useState('');
  const [updateModPartName, setUpdateModPartName] = useState('');

  // Photo Milestone state (legacy support)
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDate, setMilestoneDate] = useState('');
  const [milestoneCaption, setMilestoneCaption] = useState('');
  const [milestoneImageUrl, setMilestoneImageUrl] = useState('');

  // Vehicle Story inline editor
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [storyDraft, setStoryDraft] = useState(vehicle.story || '');

  // Build Crew & Sponsor Shoutouts State
  const [isAddShoutoutModalOpen, setIsAddShoutoutModalOpen] = useState(false);
  const [shoutoutName, setShoutoutName] = useState('');
  const [shoutoutRole, setShoutoutRole] = useState('Chassis & Cage');
  const [shoutoutType, setShoutoutType] = useState<'crew' | 'sponsor' | 'shop'>('shop');
  const [shoutoutHandle, setShoutoutHandle] = useState('');
  const [shoutoutUrl, setShoutoutUrl] = useState('');
  const [shoutoutVerified, setShoutoutVerified] = useState(true);

  const canManageVehicle = isHardAdmin(currentUser) || currentUser.id === vehicle.owner.id;
  const isOwner = currentUser.id === vehicle.owner.id;

  // Comments for this specific vehicle
  const vehicleComments = useMemo(() => {
    return comments.filter(c => c.postId === vehicle.id || c.postId === `veh-${vehicle.id}`);
  }, [comments, vehicle.id]);

  // Modifications list
  const modifications = useMemo<Modification[]>(() => {
    return vehicle.modifications || [];
  }, [vehicle.modifications]);

  // Filtered modifications
  const filteredMods = useMemo(() => {
    if (selectedModCategory === 'All') return modifications;
    return modifications.filter(m => {
      if (selectedModCategory === 'Engine & Performance') {
        return m.category === 'Engine & Performance' || m.category === 'Exhaust';
      }
      if (selectedModCategory === 'Suspension & Chassis') {
        return m.category === 'Suspension & Chassis' || m.category === 'Brakes';
      }
      if (selectedModCategory === 'Interior & Electronics') {
        return m.category === 'Interior & Electronics' || m.category === 'Interior' || m.category === 'Electronics & Audio';
      }
      return m.category === selectedModCategory;
    });
  }, [modifications, selectedModCategory]);

  // Photo Milestones & Updates
  const photoMilestones = useMemo<PhotoMilestone[]>(() => {
    if (vehicle.photoMilestones && vehicle.photoMilestones.length > 0) {
      return vehicle.photoMilestones;
    }
    // Generate initial rich milestones from galleryImages and build updates
    const list: PhotoMilestone[] = [];
    vehicle.galleryImages.forEach((img, idx) => {
      list.push({
        id: `ms-gal-${idx}`,
        imageUrl: img,
        caption: idx === 0 ? 'Current build stance and exterior finish' : `Build angle #${idx + 1}`,
        milestoneDate: vehicle.createdAt || 'Recent Milestone',
        tag: idx === 0 ? 'Current Stance' : 'Gallery Shot'
      });
    });
    (vehicle.buildUpdates || []).forEach((upd, idx) => {
      (upd.images || []).forEach((img, imgIdx) => {
        list.push({
          id: `ms-upd-${idx}-${imgIdx}`,
          imageUrl: img,
          caption: upd.title || upd.content.slice(0, 80),
          milestoneDate: upd.date || 'Update',
          tag: 'Build Log'
        });
      });
    });
    return list;
  }, [vehicle]);

  const currentCrewAndSponsors: BuildCrewOrSponsor[] = useMemo(() => {
    if (vehicle.crewAndSponsors && vehicle.crewAndSponsors.length > 0) {
      return vehicle.crewAndSponsors;
    }
    return [
      { id: 'c-def-1', name: 'Apex Speedworks', role: 'Dyno Tuning & Performance Calibration', type: 'shop', verified: true },
      { id: 'c-def-2', name: 'Craftsman Fabrication', role: 'Chassis, Alignment & Roll Cage', type: 'crew', verified: true }
    ];
  }, [vehicle]);

  // Other builds from same manufacturer
  const matchingManufacturerBuilds = useMemo(() => {
    return allVehicles
      .filter(v => v.id !== vehicle.id && v.make.toLowerCase() === vehicle.make.toLowerCase())
      .slice(0, 3);
  }, [allVehicles, vehicle.id, vehicle.make]);

  // Handlers for Modifications
  const handleToggleModStatus = (modId: string) => {
    if (!canManageVehicle || !onUpdateVehicle) return;
    const currentMods = vehicle.modifications || [];
    const updatedMods = currentMods.map(m => {
      if (m.id === modId) {
        const nextStatus: ModInstallStatus = 
          m.status === 'installed' ? 'in_progress' :
          m.status === 'in_progress' ? 'planned' : 'installed';
        return { ...m, status: nextStatus };
      }
      return m;
    });
    onUpdateVehicle({ ...vehicle, modifications: updatedMods });
  };

  const handleDeleteMod = (modId: string) => {
    if (!canManageVehicle || !onUpdateVehicle) return;
    const currentMods = vehicle.modifications || [];
    const updatedMods = currentMods.filter(m => m.id !== modId);
    onUpdateVehicle({ ...vehicle, modifications: updatedMods });
  };

  const handleStartEditMod = (mod: Modification) => {
    setEditingModId(mod.id);
    setEditModBrand(mod.brand || '');
    setEditModPartName(mod.partName);
    setEditModCategory(mod.category || 'Engine & Performance');
    setEditModNotes(mod.description || '');
    setEditModPhoto(mod.photoUrl || '');
  };

  const handleCancelEditMod = () => {
    setEditingModId(null);
    setEditModBrand('');
    setEditModPartName('');
    setEditModNotes('');
    setEditModPhoto('');
  };

  const handleSaveEditMod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModId || !editModPartName.trim()) return;

    const currentMods = vehicle.modifications || [];
    const updatedMods = currentMods.map(m => {
      if (m.id === editingModId) {
        return {
          ...m,
          brand: editModBrand.trim() || 'Custom',
          partName: editModPartName.trim(),
          category: editModCategory,
          description: editModNotes.trim() || undefined,
          photoUrl: editModPhoto.trim() || undefined,
        };
      }
      return m;
    });

    onUpdateVehicle?.({ ...vehicle, modifications: updatedMods });
    setEditingModId(null);
    setEditModPhoto('');
  };

  const handleAddModification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModPartName.trim()) return;

    const newMod: Modification = {
      id: `mod-${Date.now()}`,
      category: newModCategory,
      brand: newModBrand.trim() || 'Custom',
      partName: newModPartName.trim(),
      status: newModStatus,
      description: newModNotes.trim() || undefined,
      photoUrl: newModPhoto.trim() || undefined,
      installedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };

    const updatedMods = [...(vehicle.modifications || []), newMod];
    onUpdateVehicle?.({ ...vehicle, modifications: updatedMods });

    // Reset form
    setNewModPartName('');
    setNewModBrand('');
    setNewModNotes('');
    setNewModPhoto('');
    setIsAddModOpen(false);
  };

  // Handlers for Photo Milestones
  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneImageUrl.trim()) return;

    const newMilestone: PhotoMilestone = {
      id: `ms-${Date.now()}`,
      imageUrl: milestoneImageUrl.trim(),
      caption: milestoneCaption.trim() || milestoneTitle.trim() || 'Build milestone',
      milestoneDate: milestoneDate.trim() || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      tag: milestoneTitle.trim() || 'Milestone'
    };

    const currentMilestones = vehicle.photoMilestones || [];
    const updatedMilestones = [newMilestone, ...currentMilestones];
    const updatedGallery = [newMilestone.imageUrl, ...vehicle.galleryImages];

    onUpdateVehicle?.({
      ...vehicle,
      photoMilestones: updatedMilestones,
      galleryImages: updatedGallery
    });

    setMilestoneImageUrl('');
    setMilestoneTitle('');
    setMilestoneDate('');
    setMilestoneCaption('');
    setIsAddMilestoneOpen(false);
  };

  // Pure Photo Gallery list (deduplicated)
  const allGalleryPhotos = useMemo<string[]>(() => {
    const list: string[] = [];
    if (vehicle.primaryImage && !list.includes(vehicle.primaryImage)) {
      list.push(vehicle.primaryImage);
    }
    (vehicle.galleryImages || []).forEach(img => {
      if (img && !list.includes(img)) list.push(img);
    });
    (vehicle.photoMilestones || []).forEach(ms => {
      if (ms.imageUrl && !list.includes(ms.imageUrl)) list.push(ms.imageUrl);
    });
    (vehicle.modifications || []).forEach(m => {
      if (m.photoUrl && !list.includes(m.photoUrl)) list.push(m.photoUrl);
    });
    return list;
  }, [vehicle]);

  // Lightbox navigation & touch swipe
  const handleNextLightbox = () => {
    if (allGalleryPhotos.length <= 1) return;
    setLightboxIndex(prev => (prev + 1) % allGalleryPhotos.length);
  };

  const handlePrevLightbox = () => {
    if (allGalleryPhotos.length <= 1) return;
    setLightboxIndex(prev => (prev - 1 + allGalleryPhotos.length) % allGalleryPhotos.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > 45) {
      handleNextLightbox();
    } else if (distance < -45) {
      handlePrevLightbox();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Add Pure Photo handler
  const handleAddPurePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;
    const url = newPhotoUrl.trim();
    const updatedGallery = [url, ...vehicle.galleryImages];
    onUpdateVehicle?.({
      ...vehicle,
      galleryImages: updatedGallery,
    });
    setNewPhotoUrl('');
    setIsAddPhotoOpen(false);
  };

  // Add Vehicle Update handler (with optional mod toggle auto-add)
  const handleAddVehicleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // Relaxed validation: user can submit headline, notes, or photo
    if (!updateTitle.trim() && !updateContent.trim() && !updatePhotoUrl.trim()) return;

    const formattedDate = updateDate.trim() || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    let updatedMods = [...(vehicle.modifications || [])];
    let installedPartLabel: string | undefined = undefined;

    if (installModWithUpdate && updateModPartName.trim()) {
      const newMod: Modification = {
        id: `mod-${Date.now()}`,
        category: updateModCategory,
        brand: updateModBrand.trim() || 'Custom',
        partName: updateModPartName.trim(),
        status: 'installed',
        description: `Installed with update: ${updateTitle.trim() || 'Milestone update'}`,
        photoUrl: updatePhotoUrl.trim() || undefined,
        installedDate: formattedDate,
      };
      updatedMods = [...updatedMods, newMod];
      installedPartLabel = `${updateModBrand.trim() ? updateModBrand.trim() + ' ' : ''}${updateModPartName.trim()}`;
    }

    const newUpdate: BuildUpdate = {
      id: `upd-${Date.now()}`,
      vehicleId: vehicle.id,
      title: updateTitle.trim() || 'Vehicle Update',
      date: formattedDate,
      content: updateContent.trim() || 'Logged milestone update.',
      images: updatePhotoUrl.trim() ? [updatePhotoUrl.trim()] : [],
      modInstalled: installedPartLabel,
      likesCount: 0,
    };

    const updatedBuildUpdates = [newUpdate, ...(vehicle.buildUpdates || [])];

    onUpdateVehicle?.({
      ...vehicle,
      buildUpdates: updatedBuildUpdates,
      modifications: updatedMods,
    });

    setUpdateTitle('');
    setUpdateDate('');
    setUpdateContent('');
    setUpdatePhotoUrl('');
    setInstallModWithUpdate(false);
    setUpdateModBrand('');
    setUpdateModPartName('');
    setIsAddUpdateOpen(false);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % vehicle.galleryImages.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + vehicle.galleryImages.length) % vehicle.galleryImages.length);
  };

  const handleSaveStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateVehicle) {
      onUpdateVehicle({ ...vehicle, story: storyDraft });
      setIsEditingStory(false);
    }
  };

  const handleAddShoutout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shoutoutName.trim()) return;

    const newShoutout: BuildCrewOrSponsor = {
      id: `crew-${Date.now()}`,
      name: shoutoutName.trim(),
      role: shoutoutRole.trim(),
      type: shoutoutType,
      url: shoutoutUrl.trim() || undefined,
      verified: isHardAdmin(currentUser) ? shoutoutVerified : false,
    };

    const updatedCrew = [...currentCrewAndSponsors, newShoutout];
    onUpdateVehicle?.({ ...vehicle, crewAndSponsors: updatedCrew });
    setShoutoutName('');
    setIsAddShoutoutModalOpen(false);
  };

  const handleDeleteShoutout = (id: string) => {
    if (!canManageVehicle || !onUpdateVehicle) return;
    const updatedCrew = currentCrewAndSponsors.filter(c => c.id !== id);
    onUpdateVehicle({ ...vehicle, crewAndSponsors: updatedCrew });
  };

  // ----------------------------------------------------
  // SUB-RENDERERS
  // ----------------------------------------------------

  // 1. Hero 6-Badge Spec Grid (Clean, Industrial, High Contrast, Word-Wrapping)
  const renderHeroSpecBadges = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
      {/* 1. Engine */}
      <div className="bg-[#1e1e20] border border-[#38383c] p-3 rounded-none">
        <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block">
          ENGINE
        </span>
        <span className="font-['Oswald'] text-sm sm:text-base font-bold text-white uppercase break-words leading-snug block mt-0.5">
          {vehicle.engine || 'Stock'}
        </span>
      </div>

      {/* 2. Drivetrain */}
      <div className="bg-[#1e1e20] border border-[#38383c] p-3 rounded-none">
        <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block">
          DRIVETRAIN
        </span>
        <span className="font-['Oswald'] text-sm sm:text-base font-bold text-white uppercase break-words leading-snug block mt-0.5">
          {vehicle.drivetrain || 'RWD'}
        </span>
      </div>

      {/* 3. Power */}
      <div className="bg-[#1e1e20] border border-[#38383c] p-3 rounded-none">
        <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block">
          HORSEPOWER
        </span>
        <span className="font-['Oswald'] text-sm sm:text-base font-bold text-[#C8102E] uppercase break-words leading-snug block mt-0.5">
          {vehicle.horsepower || 'Factory Spec'}
        </span>
      </div>

      {/* 4. Transmission */}
      <div className="bg-[#1e1e20] border border-[#38383c] p-3 rounded-none">
        <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block">
          TRANSMISSION
        </span>
        <span className="font-['Oswald'] text-sm sm:text-base font-bold text-white uppercase break-words leading-snug block mt-0.5">
          {vehicle.transmission || 'Manual'}
        </span>
      </div>

      {/* 5. Chassis / Trim */}
      <div className="bg-[#1e1e20] border border-[#38383c] p-3 rounded-none">
        <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block">
          CHASSIS / TRIM
        </span>
        <span className="font-['Oswald'] text-sm sm:text-base font-bold text-white uppercase break-words leading-snug block mt-0.5">
          {vehicle.chassis || vehicle.trim || 'Standard'}
        </span>
      </div>

      {/* 6. Build Intent */}
      <div className="bg-[#1e1e20] border border-[#38383c] p-3 rounded-none">
        <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block">
          BUILD INTENT
        </span>
        <span className="font-['Oswald'] text-sm sm:text-base font-bold text-white uppercase break-words leading-snug block mt-0.5">
          {vehicle.buildStatus || 'Street Build'}
        </span>
      </div>
    </div>
  );

  // 2. Categorized Mod Checklist Section
  const renderCategorizedMods = () => {
    const modCategoriesList = [
      { key: 'All', label: 'All Mods', count: modifications.length },
      { key: 'Engine & Performance', label: 'Engine', count: modifications.filter(m => m.category === 'Engine & Performance' || m.category === 'Exhaust').length },
      { key: 'Suspension & Chassis', label: 'Suspension', count: modifications.filter(m => m.category === 'Suspension & Chassis' || m.category === 'Brakes').length },
      { key: 'Wheels & Tires', label: 'Wheels', count: modifications.filter(m => m.category === 'Wheels & Tires').length },
      { key: 'Exterior & Aero', label: 'Exterior', count: modifications.filter(m => m.category === 'Exterior & Aero').length },
      { key: 'Interior & Electronics', label: 'Interior', count: modifications.filter(m => m.category === 'Interior & Electronics' || m.category === 'Interior' || m.category === 'Electronics & Audio').length },
    ];

    return (
      <div className="bg-[#242426] border border-[#38383a] p-4 sm:p-6 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#333336]">
          <div>
            <h3 className="font-['Oswald'] text-xl font-bold uppercase tracking-wide text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-[#C8102E]" />
              <span>Modifications & Parts</span>
            </h3>
          </div>

          {canManageVehicle && (
            <button
              type="button"
              onClick={() => setIsAddModOpen(!isAddModOpen)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#C8102E] hover:bg-[#e01334] text-white font-['Oswald'] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{isAddModOpen ? 'Cancel' : 'Add Modification'}</span>
            </button>
          )}
        </div>

        {/* Inline Add Modification Form */}
        {isAddModOpen && (
          <form onSubmit={handleAddModification} className="bg-[#1a1a1c] border border-[#444448] p-4 space-y-3">
            <span className="font-['Oswald'] text-sm font-bold uppercase tracking-wider text-white block">
              Add New Part / Modification
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#aaaaaa] mb-1">Category *</label>
                <select
                  value={newModCategory}
                  onChange={(e) => setNewModCategory(e.target.value as ModificationCategory)}
                  className="w-full bg-[#141416] border border-[#38383a] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8102E] font-mono"
                >
                  <option value="Engine & Performance">Engine & Performance</option>
                  <option value="Suspension & Chassis">Suspension & Chassis</option>
                  <option value="Wheels & Tires">Wheels & Tires</option>
                  <option value="Exterior & Aero">Exterior & Aero</option>
                  <option value="Interior & Electronics">Interior & Electronics</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#aaaaaa] mb-1">Brand (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. HKS, Ohlins, OEM"
                  value={newModBrand}
                  onChange={(e) => setNewModBrand(e.target.value)}
                  className="w-full bg-[#141416] border border-[#38383a] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8102E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#aaaaaa] mb-1">Part Name / Model *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hi-Power Exhaust or Rear Wing Removal"
                  value={newModPartName}
                  onChange={(e) => setNewModPartName(e.target.value)}
                  className="w-full bg-[#141416] border border-[#38383a] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8102E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#aaaaaa] mb-1">Install Status</label>
                <select
                  value={newModStatus}
                  onChange={(e) => setNewModStatus(e.target.value as ModInstallStatus)}
                  className="w-full bg-[#141416] border border-[#38383a] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8102E] font-mono"
                >
                  <option value="installed">Installed (Active on Car)</option>
                  <option value="in_progress">In Progress (In the Garage / Shop)</option>
                  <option value="planned">Planned (Wishlist / Next Step)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#aaaaaa] mb-1">Notes / Specs (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 70mm diameter, 18x9.5 +22 offset"
                  value={newModNotes}
                  onChange={(e) => setNewModNotes(e.target.value)}
                  className="w-full bg-[#141416] border border-[#38383a] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8102E]"
                />
              </div>
            </div>

            {/* 1 Photo for modification */}
            <div className="space-y-1.5 pt-1 border-t border-[#2a2a2d]">
              <label className="block text-[11px] font-mono uppercase text-[#aaaaaa] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#C8102E]" />
                  <span>Part Photo (1 Photo, Optional)</span>
                </span>
                {newModPhoto && (
                  <button
                    type="button"
                    onClick={() => setNewModPhoto('')}
                    className="text-[10px] text-[#ef4444] hover:underline flex items-center gap-0.5 cursor-pointer font-mono"
                  >
                    <X className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                )}
              </label>

              <input
                ref={newModFileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleModPhotoUpload(e, false)}
                className="hidden"
              />

              {newModPhoto ? (
                <div className="relative aspect-video sm:aspect-[21/9] max-h-36 bg-black border border-[#38383a] overflow-hidden group">
                  <img src={newModPhoto} alt="Part preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setNewModPhoto('')}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/80 hover:bg-[#C8102E] text-white transition-colors cursor-pointer"
                    title="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <button
                    type="button"
                    onClick={() => newModFileInputRef.current?.click()}
                    className="sm:col-span-4 px-3 py-2 bg-[#202024] hover:bg-[#28282c] border border-dashed border-[#444448] hover:border-[#888888] text-white text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#C8102E]" />
                    <span>Upload Photo</span>
                  </button>
                  <div className="sm:col-span-8">
                    <input
                      type="url"
                      placeholder="Or paste photo URL (https://...)"
                      value={newModPhoto}
                      onChange={(e) => setNewModPhoto(e.target.value)}
                      className="w-full bg-[#141416] border border-[#38383a] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8102E]"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModOpen(false)}
                className="px-3 py-1.5 bg-[#252528] text-xs font-mono text-[#aaaaaa] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#C8102E] hover:bg-[#e01334] text-white text-xs font-['Oswald'] font-bold uppercase tracking-wider cursor-pointer"
              >
                Save to Build Sheet
              </button>
            </div>
          </form>
        )}

        {/* Category Filter Pills - Wrapped on mobile */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pb-1">
          {modCategoriesList.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedModCategory(cat.key)}
              className={`px-3 py-1.5 text-xs font-['Oswald'] font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 border ${
                selectedModCategory === cat.key
                  ? 'bg-[#C8102E] text-white border-[#C8102E]'
                  : 'bg-[#18181a] text-[#888888] hover:text-white border-[#38383a]'
              }`}
            >
              <span>{cat.label}</span>
              <span className="ml-1.5 text-[10px] opacity-80 font-mono">({cat.count})</span>
            </button>
          ))}
        </div>

        {/* Modifications List */}
        {filteredMods.length > 0 ? (
          <div className="space-y-3">
            {filteredMods.map((mod) => {
              if (editingModId === mod.id) {
                return (
                  <form
                    key={mod.id}
                    onSubmit={handleSaveEditMod}
                    className="p-4 bg-[#1a1a1c] border border-[#C8102E] space-y-3 shadow-md"
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-[#333336]">
                      <span className="font-['Oswald'] text-sm font-bold uppercase tracking-wider text-white">
                        Edit Modification
                      </span>
                      <button
                        type="button"
                        onClick={handleCancelEditMod}
                        className="text-xs font-mono text-[#888888] hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[#aaaaaa] mb-1">Brand</label>
                        <input
                          type="text"
                          value={editModBrand}
                          onChange={(e) => setEditModBrand(e.target.value)}
                          placeholder="e.g. HKS, Ohlins, Volk"
                          className="w-full bg-[#141416] border border-[#38383a] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C8102E]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[#aaaaaa] mb-1">Part Name *</label>
                        <input
                          type="text"
                          required
                          value={editModPartName}
                          onChange={(e) => setEditModPartName(e.target.value)}
                          placeholder="e.g. Hi-Power Exhaust"
                          className="w-full bg-[#141416] border border-[#38383a] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C8102E]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[#aaaaaa] mb-1">Category</label>
                        <select
                          value={editModCategory}
                          onChange={(e) => setEditModCategory(e.target.value as ModificationCategory)}
                          className="w-full bg-[#141416] border border-[#38383a] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#C8102E] font-mono"
                        >
                          <option value="Engine & Performance">Engine & Performance</option>
                          <option value="Suspension & Chassis">Suspension & Chassis</option>
                          <option value="Wheels & Tires">Wheels & Tires</option>
                          <option value="Exterior & Aero">Exterior & Aero</option>
                          <option value="Interior & Electronics">Interior & Electronics</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[#aaaaaa] mb-1">Notes / Specs</label>
                      <input
                        type="text"
                        value={editModNotes}
                        onChange={(e) => setEditModNotes(e.target.value)}
                        placeholder="e.g. 70mm diameter, corner balanced"
                        className="w-full bg-[#141416] border border-[#38383a] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C8102E]"
                      />
                    </div>

                    {/* 1 Photo for modification edit */}
                    <div className="space-y-1.5 pt-1 border-t border-[#2a2a2d]">
                      <label className="block text-[10px] font-mono uppercase text-[#aaaaaa] flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Camera className="w-3 h-3 text-[#C8102E]" />
                          <span>Part Photo (1 Photo, Optional)</span>
                        </span>
                        {editModPhoto && (
                          <button
                            type="button"
                            onClick={() => setEditModPhoto('')}
                            className="text-[10px] text-[#ef4444] hover:underline flex items-center gap-0.5 cursor-pointer font-mono"
                          >
                            <X className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        )}
                      </label>

                      <input
                        ref={editModFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleModPhotoUpload(e, true)}
                        className="hidden"
                      />

                      {editModPhoto ? (
                        <div className="relative aspect-video sm:aspect-[21/9] max-h-32 bg-black border border-[#38383a] overflow-hidden group">
                          <img src={editModPhoto} alt="Part preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setEditModPhoto('')}
                            className="absolute top-1.5 right-1.5 p-1 bg-black/80 hover:bg-[#C8102E] text-white transition-colors cursor-pointer"
                            title="Remove photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                          <button
                            type="button"
                            onClick={() => editModFileInputRef.current?.click()}
                            className="sm:col-span-4 px-3 py-1.5 bg-[#202024] hover:bg-[#28282c] border border-dashed border-[#444448] hover:border-[#888888] text-white text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Upload className="w-3 h-3 text-[#C8102E]" />
                            <span>Upload Photo</span>
                          </button>
                          <div className="sm:col-span-8">
                            <input
                              type="url"
                              placeholder="Or paste photo URL (https://...)"
                              value={editModPhoto}
                              onChange={(e) => setEditModPhoto(e.target.value)}
                              className="w-full bg-[#141416] border border-[#38383a] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C8102E]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCancelEditMod}
                        className="px-3 py-1.5 bg-[#252528] text-xs font-mono text-[#aaaaaa] hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#C8102E] hover:bg-[#e01334] text-white text-xs font-['Oswald'] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                );
              }

              return (
                <div
                  key={mod.id}
                  className="p-3.5 sm:p-4 bg-[#1a1a1c] border border-[#38383a] flex items-start justify-between gap-3 hover:border-[#4c4c52] transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {mod.photoUrl && (
                      <div
                        onClick={() => {
                          const targetIdx = allGalleryPhotos.indexOf(mod.photoUrl!);
                          setLightboxIndex(targetIdx >= 0 ? targetIdx : 0);
                          setLightboxOpen(true);
                        }}
                        className="w-16 h-16 sm:w-20 sm:h-20 aspect-square bg-black border border-[#38383a] overflow-hidden cursor-pointer hover:border-[#C8102E] transition-all shrink-0 group relative"
                        title="Click to view full photo"
                      >
                        <img src={mod.photoUrl} alt={mod.partName} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1 space-y-1">
                      <h4 className="font-['Oswald'] text-base sm:text-lg font-bold uppercase text-white tracking-wide break-words leading-snug">
                        {mod.brand ? `${mod.brand} ` : ''}{mod.partName}
                      </h4>

                      {mod.description && (
                        <p className="text-xs sm:text-sm text-[#aaaaaa] font-['Inter'] leading-relaxed break-words whitespace-pre-line mt-1">
                          {mod.description}
                        </p>
                      )}

                      {mod.installedDate && (
                        <span className="text-[10px] font-mono text-[#777777] block mt-1">
                          Logged {mod.installedDate}
                        </span>
                      )}
                    </div>
                  </div>

                  {canManageVehicle && (
                    <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleStartEditMod(mod)}
                        className="p-1.5 text-[#888888] hover:text-white bg-[#252528] hover:bg-[#333336] border border-[#3e3e42] transition-colors cursor-pointer"
                        title="Edit modification"
                        aria-label="Edit modification"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMod(mod.id)}
                        className="p-1.5 text-[#888888] hover:text-[#ef4444] bg-[#252528] hover:bg-red-950/40 border border-[#3e3e42] hover:border-red-900/40 transition-colors cursor-pointer"
                        title="Remove modification"
                        aria-label="Remove modification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center border border-[#38383a] bg-[#1a1a1c] text-xs font-mono text-[#888888]">
            No modifications logged under {selectedModCategory}.
          </div>
        )}
      </div>
    );
  };

  // 3. Details Table (Factory Architecture & Platform Specs)
  const renderFactoryArchitecture = () => (
    <div className="bg-[#242426] border border-[#38383a] p-4 sm:p-6 space-y-4 shadow-sm">
      <h3 className="font-['Oswald'] text-lg font-bold uppercase tracking-wide text-white">
        Details
      </h3>
      <div className="border border-[#38383a] bg-[#1a1a1c] overflow-hidden">
        <table className="w-full text-xs font-mono">
          <tbody className="divide-y divide-[#2d2d30]">
            <tr className="hover:bg-[#202024]">
              <td className="px-4 py-2.5 text-[#888888] uppercase w-5/12 sm:w-1/3">Year / Make / Model</td>
              <td className="px-4 py-2.5 text-white font-bold break-words">{vehicle.year} {vehicle.make} {vehicle.model}</td>
            </tr>
            <tr className="hover:bg-[#202024]">
              <td className="px-4 py-2.5 text-[#888888] uppercase">Trim Package</td>
              <td className="px-4 py-2.5 text-white break-words">{vehicle.trim || 'Standard'}</td>
            </tr>
            <tr className="hover:bg-[#202024]">
              <td className="px-4 py-2.5 text-[#888888] uppercase">Powertrain</td>
              <td className="px-4 py-2.5 text-white break-words">{vehicle.engine}</td>
            </tr>
            <tr className="hover:bg-[#202024]">
              <td className="px-4 py-2.5 text-[#888888] uppercase">Transmission</td>
              <td className="px-4 py-2.5 text-white break-words">{vehicle.transmission}</td>
            </tr>
            <tr className="hover:bg-[#202024]">
              <td className="px-4 py-2.5 text-[#888888] uppercase">Drivetrain Layout</td>
              <td className="px-4 py-2.5 text-white break-words">{vehicle.drivetrain}</td>
            </tr>
            <tr className="hover:bg-[#202024]">
              <td className="px-4 py-2.5 text-[#888888] uppercase">Exterior Colorway</td>
              <td className="px-4 py-2.5 text-white break-words">{vehicle.color}</td>
            </tr>
            <tr className="hover:bg-[#202024]">
              <td className="px-4 py-2.5 text-[#888888] uppercase">Garage Location</td>
              <td className="px-4 py-2.5 text-white break-words">{vehicle.owner.location}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  // 4. Pure Photo Gallery (Photos Tab - Clean 2-column grid, zero text overlays)
  const renderPurePhotoGallery = () => (
    <div className="bg-[#242426] border border-[#38383a] p-4 sm:p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#333336]">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-[#C8102E]" />
          <h3 className="font-['Oswald'] text-xl font-bold uppercase tracking-wide text-white">
            Photos ({allGalleryPhotos.length})
          </h3>
        </div>

        {canManageVehicle && (
          <button
            type="button"
            onClick={() => setIsAddPhotoOpen(!isAddPhotoOpen)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#C8102E] hover:bg-[#e01334] text-white font-['Oswald'] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{isAddPhotoOpen ? 'Cancel' : 'Add Photo'}</span>
          </button>
        )}
      </div>

      {/* Inline Add Photo Form */}
      {isAddPhotoOpen && (
        <form onSubmit={handleAddPurePhoto} className="bg-[#1a1a1c] border border-[#444448] p-4 space-y-3">
          <span className="font-['Oswald'] text-sm font-bold uppercase tracking-wider text-white block">
            Add Photo to Gallery
          </span>
          <div>
            <label className="block text-[11px] font-mono uppercase text-[#aaaaaa] mb-1">Image URL *</label>
            <input
              type="url"
              required
              placeholder="https://images.unsplash.com/..."
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
              className="w-full bg-[#141416] border border-[#38383a] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8102E]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddPhotoOpen(false)}
              className="px-3 py-1.5 bg-[#252528] text-xs font-mono text-[#aaaaaa] hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#C8102E] hover:bg-[#e01334] text-white text-xs font-['Oswald'] font-bold uppercase tracking-wider cursor-pointer"
            >
              Upload to Gallery
            </button>
          </div>
        </form>
      )}

      {/* Clean 2-Column Photo Grid with Zero Text Overlays */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {allGalleryPhotos.map((imgUrl, idx) => (
          <div
            key={idx}
            onClick={() => {
              setLightboxIndex(idx);
              setLightboxOpen(true);
            }}
            className="group relative aspect-[4/3] sm:aspect-[16/10] bg-black border border-[#38383a] overflow-hidden cursor-pointer hover:border-[#C8102E] transition-all"
            title="Click to view full screen (swipeable)"
          >
            <img
              src={imgUrl}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} - Photo ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ))}
      </div>
    </div>
  );

  // 5. Separate Vehicle Updates Feed (with optional part auto-add)
  const renderVehicleUpdates = () => (
    <div className="bg-[#242426] border border-[#38383a] p-4 sm:p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#333336]">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#C8102E]" />
          <h3 className="font-['Oswald'] text-xl font-bold uppercase tracking-wide text-white">
            Vehicle Updates ({vehicle.buildUpdates?.length || 0})
          </h3>
        </div>

        {canManageVehicle && (
          <button
            type="button"
            onClick={() => setIsAddUpdateOpen(!isAddUpdateOpen)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#C8102E] hover:bg-[#e01334] text-white font-['Oswald'] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{isAddUpdateOpen ? 'Cancel' : 'Post Vehicle Update'}</span>
          </button>
        )}
      </div>

      {/* Inline Post Vehicle Update Form */}
      {isAddUpdateOpen && (
        <form onSubmit={handleAddVehicleUpdate} className="bg-[#1a1a1c] border border-[#444448] p-4 space-y-3.5">
          <span className="font-['Oswald'] text-sm font-bold uppercase tracking-wider text-white block">
            Post an Update for this Vehicle
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#aaaaaa] mb-1">Update Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Coilover install & dyno calibration"
                value={updateTitle}
                onChange={(e) => setUpdateTitle(e.target.value)}
                className="w-full bg-[#141416] border border-[#38383a] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8102E]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#aaaaaa] mb-1">Date Logged</label>
              <input
                type="text"
                placeholder="e.g. Today or Oct 2024"
                value={updateDate}
                onChange={(e) => setUpdateDate(e.target.value)}
                className="w-full bg-[#141416] border border-[#38383a] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8102E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-[#aaaaaa] mb-1">Update Notes / Work Performed *</label>
            <textarea
              rows={3}
              required
              placeholder="What did you do to the vehicle? Track day review, parts installation, corner balance details..."
              value={updateContent}
              onChange={(e) => setUpdateContent(e.target.value)}
              className="w-full bg-[#141416] border border-[#38383a] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8102E]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-[#aaaaaa] mb-1">Attached Photo URL (Optional)</label>
            <input
              type="url"
              placeholder="https://..."
              value={updatePhotoUrl}
              onChange={(e) => setUpdatePhotoUrl(e.target.value)}
              className="w-full bg-[#141416] border border-[#38383a] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8102E]"
            />
          </div>

          {/* Optional Mod Toggle that automatically adds to Modifications & Parts */}
          <div className="p-3 bg-[#202024] border border-[#38383c] space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={installModWithUpdate}
                onChange={(e) => setInstallModWithUpdate(e.target.checked)}
                className="w-4 h-4 accent-[#C8102E] cursor-pointer"
              />
              <span className="text-xs font-mono text-white font-bold uppercase tracking-wider">
                Installed a new part / modification
              </span>
            </label>

            {installModWithUpdate && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#333336]">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#aaaaaa] mb-1">Part Name *</label>
                  <input
                    type="text"
                    required={installModWithUpdate}
                    placeholder="e.g. HKS Hi-Power Exhaust"
                    value={updateModPartName}
                    onChange={(e) => setUpdateModPartName(e.target.value)}
                    className="w-full bg-[#141416] border border-[#38383a] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#C8102E]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#aaaaaa] mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. HKS / Volk / Brembo"
                    value={updateModBrand}
                    onChange={(e) => setUpdateModBrand(e.target.value)}
                    className="w-full bg-[#141416] border border-[#38383a] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#C8102E]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#aaaaaa] mb-1">Category</label>
                  <select
                    value={updateModCategory}
                    onChange={(e) => setUpdateModCategory(e.target.value as ModificationCategory)}
                    className="w-full bg-[#141416] border border-[#38383a] px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#C8102E] font-mono"
                  >
                    <option value="Engine & Performance">Engine & Performance</option>
                    <option value="Suspension & Chassis">Suspension & Chassis</option>
                    <option value="Wheels & Tires">Wheels & Tires</option>
                    <option value="Exterior & Aero">Exterior & Aero</option>
                    <option value="Interior & Electronics">Interior & Electronics</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddUpdateOpen(false)}
              className="px-3.5 py-1.5 bg-[#252528] text-xs font-mono text-[#aaaaaa] hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-[#C8102E] hover:bg-[#e01334] text-white text-xs font-['Oswald'] font-bold uppercase tracking-wider cursor-pointer"
            >
              Publish Update
            </button>
          </div>
        </form>
      )}

      {/* Chronological Updates List */}
      <div className="space-y-4">
        {vehicle.buildUpdates && vehicle.buildUpdates.length > 0 ? (
          vehicle.buildUpdates.map((upd, idx) => (
            <div key={upd.id || idx} className="p-4 sm:p-5 bg-[#1a1a1c] border border-[#38383a] space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono px-2 py-0.5 bg-[#242428] text-[#aaaaaa] border border-[#38383a]">
                      {upd.date}
                    </span>
                    {upd.modInstalled && (
                      <span className="text-xs font-mono px-2 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-500/40 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Installed: {upd.modInstalled}</span>
                      </span>
                    )}
                  </div>
                  <h4 className="font-['Oswald'] text-base sm:text-lg font-bold uppercase text-white tracking-wide">
                    {upd.title}
                  </h4>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#cccccc] font-['Inter'] leading-relaxed whitespace-pre-line">
                {upd.content}
              </p>

              {/* Attached Photos */}
              {upd.images && upd.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                  {upd.images.map((img, imgIdx) => (
                    <div
                      key={imgIdx}
                      onClick={() => {
                        const targetIdx = allGalleryPhotos.indexOf(img);
                        setLightboxIndex(targetIdx >= 0 ? targetIdx : 0);
                        setLightboxOpen(true);
                      }}
                      className="aspect-video bg-black border border-[#38383a] overflow-hidden cursor-pointer hover:border-[#C8102E] transition-all"
                    >
                      <img src={img} alt="Update milestone" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center border border-[#38383a] bg-[#1a1a1c] text-xs font-mono text-[#888888]">
            No vehicle updates posted yet. {canManageVehicle ? 'Post your first update above!' : ''}
          </div>
        )}
      </div>
    </div>
  );

  // 6. Story Behind the Build (Renamed to "About this [Vehicle Model]")
  const renderStorySection = () => (
    <div className="bg-[#242426] border border-[#38383a] p-5 sm:p-6 space-y-3 shadow-sm">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#333336]">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#C8102E]" />
          <h3 className="font-['Oswald'] text-xl font-bold uppercase tracking-wide text-white">
            About this {vehicle.model}
          </h3>
        </div>
        {canManageVehicle && (
          <button
            type="button"
            onClick={() => setIsEditingStory(!isEditingStory)}
            className="text-xs font-mono text-[#C8102E] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>{isEditingStory ? 'Close Editor' : 'Edit Story'}</span>
          </button>
        )}
      </div>

      {isEditingStory ? (
        <form onSubmit={handleSaveStory} className="space-y-3 pt-1">
          <textarea
            rows={6}
            value={storyDraft}
            onChange={(e) => setStoryDraft(e.target.value)}
            placeholder="Describe your build's history, inspiration, adventures, track days, or paste links..."
            className="w-full bg-[#18181a] border border-[#444446] p-3 text-sm text-white focus:outline-none focus:border-[#C8102E] font-sans leading-relaxed"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditingStory(false)}
              className="px-3.5 py-1.5 bg-[#2d2d30] text-xs font-mono text-[#aaaaaa] hover:text-white cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#C8102E] hover:bg-[#e01334] text-xs font-['Oswald'] font-bold uppercase tracking-wider text-white cursor-pointer shadow-sm transition-all duration-150 active:scale-[0.98]"
            >
              Save Story
            </button>
          </div>
        </form>
      ) : (
        <div className="text-sm sm:text-base text-[#cccccc] leading-relaxed whitespace-pre-line pt-1">
          {vehicle.story ? (
            <p>{vehicle.story}</p>
          ) : (
            <p className="italic text-[#888888] font-mono text-xs">
              No story added yet. {canManageVehicle ? 'Click "Edit Story" to document your build journey, history, and inspiration!' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );

  // 6. Owner Signature Card Section
  const renderOwnerSection = () => (
    <div className="bg-[#242426] border border-[#38383a] p-5 space-y-4 shadow-sm">
      <div 
        onClick={() => onSelectOwner(vehicle.owner.id)}
        className="flex items-center gap-4 group cursor-pointer"
      >
        <img
          src={vehicle.owner.avatar}
          alt={vehicle.owner.name}
          className="w-16 h-16 sm:w-20 sm:h-20 object-cover border-2 border-[#C8102E] shrink-0 shadow-md"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-['Oswald'] text-2xl sm:text-3xl font-bold uppercase text-white group-hover:text-[#C8102E] transition-colors leading-tight truncate">
              {vehicle.owner.name}
            </h4>
            {isHardAdmin(vehicle.owner) && (
              <span className="px-1.5 py-0.5 bg-[#C8102E] text-white font-['Oswald'] font-black text-[9px] uppercase tracking-wider">
                ADMIN
              </span>
            )}
          </div>
          <p className="text-sm font-mono text-[#aaaaaa] mt-1">
            {vehicle.owner.location}
          </p>
        </div>
      </div>

      {vehicle.owner.bio && (
        <p className="text-xs text-[#aaaaaa] leading-relaxed pt-2 border-t border-[#333336]">
          {vehicle.owner.bio}
        </p>
      )}

      <div className="pt-3 border-t border-[#333336] flex items-center justify-between text-xs font-mono text-[#888888]">
        <span>Member Since {vehicle.owner.memberSince}</span>
        <span className="text-[#C8102E] font-bold">
          {isHardAdmin(vehicle.owner) ? 'VERIFIED ADMIN' : 'GASCANCO BUILDER'}
        </span>
      </div>
    </div>
  );

  // 7. Build Crew & Sponsors Section
  const renderCrewSection = () => (
    <div className="bg-[#242426] border border-[#38383a] p-5 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-[#C8102E] uppercase tracking-wider block font-bold">
          BUILD CREW & SPONSORS
        </span>
        {canManageVehicle && (
          <button
            type="button"
            onClick={() => setIsAddShoutoutModalOpen(true)}
            className="text-xs font-mono text-white hover:text-[#C8102E] flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {currentCrewAndSponsors.map(item => (
          <div key={item.id} className="p-2.5 bg-[#1a1a1c] border border-[#333336] flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-['Oswald'] text-sm font-bold uppercase text-white truncate">
                  {item.name}
                </span>
                {item.verified && (
                  <ShieldCheck className="w-3 h-3 text-[#C8102E] shrink-0" />
                )}
                <span className="text-[9px] font-mono uppercase px-1 py-0.2 bg-[#2a2a2e] text-[#bbbbbb] border border-[#38383a]">
                  {item.type}
                </span>
              </div>
              <span className="text-xs font-mono text-[#C8102E] block truncate">
                {item.role}
              </span>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-mono text-[#888888] hover:text-white inline-flex items-center gap-1 mt-0.5"
                >
                  <span>Visit partner site</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>

            {canManageVehicle && (
              <button
                type="button"
                onClick={() => handleDeleteShoutout(item.id)}
                className="text-[#666666] hover:text-[#ff4d4d] p-1 cursor-pointer transition-colors"
                title="Remove shoutout"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 bg-[#303030] text-[#eaeaea]">
      {/* Header with bold Year Make & Model directly above photo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2.5 rounded bg-[#1e2533] hover:bg-[#2d364a] text-[#c9d3e3] hover:text-white transition-all duration-150 active:scale-[0.98] cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-['Oswald'] text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-white leading-none">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Admin Spotlight Button */}
            {isHardAdmin(currentUser) && onSetAsSpotlight && (
              <button
                type="button"
                onClick={() => onSetAsSpotlight(vehicle.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-['Oswald'] font-bold uppercase tracking-wider border transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                  isCurrentSpotlight 
                    ? 'bg-[#C8102E] text-white border-[#C8102E] shadow' 
                    : 'bg-[#1e1e20] text-[#ff4d6a] hover:text-white hover:bg-[#C8102E] border-[#ff4d6a]/40'
                }`}
                title="Feature this vehicle on Live Feed & Discover spotlight"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{isCurrentSpotlight ? 'Featured Spotlight ★' : 'Set as Spotlight'}</span>
              </button>
            )}

            {(isOwner || isHardAdmin(currentUser)) && (
              <button
                type="button"
                onClick={() => onEditVehicle(vehicle.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#333333] hover:bg-[#3d3d3d] text-xs font-['Oswald'] font-bold uppercase tracking-wider text-white border border-[#444444] transition-all duration-150 active:scale-[0.98] cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5 text-[#C8102E]" />
                <span>{isOwner ? 'Edit Specs' : 'Admin Edit'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1c1c1c] hover:bg-[#2d2d2d] text-xs font-mono text-[#bbbbbb] hover:text-white border border-[#3d3d3d] transition-all duration-150 active:scale-[0.98] cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#10b981]" />
                  <span className="text-[#10b981]">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#C8102E]" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hero Visual Area: Primary Photo with Carousel Navigation */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative aspect-video sm:aspect-[21/9] bg-black rounded-lg overflow-hidden border border-[#3d3d3d] shadow-2xl">
          <img
            src={vehicle.galleryImages[activeImageIndex] || vehicle.primaryImage}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => {
              setLightboxIndex(activeImageIndex);
              setLightboxOpen(true);
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

          {/* Navigation arrows if multiple images */}
          {vehicle.galleryImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-[#C8102E] text-white transition-all cursor-pointer backdrop-blur-sm"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-[#C8102E] text-white transition-all cursor-pointer backdrop-blur-sm"
              >
                ›
              </button>
            </>
          )}
        </div>
      </section>

      {/* Primary Tabs Navigation Bar: Mobile Grid & Desktop Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6">
        {/* Mobile Full-Width 5-Button Grid */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-[#1a1a1c] border border-[#38383a] sm:hidden">
          <button
            type="button"
            onClick={() => setActiveTab('sheet')}
            className={`flex flex-col items-center justify-center py-2 px-0.5 text-center transition-all duration-150 active:scale-[0.98] cursor-pointer ${
              activeTab === 'sheet'
                ? 'bg-[#C8102E] text-white shadow font-bold'
                : 'bg-[#222225] text-[#9ba5b7] hover:text-white'
            }`}
          >
            <Gauge className="w-3.5 h-3.5 mb-0.5 shrink-0" />
            <span className="text-[9px] font-['Oswald'] uppercase tracking-wider leading-tight truncate w-full">
              Specs
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`flex flex-col items-center justify-center py-2 px-0.5 text-center transition-all duration-150 active:scale-[0.98] cursor-pointer ${
              activeTab === 'photos'
                ? 'bg-[#C8102E] text-white shadow font-bold'
                : 'bg-[#222225] text-[#9ba5b7] hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5 mb-0.5 shrink-0" />
            <span className="text-[9px] font-['Oswald'] uppercase tracking-wider leading-tight truncate w-full">
              Photos ({allGalleryPhotos.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('updates')}
            className={`flex flex-col items-center justify-center py-2 px-0.5 text-center transition-all duration-150 active:scale-[0.98] cursor-pointer ${
              activeTab === 'updates'
                ? 'bg-[#C8102E] text-white shadow font-bold'
                : 'bg-[#222225] text-[#9ba5b7] hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 mb-0.5 shrink-0" />
            <span className="text-[9px] font-['Oswald'] uppercase tracking-wider leading-tight truncate w-full">
              Updates ({vehicle.buildUpdates?.length || 0})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`flex flex-col items-center justify-center py-2 px-0.5 text-center transition-all duration-150 active:scale-[0.98] cursor-pointer ${
              activeTab === 'about'
                ? 'bg-[#C8102E] text-white shadow font-bold'
                : 'bg-[#222225] text-[#9ba5b7] hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 mb-0.5 shrink-0" />
            <span className="text-[9px] font-['Oswald'] uppercase tracking-wider leading-tight truncate w-full">
              About
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('discussion')}
            className={`flex flex-col items-center justify-center py-2 px-0.5 text-center transition-all duration-150 active:scale-[0.98] cursor-pointer ${
              activeTab === 'discussion'
                ? 'bg-[#C8102E] text-white shadow font-bold'
                : 'bg-[#222225] text-[#9ba5b7] hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 mb-0.5 shrink-0" />
            <span className="text-[9px] font-['Oswald'] uppercase tracking-wider leading-tight truncate w-full">
              Q&A ({vehicleComments.length})
            </span>
          </button>
        </div>

        {/* Desktop Tab Bar */}
        <div className="hidden sm:flex items-center justify-between border-b border-[#38383a]">
          <div className="flex items-center gap-6 sm:gap-8 font-['Oswald'] text-sm sm:text-base font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setActiveTab('sheet')}
              className={`py-3 sm:py-3.5 border-b-2 transition-colors relative cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'sheet'
                  ? 'border-[#C8102E] text-[#C8102E]'
                  : 'border-transparent text-[#8d98ab] hover:text-white'
              }`}
            >
              <Gauge className="w-4 h-4" />
              <span>Build Sheet ({modifications.length} Mods)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('photos')}
              className={`py-3 sm:py-3.5 border-b-2 transition-colors relative cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'photos'
                  ? 'border-[#C8102E] text-[#C8102E]'
                  : 'border-transparent text-[#8d98ab] hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Photos ({allGalleryPhotos.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('updates')}
              className={`py-3 sm:py-3.5 border-b-2 transition-colors relative cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'updates'
                  ? 'border-[#C8102E] text-[#C8102E]'
                  : 'border-transparent text-[#8d98ab] hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Updates ({vehicle.buildUpdates?.length || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className={`py-3 sm:py-3.5 border-b-2 transition-colors relative cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'about'
                  ? 'border-[#C8102E] text-[#C8102E]'
                  : 'border-transparent text-[#8d98ab] hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>About & Crew</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('discussion')}
              className={`py-3 sm:py-3.5 border-b-2 transition-colors relative cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'discussion'
                  ? 'border-[#C8102E] text-[#C8102E]'
                  : 'border-transparent text-[#8d98ab] hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Discussions & Q&A ({vehicleComments.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-6 min-w-0">
            
            {/* TAB: BUILD SHEET (Hero Spec Badges + Categorized Mod Checklist + Factory Specs) */}
            {activeTab === 'sheet' && (
              <div className="flex flex-col space-y-6">
                <div className="order-1">
                  {renderHeroSpecBadges()}
                </div>
                {/* Details moved before Modifications & Parts on mobile */}
                <div className="order-2 lg:order-3">
                  {renderFactoryArchitecture()}
                </div>
                <div className="order-3 lg:order-2">
                  {renderCategorizedMods()}
                </div>
              </div>
            )}

            {/* TAB: PHOTOS (Pure 2-Column Photo Gallery, Zero Text Overlays) */}
            {activeTab === 'photos' && (
              <div className="space-y-6">
                {renderPurePhotoGallery()}
              </div>
            )}

            {/* TAB: UPDATES (Dedicated Updates Feed with Optional Mod Auto-Add) */}
            {activeTab === 'updates' && (
              <div className="space-y-6">
                {renderVehicleUpdates()}
              </div>
            )}

            {/* TAB: ABOUT (Reordered: User, Build Crew & Sponsors, About this Model) */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                {renderOwnerSection()}
                {renderCrewSection()}
                {renderStorySection()}
              </div>
            )}

            {/* TAB: DISCUSSIONS */}
            {activeTab === 'discussion' && (
              <div className="space-y-6">
                <div className="bg-[#242426] border border-[#38383a] p-4 sm:p-6 space-y-4 shadow-sm">
                  <div>
                    <h3 className="font-['Oswald'] text-xl font-bold uppercase tracking-wide text-white">
                      Community Discussions & Builder Q&A
                    </h3>
                    <p className="text-xs text-[#888888] font-mono mt-0.5">
                      Ask questions about parts, recommend setup tweaks, or connect with the builder.
                    </p>
                  </div>

                  <ThreadedComments
                    postId={vehicle.id}
                    postTitle={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    postType="vehicle"
                    comments={vehicleComments}
                    currentUser={currentUser}
                    onAddComment={onAddComment || (() => {})}
                    onUpdateComment={onUpdateComment || (() => {})}
                    onDeleteComment={onDeleteComment || (() => {})}
                    onOpenLightbox={(img) => {
                      const idx = allGalleryPhotos.indexOf(img);
                      setLightboxIndex(idx >= 0 ? idx : 0);
                      setLightboxOpen(true);
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Desktop Sidebar Column */}
          <div className="hidden lg:block lg:col-span-4 space-y-6">
            {renderOwnerSection()}
            {renderCrewSection()}
            {renderStorySection()}
          </div>
        </div>
      </div>

      {/* Lightbox Modal with Full Touch Swiping and Next/Prev Controls */}
      {lightboxOpen && allGalleryPhotos.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md select-none"
          onClick={() => setLightboxOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Bar: Counter & Close */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-20 pointer-events-auto">
            <span className="text-xs font-mono px-3 py-1 bg-black/80 border border-[#444] text-[#ddd]">
              {lightboxIndex + 1} / {allGalleryPhotos.length}
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="p-2 bg-black/80 hover:bg-[#C8102E] border border-[#444] text-white cursor-pointer transition-colors"
              aria-label="Close photo view"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Prev Photo Arrow */}
          {allGalleryPhotos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevLightbox();
              }}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 bg-black/80 hover:bg-[#C8102E] border border-[#444] text-white text-xl transition-colors cursor-pointer z-20"
              aria-label="Previous photo"
            >
              ‹
            </button>
          )}

          {/* Fullscreen Image */}
          <img
            src={allGalleryPhotos[lightboxIndex] || vehicle.primaryImage}
            alt="Fullscreen photo"
            className="max-w-full max-h-[85vh] object-contain border border-[#333336] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next Photo Arrow */}
          {allGalleryPhotos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextLightbox();
              }}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 bg-black/80 hover:bg-[#C8102E] border border-[#444] text-white text-xl transition-colors cursor-pointer z-20"
              aria-label="Next photo"
            >
              ›
            </button>
          )}

          {/* Mobile Swipe Hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] font-mono text-[#888888] sm:hidden pointer-events-none">
            Swipe left or right to browse photos
          </div>
        </div>
      )}

      {/* Add Shoutout Modal */}
      {isAddShoutoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#1c1c1f] border border-[#38383a] p-5 space-y-4">
            <h3 className="font-['Oswald'] text-lg font-bold uppercase text-white">
              Add Crew / Sponsor Shoutout
            </h3>

            <form onSubmit={handleAddShoutout} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[#aaaaaa] uppercase mb-1">Partner / Shop Name *</label>
                <input
                  type="text"
                  required
                  value={shoutoutName}
                  onChange={(e) => setShoutoutName(e.target.value)}
                  placeholder="e.g. Desert Fabworks"
                  className="w-full px-3 py-2 bg-[#141416] border border-[#38383a] text-white focus:outline-none focus:border-[#C8102E]"
                />
              </div>

              <div>
                <label className="block text-[#aaaaaa] uppercase mb-1">Role / Contribution *</label>
                <input
                  type="text"
                  required
                  value={shoutoutRole}
                  onChange={(e) => setShoutoutRole(e.target.value)}
                  placeholder="e.g. Long-Travel Suspension & Cage"
                  className="w-full px-3 py-2 bg-[#141416] border border-[#38383a] text-white focus:outline-none focus:border-[#C8102E]"
                />
              </div>

              <div>
                <label className="block text-[#aaaaaa] uppercase mb-1">Partner Type</label>
                <select
                  value={shoutoutType}
                  onChange={(e) => setShoutoutType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#141416] border border-[#38383a] text-white focus:outline-none"
                >
                  <option value="shop">Performance Shop / Tuner</option>
                  <option value="crew">Fabricator / Crew Member</option>
                  <option value="sponsor">Brand Sponsor</option>
                </select>
              </div>

              <div>
                <label className="block text-[#aaaaaa] uppercase mb-1">Partner Website URL (Optional)</label>
                <input
                  type="url"
                  value={shoutoutUrl}
                  onChange={(e) => setShoutoutUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-[#141416] border border-[#38383a] text-white focus:outline-none focus:border-[#C8102E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#333336]">
                <button
                  type="button"
                  onClick={() => setIsAddShoutoutModalOpen(false)}
                  className="px-3 py-1.5 bg-[#262628] text-[#aaaaaa] hover:text-white uppercase font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#C8102E] hover:bg-[#e01334] text-white uppercase font-bold text-xs cursor-pointer"
                >
                  Add Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
