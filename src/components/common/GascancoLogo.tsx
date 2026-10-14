import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'legacy' | 'with-garage' | 'lockup';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero';
  color?: string;
}

export const GascancoLogo: React.FC<LogoProps> = ({
  className = '',
  variant = 'with-garage',
  size = 'md',
  color = 'currentColor',
}) => {
  const sizeClasses = {
    xs: 'h-4',
    sm: 'h-5',
    md: 'h-7',
    lg: 'h-9',
    hero: 'h-14',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Precision-drafted SVG wordmark replicating the exact geometry of GCC - Legacy.png */}
      <svg
        viewBox="0 0 680 96"
        fill={color}
        className={`${sizeClasses} w-auto`}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="GASCANCO."
      >
        <g transform="skewX(-15)">
          {/* G */}
          <path d="M 12 0 L 62 0 L 76 18 L 52 18 L 44 14 L 28 14 L 16 82 L 56 82 L 64 50 L 40 50 L 40 36 L 78 36 L 70 96 L 0 96 L 0 16 Z" />

          {/* A */}
          <path d="M 88 96 L 118 0 L 152 0 L 180 96 L 152 96 L 146 74 L 118 74 L 112 96 Z M 123 54 L 141 54 L 133 22 Z" />

          {/* S */}
          <path d="M 190 0 L 254 0 L 264 26 L 222 26 L 224 38 L 264 48 L 264 96 L 192 96 L 184 68 L 228 68 L 226 56 L 190 48 Z" />

          {/* C */}
          <path d="M 276 0 L 342 0 L 350 24 L 306 24 L 298 72 L 348 72 L 352 96 L 276 96 L 268 76 L 268 20 Z" />

          {/* A */}
          <path d="M 360 96 L 390 0 L 424 0 L 452 96 L 424 96 L 418 74 L 390 74 L 384 96 Z M 395 54 L 413 54 L 405 22 Z" />

          {/* N */}
          <path d="M 462 0 L 490 0 L 518 60 L 518 0 L 542 0 L 542 96 L 514 96 L 486 36 L 486 96 L 462 96 Z" />

          {/* C */}
          <path d="M 552 0 L 618 0 L 626 24 L 582 24 L 574 72 L 624 72 L 628 96 L 552 96 L 544 76 L 544 20 Z" />

          {/* O */}
          <path d="M 638 18 L 652 0 L 706 0 L 720 18 L 720 78 L 706 96 L 652 96 L 638 78 Z M 662 26 L 662 70 L 670 78 L 688 78 L 696 70 L 696 26 L 688 18 L 670 18 Z" transform="translate(-4, 0)" />

          {/* PERIOD (.) */}
          <polygon points="726,74 744,74 740,96 722,96" />
        </g>
      </svg>

      {/* Gascanco Authentic THE [GARAGE] Styling */}
      {variant === 'with-garage' && (
        <div className="flex items-center pl-1.5 border-l border-[#555555] ml-1">
          <span className="text-[#C8102E] font-black italic tracking-widest uppercase font-['Oswald'] text-base md:text-xl">
            [GARAGE]
          </span>
        </div>
      )}

      {/* Lockup with Tagline */}
      {variant === 'lockup' && (
        <div className="flex flex-col pl-2 border-l border-[#555555] ml-1 leading-none">
          <span className="text-[#C8102E] font-black italic tracking-widest uppercase font-['Oswald'] text-sm">
            [GARAGE]
          </span>
          <span className="text-[9px] font-mono text-[#aaaaaa] tracking-tighter uppercase mt-0.5">
            AUTO · MOTO · GEAR
          </span>
        </div>
      )}
    </div>
  );
};
