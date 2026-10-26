import React, { useState, useMemo } from 'react';
import { MarketplaceItem, Owner } from '../../types/garage';
import { MarketplaceCard } from '../cards/MarketplaceCard';
import { 
  Search, X, Plus, MapPin, Layers, Tag, Car, Package, 
  Sparkles, Filter, Mail, CheckCircle2, Send, MessageSquare 
} from 'lucide-react';

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
  // Tab State: 'vehicles' vs 'parts'
  const [activeTab, setActiveTab] = useState<'vehicles' | 'parts'>('vehicles');

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCondition, setSelectedCondition] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All Locations');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Contact Modal State
  const [contactItem, setContactItem] = useState<MarketplaceItem | null>(null);
  const [inquiryMessage, setInquiryMessage] = useState('Hi, is this still available? Interested in purchasing.');
  const [inquirySent, setInquirySent] = useState(false);

  // Counts for tabs
  const vehicleItems = useMemo(() => items.filter(i => i.itemType === 'vehicle'), [items]);
  const partItems = useMemo(() => items.filter(i => i.itemType === 'part'), [items]);

  // Current tab items
  const tabItems = activeTab === 'vehicles' ? vehicleItems : partItems;

  // Dynamic available categories for the active tab
  const availableCategories = useMemo(() => {
    if (activeTab === 'vehicles') {
      return [
        'All',
        'Car',
        'Truck',
        'RV',
        'Semi',
        'SXS / UTV',
        'Dirt Bike',
        '4-Wheeler / ATV',
        'Other',
      ];
    } else {
      return [
        'All',
        'Engine & Performance',
        'Suspension & Brakes',
        'Wheels & Tires',
        'Interior & Safety',
        'Exterior & Aero',
        'SXS & Powersports',
        'Tools & Garage Gear',
      ];
    }
  }, [activeTab]);

  // Dynamic Locations list
  const availableLocations = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => {
      if (i.location) set.add(i.location);
    });
    return ['All Locations', ...Array.from(set).sort()];
  }, [items]);

  // Spotlight Item: Featured or highest viewed item of current tab
  const spotlightItem = useMemo(() => {
    const featured = tabItems.find(i => i.featured && i.status === 'active');
    if (featured) return featured;
    return tabItems[0] || null;
  }, [tabItems]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return tabItems.filter(item => {
      // Category filter
      if (selectedCategory !== 'All') {
        if (activeTab === 'vehicles' && item.vehicleType !== selectedCategory) {
          return false;
        }
        if (activeTab === 'parts' && item.partCategory !== selectedCategory) {
          return false;
        }
      }

      // Condition filter (parts only)
      if (activeTab === 'parts' && selectedCondition !== 'All') {
        if (item.condition !== selectedCondition) {
          return false;
        }
      }

      // Location filter
      if (selectedLocation !== 'All Locations') {
        if (item.location.toLowerCase() !== selectedLocation.toLowerCase()) {
          return false;
        }
      }

      // Search query
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
  }, [tabItems, activeTab, selectedCategory, selectedCondition, selectedLocation, searchQuery]);

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedCondition('All');
    setSelectedLocation('All Locations');
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const hasActiveFilters = selectedCategory !== 'All' || selectedCondition !== 'All' || selectedLocation !== 'All Locations' || searchQuery !== '';

  // Exclude spotlight item from grid when no filters are active to avoid duplicate
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
        
        {/* Marketplace Title & Action Header */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#3d3d40]">
          <div>
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#C8102E]" />
              <h1 className="font-['Oswald'] text-2xl sm:text-3xl font-bold uppercase tracking-wide text-white">
                PARTS BIN <span className="text-[#C8102E]">MARKETPLACE</span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#aaaaaa] font-mono mt-1">
              Buy & sell enthusiast vehicles (Cars, Trucks, RVs, Semis, SXS, Dirt Bikes, 4-Wheelers) and automotive parts.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAddListing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C8102E] hover:bg-[#e01334] text-white font-['Oswald'] text-sm font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>List in Parts Bin</span>
          </button>
        </div>

        {/* Dual Segmented Tabs (Vehicles vs. Parts) */}
        <div className="mb-4 grid grid-cols-2 gap-2 bg-[#202022] p-1.5 border border-[#38383a]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('vehicles');
              clearFilters();
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-['Oswald'] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'vehicles'
                ? 'bg-[#C8102E] text-white shadow-sm'
                : 'text-[#aaaaaa] hover:text-white hover:bg-[#28282b]'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Vehicles For Sale ({vehicleItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('parts');
              clearFilters();
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-['Oswald'] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'parts'
                ? 'bg-[#C8102E] text-white shadow-sm'
                : 'text-[#aaaaaa] hover:text-white hover:bg-[#28282b]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Parts & Accessories ({partItems.length})</span>
          </button>
        </div>

        {/* Spotlight Featured Deal - Matching Builds Page Banner */}
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

        {/* Filter Toolbar (Exact match with Builds Page DiscoverView Toolbar) */}
        <div className="mb-3 sm:mb-5 bg-[#242426] border border-[#38383a] p-3 sm:p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-row sm:items-center sm:gap-3">
            {/* Category Filter Dropdown */}
            <div className="flex items-center gap-2 text-xs sm:text-sm w-full sm:flex-1">
              <div className="flex items-center gap-2 w-full bg-[#171719] border border-[#38383a] px-3 py-2.5 sm:px-4 sm:py-3">
                <Layers className="w-4 h-4 text-[#C8102E] shrink-0" />
                <span className="text-xs sm:text-sm font-mono text-[#aaaaaa] uppercase shrink-0 hidden xs:inline sm:inline">
                  {activeTab === 'vehicles' ? 'Vehicle Type:' : 'Category:'}
                </span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-white focus:outline-none cursor-pointer font-mono truncate"
                  aria-label="Filter by category"
                >
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#171719] text-white">
                      {cat === 'All' ? (activeTab === 'vehicles' ? 'All Vehicle Types' : 'All Categories') : cat}
                    </option>
                  ))}
                </select>
                {selectedCategory !== 'All' && (
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="text-xs text-[#C8102E] hover:underline font-mono shrink-0 ml-1 cursor-pointer sm:hidden"
                    title="Clear category filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Part Condition Filter (Parts tab only) */}
            {activeTab === 'parts' && (
              <div className="flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto">
                <div className="flex items-center gap-2 w-full sm:w-auto bg-[#171719] border border-[#38383a] px-3 py-2.5 sm:px-4 sm:py-3">
                  <Filter className="w-4 h-4 text-[#C8102E] shrink-0" />
                  <span className="text-xs sm:text-sm font-mono text-[#aaaaaa] uppercase shrink-0 hidden sm:inline">Condition:</span>
                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-full sm:w-auto bg-transparent text-xs sm:text-sm text-white focus:outline-none cursor-pointer font-mono truncate"
                    aria-label="Filter by condition"
                  >
                    <option value="All" className="bg-[#171719] text-white">All Conditions</option>
                    <option value="Brand New" className="bg-[#171719] text-white">Brand New</option>
                    <option value="Like New" className="bg-[#171719] text-white">Like New</option>
                    <option value="Used - Good" className="bg-[#171719] text-white">Used - Good</option>
                    <option value="Core / Needs Rebuild" className="bg-[#171719] text-white">Core / Needs Rebuild</option>
                  </select>
                </div>
              </div>
            )}

            {/* Location Selector */}
            <div className="flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto bg-[#171719] border border-[#38383a] px-3 py-2.5 sm:px-4 sm:py-3">
                <MapPin className="w-4 h-4 text-[#C8102E] shrink-0" />
                <span className="text-xs sm:text-sm font-mono text-[#aaaaaa] uppercase shrink-0 hidden xs:inline sm:inline">Location:</span>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full sm:w-auto bg-transparent text-xs sm:text-sm text-white focus:outline-none cursor-pointer font-mono truncate"
                  aria-label="Filter by location"
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
                className={`p-2.5 sm:p-3 border transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
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

          {/* Keyword Search Row */}
          {isSearchOpen && (
            <div className="mt-3 pt-3 border-t border-[#333333] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'vehicles' ? "Search make, model, year, transmission, seller..." : "Search part name, brand, part number, fitment..."}
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

        {/* Listings Grid (Matching Builds Page Grid) */}
        {gridItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {gridItems.map((item) => (
              <MarketplaceCard
                key={item.id}
                item={item}
                variant="grid"
                onSelect={onSelectItem}
                onContactSeller={(item) => setContactItem(item)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-[#222224] border border-[#383838] p-8">
            <Tag className="w-12 h-12 text-[#666666] mx-auto mb-3" />
            <h3 className="font-['Oswald'] text-xl font-bold uppercase text-white mb-1">
              No Listings Found
            </h3>
            <p className="text-xs sm:text-sm text-[#aaaaaa] font-mono max-w-md mx-auto mb-5">
              No {activeTab === 'vehicles' ? 'vehicles' : 'parts'} matching your current filters in the Parts Bin.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 bg-[#2d2d30] hover:bg-[#38383c] border border-[#444448] text-white font-['Oswald'] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
              <button
                type="button"
                onClick={onOpenAddListing}
                className="px-4 py-2 bg-[#C8102E] hover:bg-[#e01334] text-white font-['Oswald'] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                List The First Item
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
