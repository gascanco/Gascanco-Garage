import React, { useState, useMemo } from 'react';
import { GarageEvent, Owner } from '../../types/garage';
import { 
  Calendar, MapPin, Users, Plus, Check, 
  Share2, Clock, ChevronRight, X, Bell, Layers, Search
} from 'lucide-react';

interface EventsViewProps {
  events: GarageEvent[];
  currentUser: Owner;
  onRsvpEvent: (eventId: string) => void;
  onSelectOwner: (ownerId: string) => void;
  onOpenAddEvent: () => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  currentUser,
  onRsvpEvent,
  onSelectOwner,
  onOpenAddEvent,
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

  // Events user is attending or organizing
  const userRsvpEvents = useMemo(() => {
    return events.filter(evt => evt.isAttending || evt.organizer.id === currentUser.id);
  }, [events, currentUser.id]);

  // Updates from events the user has RSVP'd to or is organizing
  const rsvpUpdates = useMemo(() => {
    const list: {
      id: string;
      eventId: string;
      eventTitle: string;
      eventType: string;
      title: string;
      content: string;
      date: string;
      tag?: string;
      authorName?: string;
    }[] = [];

    userRsvpEvents.forEach(evt => {
      if (evt.updates && evt.updates.length > 0) {
        evt.updates.forEach(u => {
          list.push({
            id: u.id,
            eventId: evt.id,
            eventTitle: evt.title,
            eventType: evt.eventType,
            title: u.title,
            content: u.content,
            date: u.date,
            tag: u.tag,
            authorName: u.authorName || evt.organizer.name
          });
        });
      } else {
        list.push({
          id: `upd-${evt.id}-default`,
          eventId: evt.id,
          eventTitle: evt.title,
          eventType: evt.eventType,
          title: 'RSVP Confirmed & Staging Set',
          content: `You're registered for this meet. Staging at ${evt.location}. Check back for real-time organizer bulletins.`,
          date: 'Active',
          tag: 'Organizer Notice',
          authorName: evt.organizer.name
        });
      }
    });

    return list;
  }, [userRsvpEvents]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#383838] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#C8102E]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#C8102E] font-bold">
              AUTOMOTIVE GATHERINGS
            </span>
          </div>
          <h1 className="font-['Oswald'] text-3xl sm:text-4xl font-bold uppercase tracking-tight text-white mt-1">
            COMMUNITY EVENTS & MEETS
          </h1>
          <p className="text-sm text-[#aaaaaa] mt-1 max-w-2xl">
            Track days, canyon dawn patrols, cars & coffee, and garage meetups organized by builders and drivers.
          </p>
        </div>

        <button
          onClick={onOpenAddEvent}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-[#C8102E] hover:bg-[#e01334] text-white font-['Oswald'] text-sm font-bold uppercase tracking-wider shadow-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>EVENT</span>
        </button>
      </div>

      {/* Desktop Dual Column Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Filter Bar & Events Grid (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-6 min-w-0">
          {/* Unified Categories & Location Filter Toolbar (Exact match with Builds page) */}
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
                      onClick={() => setSelectedType('All Categories')}
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
                  placeholder="Search events by title, venue, host, or keyword..."
                  className="w-full pl-9 pr-8 py-2.5 bg-[#171719] border border-[#38383a] text-white placeholder-[#888888] focus:outline-none focus:border-[#C8102E] font-mono text-xs sm:text-sm"
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

          {/* Events Grid */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filteredEvents.map(evt => {
                const isOrganizer = evt.organizer.id === currentUser.id;

                return (
                  <div
                    key={evt.id}
                    className="group flex flex-col justify-between bg-[#242424] border border-[#3d3d3d] hover:border-[#C8102E] transition-all duration-300 shadow-md overflow-hidden"
                  >
                    <div>
                      {/* Event Cover Banner */}
                      <div className="relative aspect-[16/9] overflow-hidden bg-[#181818]">
                        <img
                          src={evt.coverImage}
                          alt={evt.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <span className="px-2.5 py-1 text-[11px] font-['Oswald'] font-bold uppercase tracking-wider bg-[#C8102E] text-white shadow">
                            {evt.eventType}
                          </span>

                          {isOrganizer && (
                            <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#1f1f1f] text-[#ff4d6a] border border-[#ff4d6a]/40">
                              HOST
                            </span>
                          )}
                        </div>

                        {/* Bottom overlay: Date and Time */}
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <div className="flex items-center gap-1.5 text-xs font-mono text-white/90">
                            <Calendar className="w-3.5 h-3.5 text-[#C8102E]" />
                            <span>{evt.date}</span>
                            <span className="text-white/50">•</span>
                            <span>{evt.time}</span>
                          </div>
                        </div>
                      </div>

                      {/* Body Content */}
                      <div className="p-4 sm:p-5 space-y-2.5">
                        <h3 className="font-['Oswald'] text-xl font-bold uppercase tracking-wide text-white group-hover:text-[#C8102E] transition-colors leading-tight line-clamp-2">
                          {evt.title}
                        </h3>

                        {/* Location */}
                        <div className="flex items-start gap-2 text-xs font-mono text-[#bbbbbb]">
                          <MapPin className="w-4 h-4 text-[#C8102E] flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{evt.location}</span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-[#999999] leading-relaxed line-clamp-2">
                          {evt.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer: Organizer & Action */}
                    <div className="px-4 sm:px-5 py-3.5 border-t border-[#333333] bg-[#202020] flex items-center justify-between gap-3">
                      {/* Organizer */}
                      <button
                        type="button"
                        onClick={() => onSelectOwner(evt.organizer.id)}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left cursor-pointer min-w-0"
                      >
                        <img
                          src={evt.organizer.avatar}
                          alt={evt.organizer.name}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 object-cover border border-[#C8102E] shrink-0"
                        />
                        <div className="text-xs min-w-0">
                          <span className="font-['Oswald'] font-bold uppercase text-white truncate block">
                            {evt.organizer.name}
                          </span>
                          <span className="text-[10px] font-mono text-[#888888] block">
                            {evt.attendeesCount} Going
                          </span>
                        </div>
                      </button>

                      {/* RSVP Button */}
                      <button
                        type="button"
                        onClick={() => onRsvpEvent(evt.id)}
                        className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-['Oswald'] font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                          evt.isAttending
                            ? 'bg-[#C8102E] text-white shadow'
                            : 'border border-[#555555] text-white hover:border-white hover:bg-[#2e2e2e]'
                        }`}
                      >
                        {evt.isAttending ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Going</span>
                          </>
                        ) : (
                          <>
                            <Calendar className="w-3.5 h-3.5" />
                            <span>RSVP</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-[#3d3d3d] bg-[#242424] p-12 text-center max-w-md mx-auto my-8">
              <Calendar className="w-10 h-10 text-[#888888] mx-auto mb-3" />
              <h3 className="font-['Oswald'] text-2xl font-bold uppercase text-white">
                No events found
              </h3>
              <p className="text-xs text-[#aaaaaa] mt-1">
                There are no automotive gatherings matching your filter. Be the first to host one!
              </p>
              <button
                type="button"
                onClick={onOpenAddEvent}
                className="mt-5 px-5 py-2.5 bg-[#C8102E] hover:bg-[#e01334] text-white text-xs font-['Oswald'] font-bold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Host an Event</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Desktop Dual Column Sidebar (4 cols on desktop, hidden on mobile) */}
        <aside className="hidden lg:block lg:col-span-4 space-y-5 sticky top-6">
          {/* Confirmed RSVPs */}
          <div className="bg-[#242424] border border-[#3d3d3d] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#333333]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#10b981]" />
                <h3 className="font-['Oswald'] text-base font-bold uppercase tracking-wider text-white">
                  Your Confirmed RSVPs
                </h3>
              </div>
              <span className="text-xs font-mono text-[#C8102E] font-bold">
                {userRsvpEvents.length}
              </span>
            </div>

            {userRsvpEvents.length > 0 ? (
              <div className="space-y-3">
                {userRsvpEvents.map(re => (
                  <div key={re.id} className="p-3 bg-[#1c1c1c] border border-[#383838] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#C8102E] uppercase font-bold">{re.eventType}</span>
                      <span className="text-[#888888]">{re.attendeesCount} Going</span>
                    </div>
                    <h4 className="font-['Oswald'] text-sm font-bold uppercase text-white truncate">
                      {re.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#aaaaaa]">
                      <Clock className="w-3 h-3 text-[#777777] shrink-0" />
                      <span className="truncate">{re.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#777777]">
                      <MapPin className="w-3 h-3 text-[#777777] shrink-0" />
                      <span className="truncate">{re.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-mono text-[#888888] py-2 leading-relaxed">
                You haven't RSVP'd to any upcoming gatherings yet. Click RSVP on any event to register your spot.
              </p>
            )}
          </div>

          {/* Updates from RSVP'd Events Card */}
          <div className="bg-[#242424] border border-[#3d3d3d] p-5 shadow-sm space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-[#333333]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#C8102E]" />
                <h3 className="font-['Oswald'] text-base font-bold uppercase tracking-wider text-white">
                  RSVP Event Updates
                </h3>
              </div>
              <span className="text-xs font-mono text-[#C8102E] font-bold">
                {rsvpUpdates.length}
              </span>
            </div>

            {rsvpUpdates.length > 0 ? (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {rsvpUpdates.map(upd => (
                  <div key={upd.id} className="p-3 bg-[#1c1c1c] border border-[#383838] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono gap-2">
                      <span className="text-[#C8102E] uppercase font-bold truncate max-w-[170px]" title={upd.eventTitle}>
                        {upd.eventTitle}
                      </span>
                      <span className="text-[#888888] shrink-0">{upd.date}</span>
                    </div>

                    <h4 className="font-['Oswald'] text-sm font-bold uppercase text-white truncate">
                      {upd.title}
                    </h4>

                    <p className="text-[11px] text-[#aaaaaa] leading-relaxed">
                      {upd.content}
                    </p>

                    {upd.authorName && (
                      <div className="flex items-center gap-1.5 text-[10px] text-[#777777] pt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                        <span>Host: {upd.authorName}</span>
                        {upd.tag && (
                          <>
                            <span className="text-[#555555]">•</span>
                            <span className="text-[#999999]">{upd.tag}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-mono text-[#888888] py-2 leading-relaxed">
                You haven't RSVP'd to any events with active announcements. RSVP to upcoming meets to get live organizer updates, staging briefings, and route changes here.
              </p>
            )}
          </div>

          {/* Quick Host CTA Card */}
          <div className="p-4 bg-[#1e1e1e] border border-[#383838] flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-['Oswald'] uppercase font-bold text-white block">
                Planning a Cruise or Meet?
              </span>
              <span className="text-[11px] font-mono text-[#888888]">
                Publish staging point and itinerary for free.
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenAddEvent}
              className="px-3 py-2 bg-[#C8102E] hover:bg-[#e01334] text-white text-xs font-['Oswald'] font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer"
            >
              Host Meet
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
