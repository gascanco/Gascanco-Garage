import React, { useState } from 'react';
import { Vehicle, ModificationCategory, BuildUpdate, Owner, PostComment, isHardAdmin } from '../../types/garage';
import { 
  ArrowLeft, Share2, Wrench, Calendar, MapPin, 
  ExternalLink, ChevronLeft, ChevronRight, Check, Sparkles, 
  Layers, MessageSquare, Gauge, Eye, X, PlusCircle, ThumbsDown, Camera,
  Trash2, ShieldCheck
} from 'lucide-react';
import { ReactionButtons } from '../common/ReactionButtons';
import { LoveYouGesture } from '../common/LoveYouGesture';
import { ThreadedComments } from '../common/ThreadedComments';

interface VehicleDetailViewProps {
  vehicle: Vehicle;
  currentUser: Owner;
  onBack: () => void;
  onSelectOwner?: (ownerId: string) => void;
  onEditVehicle: (vehicleId: string) => void;
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
}

export const VehicleDetailView: React.FC<VehicleDetailViewProps> = ({
  vehicle,
  currentUser,
  onBack,
  onSelectOwner,
  onEditVehicle,
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
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'specs' | 'photos'>('specs');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFollowing, setIsFollowing] = useState(vehicle.owner.isFollowing || false);
  const [showShopifyNotice, setShowShopifyNotice] = useState(false);
  const [expandedUpdateComments, setExpandedUpdateComments] = useState<Set<string>>(new Set());
  const [likedUpdateIds, setLikedUpdateIds] = useState<Set<string>>(new Set());
  const [dislikedUpdateIds, setDislikedUpdateIds] = useState<Set<string>>(new Set());

  const handleToggleUpdateLike = (updateId: string) => {
    setLikedUpdateIds(prev => {
      const next = new Set(prev);
      if (next.has(updateId)) {
        next.delete(updateId);
      } else {
        next.add(updateId);
        setDislikedUpdateIds(prevD => {
          const nextD = new Set(prevD);
          nextD.delete(updateId);
          return nextD;
        });
      }
      return next;
    });
  };

  const handleToggleUpdateDislike = (updateId: string) => {
    setDislikedUpdateIds(prev => {
      const next = new Set(prev);
      if (next.has(updateId)) {
        next.delete(updateId);
      } else {
        next.add(updateId);
        setLikedUpdateIds(prevL => {
          const nextL = new Set(prevL);
          nextL.delete(updateId);
          return nextL;
        });
      }
      return next;
    });
  };

  const toggleUpdateComments = (updateId: string) => {
    setExpandedUpdateComments(prev => {
      const next = new Set(prev);
      if (next.has(updateId)) next.delete(updateId);
      else next.add(updateId);
      return next;
    });
  };

  const isOwner = currentUser.id === vehicle.owner.id;

  // Related vehicles (same make or location, excluding current)
  const relatedVehicles = React.useMemo(() => {
    return allVehicles
      .filter(v => v.id !== vehicle.id && (v.make === vehicle.make || v.owner.location === vehicle.owner.location))
      .slice(0, 3);
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

  return (
    <div className="min-h-screen pb-24 bg-[#303030] text-[#eaeaea]">
      {/* Header with bold Year Make & Model directly above photo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="p-1 -ml-1 text-[#8c97aa] hover:text-white transition-colors cursor-pointer"
            title="Back to Garage Discovery"
          >
            <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
          <h1 className="font-['Oswald'] text-3xl sm:text-5xl lg:text-6xl font-black uppercase text-white tracking-tight leading-none">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h1>
        </div>

        {/* Multi-Photo Gallery Showcase */}
        <div className="space-y-3">
          {/* Primary Viewport Image */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full rounded-xl overflow-hidden border border-[#3d3d3d] bg-[#0c0e12]">
            <img
              src={vehicle.galleryImages[activeImageIndex] || vehicle.primaryImage}
              alt={`${vehicle.year} ${vehicle.make}`}
              className="w-full h-full object-cover transition-all duration-300"
            />

            {/* Like / Dislike Reaction Buttons Overlay - Only item visible on photo */}
            <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-sm p-1 border border-white/15">
              <ReactionButtons
                vehicleId={vehicle.id}
                likesCount={vehicle.likesCount}
                isLiked={isLiked}
                isDisliked={isDisliked}
                onLikeToggle={onLikeToggle}
                onDislikeToggle={onDislikeToggle}
                size="md"
              />
            </div>
          </div>

          {/* Thumbnail Strip */}
          {vehicle.galleryImages.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {vehicle.galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-14 sm:w-28 sm:h-18 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#C8102E] ring-2 ring-[#C8102E]/40'
                      : 'border-[#3d3d3d] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Static Navigation Tabs Bar (Technical Sheet & Photos + Share Build) */}
      <section className="bg-[#242424] border-y border-[#3d3d3d]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 sm:gap-6 md:gap-8 font-['Oswald'] text-xs sm:text-base md:text-lg font-bold uppercase tracking-wider shrink-0">
              <button
                onClick={() => setActiveTab('specs')}
                className={`py-3 sm:py-3.5 border-b-2 transition-colors relative cursor-pointer flex items-center gap-1.5 sm:gap-2 shrink-0 ${
                  activeTab === 'specs'
                    ? 'border-[#C8102E] text-[#C8102E]'
                    : 'border-transparent text-[#8d98ab] hover:text-white'
                }`}
              >
                <Gauge className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>
                  <span className="sm:hidden">Tech Sheet</span>
                  <span className="hidden sm:inline">Technical Sheet</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab('photos')}
                className={`py-3 sm:py-3.5 border-b-2 transition-colors relative cursor-pointer flex items-center gap-1.5 sm:gap-2 shrink-0 ${
                  activeTab === 'photos'
                    ? 'border-[#C8102E] text-[#C8102E]'
                    : 'border-transparent text-[#8d98ab] hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Photos ({vehicle.galleryImages.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {(isOwner || isHardAdmin(currentUser)) && (
                <button
                  onClick={() => onEditVehicle(vehicle.id)}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#333333] hover:bg-[#3d3d3d] text-xs sm:text-sm font-['Oswald'] font-bold uppercase tracking-wider text-white border border-[#444444] transition-colors cursor-pointer shrink-0"
                >
                  <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C8102E]" />
                  <span className="hidden sm:inline">{isOwner ? 'Edit Build' : 'Admin Edit'}</span>
                  <span className="sm:hidden">Edit</span>
                </button>
              )}

              {isHardAdmin(currentUser) && (
                <button
                  onClick={() => {
                    if (window.confirm(`Super Admin: Are you sure you want to delete ${vehicle.year} ${vehicle.make} ${vehicle.model}?`)) {
                      onDeleteVehicle?.(vehicle.id);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#252525] hover:bg-[#C8102E] text-xs sm:text-sm font-['Oswald'] font-bold uppercase tracking-wider text-[#ff5555] hover:text-white border border-[#444444] hover:border-[#C8102E] transition-colors cursor-pointer shrink-0"
                  title="Super Admin: Delete this build"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Delete Build</span>
                  <span className="sm:hidden">Delete</span>
                </button>
              )}

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#1c1c1c] hover:bg-[#2d2d2d] text-xs sm:text-sm font-mono text-[#bbbbbb] hover:text-white border border-[#3d3d3d] transition-colors cursor-pointer shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#10b981]" />
                    <span className="text-[#10b981]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C8102E]" />
                    <span>
                      <span className="sm:hidden">Share</span>
                      <span className="hidden sm:inline">Share Build</span>
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-8">
            {/* TAB: PHOTOS GALLERY */}
            {activeTab === 'photos' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#3d3d3d]">
                  <div>
                    <h2 className="font-['Oswald'] text-2xl font-bold uppercase text-white tracking-wide">
                      Vehicle Photo Gallery
                    </h2>
                    <p className="text-xs text-[#828fa4] font-mono mt-0.5">
                      {vehicle.galleryImages.length} {vehicle.galleryImages.length === 1 ? 'photo' : 'photos'} uploaded
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vehicle.galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setActiveLightboxImage(img);
                        setLightboxOpen(true);
                      }}
                      className="group relative aspect-video bg-black border border-[#3d3d3d] overflow-hidden cursor-pointer hover:border-[#C8102E] transition-all"
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

            {/* TAB 2: TECHNICAL SHEET */}
            {activeTab === 'specs' && (
              <div className="space-y-6">
                <div className="pb-3 border-b border-[#3d3d3d]">
                  <h2 className="font-['Oswald'] text-2xl font-bold uppercase text-white tracking-wide">
                    Vehicle Specifications & Factory Architecture
                  </h2>
                  <p className="text-xs text-[#828fa4] font-mono mt-0.5">
                    Chassis, powertrain configuration, and baseline architecture
                  </p>
                </div>

                <div className="rounded-lg border border-[#3d3d3d] bg-[#242424] overflow-hidden">
                  <table className="w-full text-xs font-mono">
                    <tbody className="divide-y divide-[#333333]">
                      <tr className="hover:bg-[#151923]">
                        <td className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 text-[#738096] uppercase w-5/12 sm:w-1/3">Year / Make / Model</td>
                        <td className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 text-white font-bold">{vehicle.year} {vehicle.make} {vehicle.model}</td>
                      </tr>
                      <tr className="hover:bg-[#151923]">
                        <td className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 text-[#738096] uppercase">Trim Package</td>
                        <td className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 text-white">{vehicle.trim || 'Standard'}</td>
                      </tr>
                      <tr className="hover:bg-[#151923]">
                        <td className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 text-[#738096] uppercase">Powertrain / Engine</td>
                        <td className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 text-white font-medium">{vehicle.engine}</td>
                      </tr>
                      <tr className="hover:bg-[#151923]">
                        <td className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 text-[#738096] uppercase">Power Output</td>
                        <td className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 text-[#ffffff] font-bold">{vehicle.horsepower || 'Not Disclosed'}</td>
                      </tr>
                      <tr className="hover:bg-[#151923]">
                        <td className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 text-[#738096] uppercase">Transmission</td>
                        <td className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 text-white">{vehicle.transmission}</td>
                      </tr>
                      <tr className="hover:bg-[#151923]">
                        <td className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 text-[#738096] uppercase">Drivetrain Layout</td>
                        <td className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 text-white">{vehicle.drivetrain}</td>
                      </tr>
                      <tr className="hover:bg-[#151923]">
                        <td className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 text-[#738096] uppercase">Exterior Colorway</td>
                        <td className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 text-white">{vehicle.color}</td>
                      </tr>
                      <tr className="hover:bg-[#151923]">
                        <td className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 text-[#738096] uppercase">Garage Location</td>
                        <td className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 text-white">{vehicle.owner.location}</td>
                      </tr>
                      <tr className="hover:bg-[#151923]">
                        <td className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 text-[#738096] uppercase">Build Intent</td>
                        <td className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 text-white">{vehicle.buildStatus}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Owner Spotlight Sidebar Box */}
            <div className="rounded-lg border border-[#3d3d3d] bg-[#242424] p-5">
              <span className="text-[11px] font-mono text-[#C8102E] uppercase tracking-wider block mb-3">
                WRENCHED BY
              </span>
              <div className="flex items-center gap-3">
                <img
                  src={vehicle.owner.avatar}
                  alt={vehicle.owner.name}
                  className="w-12 h-12 rounded-full object-cover border border-[#3b4457]"
                />
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-['Oswald'] text-xl font-bold uppercase text-white leading-tight">
                      {vehicle.owner.name}
                    </h4>
                    {isHardAdmin(vehicle.owner) && (
                      <span className="px-1.5 py-0.5 bg-[#C8102E] text-white font-['Oswald'] font-black text-[9px] tracking-wider uppercase inline-flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" /> ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#8491a6] font-mono">{vehicle.owner.location}</p>
                </div>
              </div>

              <p className="text-xs text-[#9aa6b9] mt-3 leading-relaxed">
                {vehicle.owner.bio}
              </p>

              <div className="mt-4 pt-4 border-t border-[#333333] flex items-center justify-between text-xs font-mono text-[#7b879c]">
                <span>Member Since {vehicle.owner.memberSince}</span>
                <span className="text-[#C8102E] font-bold">
                  {isHardAdmin(vehicle.owner) ? 'VERIFIED SUPER ADMIN' : 'Gascanco Builder'}
                </span>
              </div>

              {!isOwner && (
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`mt-4 w-full py-1.5 rounded text-xs font-['Oswald'] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    isFollowing
                      ? 'bg-[#1e2533] text-[#a5b0c2] border border-[#2d364a]'
                      : 'bg-[#C8102E] hover:bg-[#e01334] text-white shadow-sm'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow Builder'}
                </button>
              )}
            </div>

            {/* Shopify Store Connection Card */}
            <div className="rounded-lg border border-[#293245] bg-[#141823] p-5">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#ffffff] mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>GASCANCO STORE COMPATIBILITY</span>
              </div>
              <h4 className="font-['Oswald'] text-xl font-bold uppercase text-white">
                Shop parts for this chassis
              </h4>
              <p className="text-xs text-[#9aa6b8] mt-2 leading-relaxed">
                Browse apparel, garage accessories, and chassis-specific parts engineered for {vehicle.make} enthusiasts.
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowShopifyNotice(true);
                    setTimeout(() => setShowShopifyNotice(false), 3000);
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded bg-[#1e2536] hover:bg-[#283247] text-white text-xs font-['Oswald'] font-bold uppercase tracking-wider border border-[#323d53] transition-colors cursor-pointer"
                >
                  {showShopifyNotice ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#10b981]" />
                      <span className="text-[#10b981]">Gascanco {vehicle.make} Collection Filtered</span>
                    </>
                  ) : (
                    <>
                      <span>Explore {vehicle.make} Collection</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Related Community Builds */}
            {relatedVehicles.length > 0 && (
              <div className="rounded-lg border border-[#3d3d3d] bg-[#242424] p-5">
                <span className="text-[11px] font-mono text-[#828ea2] uppercase tracking-wider block mb-3">
                  MORE {vehicle.make.toUpperCase()} BUILDS
                </span>
                <div className="space-y-3">
                  {relatedVehicles.map(rel => (
                    <div
                      key={rel.id}
                      onClick={() => onSelectRelated(rel.id)}
                      className="group flex items-center gap-3 p-2 rounded hover:bg-[#181c26] cursor-pointer transition-colors"
                    >
                      <img
                        src={rel.primaryImage}
                        alt=""
                        className="w-14 h-12 rounded object-cover border border-[#242b39]"
                      />
                      <div className="min-w-0 flex-1">
                        <h5 className="font-['Oswald'] text-base font-bold uppercase text-white truncate group-hover:text-[#C8102E] transition-colors">
                          {rel.year} {rel.make} {rel.model}
                        </h5>
                        <p className="text-[11px] text-[#788497] font-mono truncate">
                          {rel.buildStatus} · by {rel.owner.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 backdrop-blur-md">
          <div className="flex items-center justify-between text-white">
            <span className="font-['Oswald'] text-xl font-bold uppercase">
              {vehicle.year} {vehicle.make} {vehicle.model} · Photo {activeImageIndex + 1} of {vehicle.galleryImages.length}
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={vehicle.galleryImages[activeImageIndex]}
              alt=""
              className="max-h-full max-w-full object-contain rounded"
            />
            {vehicle.galleryImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 p-3 rounded-full bg-black/70 hover:bg-black text-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 p-3 rounded-full bg-black/70 hover:bg-black text-white"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
            {vehicle.galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-16 h-12 rounded overflow-hidden border-2 flex-shrink-0 ${
                  activeImageIndex === idx ? 'border-[#C8102E]' : 'border-transparent opacity-50'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comment Photo Lightbox Modal - Full-Res View, No Box, Clicking Photo Closes */}
      {activeLightboxImage && (
        <div 
          onClick={() => setActiveLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm animate-fade-in cursor-pointer select-none"
          title="Click photo to close"
        >
          <img 
            src={activeLightboxImage} 
            alt="Full resolution attachment" 
            onClick={() => setActiveLightboxImage(null)}
            className="max-h-[96vh] max-w-[96vw] w-auto h-auto object-contain cursor-pointer transition-opacity duration-150 hover:opacity-95"
          />
        </div>
      )}
    </div>
  );
};
