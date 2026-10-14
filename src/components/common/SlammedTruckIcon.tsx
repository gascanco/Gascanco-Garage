import React from 'react';

export interface SlammedTruckIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Custom Mini Truck Icon: Chevrolet S10 slammed on Air Ride suspension.
 * Features an ultra-low laid-out frame, deeply tucked wheels, squarebody cab,
 * raked windshield, flat hood, and open cargo bed with roll pan.
 * Conforms to standard Lucide 24x24 SVG styling.
 */
export const SlammedTruckIcon: React.FC<SlammedTruckIconProps> = ({
  className = 'w-5 h-5',
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Slammed S10 Body Outline: Laid out frame on the ground */}
      {/* Rear bumper/rollpan -> bed top -> cab back -> roof -> windshield -> flat hood -> front fascia */}
      <path d="M2 19V12h8V6.5h5.5l3.5 5.5h3v7H2z" />
      
      {/* Side Cab Window */}
      <path d="M10.5 8h4l2.5 4h-6.5V8z" />
      
      {/* Bed Divider / Cab Separation line */}
      <line x1="10" y1="12" x2="10" y2="19" />

      {/* Slammed Air Ride Tucked Wheels (Tucked high into fenders/bed) */}
      {/* Rear tucked wheel */}
      <circle cx="6" cy="18" r="2" />
      {/* Front tucked wheel */}
      <circle cx="18" cy="18" r="2" />

      {/* Air Ride Ground Level / Laid-out Frame Sparks Line */}
      <line x1="1" y1="21" x2="23" y2="21" strokeWidth="1.5" strokeDasharray="1 1.5" opacity="0.6" />
    </svg>
  );
};

export default SlammedTruckIcon;
