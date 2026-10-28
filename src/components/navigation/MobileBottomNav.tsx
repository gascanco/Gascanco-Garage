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
      <div className="w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto flex items-center justify-evenly px-2 sm:px-6 md:px-8">
        {/* 1. Floating Action Button (FAB) positioned ergonomically above bottom nav without obscuring tabs or content */}
        <button
          type="button"
          onClick={onOpenAddVehicle}
          className="fixed bottom-20 right-4 sm:bottom-22 sm:right-6 md:bottom-24 md:right-8 z-40 flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:px-4 sm:py-3 bg-[#C8102E] hover:bg-[#e01334] text-white rounded-full shadow-2xl shadow-black/80 hover:shadow-[#C8102E]/30 border border-white/20 hover:border-white/50 transition-all duration-200 active:scale-95 cursor-pointer shrink-0 group"
          aria-label="Add"
          title="Add Vehicle, Part Listing, Event, or Post"
        >
          <Plus className="w-5 h-5 stroke-[2.5] transition-transform duration-200 group-hover:rotate-90" />
          <span className="text-xs sm:text-sm font-['Oswald'] font-black uppercase tracking-wider pr-0.5">
            ADD
          </span>
        </button>

        {/* 2. Primary: Activity Feed */}
        <button
          type="button"
          onClick={() => setActiveView({ type: 'activity-feed' })}
          className={`flex flex-col items-center gap-1 py-1 px-1 sm:px-2.5 md:px-5 md:py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer ${
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
          className={`flex flex-col items-center gap-1 py-1 px-1 sm:px-2.5 md:px-5 md:py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer ${
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
          className={`flex flex-col items-center gap-1 py-1 px-1 sm:px-2.5 md:px-5 md:py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer ${
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
          className={`flex flex-col items-center gap-1 py-1 px-1 sm:px-2.5 md:px-5 md:py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer ${
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
          className={`flex flex-col items-center gap-1 py-1 px-1 sm:px-2.5 md:px-5 md:py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer ${
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
