import React, { useState, useMemo } from 'react';
import { Vehicle, Owner, PostComment, BuildCrewOrSponsor, isHardAdmin } from '../../types/garage';
import { 
  ArrowLeft, Share2, Wrench, ShieldCheck, Heart, ThumbsDown, 
  MapPin, Calendar, Gauge, Camera, Plus, ExternalLink, Trash2, 
  Check, Star, Sparkles, MessageSquare, BookOpen, Pencil, Link2
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
  const [activeTab, setActiveTab] = useState<'specs' | 'about' | 'photos' | 'discussion'>('specs');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFollowing, setIsFollowing] = useState(vehicle.owner.isFollowing || false);
  const [expandedUpdateComments, setExpandedUpdateComments] = useState<Set<string>>(new Set());
  const [likedUpdateIds, setLikedUpdateIds] = useState<Set<string>>(new Set());
  const [dislikedUpdateIds, setDislikedUpdateIds] = useState<Set<string>>(new Set());

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

  const canManageShoutouts = isHardAdmin(currentUser) || currentUser.id === vehicle.owner.id;
  const isOwner = currentUser.id === vehicle.owner.id;

  // Comments for this specific vehicle
  const vehicleComments = useMemo(() => {
    return comments.filter(c => c.postId === vehicle.id || c.postId === `veh-${vehicle.id}`);
  }, [comments, vehicle.id]);

  const currentCrewAndSponsors: BuildCrewOrSponsor[] = useMemo(() => {
    if (vehicle.crewAndSponsors && vehicle.crewAndSponsors.length > 0) {
      return vehicle.crewAndSponsors;
    }
    const cat = (vehicle.category || '').toLowerCase();
    if (cat.includes('sxs') || cat.includes('powersports')) {
      return [
        { id: 'c-def-1', name: 'Desert Fabworks', role: 'Long-Travel Suspension & Cage', type: 'crew', verified: true },
        { id: 'c-def-2', name: 'Rigid Industries', role: 'Baja Race Lighting Partner', url: 'https://rigidindustries.com', type: 'sponsor', verified: true },
        { id: 'c-def-3', name: 'Shock Therapy', role: 'Dual-Rate Springs & Valving Tune', type: 'shop', verified: true }
      ];
    }
    if (cat.includes('muscle') || cat.includes('classic') || cat.includes('rat')) {
      return [
        { id: 'c-def-1', name: 'Iron & Rust Fab Lab', role: 'Chassis Chop & Custom Z-Frame', type: 'crew', verified: true },
        { id: 'c-def-2', name: 'Vintage V8 Speed Supply', role: 'Engine Machining & Dyno', type: 'shop', verified: true },
        { id: 'c-def-3', name: 'Pinstriping by Bones', role: 'Hand-Laid 1-Shot Enamel Artwork', type: 'crew' }
      ];
    }
    if (cat.includes('truck') || cat.includes('4x4') || cat.includes('overland')) {
      return [
        { id: 'c-def-1', name: 'Apex Air Ride Co.', role: 'Bagged Chassis & Air Management', type: 'crew', verified: true },
        { id: 'c-def-2', name: 'Billet Specialties', role: 'Custom Forged Wheels', url: 'https://billetspecialties.com', type: 'sponsor', verified: true },
        { id: 'c-def-3', name: 'Full Throttle Customs', role: 'Custom Metal Bed & Bodywork', type: 'shop' }
      ];
    }
    return [
      { id: 'c-def-1', name: 'Apex Speedworks', role: 'Twin-Turbo & Dyno Calibration', type: 'shop', verified: true },
      { id: 'c-def-2', name: 'Craftsman Race Works', role: 'Chassis & Custom Roll Cage', type: 'crew', verified: true },
      { id: 'c-def-3', name: 'Volk Racing / Rays Japan', role: 'Wheel & Aero Program', url: 'https://rayswheels.co.jp', type: 'sponsor', verified: true },
      { id: 'c-def-4', name: 'Midnight Shutter Co.', role: 'Lead Track Photographer', type: 'crew' }
    ];
  }, [vehicle]);

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

    const updatedList = [...currentCrewAndSponsors, newShoutout];
    const updatedVehicle: Vehicle = {
      ...vehicle,
      crewAndSponsors: updatedList,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onUpdateVehicle?.(updatedVehicle);
    setIsAddShoutoutModalOpen(false);
    setShoutoutName('');
    setShoutoutHandle('');
    setShoutoutUrl('');
  };

  const handleDeleteShoutout = (shoutoutId: string) => {
    const updatedList = currentCrewAndSponsors.filter(s => s.id !== shoutoutId);
    const updatedVehicle: Vehicle = {
      ...vehicle,
      crewAndSponsors: updatedList,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateVehicle?.(updatedVehicle);
  };

  // Save story draft
  const handleSaveStory = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedVehicle: Vehicle = {
      ...vehicle,
      story: storyDraft.trim(),
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateVehicle?.(updatedVehicle);
    setIsEditingStory(false);
  };

  // Helper to parse URLs inside user story text
  const renderStoryWithLinks = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C8102E] hover:underline font-bold inline-flex items-center gap-0.5 break-all"
          >
            <span>{part}</span>
            <ExternalLink className="w-3 h-3 inline shrink-0" />
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Strict manufacturer matching for More Builds container
  const matchingManufacturerBuilds = useMemo(() => {
    return allVehicles.filter(
      v => v.id !== vehicle.id && v.make.trim().toLowerCase() === vehicle.make.trim().toLowerCase()
    );
  }, [allVehicles, vehicle]);

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

  // 1. Story Behind This Build Section
  const renderStorySection = () => (
    <div className="bg-[#242426] border border-[#38383a] p-5 sm:p-6 space-y-3 shadow-sm">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#333336]">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#C8102E]" />
          <h3 className="font-['Oswald'] text-xl font-bold uppercase tracking-wide text-white">
            The Story Behind This Build
          </h3>
        </div>
        {(isOwner || isHardAdmin(currentUser)) && (
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
            placeholder="Describe your build's history, inspiration, adventures, track days, or paste links (e.g. YouTube dyno pulls, parts logs)..."
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
            renderStoryWithLinks(vehicle.story)
          ) : (
            <p className="italic text-[#888888] font-mono text-xs">
              No story added yet. {isOwner ? 'Click "Edit Story" to describe your build journey, history, and links!' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );

  // 2. Specifications Table Section
  const renderSpecsTable = () => (
    <div className="bg-[#242426] border border-[#38383a] p-5 sm:p-6 space-y-4 shadow-sm">
      <div className="pb-3 border-b border-[#333336] flex items-center justify-between">
        <h3 className="font-['Oswald'] text-xl font-bold uppercase tracking-wide text-white">
          Vehicle Specifications & Factory Architecture
        </h3>
        <span className="text-xs font-mono text-[#aaaaaa]">
          Baseline Specs
        </span>
      </div>

      <div className="border border-[#38383a] bg-[#1a1a1c] overflow-hidden">
        <table className="w-full text-xs sm:text-sm font-mono">
          <tbody className="divide-y divide-[#2d2d30]">
            <tr className="hover:bg-[#202024]">
              <td className="px-4 py-3 text-[#888888] uppercase w-5/12 sm:w-1/3">Year / Make / Model</td>
              <td className="px-4 py-3 text-white font-bold break-words">{vehicle.year} {vehicle.make} {vehicle.model}</td>
            </tr>
            <tr className="hover:bg-[#202024]">
              <td className="px-4 py-3 text-[#888888] uppercase">Trim Package</td>
              <td className="px-4 py-3 text-white break-words">{vehicle.trim || 'Standard'}</td>
            </tr>
            <tr className="hover:bg-[#202024]">
              <td className="px-4 py-3 text-[#888888] uppercase">Powertrain / Engine</td>
              <td className="px-4 py-3 text-white font-medium break-words">{vehicle.engine}</td>
            </tr>
            <tr className="hover:bg-[#202024]">
              <td className="px-4 py-3 text-[#888888] uppercase">Power Output</td>
              <td className="px-4 py-3 text-white font-bold break-words">{vehicle.horsepower || 'Not Disclosed'}</td>
            </tr>
            <tr className="hover:bg-[#202024]">
              <td className="px-4 py-3 text-[#888888] uppercase">Transmission</td>
              <td className="px-4 py-3 text-white break-words">{vehicle.transmission}</td>
            </tr>
            <tr className="hover:bg-[#202024]">
              <td className="px-4 py-3 text-[#888888] uppercase">Drivetrain Layout</td>
              <td className="px-4 py-3 text-white break-words">{vehicle.drivetrain}</td>
            </tr>
            <tr className="hover:bg-[#202024]">
              <td className="px-4 py-3 text-[#888888] uppercase">Exterior Colorway</td>
              <td className="px-4 py-3 text-white break-words">{vehicle.color}</td>
            </tr>
            <tr className="hover:bg-[#202024]">
              <td className="px-4 py-3 text-[#888888] uppercase">Garage Location</td>
              <td className="px-4 py-3 text-white break-words">{vehicle.owner.location}</td>
            </tr>
            <tr className="hover:bg-[#202024]">
              <td className="px-4 py-3 text-[#888888] uppercase">Build Intent</td>
              <td className="px-4 py-3 text-white break-words">{vehicle.buildStatus}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  // 3. Owner Signature Card Section
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

  // 4. Build Crew & Sponsors Section
  const renderCrewSection = () => (
    <div className="bg-[#242426] border border-[#38383a] p-5 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-[#C8102E] uppercase tracking-wider block font-bold">
          BUILD CREW & SPONSORS
        </span>
        {canManageShoutouts && (
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

            {canManageShoutouts && (
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

  // 5. More Builds From Same Manufacturer Section
  const renderMoreBuildsSection = () => (
    <div className="bg-[#242426] border border-[#38383a] p-5 space-y-3 shadow-sm">
      <span className="text-xs font-mono text-[#C8102E] uppercase tracking-wider block font-bold">
        MORE {vehicle.make.toUpperCase()} BUILDS
      </span>

      {matchingManufacturerBuilds.length > 0 ? (
        <div className="space-y-2.5">
          {matchingManufacturerBuilds.map(rel => (
            <div
              key={rel.id}
              onClick={() => onSelectRelated(rel.id)}
              className="p-2.5 bg-[#1a1a1c] border border-[#333336] hover:border-[#C8102E] transition-colors cursor-pointer group flex items-center gap-3"
            >
              <img
                src={rel.primaryImage}
                alt=""
                className="w-14 h-12 object-cover border border-[#444446] shrink-0"
              />
              <div className="min-w-0">
                <span className="font-['Oswald'] text-sm font-bold uppercase text-white group-hover:text-[#C8102E] transition-colors truncate block">
                  {rel.year} {rel.make} {rel.model}
                </span>
                <span className="text-xs font-mono text-[#888888] block truncate">
                  {rel.owner.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 bg-[#1a1a1c] border border-[#333336] text-center">
          <p className="text-xs font-mono text-[#888888]">
            No other registered {vehicle.make} builds in the registry yet.
          </p>
        </div>
      )}
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

          {/* Admin Spotlight Button */}
          {isHardAdmin(currentUser) && onSetAsSpotlight && (
            <button
              type="button"
              onClick={() => onSetAsSpotlight(vehicle.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-['Oswald'] font-bold uppercase tracking-wider border transition-all duration-150 active:scale-[0.98] cursor-pointer self-start sm:self-auto ${
                isCurrentSpotlight 
                  ? 'bg-[#C8102E] text-white border-[#C8102E] shadow' 
                  : 'bg-[#1e1e20] text-[#ff4d6a] hover:text-white hover:bg-[#C8102E] border-[#ff4d6a]/40'
              }`}
              title="Feature this vehicle on Live Feed & Discover spotlight"
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{isCurrentSpotlight ? 'Featured Spotlight ★' : 'Set as Community Spotlight'}</span>
            </button>
          )}
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

      {/* Mobile Action Bar: Edit & Share */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-mono text-[#888888] uppercase tracking-wider">
            Vehicle Profile
          </div>
          <div className="flex items-center gap-2">
            {(isOwner || isHardAdmin(currentUser)) && (
              <button
                type="button"
                onClick={() => onEditVehicle(vehicle.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#333333] hover:bg-[#3d3d3d] text-xs font-['Oswald'] font-bold uppercase tracking-wider text-white border border-[#444444] transition-all duration-150 active:scale-[0.98] cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5 text-[#C8102E]" />
                <span>{isOwner ? 'Edit Build' : 'Admin Edit'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c1c1c] hover:bg-[#2d2d2d] text-xs font-mono text-[#bbbbbb] hover:text-white border border-[#3d3d3d] transition-all duration-150 active:scale-[0.98] cursor-pointer"
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

      {/* Tabs Navigation Bar: Mobile 4-Button Grid (Zero scrollbar, all visible at once) & Desktop Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3 sm:mt-6">
        {/* Mobile Full-Width 4-Button Grid */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-[#1a1a1c] border border-[#38383a] sm:hidden">
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`flex flex-col items-center justify-center py-2 px-1 text-center transition-all duration-150 active:scale-[0.98] cursor-pointer ${
              activeTab === 'specs'
                ? 'bg-[#C8102E] text-white shadow font-bold'
                : 'bg-[#222225] text-[#9ba5b7] hover:text-white hover:bg-[#28282c]'
            }`}
          >
            <Gauge className="w-4 h-4 mb-0.5 shrink-0" />
            <span className="text-[11px] font-['Oswald'] uppercase tracking-wider leading-tight truncate w-full">
              Specs
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`flex flex-col items-center justify-center py-2 px-1 text-center transition-all duration-150 active:scale-[0.98] cursor-pointer ${
              activeTab === 'about'
                ? 'bg-[#C8102E] text-white shadow font-bold'
                : 'bg-[#222225] text-[#9ba5b7] hover:text-white hover:bg-[#28282c]'
            }`}
          >
            <BookOpen className="w-4 h-4 mb-0.5 shrink-0" />
            <span className="text-[11px] font-['Oswald'] uppercase tracking-wider leading-tight truncate w-full">
              About
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`flex flex-col items-center justify-center py-2 px-1 text-center transition-all duration-150 active:scale-[0.98] cursor-pointer ${
              activeTab === 'photos'
                ? 'bg-[#C8102E] text-white shadow font-bold'
                : 'bg-[#222225] text-[#9ba5b7] hover:text-white hover:bg-[#28282c]'
            }`}
          >
            <Camera className="w-4 h-4 mb-0.5 shrink-0" />
            <span className="text-[11px] font-['Oswald'] uppercase tracking-wider leading-tight truncate w-full">
              Photos ({vehicle.galleryImages.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('discussion')}
            className={`flex flex-col items-center justify-center py-2 px-1 text-center transition-all duration-150 active:scale-[0.98] cursor-pointer ${
              activeTab === 'discussion'
                ? 'bg-[#C8102E] text-white shadow font-bold'
                : 'bg-[#222225] text-[#9ba5b7] hover:text-white hover:bg-[#28282c]'
            }`}
          >
            <MessageSquare className="w-4 h-4 mb-0.5 shrink-0" />
            <span className="text-[11px] font-['Oswald'] uppercase tracking-wider leading-tight truncate w-full">
              Chat ({vehicleComments.length})
            </span>
          </button>
        </div>

        {/* Desktop Tab Bar */}
        <div className="hidden sm:flex items-center justify-between border-b border-[#38383a]">
          <div className="flex items-center gap-6 sm:gap-8 font-['Oswald'] text-sm sm:text-base font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`py-3 sm:py-3.5 border-b-2 transition-colors relative cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'specs' || activeTab === 'about'
                  ? 'border-[#C8102E] text-[#C8102E]'
                  : 'border-transparent text-[#8d98ab] hover:text-white'
              }`}
            >
              <Gauge className="w-4 h-4" />
              <span>Technical Sheet</span>
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
              <span>Photos ({vehicle.galleryImages.length})</span>
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
              <span>Discussions ({vehicleComments.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {(isOwner || isHardAdmin(currentUser)) && (
              <button
                type="button"
                onClick={() => onEditVehicle(vehicle.id)}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#333333] hover:bg-[#3d3d3d] text-xs sm:text-sm font-['Oswald'] font-bold uppercase tracking-wider text-white border border-[#444444] transition-all duration-150 active:scale-[0.98] cursor-pointer shrink-0"
              >
                <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C8102E]" />
                <span>{isOwner ? 'Edit Build' : 'Admin Edit'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#1c1c1c] hover:bg-[#2d2d2d] text-xs sm:text-sm font-mono text-[#bbbbbb] hover:text-white border border-[#3d3d3d] transition-all duration-150 active:scale-[0.98] cursor-pointer shrink-0"
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

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-6 min-w-0">
            
            {/* TAB: SPECS / TECHNICAL SHEET */}
            {activeTab === 'specs' && (
              <div className="space-y-6">
                {renderSpecsTable()}
              </div>
            )}

            {/* TAB: ABOUT THE BUILD (Dedicated mobile page before photos) */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="sm:hidden pb-1 border-b border-[#38383a]">
                  <h2 className="font-['Oswald'] text-2xl font-bold uppercase tracking-wide text-white">
                    About the Build
                  </h2>
                </div>
                <div className="space-y-6 lg:hidden">
                  {renderOwnerSection()}
                  {renderCrewSection()}
                  {renderMoreBuildsSection()}
                </div>
                {/* On desktop if about active, show Specs table */}
                <div className="hidden lg:block space-y-6">
                  {renderSpecsTable()}
                </div>
              </div>
            )}

            {/* TAB: PHOTOS GALLERY */}
            {activeTab === 'photos' && (
              <div className="bg-[#242426] border border-[#38383a] p-5 sm:p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#333336]">
                  <h3 className="font-['Oswald'] text-xl font-bold uppercase tracking-wide text-white">
                    Vehicle Photo Gallery
                  </h3>
                  <span className="text-xs font-mono text-[#aaaaaa]">
                    {vehicle.galleryImages.length} {vehicle.galleryImages.length === 1 ? 'photo' : 'photos'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vehicle.galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setActiveLightboxImage(img);
                        setLightboxOpen(true);
                      }}
                      className="group relative aspect-video bg-black border border-[#38383a] overflow-hidden cursor-pointer hover:border-[#C8102E] transition-all"
                    >
                      <img
                        src={img}
                        alt={`${vehicle.year} ${vehicle.make} photo ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {idx === 0 && (
                        <div className="absolute top-2 left-2 bg-[#C8102E] text-white text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider shadow">
                          Primary
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-xs font-mono uppercase tracking-wider text-white bg-black/70 px-3 py-1 border border-white/20">
                          View Fullscreen
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: DISCUSSIONS (Full Threaded Conversation Thread & Builder Story/Notes) */}
            {activeTab === 'discussion' && (
              <div className="space-y-6">
                {/* The Story Behind This Build / Builder Journal */}
                {renderStorySection()}

                <div className="bg-[#242426] border border-[#38383a] p-4 sm:p-6 space-y-4 shadow-sm">
                  <div>
                    <h3 className="font-['Oswald'] text-xl font-bold uppercase tracking-wide text-white">
                      Community Discussions & Build Notes
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

          {/* Desktop Sidebar Column - Hidden on mobile because it is moved to 'About the Build' tab */}
          <div className="hidden lg:block lg:col-span-4 space-y-6">
            {renderOwnerSection()}
            {renderCrewSection()}
            {renderMoreBuildsSection()}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && activeLightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
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
