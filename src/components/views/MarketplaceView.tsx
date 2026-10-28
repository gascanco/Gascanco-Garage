import React, { useState, useMemo } from 'react';
import { MarketplaceItem, Owner } from '../../types/garage';
import { MarketplaceCard } from '../cards/MarketplaceCard';
import { 
  Search, X, Plus, MapPin, Layers, Tag, Mail, CheckCircle2, Send
} from 'lucide-react';
import { extractStateName } from '../../utils/dateAndLocationUtils';

interface MarketplaceViewProps {
  items: MarketplaceItem[];
  currentUser: Owner;
  onOpenAddListing: () => void;
  onSelectItem?: (itemId: string) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  items,
  currentUser,
  onOpenAddListing,
  onSelectItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedLocation, setSelectedLocation] = useState<string>('All Locations');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Contact Modal State
  const [contactItem, setContactItem] = useState<MarketplaceItem | null>(null);
  const [inquiryMessage, setInquiryMessage] = useState('Hi, is this still available? Interested in purchasing.');
  const [inquirySent, setInquirySent] = useState(false);

  // Spotlight Item: Featured or first active listing in Parts Bin (Matching Builds Page Spotlight)
  const spotlightItem = useMemo(() => {
    const featured = items.find(i => i.featured && i.status === 'active');
    if (featured) return featured;
    return items[0] || null;
  }, [items]);

  // Dynamic Categories list across Vehicles and Parts
  const availableCategories = useMemo(() => {
    return [
      'All Categories',
      'All Vehicles For Sale',
      'Cars For Sale',
      'Trucks & 4x4s',
      'SXS & UTVs',
      'Dirt Bikes & Motos',
      '4-Wheelers & ATVs',
      'Semis & Heavy Duty',
      'RVs & Haulers',
      'All Parts & Accessories',
      'Engine & Performance',
      'Suspension & Brakes',
      'Wheels & Tires',
      'Interior & Safety',
      'Exterior & Aero',
      'SXS & Powersports Parts',
      'Tools & Garage Gear',
    ];
  }, []);

  // Dynamic Locations list - Merged into States only
  const availableLocations = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => {
      if (i.location) set.add(extractStateName(i.location));
    });
    return ['All Locations', ...Array.from(set).sort()];
  }, [items]);

  // Filtered listings
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // 1. Category Filter
      if (selectedCategory !== 'All Categories') {
        if (selectedCategory === 'All Vehicles For Sale' && item.itemType !== 'vehicle') return false;
        if (selectedCategory === 'Cars For Sale' && (item.itemType !== 'vehicle' || item.vehicleType !== 'Car')) return false;
        if (selectedCategory === 'Trucks & 4x4s' && (item.itemType !== 'vehicle' || item.vehicleType !== 'Truck')) return false;
        if (selectedCategory === 'SXS & UTVs' && (item.itemType !== 'vehicle' || !item.vehicleType?.includes('SXS'))) return false;
        if (selectedCategory === 'Dirt Bikes & Motos' && (item.itemType !== 'vehicle' || !item.vehicleType?.includes('Dirt Bike'))) return false;
        if (selectedCategory === '4-Wheelers & ATVs' && (item.itemType !== 'vehicle' || !item.vehicleType?.includes('4-Wheeler'))) return false;
        if (selectedCategory === 'Semis & Heavy Duty' && (item.itemType !== 'vehicle' || !item.vehicleType?.includes('Semi'))) return false;
        if (selectedCategory === 'RVs & Haulers' && (item.itemType !== 'vehicle' || !item.vehicleType?.includes('RV'))) return false;

        if (selectedCategory === 'All Parts & Accessories' && item.itemType !== 'part') return false;
        if (selectedCategory === 'Engine & Performance' && item.partCategory !== 'Engine & Performance') return false;
        if (selectedCategory === 'Suspension & Brakes' && item.partCategory !== 'Suspension & Brakes') return false;
        if (selectedCategory === 'Wheels & Tires' && item.partCategory !== 'Wheels & Tires') return false;
        if (selectedCategory === 'Interior & Safety' && item.partCategory !== 'Interior & Safety') return false;
        if (selectedCategory === 'Exterior & Aero' && item.partCategory !== 'Exterior & Aero') return false;
        if (selectedCategory === 'SXS & Powersports Parts' && item.partCategory !== 'SXS & Powersports') return false;
        if (selectedCategory === 'Tools & Garage Gear' && item.partCategory !== 'Tools & Garage Gear') return false;
      }

      // 2. Location filter (States only)
      if (selectedLocation !== 'All Locations') {
        const stateName = extractStateName(item.location);
        if (stateName.toLowerCase() !== selectedLocation.toLowerCase()) {
          return false;
        }
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = item.title.toLowerCase().includes(query);
        const descMatch = item.description.toLowerCase().includes(query);
        const locationMatch = item.location.toLowerCase().includes(query);
        const sellerMatch = item.seller.name.toLowerCase().includes(query);
        const brandMatch = item.brand ? item.brand.toLowerCase().includes(query) : false;
        const makeMatch = item.make ? item.make.toLowerCase().includes(query) : false;
        const modelMatch = item.model ? item.model.toLowerCase().includes(query) : false;
        if (!titleMatch && !descMatch && !locationMatch && !sellerMatch && !brandMatch && !makeMatch && !modelMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.viewsCount - a.viewsCount;
    });
  }, [items, selectedCategory, selectedLocation, searchQuery]);

  const clearFilters = () => {
    setSelectedCategory('All Categories');
    setSelectedLocation('All Locations');
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const hasActiveFilters = selectedCategory !== 'All Categories' || selectedLocation !== 'All Locations' || searchQuery !== '';

  // Strict single Spotlight rule matching Builds page: When hero banner is visible, exclude it from grid
  const gridItems = useMemo(() => {
    if (!hasActiveFilters && spotlightItem) {
      return filteredItems.filter(i => i.id !== spotlightItem.id);
    }
    return filteredItems;
  }, [filteredItems, hasActiveFilters, spotlightItem]);

  const handleSendInquiry = () => {
    setInquirySent(true);
    setTimeout(() => {
      setInquirySent(false);
      setContactItem(null);
    }, 2200);
  };

  return (
    <div className="pb-16 bg-[#303030] text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-5 sm:pt-6">
        {/* Spotlight Listing - Desktop only, removed on mobile (Identical to Builds page) */}
        {!hasActiveFilters && spotlightItem && (
          <div className="mb-5 sm:mb-6 hidden sm:block">
            <MarketplaceCard
              item={spotlightItem}
              variant="featured"
              onSelect={onSelectItem}
              onContactSeller={(item) => setContactItem(item)}
            />
          </div>
        )}

        {/* Categories & Location Filter Toolbar (Identical to Builds DiscoverView Toolbar) */}
        <div className="mb-3 sm:mb-5 bg-[#242426] border border-[#38383a] p-3 sm:p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-row sm:items-center sm:gap-3">
            {/* Category Dropdown */}
            <div className="flex items-center gap-2 text-xs sm:text-sm w-full sm:flex-1">
              <div className="flex items-center gap-2 w-full bg-[#171719] border border-[#38383a] px-3 py-2.5 sm:px-4 sm:py-3">
                <Layers className="w-4 h-4 text-[#C8102E] shrink-0" />
                <span className="text-xs sm:text-sm font-mono text-[#aaaaaa] uppercase shrink-0 hidden xs:inline sm:inline">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-white focus:outline-none cursor-pointer font-mono truncate"
                  aria-label="Filter parts bin by category"
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

            {/* Location Selector */}
            <div className="flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto bg-[#171719] border border-[#38383a] px-3 py-2.5 sm:px-4 sm:py-3">
                <MapPin className="w-4 h-4 text-[#C8102E] shrink-0" />
                <span className="text-xs sm:text-sm font-mono text-[#aaaaaa] uppercase shrink-0 hidden xs:inline sm:inline">Location:</span>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full sm:w-auto bg-transparent text-xs sm:text-sm text-white focus:outline-none cursor-pointer font-mono truncate"
                  aria-label="Filter parts bin by location"
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
                placeholder="Search specific part, vehicle make, model, seller..."
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

        {/* Count Bar (Identical to Builds page) */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#3d3d3d] text-xs sm:text-sm font-mono text-[#bbbbbb]">
          <div className="flex items-center gap-2 flex-wrap">
            <span>SHOWING <strong className="text-white">{filteredItems.length}</strong> LISTINGS</span>
            {selectedCategory !== 'All Categories' && <span>· <span className="text-[#C8102E]">{selectedCategory}</span></span>}
            {selectedLocation !== 'All Locations' && <span>· <span className="text-[#C8102E]">{selectedLocation}</span></span>}
            {searchQuery && <span>· <span className="text-[#888888]">"{searchQuery}"</span></span>}
          </div>
        </div>

        {/* Listings Grid: Dynamically responsive (Identical to Builds page) */}
        {gridItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 md:gap-6 w-full">
            {gridItems.map((item) => (
              <div key={item.id} className="min-w-0 w-full">
                <MarketplaceCard
                  item={item}
                  variant="grid"
                  onSelect={onSelectItem}
                  onContactSeller={(target) => setContactItem(target)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-[#3d3d3d] bg-[#242424] p-10 text-center max-w-lg mx-auto my-12">
            <Tag className="w-10 h-10 text-[#888888] mx-auto mb-3" />
            <h3 className="font-['Oswald'] text-2xl font-bold uppercase text-white">
              No matching listings found
            </h3>
            <p className="text-sm text-[#aaaaaa] mt-2">
              Try adjusting your search or location filter.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider font-['Oswald'] bg-[#333333] hover:bg-[#444444] text-white transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
              <button
                type="button"
                onClick={onOpenAddListing}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider font-['Oswald'] bg-[#C8102E] hover:bg-[#e01334] text-white transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>List in Parts Bin</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contact Seller Inquiry Modal */}
      {contactItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#242426] border border-[#3d3d40] w-full max-w-lg p-5 sm:p-6 shadow-2xl relative animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#333336]">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#C8102E]" />
                <h3 className="font-['Oswald'] text-lg sm:text-xl font-bold uppercase text-white">
                  Contact Seller
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setContactItem(null)}
                className="p-1 text-[#888888] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Item Snapshot */}
            <div className="my-4 p-3 bg-[#18181a] border border-[#333336] flex items-center gap-3.5">
              <img
                src={contactItem.primaryImage}
                alt={contactItem.title}
                className="w-16 h-16 object-cover border border-[#404040] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono text-[#aaaaaa] uppercase block">
                  {contactItem.itemType === 'vehicle' ? contactItem.vehicleType : contactItem.partCategory}
                </span>
                <h4 className="font-['Oswald'] font-bold text-base uppercase text-white truncate">
                  {contactItem.title}
                </h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-['Oswald'] font-bold text-[#C8102E] text-sm">
                    ${contactItem.price.toLocaleString()} {contactItem.priceType?.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-mono text-[#888888] flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-[#C8102E]" />
                    {contactItem.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="mb-4 flex items-center gap-3 p-2.5 bg-[#1e1e20] border border-[#333336]">
              <img
                src={contactItem.seller.avatar}
                alt={contactItem.seller.name}
                className="w-8 h-8 rounded-full object-cover border border-[#C8102E]"
              />
              <div>
                <span className="font-['Oswald'] font-bold text-sm uppercase text-white block">
                  {contactItem.seller.name}
                </span>
                <span className="text-[11px] font-mono text-[#888888]">
                  Verified Enthusiast · Member since {contactItem.seller.memberSince}
                </span>
              </div>
            </div>

            {/* Quick Templates */}
            <div className="mb-3 space-y-1">
              <label className="text-[11px] font-mono text-[#888888] uppercase block">Quick Inquiries:</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Is this still available?',
                  'Would you consider an offer?',
                  'Can I inspect in person?',
                  'Willing to ship to my zip code?',
                ].map((txt) => (
                  <button
                    key={txt}
                    type="button"
                    onClick={() => setInquiryMessage(txt)}
                    className="px-2.5 py-1 bg-[#1a1a1c] hover:bg-[#28282c] border border-[#3a3a3e] text-[11px] font-mono text-[#cccccc] cursor-pointer"
                  >
                    {txt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Message Textarea */}
            <div className="mb-4">
              <label className="text-[11px] font-mono text-[#888888] uppercase block mb-1">Your Message:</label>
              <textarea
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-[#171719] border border-[#444448] text-white text-xs font-mono focus:outline-none focus:border-[#C8102E]"
                placeholder="Write your message to the seller..."
              />
            </div>

            {/* Send Button & Confirmation */}
            {inquirySent ? (
              <div className="p-3 bg-[#10b981]/20 border border-[#10b981] text-[#34d399] flex items-center justify-center gap-2 text-xs font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>Inquiry sent to {contactItem.seller.name}! They will be notified.</span>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setContactItem(null)}
                  className="px-4 py-2 border border-[#444448] text-[#aaaaaa] hover:text-white font-['Oswald'] text-xs uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendInquiry}
                  className="px-5 py-2 bg-[#C8102E] hover:bg-[#e01334] text-white font-['Oswald'] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Inquiry</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
