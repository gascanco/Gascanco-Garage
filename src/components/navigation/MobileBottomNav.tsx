import React from 'react';
import { ActiveView } from '../../types/garage';
import { Wrench, Plus, Activity, Share2 } from 'lucide-react';
import { SlammedTruckIcon } from '../common/SlammedTruckIcon';

interface MobileBottomNavProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onOpenAddVehicle: () => void;
  onOpenShare: () => void;
  currentUserId: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  setActiveView,
  onOpenAddVehicle,
  onOpenShare,
  currentUserId,
}) => {
  const isActivity = activeView.type === 'activity-feed';
  const isCommunity = activeView.type === 'community-builds' || activeView.type === 'discover';
  const isMyGarage = activeView.type === 'my-garage' || (activeView.type === 'user-profile' && activeView.ownerId === currentUserId);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#202020]/95 backdrop-blur-lg border-t border-[#383838] pt-1.5 pb-2 sm:py-2.5 safe-area-pb shadow-2xl">
      <div className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto flex items-center justify-between px-2 sm:px-4 md:px-6">
        {/* 1. Live Feed */}
        <button
          type="button"
          onClick={() => setActiveView({ type: 'activity-feed' })}
          className={`flex-1 flex flex-col items-center gap-1 py-1 px-0.5 sm:px-1 hover:bg-white/5 transition-colors cursor-pointer ${
            isActivity ? 'text-[#C8102E]' : 'text-[#aaaaaa] hover:text-white'
          }`}
        >
          <Activity className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
          <span className="text-[9.5px] sm:text-xs font-['Oswald'] tracking-wider uppercase font-bold whitespace-nowrap">
            LIVE FEED
          </span>
        </button>

        {/* 2. Builds & Rides */}
        <button
          type="button"
          onClick={() => setActiveView({ type: 'community-builds' })}
          className={`flex-1 flex flex-col items-center gap-1 py-1 px-0.5 sm:px-1 hover:bg-white/5 transition-colors cursor-pointer ${
            isCommunity ? 'text-[#C8102E]' : 'text-[#aaaaaa] hover:text-white'
          }`}
        >
          <SlammedTruckIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
          <span className="text-[9.5px] sm:text-xs font-['Oswald'] tracking-wider uppercase font-bold whitespace-nowrap">
            BUILDS & RIDES
          </span>
        </button>

        {/* 3. Center ADD Button (Prominent Raised Center) */}
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
          <span className="text-[9.5px] sm:text-xs font-['Oswald'] tracking-wider uppercase font-bold text-white mt-1">
            ADD
          </span>
        </div>

        {/* 4. My Garage */}
        <button
          type="button"
          onClick={() => setActiveView({ type: 'my-garage' })}
          className={`flex-1 flex flex-col items-center gap-1 py-1 px-0.5 sm:px-1 hover:bg-white/5 transition-colors cursor-pointer ${
            isMyGarage ? 'text-[#C8102E]' : 'text-[#aaaaaa] hover:text-white'
          }`}
        >
          <Wrench className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
          <span className="text-[9.5px] sm:text-xs font-['Oswald'] tracking-wider uppercase font-bold whitespace-nowrap">
            MY GARAGE
          </span>
        </button>

        {/* 5. Share */}
        <button
          type="button"
          onClick={onOpenShare}
          className="flex-1 flex flex-col items-center gap-1 py-1 px-0.5 sm:px-1 hover:bg-white/5 text-[#aaaaaa] hover:text-white transition-colors cursor-pointer"
          title="Share Gascanco Garage"
        >
          <Share2 className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
          <span className="text-[9.5px] sm:text-xs font-['Oswald'] tracking-wider uppercase font-bold whitespace-nowrap">
            SHARE
          </span>
        </button>
      </div>
    </nav>
  );
};
