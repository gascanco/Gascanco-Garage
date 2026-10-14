import React from 'react';
import { ActiveView } from '../../types/garage';
import { Wrench, Plus, Activity, Calendar } from 'lucide-react';
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
  const isEvents = activeView.type === 'events';
  const isMyGarage = activeView.type === 'my-garage' || (activeView.type === 'user-profile' && activeView.ownerId === currentUserId);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#202020]/95 backdrop-blur-lg border-t border-[#383838] py-2 sm:py-3 safe-area-pb shadow-2xl">
      <div className="max-w-2xl sm:max-w-3xl md:max-w-5xl mx-auto flex items-center justify-around px-3 sm:px-6 md:px-8">
        {/* 1. Primary: Activity Feed */}
        <button
          type="button"
          onClick={() => setActiveView({ type: 'activity-feed' })}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 sm:px-4 transition-colors cursor-pointer ${
            isActivity ? 'text-[#C8102E]' : 'text-[#aaaaaa] hover:text-white'
          }`}
        >
          <Activity className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
          <span className="text-[10px] sm:text-xs md:text-sm font-['Oswald'] tracking-wider uppercase font-bold">
            LIVE
          </span>
        </button>

        {/* 2. My Garage & Registry */}
        <button
          type="button"
          onClick={() => setActiveView({ type: 'my-garage' })}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 sm:px-4 transition-colors cursor-pointer ${
            isMyGarage ? 'text-[#C8102E]' : 'text-[#aaaaaa] hover:text-white'
          }`}
        >
          <Wrench className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
          <span className="text-[10px] sm:text-xs md:text-sm font-['Oswald'] tracking-wider uppercase font-bold">
            MY GARAGE
          </span>
        </button>

        {/* 3. Central Add Button */}
        <button
          type="button"
          onClick={onOpenAddVehicle}
          className="flex flex-col items-center justify-center w-11 h-11 sm:w-13 sm:h-13 md:w-15 md:h-15 bg-[#C8102E] hover:bg-[#e01334] text-white shadow-lg border border-[#e01334] transition-all active:scale-95 cursor-pointer self-center"
          aria-label="Add"
          title="Add Vehicle, Build Log, Event, or Post"
        >
          <Plus className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
          <span className="text-[9px] sm:text-[10px] md:text-xs font-['Oswald'] font-black uppercase tracking-wider -mt-0.5">
            ADD
          </span>
        </button>

        {/* 4. Builds (Slammed S10 Air Ride Icon) */}
        <button
          type="button"
          onClick={() => setActiveView({ type: 'community-builds' })}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 sm:px-4 transition-colors cursor-pointer ${
            isCommunity ? 'text-[#C8102E]' : 'text-[#aaaaaa] hover:text-white'
          }`}
        >
          <SlammedTruckIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
          <span className="text-[10px] sm:text-xs md:text-sm font-['Oswald'] tracking-wider uppercase font-bold">
            BUILDS
          </span>
        </button>

        {/* 5. Events */}
        <button
          type="button"
          onClick={() => setActiveView({ type: 'events' })}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 sm:px-4 transition-colors cursor-pointer ${
            isEvents ? 'text-[#C8102E]' : 'text-[#aaaaaa] hover:text-white'
          }`}
        >
          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
          <span className="text-[10px] sm:text-xs md:text-sm font-['Oswald'] tracking-wider uppercase font-bold">
            EVENTS
          </span>
        </button>
      </div>
    </nav>
  );
};
