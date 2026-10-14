import React from 'react';
import { GascancoLogo } from '../common/GascancoLogo';
import { ActiveView } from '../../types/garage';
import { Plus } from 'lucide-react';

interface FooterProps {
  setActiveView: (view: ActiveView) => void;
  onOpenAddVehicle: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveView, onOpenAddVehicle }) => {
  return (
    <footer className="border-t border-[#383838] bg-[#202020] text-[#8692a5] py-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#1b202c]">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <GascancoLogo variant="with-garage" size="sm" className="text-white" />
            <p className="text-xs text-[#758195] leading-relaxed">
              Automotive enthusiast community, build registry, and garage journals native to the Gascanco lifestyle.
            </p>
            <p className="text-[11px] font-mono text-[#5b6678]">
              Built for seamless integration into Shopify Online Store 2.0.
            </p>
          </div>

          {/* Garage Navigation */}
          <div>
            <h4 className="font-['Oswald'] font-bold text-sm uppercase text-white tracking-wider mb-3">
              Garage Experience
            </h4>
            <ul className="space-y-2 font-mono text-xs">
              <li>
                <button
                  onClick={() => setActiveView({ type: 'discover' })}
                  className="hover:text-white transition-colors"
                >
                  Discover All Builds
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView({ type: 'my-garage' })}
                  className="hover:text-white transition-colors"
                >
                  My Garage Registry
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAddVehicle}
                  className="text-[#C8102E] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Vehicle</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView({ type: 'activity-feed' })}
                  className="hover:text-white transition-colors"
                >
                  Live Activity Feed
                </button>
              </li>
            </ul>
          </div>

          {/* Subsystems & Categories */}
          <div>
            <h4 className="font-['Oswald'] font-bold text-sm uppercase text-white tracking-wider mb-3">
              Chassis & Sub-Cultures
            </h4>
            <ul className="space-y-2 font-mono text-xs text-[#707c91]">
              <li>Tuner & Japanese Domestic Market</li>
              <li>Overland Rigs & 4x4 Trail Vehicles</li>
              <li>Euro Touring & Track Dedicated</li>
              <li>Old School Rat Rod & Heavy Steel</li>
              <li>Kei Cars & Daily Canyon Runners</li>
            </ul>
          </div>

          {/* Storefront Integration */}
          <div>
            <h4 className="font-['Oswald'] font-bold text-sm uppercase text-white tracking-wider mb-3">
              Shopify Ecosystem
            </h4>
            <p className="text-xs text-[#758195] leading-relaxed mb-3">
              Customer accounts automatically sync with Shopify Store identity. Metafield storage keeps builds persistent and fast.
            </p>
            <div className="font-mono text-[11px] text-[#ffffff]">
              API: Storefront GraphQL & Theme Extensions
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-[#5f6b7e]">
          <div>
            © {new Date().getFullYear()} Gascanco Inc. All rights reserved. Garage Community Platform.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#3b4457]">·</span>
            <span>U.S. Automotive Community</span>
            <span className="text-[#3b4457]">·</span>
            <span>Shopify App Block Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
