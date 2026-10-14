import React from 'react';

interface LoveYouGestureProps {
  className?: string;
  filled?: boolean;
}

/**
 * American Sign Language (ASL) "I Love You" / Love-You hand gesture icon (🤟)
 * Thumb out, index finger up, middle & ring folded, pinky up.
 */
export const LoveYouGesture: React.FC<LoveYouGestureProps> = ({
  className = 'w-4 h-4',
  filled = false,
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? '1.5' : '2'}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Index finger extended */}
      <path d="M7 11V3.5a1.5 1.5 0 0 1 3 0V11" />
      {/* Middle finger folded */}
      <path d="M10 10.5a1.5 1.5 0 0 1 3 0V12" />
      {/* Ring finger folded */}
      <path d="M13 11a1.5 1.5 0 0 1 3 0V12.5" />
      {/* Pinky finger extended */}
      <path d="M16 12.5V5.5a1.5 1.5 0 0 1 3 0V14" />
      {/* Extended thumb to the left */}
      <path d="M2.5 11.5a1.5 1.5 0 0 1 2.2-1.3l2.3 1.3" />
      {/* Palm outline & wrist */}
      <path d="M7 11.5v5.5c0 3 2 4.5 5 4.5h2.5c3.5 0 4.5-2.5 4.5-5.5v-2" />
      <path d="M2.5 11.5c.3 1.8 1.8 3.5 4.5 4.5" />
    </svg>
  );
};
