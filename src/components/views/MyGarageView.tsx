import React, { useState } from 'react';
import { Vehicle, Owner, isHardAdmin } from '../../types/garage';
import { VehicleCard } from '../cards/VehicleCard';
import { ImageUploadDropzone } from '../common/ImageUploadDropzone';
import { 
  Plus, Wrench, MapPin, Edit3, Calendar, X, Check, Share2, ShieldCheck, Copy, ExternalLink
} from 'lucide-react';
import { formatMemberSince, normalizeCityState, POPULAR_US_CITIES } from '../../utils/dateAndLocationUtils';

interface MyGarageViewProps {
  currentUser: Owner;
  vehicles: Vehicle[];
  onSelectVehicle: (id: string) => void;
  onOpenAddVehicle: () => void;
  onEditVehicle?: (vehicleId: string) => void;
  onUpdateVehicle?: (updated: Vehicle) => void;
  onDeleteVehicle?: (id: string) => void;
  onUpdateCurrentUser?: (updated: Owner) => void;
  likedVehicleIds?: Set<string>;
  dislikedVehicleIds?: Set<string>;
  onLikeToggle?: (id: string) => void;
  onDislikeToggle?: (id: string) => void;
}

export const MyGarageView: React.FC<MyGarageViewProps> = ({
  currentUser,
  vehicles,
  onSelectVehicle,
  onOpenAddVehicle,
  onEditVehicle,
  onUpdateCurrentUser,
}) => {
  // Current user's owned vehicles
  const userVehicles = vehicles.filter(v => v.owner.id === currentUser.id);

  // Split name into first and last name (pre-populated from Shopify customer name)
  const parseName = (fullName: string) => {
    const parts = (fullName || '').trim().split(/\s+/);
    const first = parts[0] || '';
    const last = parts.slice(1).join(' ') || '';
    return { first, last };
  };

  const initialName = parseName(currentUser.name);

  // Profile Edit Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState(initialName.first);
  const [editLastName, setEditLastName] = useState(initialName.last);
  const [editBio, setEditBio] = useState(currentUser.bio);
  const [editLocation, setEditLocation] = useState(currentUser.location);
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);
  const [editCoverPhoto, setEditCoverPhoto] = useState(
    currentUser.coverPhoto || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=80'
  );
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync state whenever modal opens or currentUser updates
  React.useEffect(() => {
    if (isEditProfileOpen) {
      const parsed = parseName(currentUser.name);
      setEditFirstName(parsed.first);
      setEditLastName(parsed.last);
      setEditBio(currentUser.bio);
      setEditLocation(currentUser.location);
      setEditAvatar(currentUser.avatar);
      setEditCoverPhoto(
        currentUser.coverPhoto || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=80'
      );
    }
  }, [isEditProfileOpen, currentUser]);

  // Handle saving profile changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateCurrentUser) return;
    const fullName = `${editFirstName.trim()} ${editLastName.trim()}`.trim() || currentUser.name;
    const normalizedLocation = normalizeCityState(editLocation.trim()) || currentUser.location;
    const updated: Owner = {
      ...currentUser,
      name: fullName,
      handle: fullName,
      bio: editBio.trim(),
      location: normalizedLocation,
      avatar: editAvatar.trim() || currentUser.avatar,
      coverPhoto: editCoverPhoto.trim() || currentUser.coverPhoto,
    };
    onUpdateCurrentUser(updated);
    setIsEditProfileOpen(false);
  };

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Derived user first name and share copy
  const userFirstName = (currentUser.name || '').trim().split(' ')[0] || 'User';
  const shareMessage = `Check out ${userFirstName}'s Garage on Gascanco.`;
  const garageShareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?garage=${encodeURIComponent(currentUser.id)}`
    : `https://gascanco.com/?garage=${encodeURIComponent(currentUser.id)}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(garageShareUrl)}&quote=${encodeURIComponent(shareMessage)}`;

  const handleOpenShareModal = () => {
    setIsShareModalOpen(true);
  };

  const handleCopyShareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareMessage}\n${garageShareUrl}`);
    }
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2400);
  };

  const handleNativeDeviceShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${userFirstName}'s Garage | Gascanco`,
          text: shareMessage,
          url: garageShareUrl,
        });
      } catch {
        handleCopyShareLink();
      }
    } else {
      handleCopyShareLink();
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-[#303030] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* GARAGE COVER PHOTO & PROFILE HERO */}
        <section className="bg-[#242424] border border-[#3d3d3d] mb-6 sm:mb-8 overflow-hidden shadow-md">
          {/* Cover Photo */}
          <div className="relative w-full h-52 sm:h-64 md:h-80 lg:h-96 xl:h-[420px] bg-[#1a1a1a] overflow-hidden">
            <img
              src={currentUser.coverPhoto || "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=80"}
              alt={`${currentUser.name}'s Garage Cover`}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#242424] via-black/25 to-black/15" />
          </div>

          {/* Profile Header Details below cover */}
          <div className="p-5 sm:p-7 md:p-8 pt-0 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 -mt-12 sm:-mt-16 md:-mt-20 lg:-mt-24 mb-3 sm:mb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-44 lg:h-44 object-cover border-2 sm:border-3 border-[#C8102E] shadow-2xl flex-shrink-0 bg-[#1c1c1c]"
                />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="font-['Oswald'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase text-white leading-tight">
                      {currentUser.name}
                    </h1>
                    {isHardAdmin(currentUser) && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C8102E] text-white font-['Oswald'] font-black text-xs sm:text-sm tracking-wider uppercase border border-[#ff4d4d] shadow-lg">
                        <ShieldCheck className="w-4 h-4" />
                        <span>VERIFIED SUPER ADMIN</span>
                      </span>
                    )}
                  </div>

                  {currentUser.bio && (
                    <p className="text-sm sm:text-base md:text-lg text-[#dddddd] max-w-2xl leading-relaxed">
                      {currentUser.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm md:text-base font-mono text-[#aaaaaa] pt-1">
                    <span className="flex items-center gap-1.5 text-white">
                      <MapPin className="w-4 h-4 text-[#C8102E]" />
                      <span>{currentUser.location}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-[#888888]">
                      <Calendar className="w-4 h-4" />
                      <span>Member since {formatMemberSince(currentUser.memberSince)}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Action Buttons */}
              <div className="flex items-center gap-2.5 self-start md:self-end flex-wrap pt-2 md:pt-0">
                <button
                  type="button"
                  onClick={handleOpenShareModal}
                  className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 bg-[#303030] hover:bg-[#3d3d3d] text-white border border-[#444444] text-xs sm:text-sm font-['Oswald'] font-bold uppercase tracking-wider transition-colors cursor-pointer group"
                  title="Share Garage profile on Facebook and social media"
                >
                  <Share2 className="w-4 h-4 text-[#C8102E] group-hover:scale-110 transition-transform" />
                  <span>Share Garage</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 bg-[#303030] hover:bg-[#3d3d3d] text-white border border-[#444444] text-xs sm:text-sm font-['Oswald'] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-[#C8102E]" />
                  <span>Edit Profile</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenAddVehicle}
                  className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 bg-[#C8102E] hover:bg-[#e01334] text-white font-['Oswald'] font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add Vehicle</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* EDIT PROFILE MODAL */}
        {isEditProfileOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
            <div className="relative w-full max-w-lg md:max-w-3xl border border-[#3d3d3d] bg-[#242424] text-white shadow-2xl p-5 sm:p-6 my-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#333333] mb-4">
                <h3 className="font-['Oswald'] text-xl font-bold uppercase tracking-wider text-white">
                  Edit Profile
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="p-1 text-[#888888] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Left Column: Text fields */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono uppercase text-[#aaaaaa] mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          required
                          value={editFirstName}
                          onChange={(e) => setEditFirstName(e.target.value)}
                          placeholder="First Name"
                          className="w-full bg-[#1c1c1c] border border-[#444444] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C8102E]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-[#aaaaaa] mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          required
                          value={editLastName}
                          onChange={(e) => setEditLastName(e.target.value)}
                          placeholder="Last Name"
                          className="w-full bg-[#1c1c1c] border border-[#444444] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C8102E]"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-mono uppercase text-[#aaaaaa]">
                          Location (City &amp; State)
                        </label>
                        <span className="text-[10px] font-mono text-[#888888]">
                          Can change for privacy
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        list="popular-us-cities"
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        onBlur={() => setEditLocation(prev => normalizeCityState(prev))}
                        placeholder="e.g. Costa Mesa, CA"
                        className="w-full bg-[#1c1c1c] border border-[#444444] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C8102E]"
                      />
                      <datalist id="popular-us-cities">
                        {POPULAR_US_CITIES.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                      <p className="text-[10px] text-[#777777] font-mono mt-1">
                        Sourced as City, State (e.g. Costa Mesa, CA) to ensure clean database indexing.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#aaaaaa] mb-1">
                        Short Bio
                      </label>
                      <textarea
                        rows={4}
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        placeholder="Short bio about your garage, builds, or shop..."
                        className="w-full bg-[#1c1c1c] border border-[#444444] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C8102E]"
                      />
                    </div>
                  </div>

                  {/* Right Column: Visual assets */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#aaaaaa] mb-1">
                        Profile Scene
                      </label>
                      <ImageUploadDropzone
                        value={editCoverPhoto}
                        onChange={(dataUrl) => setEditCoverPhoto(dataUrl)}
                        onRemove={() => setEditCoverPhoto('')}
                        aspectRatio="video"
                        buttonText="Upload Profile Scene"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#aaaaaa] mb-1">
                        Profile Photo
                      </label>
                      <ImageUploadDropzone
                        value={editAvatar}
                        onChange={(dataUrl) => setEditAvatar(dataUrl)}
                        onRemove={() => setEditAvatar('')}
                        aspectRatio="square"
                        isAvatar={true}
                        buttonText="Upload Profile Photo"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-[#333333]">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#C8102E] hover:bg-[#e01334] text-white font-['Oswald'] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center shadow-xs"
                  >
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SOCIAL SHARE GARAGE MODAL */}
        {isShareModalOpen && (
          <div 
            className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
            onClick={() => setIsShareModalOpen(false)}
          >
            <div 
              className="relative w-full max-w-md border border-[#3e3e42] bg-[#222224] text-white shadow-2xl p-5 sm:p-6 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#333336] mb-4">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#C8102E]" />
                  <h3 className="font-['Oswald'] text-xl font-bold uppercase tracking-wider text-white">
                    Share {userFirstName}'s Garage
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="p-1 text-[#888888] hover:text-white transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Message Preview Box */}
              <div className="p-3.5 bg-[#171719] border border-[#333336] mb-4">
                <span className="block text-[10px] font-mono uppercase tracking-wider text-[#888888] mb-1">
                  Share Message
                </span>
                <p className="font-['Oswald'] text-base sm:text-lg font-bold text-white tracking-wide leading-snug">
                  "{shareMessage}"
                </p>
                <div className="mt-2 pt-2 border-t border-[#26262a] text-[11px] font-mono text-[#aaaaaa] truncate">
                  {garageShareUrl}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2.5">
                {/* 1. Share on Facebook */}
                <a
                  href={facebookShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white font-['Oswald'] font-bold text-sm uppercase tracking-wider transition-all duration-150 active:scale-[0.98] shadow-sm"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Share on Facebook</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                {/* 2. Copy Link & Formatted Message */}
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#2c2c30] hover:bg-[#38383e] border border-[#444448] text-white font-['Oswald'] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {shareCopied ? (
                    <>
                      <Check className="w-4 h-4 text-[#10b981]" />
                      <span className="text-[#10b981]">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#aaaaaa]" />
                      <span>Copy Link & Message</span>
                    </>
                  )}
                </button>

                {/* 3. Native Device Share */}
                {typeof navigator !== 'undefined' && typeof (navigator as any).share === 'function' && (
                  <button
                    type="button"
                    onClick={handleNativeDeviceShare}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#232326] hover:bg-[#2c2c30] border border-[#38383c] text-[#cccccc] hover:text-white font-['Oswald'] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-[#C8102E]" />
                    <span>More Share Options</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* User Garage Vehicles */}
        {userVehicles.length > 0 ? (
          <div className={`grid gap-4 sm:gap-6 md:gap-8 w-full ${
            userVehicles.length === 1
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 max-w-4xl'
              : userVehicles.length === 2
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 max-w-5xl'
              : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4'
          }`}>
            {userVehicles.map((vehicle) => (
              <div key={vehicle.id} className="min-w-0 w-full">
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  variant="my-garage"
                  onSelect={onSelectVehicle}
                  onEdit={(id) => onEditVehicle?.(id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-[#3d3d3d] bg-[#242424] p-12 text-center max-w-lg mx-auto">
            <Wrench className="w-12 h-12 text-[#6d798f] mx-auto mb-4" />
            <h3 className="font-['Oswald'] text-2xl font-bold uppercase text-white">
              Your Garage is currently empty
            </h3>
            <p className="text-sm text-[#8c97aa] mt-2">
              Add your daily driver, track project, or weekend build to start documenting your garage.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={onOpenAddVehicle}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C8102E] hover:bg-[#e01334] text-white font-['Oswald'] font-bold text-sm uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
