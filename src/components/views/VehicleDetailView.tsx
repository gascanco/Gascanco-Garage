import React, { useState, useMemo } from 'react';
import { 
  Vehicle, Owner, PostComment, BuildCrewOrSponsor, isHardAdmin,
  Modification, ModificationCategory, ModInstallStatus, PhotoMilestone 
} from '../../types/garage';
import { 
  ArrowLeft, Share2, Wrench, ShieldCheck, Heart, ThumbsDown, 
  MapPin, Calendar, Gauge, Camera, Plus, ExternalLink, Trash2, 
  Check, Star, Sparkles, MessageSquare, BookOpen, Pencil, Link2,
  Zap, Disc, Sliders, CheckCircle2, Clock, AlertCircle, ChevronDown,
  Upload, Layers
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
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sheet' | 'updates' | 'about' | 'discussion'>('sheet');
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

  // Photo Milestone state
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

  const handleAddModification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModPartName.trim()) return;

    const newMod: Modification = {
      id: `mod-${Date.now()}`,
      category: newModCategory,
      brand: newModBrand.trim() || 'Custom / Unspecified',
      partName: newModPartName.trim(),
      status: newModStatus,
      description: newModNotes.trim() || undefined,
      installedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };

    const updatedMods = [...(vehicle.modifications || []), newMod];
    onUpdateVehicle?.({ ...vehicle, modifications: updatedMods });

    // Reset form
    setNewModPartName('');
    setNewModBrand('');
    setNewModNotes('');
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

  // 1. Hero 6-Badge Spec Grid (Clean, Industrial, High Contrast)
  const renderHeroSpecBadges = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
      {/* 1. Engine */}
      <div className="bg-[#1e1e20] border border-[#38383c] p-3 rounded-none">
        <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block">
          ENGINE
        </span>
        <span className="font-['Oswald'] text-sm sm:text-base font-bold text-white uppercase truncate block mt-0.5">
          {vehicle.engine || 'Stock'}
        </span>
      </div>

      {/* 2. Drivetrain */}
      <div className="bg-[#1e1e20] border border-[#38383c] p-3 rounded-none">
        <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block">
          DRIVETRAIN
        </span>
        <span className="font-['Oswald'] text-sm sm:text-base font-bold text-white uppercase truncate block mt-0.5">
          {vehicle.drivetrain || 'RWD'}
        </span>
      </div>

      {/* 3. Power */}
      <div className="bg-[#1e1e20] border border-[#38383c] p-3 rounded-none">
        <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block">
          HORSEPOWER
        </span>
        <span className="font-['Oswald'] text-sm sm:text-base font-bold text-[#C8102E] uppercase truncate block mt-0.5">
          {vehicle.horsepower || 'Factory Spec'}
        </span>
      </div>

      {/* 4. Transmission */}
      <div className="bg-[#1e1e20] border border-[#38383c] p-3 rounded-none">
        <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block">
          TRANSMISSION
        </span>
        <span className="font-['Oswald'] text-sm sm:text-base font-bold text-white uppercase truncate block mt-0.5">
          {vehicle.transmission || 'Manual'}
        </span>
      </div>

      {/* 5. Chassis / Trim */}
      <div className="bg-[#1e1e20] border border-[#38383c] p-3 rounded-none">
        <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block">
          CHASSIS / TRIM
        </span>
        <span className="font-['Oswald'] text-sm sm:text-base font-bold text-white uppercase truncate block mt-0.5">
          {vehicle.chassis || vehicle.trim || 'Standard'}
        </span>
      </div>

      {/* 6. Build Intent */}
      <div className="bg-[#1e1e20] border border-[#38383c] p-3 rounded-none">
        <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block">
          BUILD INTENT
        </span>
        <span className="font-['Oswald'] text-sm sm:text-base font-bold text-white uppercase truncate block mt-0.5">
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
              <span>Modifications & Build Checklist</span>
            </h3>
            <p className="text-xs text-[#888888] font-mono mt-0.5">
              Documented parts, install status, and performance upgrades.
            </p>
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
                <label className="block text-[11px] font-mono uppercase text-[#aaaaaa] mb-1">Brand *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HKS, Ohlins, Volk"
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
                  placeholder="e.g. Hi-Power Exhaust"
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

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar">
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
          <div className="divide-y divide-[#333336] border border-[#38383a] bg-[#1a1a1c]">
            {filteredMods.map((mod) => {
              const status = mod.status || 'installed';
              return (
                <div key={mod.id} className="p-3 sm:p-4 flex items-start justify-between gap-3 hover:bg-[#202024] transition-colors">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-['Oswald'] text-sm sm:text-base font-bold uppercase text-white tracking-wide">
                        {mod.brand} {mod.partName}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-[#242428] text-[#aaaaaa] border border-[#38383a]">
                        {mod.category}
                      </span>
                    </div>

                    {mod.description && (
                      <p className="text-xs text-[#aaaaaa] font-mono leading-relaxed">
                        {mod.description}
                      </p>
                    )}

                    {mod.installedDate && (
                      <span className="text-[10px] font-mono text-[#777777] block">
                        Logged {mod.installedDate}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Status Badge with click-to-toggle for Owner */}
                    <button
                      type="button"
                      disabled={!canManageVehicle}
                      onClick={() => handleToggleModStatus(mod.id)}
                      title={canManageVehicle ? "Click to toggle status (Installed / In Progress / Planned)" : undefined}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase border transition-all ${
                        canManageVehicle ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                      } ${
                        status === 'installed'
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40'
                          : status === 'in_progress'
                          ? 'bg-amber-950/40 text-amber-400 border-amber-500/40'
                          : 'bg-sky-950/40 text-sky-400 border-sky-500/40'
                      }`}
                    >
                      {status === 'installed' ? '✓ Installed' : status === 'in_progress' ? '⏳ In Progress' : '📋 Planned'}
                    </button>

                    {canManageVehicle && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMod(mod.id)}
                        className="p-1 text-[#666666] hover:text-[#ef4444] transition-colors cursor-pointer"
                        title="Remove modification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
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

  // 3. Factory Architecture & Baseline Specs Table
  const renderFactoryArchitecture = () => (
    <div className="bg-[#242426] border border-[#38383a] p-4 sm:p-6 space-y-4 shadow-sm">
      <h3 className="font-['Oswald'] text-lg font-bold uppercase tracking-wide text-white">
        Factory Architecture & Platform Specs
      </h3>
      <div className="border border-[#38383a] bg-[#1a1a1c] overflow-hidden">
        <table className="w-full text-xs font-mono">
          <tbody className="divide-y divide-[#2d2d30]">
            <tr className="hover:bg-[#202024]">
              <td className="px-4 py-2.5 text-[#888888] uppercase w-5/12 sm:w-1/3">Year / Make / Model</td>
              <td className="px-4 py-2.5 text-white font-bold">{vehicle.year} {vehicle.make} {vehicle.model}</td>
            </tr>
            <tr className="hover:bg-[#202024]">
              <td className="px-4 py-2.5 text-[#888888] uppercase">Trim Package</td>
              <td className="px-4 py-2.5 text-white">{vehicle.trim || 'Standard'}</td>
            </tr>
            <tr className="hover:bg-[#202024]">
              <td className="px-4 py-2.5 text-[#888888] uppercase">Powertrain</td>
              <td className="px-4 py-2.5 text-white">{vehicle.engine}</td>
            </tr>
            <tr className="hover:bg-[#202024]">
              <td className="px-4 py-2.5 text-[#888888] uppercase">Transmission</td>
              <td className="px-4 py-2.5 text-white">{vehicle.transmission}</td>
            </tr>
            <tr className="hover:bg-[#202024]">
              <td className="px-4 py-2.5 text-[#888888] uppercase">Drivetrain Layout</td>
              <td className="px-4 py-2.5 text-white">{vehicle.drivetrain}</td>
            </tr>
            <tr className="hover:bg-[#202024]">
              <td className="px-4 py-2.5 text-[#888888] uppercase">Exterior Colorway</td>
              <td className="px-4 py-2.5 text-white">{vehicle.color}</td>
            </tr>
            <tr className="hover:bg-[#202024]">
              <td className="px-4 py-2.5 text-[#888888] uppercase">Garage Location</td>
              <td className="px-4 py-2.5 text-white">{vehicle.owner.location}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  // 4. Photo Updates / Progression Timeline
  const renderPhotoUpdates = () => (
    <div className="bg-[#242426] border border-[#38383a] p-4 sm:p-6 space-y-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#333336]">
        <div>
          <h3 className="font-['Oswald'] text-xl font-bold uppercase tracking-wide text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#C8102E]" />
            <span>Updates & Build Progression</span>
          </h3>
          <p className="text-xs text-[#888888] font-mono mt-0.5">
            Visual milestones documenting parts installation, dyno sessions, and stance.
          </p>
        </div>

        {canManageVehicle && (
          <button
            type="button"
            onClick={() => setIsAddMilestoneOpen(!isAddMilestoneOpen)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#C8102E] hover:bg-[#e01334] text-white font-['Oswald'] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{isAddMilestoneOpen ? 'Cancel' : 'Add Milestone Photo'}</span>
          </button>
        )}
      </div>

      {/* Add Milestone Photo Form */}
      {isAddMilestoneOpen && (
        <form onSubmit={handleAddMilestone} className="bg-[#1a1a1c] border border-[#444448] p-4 space-y-3">
          <span className="font-['Oswald'] text-sm font-bold uppercase tracking-wider text-white block">
            Add Photo Milestone
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#aaaaaa] mb-1">Photo Image URL *</label>
              <input
                type="url"
                required
                placeholder="https://..."
                value={milestoneImageUrl}
                onChange={(e) => setMilestoneImageUrl(e.target.value)}
                className="w-full bg-[#141416] border border-[#38383a] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8102E]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#aaaaaa] mb-1">Milestone Title</label>
              <input
                type="text"
                placeholder="e.g. Coilovers Installed & Corner Balanced"
                value={milestoneTitle}
                onChange={(e) => setMilestoneTitle(e.target.value)}
                className="w-full bg-[#141416] border border-[#38383a] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8102E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-[#aaaaaa] mb-1">Caption / Description</label>
            <textarea
              rows={2}
              placeholder="Details about the milestone, parts installed, or track day results..."
              value={milestoneCaption}
              onChange={(e) => setMilestoneCaption(e.target.value)}
              className="w-full bg-[#141416] border border-[#38383a] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8102E]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddMilestoneOpen(false)}
              className="px-3 py-1.5 bg-[#252528] text-xs font-mono text-[#aaaaaa] hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#C8102E] hover:bg-[#e01334] text-white text-xs font-['Oswald'] font-bold uppercase tracking-wider cursor-pointer"
            >
              Add Update
            </button>
          </div>
        </form>
      )}

      {/* Milestones Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {photoMilestones.map((ms, idx) => (
          <div
            key={ms.id || idx}
            onClick={() => {
              setActiveLightboxImage(ms.imageUrl);
              setLightboxOpen(true);
            }}
            className="group relative border border-[#38383a] bg-[#1a1a1c] overflow-hidden cursor-pointer hover:border-[#C8102E] transition-all"
          >
            <div className="aspect-[16/10] overflow-hidden bg-black">
              <img
                src={ms.imageUrl}
                alt={ms.caption || 'Milestone photo'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-3 space-y-1 bg-[#1e1e20] border-t border-[#333336]">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#888888]">
                <span className="text-[#C8102E] font-bold uppercase">{ms.tag || `Milestone #${idx + 1}`}</span>
                <span>{ms.milestoneDate}</span>
              </div>
              <p className="text-xs text-[#cccccc] font-mono line-clamp-2">
                {ms.caption}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 5. Story Behind the Build
  const renderStorySection = () => (
    <div className="bg-[#242426] border border-[#38383a] p-5 sm:p-6 space-y-3 shadow-sm">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#333336]">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#C8102E]" />
          <h3 className="font-['Oswald'] text-xl font-bold uppercase tracking-wide text-white">
            The Story Behind This Build
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
              setActiveLightboxImage(vehicle.galleryImages[activeImageIndex] || vehicle.primaryImage);
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
        {/* Mobile Full-Width 4-Button Grid */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-[#1a1a1c] border border-[#38383a] sm:hidden">
          <button
            type="button"
            onClick={() => setActiveTab('sheet')}
            className={`flex flex-col items-center justify-center py-2 px-1 text-center transition-all duration-150 active:scale-[0.98] cursor-pointer ${
              activeTab === 'sheet'
                ? 'bg-[#C8102E] text-white shadow font-bold'
                : 'bg-[#222225] text-[#9ba5b7] hover:text-white'
            }`}
          >
            <Gauge className="w-4 h-4 mb-0.5 shrink-0" />
            <span className="text-[10px] font-['Oswald'] uppercase tracking-wider leading-tight truncate w-full">
              Build Sheet
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('updates')}
            className={`flex flex-col items-center justify-center py-2 px-1 text-center transition-all duration-150 active:scale-[0.98] cursor-pointer ${
              activeTab === 'updates'
                ? 'bg-[#C8102E] text-white shadow font-bold'
                : 'bg-[#222225] text-[#9ba5b7] hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4 mb-0.5 shrink-0" />
            <span className="text-[10px] font-['Oswald'] uppercase tracking-wider leading-tight truncate w-full">
              Updates ({photoMilestones.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`flex flex-col items-center justify-center py-2 px-1 text-center transition-all duration-150 active:scale-[0.98] cursor-pointer ${
              activeTab === 'about'
                ? 'bg-[#C8102E] text-white shadow font-bold'
                : 'bg-[#222225] text-[#9ba5b7] hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 mb-0.5 shrink-0" />
            <span className="text-[10px] font-['Oswald'] uppercase tracking-wider leading-tight truncate w-full">
              About
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('discussion')}
            className={`flex flex-col items-center justify-center py-2 px-1 text-center transition-all duration-150 active:scale-[0.98] cursor-pointer ${
              activeTab === 'discussion'
                ? 'bg-[#C8102E] text-white shadow font-bold'
                : 'bg-[#222225] text-[#9ba5b7] hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 mb-0.5 shrink-0" />
            <span className="text-[10px] font-['Oswald'] uppercase tracking-wider leading-tight truncate w-full">
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
              onClick={() => setActiveTab('updates')}
              className={`py-3 sm:py-3.5 border-b-2 transition-colors relative cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'updates'
                  ? 'border-[#C8102E] text-[#C8102E]'
                  : 'border-transparent text-[#8d98ab] hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Updates ({photoMilestones.length})</span>
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
              <div className="space-y-6">
                {renderHeroSpecBadges()}
                {renderCategorizedMods()}
                {renderFactoryArchitecture()}
              </div>
            )}

            {/* TAB: UPDATES */}
            {activeTab === 'updates' && (
              <div className="space-y-6">
                {renderPhotoUpdates()}
              </div>
            )}

            {/* TAB: ABOUT & CREW */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                {renderStorySection()}
                <div className="space-y-6 lg:hidden">
                  {renderOwnerSection()}
                  {renderCrewSection()}
                </div>
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
                      setActiveLightboxImage(img);
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

      {/* Lightbox Modal */}
      {lightboxOpen && activeLightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md cursor-pointer"
          onClick={() => setLightboxOpen(false)}
        >
          <img
            src={activeLightboxImage}
            alt="Fullscreen view"
            className="max-w-full max-h-[90vh] object-contain border border-[#444446]"
          />
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
