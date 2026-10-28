import React, { useState } from 'react';
import { MarketplaceItem } from '../../types/garage';
import { MapPin, Tag, Mail, Phone, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Package, Car } from 'lucide-react';

interface MarketplaceCardProps {
  item: MarketplaceItem;
  variant?: 'grid' | 'featured';
  onSelect?: (itemId: string) => void;
  onContactSeller?: (item: MarketplaceItem) => void;
}

export const MarketplaceCard: React.FC<MarketplaceCardProps> = ({
  item,
  variant = 'grid',
  onSelect,
  onContactSeller,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formattedPrice = `$${item.price.toLocaleString()} ${item.priceType ? item.priceType.toUpperCase() : ''}`;

  const renderImageFallback = () => (
    <div className="w-full h-48 flex flex-col items-center justify-center bg-[#202020] text-[#888888] p-4 text-center">
      {item.itemType === 'vehicle' ? (
        <Car className="w-8 h-8 text-[#C8102E] mb-2 opacity-80" />
      ) : (
        <Package className="w-8 h-8 text-[#C8102E] mb-2 opacity-80" />
      )}
      <span className="font-['Oswald'] font-bold text-lg text-white uppercase tracking-wider">
        {item.title}
      </span>
      <span className="text-xs text-[#aaaaaa] font-mono mt-1">
        {item.itemType === 'vehicle' ? item.vehicleType : item.partCategory}
      </span>
    </div>
  );

  // 1. FEATURED / SPOTLIGHT DEAL VARIANT (Matching Builds Featured Card)
  if (variant === 'featured') {
    return (
      <div 
        onClick={() => onSelect && onSelect(item.id)}
        className="group relative cursor-pointer overflow-hidden border border-[#404040] bg-[#242424] hover:border-[#C8102E] transition-all duration-300 shadow-lg min-w-0 w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 min-w-0">
          {/* Visual Showcase - Fixed 16:10 automotive aspect ratio with object-cover */}
          <div className="md:col-span-7 relative aspect-[16/10] sm:aspect-[16/9] md:aspect-[16/10] overflow-hidden bg-[#181818] shrink-0">
            {!imageError ? (
              <img
                src={item.primaryImage}
                alt={item.title}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 ${
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
              <span>Parts Bin Spotlight Deal</span>
            </div>

            {/* Price Badge Overlay on Media */}
            <div className="absolute bottom-3 left-3 bg-black/85 backdrop-blur-xs border border-white/10 px-3 py-1.5">
              <span className="font-['Oswald'] text-xl sm:text-2xl font-black text-[#ffffff] uppercase tracking-wide">
                {formattedPrice}
              </span>
            </div>
          </div>

          {/* Details & Specs */}
          <div className="md:col-span-5 p-3.5 sm:p-5 md:p-6 flex flex-col justify-between min-w-0 overflow-hidden">
            <div className="min-w-0 overflow-hidden space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#171717] border border-[#404040] text-[10px] font-mono text-[#aaaaaa] uppercase">
                  {item.itemType === 'vehicle' ? item.vehicleType : item.partCategory}
                </span>
                {item.condition && (
                  <span className="px-2 py-0.5 bg-[#C8102E]/20 text-[#ff4d66] border border-[#C8102E]/40 text-[10px] font-mono uppercase font-bold">
                    {item.condition}
                  </span>
                )}
                {item.titleStatus && (
                  <span className="px-2 py-0.5 bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/40 text-[10px] font-mono uppercase font-bold">
                    {item.titleStatus} Title
                  </span>
                )}
              </div>

              <h2 className="font-['Oswald'] text-xl sm:text-2xl font-bold uppercase text-white group-hover:text-[#C8102E] transition-colors leading-tight">
                {item.title}
              </h2>

              <p className="text-xs sm:text-sm text-[#bbbbbb] line-clamp-3 font-sans leading-relaxed">
                {item.description}
              </p>

              {/* Tech Specs Summary */}
              <div className="pt-2 grid grid-cols-2 gap-2 text-xs font-mono text-[#999999] border-t border-[#333333]">
                {item.itemType === 'vehicle' ? (
                  <>
                    <div>
                      <span className="text-[#666666] block text-[10px] uppercase">Mileage / Hours</span>
                      <span className="text-[#dddddd] font-bold">{item.mileageHours || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[#666666] block text-[10px] uppercase">Transmission</span>
                      <span className="text-[#dddddd] font-bold">{item.transmission || 'N/A'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-[#666666] block text-[10px] uppercase">Brand / Mfr</span>
                      <span className="text-[#dddddd] font-bold">{item.brand || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[#666666] block text-[10px] uppercase">Shipping</span>
                      <span className="text-[#dddddd] font-bold">{item.shippingOption || 'Local Pickup'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Seller & Action Footer */}
            <div className="pt-4 mt-3 border-t border-[#383838] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={item.seller.avatar}
                  alt={item.seller.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#C8102E] shrink-0"
                />
                <div className="min-w-0">
                  <span className="font-['Oswald'] font-bold text-xs uppercase text-white block truncate">
                    {item.seller.name}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-[#888888] font-mono">
                    <MapPin className="w-2.5 h-2.5 text-[#C8102E] shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onContactSeller) onContactSeller(item);
                }}
                className="px-3.5 py-1.5 bg-[#C8102E] hover:bg-[#e01334] text-white font-['Oswald'] text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              >
                <span>Contact Seller</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. STANDARD GRID CARD (Matching VehicleCard.tsx Grid Layout)
  return (
    <div
      onClick={() => onSelect && onSelect(item.id)}
      className="group relative flex flex-col h-full min-w-0 w-full border border-[#383838] bg-[#222222] hover:border-[#C8102E] hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden select-none"
    >
      {/* Full Photo Showcase Container - Standardized 16:10 aspect ratio with object-cover */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#18181a] shrink-0">
        {!imageError ? (
          <img
            src={item.primaryImage}
            alt={item.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-[#1e1e20] flex items-center justify-center">
            {renderImageFallback()}
          </div>
        )}

        {/* Top Badges: Category & Status */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <span className="px-2 py-0.5 bg-black/85 backdrop-blur-xs border border-white/15 text-[10px] font-mono text-[#e0e0e0] uppercase font-bold tracking-wider">
            {item.itemType === 'vehicle' ? item.vehicleType : item.partCategory}
          </span>

          <div className="flex items-center gap-1.5">
            {item.status === 'sold' ? (
              <span className="px-2 py-0.5 bg-[#ef4444] text-white font-['Oswald'] text-[10px] font-bold uppercase tracking-wider">
                SOLD
              </span>
            ) : item.status === 'pending' ? (
              <span className="px-2 py-0.5 bg-[#f59e0b] text-black font-['Oswald'] text-[10px] font-bold uppercase tracking-wider">
                SALE PENDING
              </span>
            ) : null}
          </div>
        </div>

        {/* Highlighted Price Tag Overlay on Bottom Left */}
        <div className="absolute bottom-2 left-2 bg-black/90 backdrop-blur-xs border border-white/10 px-2 py-1 shadow-md">
          <span className="font-['Oswald'] text-base sm:text-lg font-black text-white tracking-wide">
            {formattedPrice}
          </span>
        </div>
      </div>

      {/* Card Body - Left/Right Split Layout matching Builds Page */}
      <div className="p-3 sm:p-3.5 flex-1 flex items-start justify-between gap-2.5 sm:gap-3 min-w-0 w-full bg-[#222224] border-t border-[#333336]">
        {/* Left Side: Title & Key Spec/Fitment */}
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="font-['Oswald'] font-bold text-base sm:text-lg uppercase text-white tracking-tight leading-tight group-hover:text-[#C8102E] transition-colors break-words">
            {item.title}
          </h3>

          <div className="text-xs font-mono text-[#aaaaaa] break-words leading-tight">
            {item.itemType === 'vehicle' ? (
              <span>{item.mileageHours || item.transmission || 'Enthusiast Built'}</span>
            ) : (
              <span>{item.brand ? `${item.brand} · ` : ''}{item.condition || 'Used - Good'}</span>
            )}
          </div>
        </div>

        {/* Right Side: Seller & Location */}
        <div className="flex flex-col items-end text-right shrink-0 min-w-[32%] max-w-[48%] space-y-0.5">
          <span className="font-['Oswald'] font-bold text-xs sm:text-sm uppercase text-[#e0e0e0] group-hover:text-white transition-colors break-words text-right leading-tight">
            {item.seller.name}
          </span>
          <div className="flex items-center justify-end gap-1 text-[11px] sm:text-xs text-[#888888] font-mono break-words text-right leading-tight">
            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#C8102E] shrink-0" />
            <span className="break-words">{item.location}</span>
          </div>
        </div>
      </div>

      {/* Quick Inquire Action Bar */}
      <div className="px-3 py-2 bg-[#1b1b1c] border-t border-[#2d2d30] flex items-center justify-between text-xs font-mono">
        <span className="text-[#888888] text-[11px]">
          {item.itemType === 'vehicle' ? item.titleStatus ? `${item.titleStatus} Title` : 'Verified Seller' : item.shippingOption || 'Local Pickup'}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onContactSeller) onContactSeller(item);
          }}
          className="text-[#C8102E] hover:text-[#e01334] font-['Oswald'] font-bold uppercase tracking-wider text-xs flex items-center gap-1 cursor-pointer"
        >
          <span>Inquire</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
