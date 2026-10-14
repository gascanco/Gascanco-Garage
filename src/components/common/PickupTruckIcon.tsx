import React from 'react';

export interface PickupTruckIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Distinct pickup truck icon with open rear cargo bed, cab, windshield, and wheels.
 * Conforms to standard Lucide 24x24 SVG styling.
 */
export const PickupTruckIcon: React.FC<PickupTruckIconProps> = ({
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
      {/* Pickup Truck Body: Open rear cargo bed, cab, windshield & hood */}
      <path d="M2 11h7V6.5h5l3 4.5h5v5h-3" />
      <path d="M15 16H9" />
      <path d="M5 16H2v-5" />
      <path d="M9 11v5" />
      <path d="M10 8h3l2 3h-5z" />
      <circle cx="7" cy="16" r="2" />
      <circle cx="17" cy="16" r="2" />
    </svg>
  );
};

export default PickupTruckIcon;
