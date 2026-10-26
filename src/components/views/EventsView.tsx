import React, { useState, useMemo, useEffect } from 'react';
import { GarageEvent, Owner } from '../../types/garage';
import { 
  Calendar, MapPin, Users, Plus, Check, 
  Clock, X, Layers, Search, ArrowRight, Star
} from 'lucide-react';

interface EventsViewProps {
  events: GarageEvent[];
  currentUser: Owner;
  onRsvpEvent: (eventId: string, status?: 'going' | 'interested' | 'none') => void;
  onSelectOwner: (ownerId: string) => void;
  onOpenAddEvent: () => void;
  onSelectEvent: (eventId: string) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  currentUser,
  onRsvpEvent,
  onSelectOwner,
  onOpenAddEvent,
  onSelectEvent,
}) => {
  const [selectedType, setSelectedType] = useState<string>('All Categories');
  const [selectedLocation, setSelectedLocation] = useState<string>('All Locations');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const EVENT_CATEGORIES = [
    'All Categories',
    'Canyon Cruise',
    'Track Day',
    'Cars & Coffee',
    'Car Meet',
    'Drag Night',
    'Overland Trek',
    'Dyno Day'
  ];

  // Dynamic Locations list extracted from events
  const availableLocations = useMemo(() => {
    const set = new Set<string>();
    events.forEach(evt => {
      if (evt.location) {
        const parts = evt.location.split(',').map(s => s.trim());
        if (parts.length >= 2) {
          const cityState = `${parts[parts.length - 2]}, ${parts[parts.length - 1]}`;
          set.add(cityState);
        } else {
          set.add(evt.location);
        }
      }
    });
    return ['All Locations', ...Array.from(set).sort()];
  }, [events]);

  // Featured next upcoming event (Spotlight)
  const spotlightEvent = useMemo(() => {
    if (events.length === 0) return null;
    return events[0];
  }, [events]);

  // Countdown timer for spotlight event
  const [spotlightCountdown, setSpotlightCountdown] = useState({
    days: 4,
    hours: 12,
    minutes: 38,
    seconds: 45
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setSpotlightCountdown(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      const matchesType = selectedType === 'All Categories' || evt.eventType === selectedType;
      const matchesLocation = selectedLocation === 'All Locations' || 
        evt.location.toLowerCase().includes(selectedLocation.toLowerCase());
      
      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        matchesSearch = 
          evt.title.toLowerCase().includes(q) ||
          evt.description.toLowerCase().includes(q) ||
          evt.location.toLowerCase().includes(q) ||
          evt.organizer.name.toLowerCase().includes(q) ||
          evt.eventType.toLowerCase().includes(q);
      }

      return matchesType && matchesLocation && matchesSearch;
    });
  }, [events, selectedType, selectedLocation, searchQuery]);

  const clearFilters = () => {
    setSelectedType('All Categories');
    setSelectedLocation('All Locations');
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const hasActiveFilters = selectedType !== 'All Categories' || selectedLocation !== 'All Locations' || searchQuery !== '';

  // Exclude spotlight event from grid when showing default unfiltered view to avoid duplicate card
  const gridEvents = useMemo(() => {
    if (!hasActiveFilters && spotlightEvent) {
      return filteredEvents.filter(e => e.id !== spotlightEvent.id);
    }
    return filteredEvents;
  }, [filteredEvents, hasActiveFilters, spotlightEvent]);

  return (
    <div className="pb-16 bg-[#303030] text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-5 sm:pt-6 space-y-6">
        
        {/* ========================================================
            1. NEXT UPCOMING EVENT SPOTLIGHT HERO (Mirrored from Builds page)
           ======================================================== */}
        {!hasActiveFilters && spotlightEvent && (
          <div 
            onClick={() => onSelectEvent(spotlightEvent.id)}
            className="group relative bg-[#1c1c1f] border border-[#38383a] hover:border-[#C8102E] transition-all duration-200 overflow-hidden shadow-2xl cursor-pointer"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              {/* Event Hero Cover Image */}
              <div className="lg:col-span-7 relative aspect-[16/9] lg:aspect-auto overflow-hidden bg-black">
                <img
                  src={spotlightEvent.coverImage}
                  alt={spotlightEvent.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/90 via-black/30 to-transparent pointer-events-none" />
                
                {/* Badge tags */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-[#C8102E] text-white font-['Oswald'] font-bold text-xs uppercase tracking-wider shadow">
                    NEXT OFFICIAL MEET
                  </span>
                  <span className="px-2.5 py-1 bg-black/80 backdrop-blur-sm border border-white/20 text-[#eeeeee] font-mono text-[11px]">
                    {spotlightEvent.eventType}
                  </span>
                </div>
              </div>

              {/* Event Spotlight Details */}
              <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between bg-[#202022] space-y-4">
                <div className="space-y-3">
                  {/* Countdown Timer Strip */}
                  <div className="flex items-center gap-2 text-xs font-mono text-[#888888] pb-2 border-b border-[#303034]">
                    <Clock className="w-3.5 h-3.5 text-[#C8102E]" />
                    <span>Countdown:</span>
                    <span className="font-bold text-white tabular-nums">
                      {spotlightCountdown.days}d : {spotlightCountdown.hours}h : {spotlightCountdown.minutes}m : {spotlightCountdown.seconds}s
                    </span>
                  </div>

                  <h2 className="font-['Oswald'] text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white group-hover:text-[#C8102E] transition-colors leading-tight">
                    {spotlightEvent.title}
                  </h2>

                  <div className="space-y-1.5 text-xs font-mono text-[#aaaaaa]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#C8102E] shrink-0" />
                      <span className="text-white">{spotlightEvent.date} • {spotlightEvent.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#C8102E] shrink-0" />
                      <span className="truncate">{spotlightEvent.location}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#999999] line-clamp-3 leading-relaxed">
                    {spotlightEvent.description}
                  </p>
                </div>

                {/* Bottom Row: RSVP and View Details */}
                <div className="pt-3 border-t border-[#303034] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#aaaaaa]">
                    <Users className="w-4 h-4 text-[#C8102E]" />
                    <span>{spotlightEvent.attendeesCount} Going</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRsvpEvent(spotlightEvent.id, spotlightEvent.isAttending ? 'none' : 'going');
                      }}
                      className={`px-3 py-1.5 text-xs font-['Oswald'] font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.98] border cursor-pointer ${
                        spotlightEvent.isAttending
                          ? 'bg-[#182618] border-[#225022] text-[#4ade80]'
                          : 'bg-[#C8102E] hover:bg-[#e01334] border-[#C8102E] text-white shadow'
                      }`}
                    >
                      {spotlightEvent.isAttending ? '✓ Going' : 'RSVP'}
                    </button>

                    <div className="flex items-center gap-1 text-xs font-['Oswald'] font-bold uppercase text-[#C8102E] group-hover:translate-x-1 transition-transform">
                      <span>Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            2. CATEGORIES & LOCATION FILTER TOOLBAR (Exact match with Builds and Live)
           ======================================================== */}
        <div className="mb-3 sm:mb-5 bg-[#242426] border border-[#38383a] p-3 sm:p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-row sm:items-center sm:gap-3">
            {/* Category Dropdown */}
            <div className="flex items-center gap-2 text-xs sm:text-sm w-full sm:flex-1">
              <div className="flex items-center gap-2 w-full bg-[#171719] border border-[#38383a] px-3 py-2.5 sm:px-4 sm:py-3">
                <Layers className="w-4 h-4 text-[#C8102E] shrink-0" />
                <span className="text-xs sm:text-sm font-mono text-[#aaaaaa] uppercase shrink-0 hidden xs:inline sm:inline">Category:</span>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-white focus:outline-none cursor-pointer font-mono truncate"
                  aria-label="Filter events by category"
                >
                  {EVENT_CATEGORIES.map(category => (
                    <option key={category} value={category} className="bg-[#171719] text-white">
                      {category}
                    </option>
                  ))}
                </select>
                {selectedType !== 'All Categories' && (
                  <button
                    type="button"
                    onClick={() => setSelectedType('All Categories')}
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
                  aria-label="Filter events by location"
                >
                  {availableLocations.map((loc) => (
                    <option key={loc} value={loc} className="bg-[#171719] text-white">
                      {loc}
                    </option>
                  ))}
                </select>
                {hasActiveFilters && (
                  <button
                    type="button"
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
                  type="button"
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
                placeholder="Search meets by name, venue, organizer, or city..."
                className="w-full bg-[#171719] border border-[#38383a] pl-9 pr-8 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#C8102E] font-mono"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-white cursor-pointer"
                  title="Clear search text"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ========================================================
            3. EVENTS GRID (Clean 3-Column Responsive Grid)
           ======================================================== */}
        {gridEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {gridEvents.map((evt) => (
              <article
                key={evt.id}
                onClick={() => onSelectEvent(evt.id)}
                className="group bg-[#242426] border border-[#38383a] hover:border-[#C8102E] transition-all duration-200 overflow-hidden shadow-sm flex flex-col cursor-pointer"
              >
                {/* 16:9 Cover Photo */}
                <div className="relative aspect-[16/9] bg-black overflow-hidden">
                  <img
                    src={evt.coverImage}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  {/* Category Pill Tag (Unboxed, clean) */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 bg-black/80 backdrop-blur-sm border border-white/20 text-white font-['Oswald'] font-bold text-[10px] uppercase tracking-wider">
                      {evt.eventType}
                    </span>
                  </div>

                  {/* Date badge */}
                  <div className="absolute bottom-2.5 left-2.5 text-white font-mono text-xs">
                    <span className="bg-black/70 px-2 py-0.5 border border-white/10">
                      {evt.date}
                    </span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <h3 className="font-['Oswald'] text-lg sm:text-xl font-bold uppercase tracking-wide text-white group-hover:text-[#C8102E] transition-colors leading-snug">
                      {evt.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs font-mono text-[#aaaaaa]">
                      <MapPin className="w-3.5 h-3.5 text-[#C8102E] shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>

                    <p className="text-xs text-[#888888] line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  {/* Bottom Footer Row: Attendees & RSVP Action */}
                  <div className="pt-3 border-t border-[#333336] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-[#aaaaaa]">
                      <Users className="w-3.5 h-3.5 text-[#C8102E]" />
                      <span>{evt.attendeesCount} Going</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRsvpEvent(evt.id, evt.isAttending ? 'none' : 'going');
                        }}
                        className={`px-2.5 py-1 text-xs font-['Oswald'] font-bold uppercase tracking-wider border transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                          evt.isAttending
                            ? 'bg-[#182618] border-[#225022] text-[#4ade80]'
                            : 'bg-[#1e1e22] hover:bg-[#C8102E] text-white border-[#38383a] hover:border-[#C8102E]'
                        }`}
                      >
                        {evt.isAttending ? '✓ Going' : 'RSVP'}
                      </button>

                      <span className="text-xs font-['Oswald'] font-bold uppercase text-[#C8102E] flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                        Details →
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-[#38383a] bg-[#242426] p-10 text-center max-w-md mx-auto my-8">
            <Calendar className="w-8 h-8 text-[#888888] mx-auto mb-2" />
            <h4 className="font-['Oswald'] text-xl font-bold uppercase text-white">
              No meets found
            </h4>
            <p className="text-xs text-[#aaaaaa] mt-1">
              Try clearing filters or search to view all upcoming automotive events.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 text-xs font-['Oswald'] font-bold uppercase tracking-wider bg-[#333333] hover:bg-[#444444] text-white transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
              <button
                type="button"
                onClick={onOpenAddEvent}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-['Oswald'] font-bold uppercase tracking-wider bg-[#C8102E] hover:bg-[#e01334] text-white transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Event</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
