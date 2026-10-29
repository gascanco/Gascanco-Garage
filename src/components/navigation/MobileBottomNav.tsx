import React from 'react';
import { ActiveView } from '../../types/garage';
import { Wrench, Plus, Activity } from 'lucide-react';
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
  const isMyGarage = activeView.type === 'my-garage' || (activeView.type === 'user-profile' && activeView.ownerId === currentUserId);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#202020]/95 backdrop-blur-lg border-t border-[#383838] pt-1.5 pb-2 sm:py-2.5 safe-area-pb shadow-2xl">
      <div className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto flex items-center justify-between px-3 sm:px-6 md:px-8">
        {/* 1. Live Feed */}
        <button
          type="button"
          onClick={() => setActiveView({ type: 'activity-feed' })}
          className={`flex-1 flex flex-col items-center gap-1 py-1 px-1 sm:px-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer ${
            isActivity ? 'text-[#C8102E]' : 'text-[#aaaaaa] hover:text-white'
          }`}
        >
          <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[10px] sm:text-xs font-['Oswald'] tracking-wider uppercase font-bold whitespace-nowrap">
            LIVE FEED
          </span>
        </button>

        {/* 2. Builds & Rides */}
        <button
          type="button"
          onClick={() => setActiveView({ type: 'community-builds' })}
          className={`flex-1 flex flex-col items-center gap-1 py-1 px-1 sm:px-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer ${
            isCommunity ? 'text-[#C8102E]' : 'text-[#aaaaaa] hover:text-white'
          }`}
        >
          <SlammedTruckIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[10px] sm:text-xs font-['Oswald'] tracking-wider uppercase font-bold whitespace-nowrap">
            BUILDS & RIDES
          </span>
        </button>

        {/* 3. My Garage */}
        <button
          type="button"
          onClick={() => setActiveView({ type: 'my-garage' })}
          className={`flex-1 flex flex-col items-center gap-1 py-1 px-1 sm:px-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer ${
            isMyGarage ? 'text-[#C8102E]' : 'text-[#aaaaaa] hover:text-white'
          }`}
        >
          <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[10px] sm:text-xs font-['Oswald'] tracking-wider uppercase font-bold whitespace-nowrap">
            MY GARAGE
          </span>
        </button>

        {/* 4. Add Button (Right side of My Garage) */}
        <div className="flex-1 flex flex-col items-center -mt-6 sm:-mt-7 shrink-0">
          <button
            type="button"
            onClick={onOpenAddVehicle}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#C8102E] hover:bg-[#e01334] text-white flex items-center justify-center shadow-2xl shadow-black/90 hover:shadow-[#C8102E]/40 border-2 border-[#1c1c1e] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group"
            aria-label="Add"
            title="Add a Vehicle, Update, or Post"
          >
            <Plus className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3] transition-transform duration-200 group-hover:rotate-90" />
          </button>
          <span className="text-[10px] sm:text-xs font-['Oswald'] tracking-wider uppercase font-bold text-white mt-1">
            ADD
          </span>
        </div>
      </div>
    </nav>
  );
};
