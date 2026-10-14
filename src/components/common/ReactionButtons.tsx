import React from 'react';
import { ThumbsDown } from 'lucide-react';
import { LoveYouGesture } from './LoveYouGesture';

interface ReactionButtonsProps {
  vehicleId: string;
  likesCount?: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  onLikeToggle?: (vehicleId: string) => void;
  onDislikeToggle?: (vehicleId: string) => void;
  size?: 'xs' | 'sm' | 'md';
}

export const ReactionButtons: React.FC<ReactionButtonsProps> = ({
  vehicleId,
  likesCount = 0,
  isLiked = false,
  isDisliked = false,
  onLikeToggle,
  onDislikeToggle,
  size = 'sm',
}) => {
  const displayCount = likesCount + (isLiked ? 1 : 0);

  const iconSize = size === 'md' ? 'w-4 h-4' : size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5';
  const padding = size === 'md' ? 'px-2.5 py-1.5' : size === 'xs' ? 'px-1.5 py-0.5' : 'px-2 py-1';
  const dislikePadding = size === 'xs' ? 'p-1' : 'p-1.5';
  const textSize = size === 'xs' ? 'text-[10px]' : 'text-xs';
  const buttonGap = size === 'xs' ? 'gap-1' : 'gap-1.5';

  return (
    <div
      className={`inline-flex items-center ${buttonGap}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. Love-you gesture for likes */}
      <button
        type="button"
        onClick={() => onLikeToggle?.(vehicleId)}
        className={`flex items-center gap-1 ${textSize} font-mono ${padding} border transition-colors cursor-pointer ${
          isLiked
            ? 'border-[#C8102E] text-[#C8102E] bg-[#C8102E]/15 font-bold'
            : 'border-[#383838] text-[#888888] hover:text-white hover:border-[#555555]'
        }`}
        title={isLiked ? 'Loved! Click to remove' : 'Love this build (🤟)'}
        aria-label="Love this build"
      >
        <LoveYouGesture className={iconSize} filled={isLiked} />
        <span>{displayCount}</span>
      </button>

      {/* 2. Thumbs-down for dislikes */}
      <button
        type="button"
        onClick={() => onDislikeToggle?.(vehicleId)}
        className={`${dislikePadding} ${textSize} font-mono border transition-colors cursor-pointer ${
          isDisliked
            ? 'border-[#888888] text-white bg-[#444444]'
            : 'border-[#383838] text-[#666666] hover:text-[#aaaaaa] hover:border-[#555555]'
        }`}
        title={isDisliked ? 'Disliked (click to remove)' : 'Dislike build'}
        aria-label="Dislike build"
      >
        <ThumbsDown className={`${iconSize} ${isDisliked ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
};
