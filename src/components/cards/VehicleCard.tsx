import React, { useState } from 'react';
import { Vehicle, isHardAdmin } from '../../types/garage';
import { Wrench, BookOpen, MapPin, Sparkles, Edit, ArrowRight, ShieldCheck } from 'lucide-react';
import { ReactionButtons } from '../common/ReactionButtons';

interface VehicleCardProps {
  vehicle: Vehicle;
  variant?: 'grid' | 'featured' | 'compact' | 'carousel' | 'my-garage';
  showLocation?: boolean;
  onSelect: (vehicleId: string) => void;
  onEdit?: (vehicleId: string) => void;
  onOwnerClick?: (ownerId: string) => void;
  onLikeToggle?: (vehicleId: string) => void;
  onDislikeToggle?: (vehicleId: string) => void;
  isLiked?: boolean;
  isDisliked?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  variant = 'grid',
  showLocation = variant !== 'my-garage',
  onSelect,
  onEdit,
  onOwnerClick,
  onLikeToggle,
  onDislikeToggle,
  isLiked = false,
  isDisliked = false,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Fallback image gradient container if image fails
  const renderImageFallback = () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#202020] text-[#888888] p-4 text-center">
      <Wrench className="w-8 h-8 text-[#C8102E] mb-2 opacity-80" />
      <span className="font-['Oswald'] font-bold text-lg text-white uppercase tracking-wider">
        {vehicle.year} {vehicle.make} {vehicle.model}
      </span>
      <span className="text-xs text-[#aaaaaa] font-mono mt-1">{vehicle.engine}</span>
    </div>
  );

  // Helper to cleanly extract and format Trim & Chassis
  const getTrimAndChassis = () => {
    const rawTrim = vehicle.trim || '';
    const rawChassis = vehicle.chassis || '';

    const match = rawTrim.match(/^(.*?)\s*\((.*?)\)$/);
    if (match) {
      const trimPart = match[1].trim();
      const chassisPart = rawChassis || match[2].trim();
      return `${trimPart} · ${chassisPart}`;
    }

    if (rawTrim && rawChassis && rawTrim !== rawChassis) {
      return `${rawTrim} · ${rawChassis}`;
    }

    return rawTrim || rawChassis || 'Standard';
  };

  // 1. FEATURED EDITORIAL SPOTLIGHT VARIANT (Strictly single line, zero wrap, clean & balanced)
  if (variant === 'featured') {
    return (
      <div 
        onClick={() => onSelect(vehicle.id)}
        className="group relative cursor-pointer overflow-hidden border border-[#404040] bg-[#242424] hover:border-[#C8102E] transition-all duration-300 shadow-lg min-w-0 w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 min-w-0">
          {/* Visual Showcase */}
          <div className="md:col-span-7 relative h-52 sm:h-64 md:h-auto overflow-hidden bg-[#181818] min-h-[220px] md:min-h-[300px]">
            {!imageError ? (
              <img
                src={vehicle.primaryImage}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ) : (
              renderImageFallback()
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#242424] via-transparent to-black/30 md:bg-gradient-to-r md:from-transparent md:to-[#242424]" />

            {/* Spotlight Banner in #C8102E */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-1.5 bg-[#C8102E] text-white px-2.5 py-1 text-xs font-['Oswald'] font-bold tracking-wider uppercase shadow">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Spotlight Build</span>
            </div>
          </div>

          {/* Details & Specs - Strictly single-line text and titles (no wrap, not cut off) */}
          <div className="md:col-span-5 p-3.5 sm:p-5 md:p-6 flex flex-col justify-between min-w-0 overflow-hidden">
            <div className="min-w-0 overflow-hidden space-y-2">
              {/* Line 1: Make & Model - Strictly single-line, no wrap */}
              <h2 className="font-['Oswald'] text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold uppercase tracking-tight text-white group-hover:text-[#C8102E] transition-colors leading-tight whitespace-nowrap truncate block w-full">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h2>

              {/* Line 2: The Trim & Chassis - Right below Make & Model (Paint color excluded) */}
              <div className="text-xs sm:text-sm font-mono text-[#cccccc] whitespace-nowrap truncate block w-full">
                <span className="text-[#888888] uppercase text-[10px] sm:text-[11px] font-semibold tracking-wider mr-1.5">Trim & Chassis:</span>
                <span className="text-white font-medium">{getTrimAndChassis()}</span>
              </div>

              {/* Line 3: AWD & Track Dedicated - Below Make & Model */}
              <div className="flex items-center gap-2 text-xs font-mono whitespace-nowrap truncate w-full">
                <span className="bg-[#C8102E]/20 text-[#ff4d6d] border border-[#C8102E]/40 px-2 py-0.5 text-[11px] font-bold uppercase shrink-0">
                  {vehicle.drivetrain}
                </span>
                <span className="text-[#555555] shrink-0">·</span>
                <span className="text-[#e0e0e0] font-medium truncate">{vehicle.buildStatus}</span>
              </div>

              {/* Line 4: Clean Specs Bar (Engine & Specs - Single line, no wrap) */}
              <div className="flex items-center gap-2.5 sm:gap-4 py-2 border-y border-[#383838] my-1 sm:my-2 text-xs font-mono text-[#aaaaaa] whitespace-nowrap overflow-hidden w-full">
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <span className="text-[#777777] uppercase text-[10px] shrink-0">ENGINE</span>
                  <span className="text-white font-medium truncate">{vehicle.engine}</span>
                </div>
                {vehicle.horsepower && (
                  <>
                    <span className="text-[#444444] shrink-0">|</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[#777777] uppercase text-[10px] shrink-0">POWER</span>
                      <span className="text-white font-medium">{vehicle.horsepower}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Line 5: Owner Footer & Reaction Buttons - Single line, no wrap */}
            <div className="pt-2.5 sm:pt-3 border-t border-[#383838] flex items-center justify-between gap-2 whitespace-nowrap min-w-0 w-full overflow-hidden">
              <div className="flex items-center gap-2 min-w-0 truncate">
                <img
                  src={vehicle.owner.avatar}
                  alt={vehicle.owner.name}
                  className="w-6 h-6 sm:w-7 sm:h-7 object-cover border border-[#C8102E] shrink-0"
                />
                <div className="min-w-0 truncate">
                  <div className="text-xs font-semibold text-white leading-tight font-['Oswald'] uppercase whitespace-nowrap truncate flex items-center gap-1">
                    <span className="truncate">{vehicle.owner.name}</span>
                    {isHardAdmin(vehicle.owner) && (
                      <span className="px-1 py-0.2 bg-[#C8102E] text-white font-['Oswald'] font-black text-[8px] tracking-wider uppercase inline-flex items-center gap-0.5 shrink-0">
                        <ShieldCheck className="w-2 h-2" /> ADMIN
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-[#888888] font-mono flex items-center gap-1 whitespace-nowrap truncate">
                    <MapPin className="w-2.5 h-2.5 text-[#C8102E] shrink-0" />
                    <span className="truncate">{vehicle.owner.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <ReactionButtons
                  vehicleId={vehicle.id}
                  likesCount={vehicle.likesCount}
                  isLiked={isLiked}
                  isDisliked={isDisliked}
                  onLikeToggle={onLikeToggle}
                  onDislikeToggle={onDislikeToggle}
                  size="sm"
                />
                <span className="hidden sm:flex items-center gap-1 text-xs font-['Oswald'] font-bold uppercase tracking-wider text-[#C8102E] group-hover:translate-x-1 transition-transform">
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. COMPACT / HORIZONTAL VARIANT (for mobile drawers & product page cross-sells)
  if (variant === 'compact') {
    return (
      <div
        onClick={() => onSelect(vehicle.id)}
        className="group flex items-center gap-3.5 p-2.5 border border-[#3f3f3f] bg-[#242424] hover:border-[#C8102E] transition-all cursor-pointer"
      >
        <div className="w-20 h-16 overflow-hidden flex-shrink-0 bg-[#181818]">
          {!imageError ? (
            <img
              src={vehicle.primaryImage}
              alt={`${vehicle.year} ${vehicle.make}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-[#181818] flex items-center justify-center">
              <Wrench className="w-4 h-4 text-[#888888]" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono text-[#aaaaaa] uppercase truncate">
            {vehicle.drivetrain} · {vehicle.owner.location}
          </div>
          <h4 className="font-['Oswald'] font-bold text-base uppercase text-white truncate group-hover:text-[#C8102E] transition-colors">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h4>
          <div className="text-xs text-[#888888] font-mono flex items-center gap-2 mt-0.5">
            <span>{vehicle.buildStatus}</span>
            <span>·</span>
            <span className="truncate">{vehicle.owner.name}</span>
          </div>
        </div>

        <ArrowRight className="w-4 h-4 text-[#666666] group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </div>
    );
  }

  // 3. STANDARD GRID & MY-GARAGE CARD (Strict 2-Column Mobile, Facebook Marketplace Style, zero wrap)
  return (
    <div
      onClick={() => onSelect(vehicle.id)}
      className="group relative flex flex-col h-full min-w-0 w-full border border-[#383838] bg-[#222222] hover:border-[#C8102E] hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden select-none"
    >
      {/* Edge-to-Edge Image Container (Marketplace 4:3) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#181818] shrink-0">
        {!imageError ? (
          <img
            src={vehicle.primaryImage}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-104 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          renderImageFallback()
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges / Indicators */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <span />

          {variant === 'my-garage' && (
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <span className={`text-[10px] sm:text-xs font-mono px-2 py-0.5 sm:px-2.5 sm:py-1 font-bold uppercase shadow-sm ${
                vehicle.visibility === 'public' 
                  ? 'bg-[#10b981]/90 text-white' 
                  : 'bg-[#4b5563]/90 text-white'
              }`}>
                {vehicle.visibility}
              </span>
              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(vehicle.id);
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-black/80 hover:bg-[#C8102E] text-[10px] sm:text-xs font-['Oswald'] font-bold uppercase text-white transition-colors cursor-pointer"
                >
                  <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Reaction Buttons Overlay (Compact, neat corner alignment, zero overflow) */}
        {variant !== 'my-garage' && (
          <div 
            className="absolute bottom-2 right-2 z-10 pointer-events-auto bg-black/80 backdrop-blur-xs border border-white/10 px-1.5 py-1 shadow-sm max-w-[calc(100%-12px)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <ReactionButtons
              vehicleId={vehicle.id}
              likesCount={vehicle.likesCount}
              isLiked={isLiked}
              isDisliked={isDisliked}
              onLikeToggle={onLikeToggle}
              onDislikeToggle={onDislikeToggle}
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Card Body - Strictly Year Make Model, Trim, and Location only */}
      <div className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col justify-start min-w-0 w-full overflow-hidden">
        <div className="min-w-0 w-full overflow-hidden space-y-1">
          {/* 1. Year Make Model - Dynamically sized font */}
          <h3 className="font-['Oswald'] text-sm sm:text-base md:text-lg lg:text-xl font-bold uppercase text-white tracking-tight leading-tight group-hover:text-[#C8102E] transition-colors truncate whitespace-nowrap block w-full">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>

          {/* 2. Trim - Dynamically sized */}
          <div className="text-xs sm:text-sm md:text-base font-mono text-[#aaaaaa] truncate whitespace-nowrap block w-full">
            {vehicle.trim || 'Standard'}
          </div>

          {/* 3. Location - Dynamically sized */}
          {showLocation && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#777777] font-mono truncate whitespace-nowrap w-full pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#aaaaaa] shrink-0" />
              <span className="truncate whitespace-nowrap">{vehicle.owner.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
