import React, { useState, useMemo } from 'react';
import { Vehicle } from '../../types/garage';
import { VehicleCard } from '../cards/VehicleCard';
import { Bookmark, Search, ArrowRight, Compass } from 'lucide-react';

interface SavedBuildsViewProps {
  vehicles: Vehicle[];
  likedVehicleIds: Set<string>;
  dislikedVehicleIds?: Set<string>;
  onSelectVehicle: (id: string) => void;
  onSelectOwner: (ownerId: string) => void;
  onLikeToggle: (id: string) => void;
  onDislikeToggle?: (id: string) => void;
  onExploreBuilds: () => void;
}

export const SavedBuildsView: React.FC<SavedBuildsViewProps> = ({
  vehicles,
  likedVehicleIds,
  dislikedVehicleIds = new Set(),
  onSelectVehicle,
  onSelectOwner,
  onLikeToggle,
  onDislikeToggle,
  onExploreBuilds,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMake, setSelectedMake] = useState<string>('All Makes');
  const [selectedLocation, setSelectedLocation] = useState<string>('All Locations');

  // Filter only saved/loved vehicles
  const savedVehicles = useMemo(() => {
    return vehicles.filter(v => likedVehicleIds.has(v.id));
  }, [vehicles, likedVehicleIds]);

  const makes = useMemo(() => {
    const set = new Set<string>();
    savedVehicles.forEach(v => { if (v.make) set.add(v.make); });
    return ['All Makes', ...Array.from(set).sort()];
  }, [savedVehicles]);

  const locations = useMemo(() => {
    const set = new Set<string>();
    savedVehicles.forEach(v => { if (v.owner?.location) set.add(v.owner.location); });
    return ['All Locations', ...Array.from(set).sort()];
  }, [savedVehicles]);

  const filteredSaved = useMemo(() => {
    return savedVehicles.filter(v => {
      if (selectedMake !== 'All Makes' && v.make.toLowerCase() !== selectedMake.toLowerCase()) {
        return false;
      }
      if (selectedLocation !== 'All Locations' && v.owner.location.toLowerCase() !== selectedLocation.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const title = `${v.year} ${v.make} ${v.model} ${v.trim || ''} ${v.nickname || ''}`.toLowerCase();
        const owner = v.owner.name.toLowerCase();
        const loc = v.owner.location.toLowerCase();
        return title.includes(q) || owner.includes(q) || loc.includes(q) || v.engine.toLowerCase().includes(q);
      }
      return true;
    });
  }, [savedVehicles, selectedMake, selectedLocation, searchQuery]);

  return (
    <div className="pb-24 bg-[#303030] text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-5 sm:pt-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-5 border-b border-[#3d3d3d]">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#C8102E]" />
            <h1 className="font-['Oswald'] text-2xl font-bold uppercase tracking-wider text-white">
              Saved & Loved Builds
            </h1>
            <span className="text-xs font-mono text-[#888888]">
              ({savedVehicles.length})
            </span>
          </div>
          <div className="text-xs font-mono text-[#888888]">
            PROJECT CARS & INSPIRATION YOU FOLLOW
          </div>
        </div>

        {savedVehicles.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Search Filters & Saved Vehicles Grid */}
            <div className="lg:col-span-8 space-y-5">
              {/* Search & Make/Location Filter Toolbar */}
              <div className="mb-3 sm:mb-5 sm:bg-[#242424] sm:border sm:border-[#3d3d3d] sm:p-3.5">
                <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-row sm:items-center sm:gap-3 justify-between">
                  <div className="relative w-full sm:flex-1">
                    <Search className="absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#888888] pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search saved..."
                      className="w-full pl-8 sm:pl-10 pr-3 py-1.5 bg-[#1c1c1c] border border-[#444444] text-xs font-mono text-white placeholder-[#888888] focus:outline-none focus:border-[#C8102E]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono w-full sm:w-auto">
                    {makes.length > 2 && (
                      <select
                        value={selectedMake}
                        onChange={(e) => setSelectedMake(e.target.value)}
                        className="w-full sm:w-auto bg-[#1c1c1c] border border-[#383838] px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#C8102E] cursor-pointer truncate"
                      >
                        {makes.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    )}

                    {locations.length > 2 && (
                      <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="w-full sm:w-auto bg-[#1c1c1c] border border-[#383838] px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#C8102E] cursor-pointer truncate"
                      >
                        {locations.map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid: Dynamically responsive */}
              {filteredSaved.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5 w-full">
                  {filteredSaved.map((vehicle) => (
                    <div key={vehicle.id} className="min-w-0 w-full">
                      <VehicleCard
                        vehicle={vehicle}
                        variant="grid"
                        onSelect={onSelectVehicle}
                        onOwnerClick={onSelectOwner}
                        onLikeToggle={onLikeToggle}
                        onDislikeToggle={onDislikeToggle}
                        isLiked={likedVehicleIds.has(vehicle.id)}
                        isDisliked={dislikedVehicleIds.has(vehicle.id)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-[#3d3d3d] bg-[#242424] p-10 text-center max-w-md mx-auto my-8">
                  <Search className="w-8 h-8 text-[#888888] mx-auto mb-2" />
                  <h4 className="font-['Oswald'] text-xl font-bold uppercase text-white">
                    No matching saved builds
                  </h4>
                  <p className="text-xs text-[#aaaaaa] mt-1">
                    Try clearing your search query.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mt-4 px-3 py-1.5 text-xs font-['Oswald'] font-bold uppercase tracking-wider bg-[#333333] hover:bg-[#444444] text-white transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Desktop Sidebar (hidden on mobile, visible on lg:) */}
            <aside className="hidden lg:flex lg:col-span-4 flex-col gap-5 sticky top-6">
              {/* Watchlist Overview Card */}
              <div className="bg-[#242424] border border-[#383838] p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#303030] mb-4">
                  <span className="text-[11px] font-mono text-[#C8102E] uppercase tracking-wider font-bold">
                    WATCHLIST STATS
                  </span>
                  <span className="text-[11px] font-mono text-[#888888]">
                    {savedVehicles.length} Saved
                  </span>
                </div>

                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-[#2d2d2d]">
                    <span className="text-[#888888]">Total Tracked</span>
                    <span className="text-white font-bold">{savedVehicles.length} builds</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#2d2d2d]">
                    <span className="text-[#888888]">Filtered Matches</span>
                    <span className="text-white font-bold">{filteredSaved.length}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#888888]">Selected Make</span>
                    <span className="text-[#C8102E]">{selectedMake}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onExploreBuilds}
                  className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C8102E] hover:bg-[#e01334] text-white font-['Oswald'] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Discover More Builds</span>
                </button>
              </div>

              {/* Watchlist Ethos */}
              <div className="border border-[#383838] bg-[#1d1d1d] p-4 text-xs font-mono text-[#888888] space-y-2">
                <div className="text-white font-['Oswald'] font-bold uppercase text-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#C8102E]" />
                  <span>SAVED BUILDS NOTE</span>
                </div>
                <p className="leading-relaxed text-[11px]">
                  Builds you love (🤟) stay pinned to your personal watchlist so you can follow updates, powertrain modifications, and event appearances.
                </p>
              </div>
            </aside>
          </div>
        ) : (
          /* Empty Saved State */
          <div className="border border-[#3d3d3d] bg-[#242424] p-12 text-center max-w-lg mx-auto my-12">
            <Bookmark className="w-10 h-10 text-[#888888] mx-auto mb-3" />
            <h3 className="font-['Oswald'] text-2xl font-bold uppercase text-white">
              No saved builds yet
            </h3>
            <p className="text-sm text-[#aaaaaa] mt-2 leading-relaxed">
              When you discover project cars, track builds, or daily drivers you love, tap the Love-you gesture (🤟) to save them to your watchlist.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={onExploreBuilds}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C8102E] hover:bg-[#e01334] text-white font-['Oswald'] font-bold text-sm uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Community Builds</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
