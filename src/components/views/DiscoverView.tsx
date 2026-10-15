import React, { useState, useMemo } from 'react';
import { Vehicle } from '../../types/garage';
import { VehicleCard } from '../cards/VehicleCard';
import { Search, X, Compass, Plus, MapPin, Layers } from 'lucide-react';

interface DiscoverViewProps {
  vehicles: Vehicle[];
  onSelectVehicle: (id: string) => void;
  onSelectOwner: (ownerId: string) => void;
  onLikeToggle: (id: string) => void;
  onDislikeToggle?: (id: string) => void;
  likedVehicleIds: Set<string>;
  dislikedVehicleIds?: Set<string>;
  onOpenAddVehicle: () => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  vehicles,
  onSelectVehicle,
  onSelectOwner,
  onLikeToggle,
  onDislikeToggle,
  likedVehicleIds,
  dislikedVehicleIds = new Set(),
  onOpenAddVehicle,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedLocation, setSelectedLocation] = useState<string>('All Locations');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Spotlight build (remains full length at top - strictly one)
  const spotlightVehicle = useMemo(() => {
    return vehicles.find(v => v.featured) || vehicles[0];
  }, [vehicles]);

  // Dynamic Categories list
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    vehicles.forEach(v => {
      if (v.category) set.add(v.category);
    });
    // Ensure all standard categories exist in list
    const defaults = [
      'Tuner & JDM',
      'Overland & 4x4',
      'Euro & Track',
      'Muscle & Rat Rod',
      'Daily Drivers & Keis',
      'Moto & Haulers',
      'Powersports & SXS',
      'Commercial & Heavy Duty',
    ];
    defaults.forEach(d => set.add(d));
    return ['All Categories', ...Array.from(set)];
  }, [vehicles]);

  // Dynamic Locations list
  const availableLocations = useMemo(() => {
    const set = new Set<string>();
    vehicles.forEach(v => {
      if (v.owner?.location) set.add(v.owner.location);
    });
    return ['All Locations', ...Array.from(set).sort()];
  }, [vehicles]);

  // Filtered vehicle list: Category, Location & Search based
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      if (selectedCategory !== 'All Categories' && v.category !== selectedCategory) {
        return false;
      }
      if (selectedLocation !== 'All Locations' && v.owner.location.toLowerCase() !== selectedLocation.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const fullTitle = `${v.year} ${v.make} ${v.model} ${v.trim || ''} ${v.nickname || ''}`.toLowerCase();
        const locationMatch = v.owner.location.toLowerCase().includes(query);
        const ownerMatch = v.owner.name.toLowerCase().includes(query) || v.owner.handle.toLowerCase().includes(query);
        const engineMatch = v.engine.toLowerCase().includes(query);
        const statusMatch = v.buildStatus.toLowerCase().includes(query);
        if (!fullTitle.includes(query) && !locationMatch && !ownerMatch && !engineMatch && !statusMatch) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.viewsCount - a.viewsCount;
    });
  }, [vehicles, selectedCategory, selectedLocation, searchQuery]);

  const clearFilters = () => {
    setSelectedCategory('All Categories');
    setSelectedLocation('All Locations');
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const hasActiveFilters = selectedCategory !== 'All Categories' || selectedLocation !== 'All Locations' || searchQuery !== '';

  // Strict single Spotlight rule: When hero banner is visible, exclude it from grid to prevent duplicate
  const gridVehicles = useMemo(() => {
    if (!hasActiveFilters && spotlightVehicle) {
      return filteredVehicles.filter(v => v.id !== spotlightVehicle.id);
    }
    return filteredVehicles;
  }, [filteredVehicles, hasActiveFilters, spotlightVehicle]);

  return (
    <div className="pb-16 bg-[#303030] text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-5 sm:pt-6">
        {/* Spotlight Build (Remains full length at top - strictly the only spotlight) */}
        {!hasActiveFilters && spotlightVehicle && (
          <div className="mb-5 sm:mb-6">
            <VehicleCard
              vehicle={spotlightVehicle}
              variant="featured"
              onSelect={onSelectVehicle}
              onOwnerClick={onSelectOwner}
              onLikeToggle={onLikeToggle}
              onDislikeToggle={onDislikeToggle}
              isLiked={likedVehicleIds.has(spotlightVehicle.id)}
              isDisliked={dislikedVehicleIds.has(spotlightVehicle.id)}
            />
          </div>
        )}

        {/* Categories & Location Filter Toolbar (Mirrored 2-col dropdown menu layout on mobile, clean flex on desktop) */}
        <div className="mb-3 sm:mb-5 bg-[#242426] border border-[#38383a] p-3 sm:p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-row sm:items-center sm:gap-3">
            {/* Category Dropdown - Featuring categories instead of a search bar */}
            <div className="flex items-center gap-2 text-xs sm:text-sm w-full sm:flex-1">
              <div className="flex items-center gap-2 w-full bg-[#171719] border border-[#38383a] px-3 py-2.5 sm:px-4 sm:py-3">
                <Layers className="w-4 h-4 text-[#C8102E] shrink-0" />
                <span className="text-xs sm:text-sm font-mono text-[#aaaaaa] uppercase shrink-0 hidden xs:inline sm:inline">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-white focus:outline-none cursor-pointer font-mono truncate"
                  aria-label="Filter builds by category"
                >
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#171719] text-white">
                      {cat}
                    </option>
                  ))}
                </select>
                {selectedCategory !== 'All Categories' && (
                  <button
                    onClick={() => setSelectedCategory('All Categories')}
                    className="text-xs text-[#C8102E] hover:underline font-mono shrink-0 ml-1 cursor-pointer sm:hidden"
                    title="Clear category filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Location Selector - Standard Card Width on Mobile */}
            <div className="flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto bg-[#171719] border border-[#38383a] px-3 py-2.5 sm:px-4 sm:py-3">
                <MapPin className="w-4 h-4 text-[#C8102E] shrink-0" />
                <span className="text-xs sm:text-sm font-mono text-[#aaaaaa] uppercase shrink-0 hidden xs:inline sm:inline">Location:</span>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full sm:w-auto bg-transparent text-xs sm:text-sm text-white focus:outline-none cursor-pointer font-mono truncate"
                  aria-label="Filter builds by location"
                >
                  {availableLocations.map((loc) => (
                    <option key={loc} value={loc} className="bg-[#171719] text-white">
                      {loc}
                    </option>
                  ))}
                </select>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-[#C8102E] hover:underline font-mono shrink-0 ml-1 cursor-pointer sm:hidden"
                    title="Reset filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Search Toggle Button */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-2.5 sm:p-3 border transition-colors cursor-pointer flex items-center justify-center ${
                  isSearchOpen || searchQuery ? 'bg-[#C8102E] text-white border-[#C8102E]' : 'bg-[#171719] text-[#888888] hover:text-white border-[#38383a]'
                }`}
                title="Toggle keyword search"
              >
                <Search className="w-4 h-4" />
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs sm:text-sm text-[#C8102E] hover:underline font-mono whitespace-nowrap cursor-pointer px-2 py-1 hidden sm:inline-block font-bold"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Optional Keyword Search Row if opened */}
          {isSearchOpen && (
            <div className="mt-3 pt-3 border-t border-[#333333] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search specific model, engine, builder name..."
                className="w-full pl-9 pr-8 py-2.5 bg-[#1c1c1c] border border-[#444444] text-white placeholder-[#888888] focus:outline-none focus:border-[#C8102E] font-mono text-xs sm:text-sm"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Count Bar */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#3d3d3d] text-xs sm:text-sm font-mono text-[#bbbbbb]">
          <div className="flex items-center gap-2 flex-wrap">
            <span>SHOWING <strong className="text-white">{filteredVehicles.length}</strong> BUILDS</span>
            {selectedCategory !== 'All Categories' && <span>· <span className="text-[#C8102E]">{selectedCategory}</span></span>}
            {selectedLocation !== 'All Locations' && <span>· <span className="text-[#C8102E]">{selectedLocation}</span></span>}
            {searchQuery && <span>· <span className="text-[#888888]">"{searchQuery}"</span></span>}
          </div>
        </div>

        {/* Vehicle Cards Grid: Dynamically responsive */}
        {gridVehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 md:gap-6 w-full">
            {gridVehicles.map((vehicle) => (
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
          <div className="border border-[#3d3d3d] bg-[#242424] p-10 text-center max-w-lg mx-auto my-12">
            <Compass className="w-10 h-10 text-[#888888] mx-auto mb-3" />
            <h3 className="font-['Oswald'] text-2xl font-bold uppercase text-white">
              No matching builds found
            </h3>
            <p className="text-sm text-[#aaaaaa] mt-2">
              Try adjusting your search or location filter.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider font-['Oswald'] bg-[#333333] hover:bg-[#444444] text-white transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
              <button
                onClick={onOpenAddVehicle}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider font-['Oswald'] bg-[#C8102E] hover:bg-[#e01334] text-white transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Vehicle</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
