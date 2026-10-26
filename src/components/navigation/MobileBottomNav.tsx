import React from 'react';
import { ActiveView } from '../../types/garage';
import { Wrench, Plus, Activity, Calendar, Tag } from 'lucide-react';
import { SlammedTruckIcon } from '../common/SlammedTruckIcon';

interface MobileBottomNavProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onOpenAddVehicle: () => void;
  currentUserId: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  setActiveView,
  onOpenAddVehicle,
  currentUserId,
}) => {
  const isActivity = activeView.type === 'activity-feed';
  const isCommunity = activeView.type === 'community-builds' || activeView.type === 'discover';
  const isEvents = activeView.type === 'events' || activeView.type === 'event-detail';
  const isMarketplace = activeView.type === 'marketplace' || activeView.type === 'marketplace-detail';
  const isMyGarage = activeView.type === 'my-garage' || (activeView.type === 'user-profile' && activeView.ownerId === currentUserId);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#202020]/95 backdrop-blur-lg border-t border-[#383838] py-2 sm:py-2.5 safe-area-pb shadow-2xl">
      <div className="max-w-2xl sm:max-w-3xl md:max-w-5xl mx-auto flex items-center justify-between px-2 sm:px-4 md:px-6">
        {/* 1. Far Left Add Button */}
        <button
          type="button"
          onClick={onOpenAddVehicle}
          className="flex flex-col items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-[#C8102E] hover:bg-[#e01334] text-white shadow-lg border border-[#e01334] transition-all active:scale-95 cursor-pointer shrink-0"
          aria-label="Add"
          title="Add Vehicle, Part Listing, Event, or Post"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span className="text-[9px] sm:text-[10px] font-['Oswald'] font-black uppercase tracking-wider -mt-0.5">
            ADD
          </span>
        </button>

        {/* 2. Primary: Activity Feed */}
        <button
          type="button"
          onClick={() => setActiveView({ type: 'activity-feed' })}
          className={`flex flex-col items-center gap-1 py-1 px-1 sm:px-2.5 md:px-3 transition-colors cursor-pointer ${
            isActivity ? 'text-[#C8102E]' : 'text-[#aaaaaa] hover:text-white'
          }`}
        >
          <Activity className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          <span className="text-[10px] sm:text-xs font-['Oswald'] tracking-wider uppercase font-bold">
            LIVE
          </span>
        </button>

        {/* 3. Builds (Slammed S10 Air Ride Icon) */}
        <button
          type="button"
          onClick={() => setActiveView({ type: 'community-builds' })}
          className={`flex flex-col items-center gap-1 py-1 px-1 sm:px-2.5 md:px-3 transition-colors cursor-pointer ${
            isCommunity ? 'text-[#C8102E]' : 'text-[#aaaaaa] hover:text-white'
          }`}
        >
          <SlammedTruckIcon className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          <span className="text-[10px] sm:text-xs font-['Oswald'] tracking-wider uppercase font-bold">
            BUILDS
          </span>
        </button>

        {/* 4. Events */}
        <button
          type="button"
          onClick={() => setActiveView({ type: 'events' })}
          className={`flex flex-col items-center gap-1 py-1 px-1 sm:px-2.5 md:px-3 transition-colors cursor-pointer ${
            isEvents ? 'text-[#C8102E]' : 'text-[#aaaaaa] hover:text-white'
          }`}
        >
          <Calendar className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          <span className="text-[10px] sm:text-xs font-['Oswald'] tracking-wider uppercase font-bold">
            EVENTS
          </span>
        </button>

        {/* 5. Parts Bin (Marketplace) */}
        <button
          type="button"
          onClick={() => setActiveView({ type: 'marketplace' })}
          className={`flex flex-col items-center gap-1 py-1 px-1 sm:px-2.5 md:px-3 transition-colors cursor-pointer ${
            isMarketplace ? 'text-[#C8102E]' : 'text-[#aaaaaa] hover:text-white'
          }`}
        >
          <Tag className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          <span className="text-[10px] sm:text-xs font-['Oswald'] tracking-wider uppercase font-bold whitespace-nowrap">
            PARTS BIN
          </span>
        </button>

        {/* 6. My Garage & Registry */}
        <button
          type="button"
          onClick={() => setActiveView({ type: 'my-garage' })}
          className={`flex flex-col items-center gap-1 py-1 px-1 sm:px-2.5 md:px-3 transition-colors cursor-pointer ${
            isMyGarage ? 'text-[#C8102E]' : 'text-[#aaaaaa] hover:text-white'
          }`}
        >
          <Wrench className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          <span className="text-[10px] sm:text-xs font-['Oswald'] tracking-wider uppercase font-bold whitespace-nowrap">
            MY GARAGE
          </span>
        </button>
      </div>
    </nav>
  );
};
