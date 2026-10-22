import React, { useState, useMemo } from 'react';
import { 
  Vehicle, ActivityItem, ActivityType, Owner, GarageEvent, 
  CommunityPost, PostComment, isHardAdmin, SpotlightConfig, CommunityPoll 
} from '../../types/garage';
import { 
  Wrench, BookOpen, Clock, 
  Search, ChevronRight, Calendar, MessageSquare, MapPin, 
  Check, Play, ExternalLink, Globe, Youtube, Image as ImageIcon, X, Maximize2,
  Pencil, Trash2, Car, Upload, Plus, ShieldCheck, Layers, ShoppingBag, Tag,
  Star, BarChart3, Vote
} from 'lucide-react';
import { ReactionButtons } from './ReactionButtons';
import { ThreadedComments } from './ThreadedComments';
import { CommunityPollCard } from '../cards/CommunityPollCard';
import { formatTimeAgo } from '../../utils/dateAndLocationUtils';

interface ActivityFeedProps {
  vehicles: Vehicle[];
  events?: GarageEvent[];
  posts?: CommunityPost[];
  comments?: PostComment[];
  onSelectVehicle: (vehicleId: string) => void;
  onSelectOwner?: (ownerId: string) => void;
  onLikeToggle?: (vehicleId: string) => void;
  onDislikeToggle?: (vehicleId: string) => void;
  onRsvpEvent?: (eventId: string) => void;
  likedVehicleIds?: Set<string>;
  dislikedVehicleIds?: Set<string>;
  currentUserId?: string;
  currentUser?: Owner;
  onUpdatePost?: (updatedPost: CommunityPost) => void;
  onDeletePost?: (postId: string) => void;
  onAddComment?: (comment: Omit<PostComment, 'id' | 'createdAt'>) => void;
  onUpdateComment?: (commentId: string, content: string, photoUrl?: string) => void;
  onDeleteComment?: (commentId: string) => void;
  limit?: number;
  compact?: boolean;
  onOpenAddVehicle?: () => void;
  onExploreEvents?: () => void;
  onExploreBuilds?: () => void;
  spotlightConfig?: SpotlightConfig;
  onOpenSpotlightModal?: () => void;
  polls?: CommunityPoll[];
  onVotePoll?: (pollId: string, optionId: string) => void;
  onTogglePollStatus?: (pollId: string) => void;
  onDeletePoll?: (pollId: string) => void;
  onOpenAddPoll?: () => void;
  onSelectEvent?: (eventId: string) => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  vehicles,
  events = [],
  posts = [],
  comments = [],
  onSelectVehicle,
  onSelectOwner,
  onLikeToggle,
  onDislikeToggle,
  onRsvpEvent,
  likedVehicleIds = new Set(),
  dislikedVehicleIds = new Set(),
  currentUserId,
  currentUser,
  onUpdatePost,
  onDeletePost,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  limit,
  compact = false,
  spotlightConfig,
  onOpenSpotlightModal,
  polls = [],
  onVotePoll,
  onTogglePollStatus,
  onDeletePoll,
  onOpenAddPoll,
  onExploreEvents,
  onSelectEvent,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedLocation, setSelectedLocation] = useState<string>('All Locations');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);
  const [playingYoutubeId, setPlayingYoutubeId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(10);

  // Threaded Comments Expanded State
  const [expandedCommentItemIds, setExpandedCommentItemIds] = useState<Set<string>>(new Set());

  const toggleComments = (itemId: string) => {
    setExpandedCommentItemIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // Edit Post State
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editVehicleId, setEditVehicleId] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editLinkPreview, setEditLinkPreview] = useState<CommunityPost['linkPreview'] | null>(null);
  const [editDismissedUrl, setEditDismissedUrl] = useState<string | null>(null);
  const [isEditDragOver, setIsEditDragOver] = useState(false);
  const editFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Vehicles owned by the logged-in user
  const userVehicles = useMemo(() => {
    if (!currentUserId) return [];
    return vehicles.filter(v => v.owner.id === currentUserId);
  }, [vehicles, currentUserId]);

  // Extract URL from string
  const extractUrlFromText = (text: string): string | null => {
    const match = text.match(/https?:\/\/[^\s]+/i);
    return match ? match[0] : null;
  };

  // URL recognition in Edit mode
  React.useEffect(() => {
    if (!editingPost) return;
    const foundUrl = extractUrlFromText(editContent);
    if (!foundUrl) {
      if (!editingPost.linkPreview) {
        setEditLinkPreview(null);
      }
      return;
    }
    if (foundUrl === editDismissedUrl) return;

    try {
      const ytMatch = foundUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i);
      if (ytMatch) {
        const videoId = ytMatch[1];
        setEditLinkPreview({
          type: 'youtube',
          url: foundUrl,
          youtubeId: videoId,
          title: 'YouTube Video',
          image: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          domain: 'youtube.com',
        });
      } else {
        const parsed = new URL(foundUrl);
        setEditLinkPreview({
          type: 'website',
          url: foundUrl,
          title: parsed.hostname,
          domain: parsed.hostname,
          image: `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`,
        });

        fetch(`/api/link-preview?url=${encodeURIComponent(foundUrl)}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data && data.url === foundUrl) {
              setEditLinkPreview(data);
            }
          })
          .catch(() => {});
      }
    } catch {
      // ignore invalid URLs
    }
  }, [editContent, editDismissedUrl, editingPost]);

  const handleStartEdit = (act: ActivityItem) => {
    const targetPostId = act.postId || act.id.replace('act-post-', '');
    const found = posts.find(p => p.id === targetPostId) || {
      id: targetPostId,
      content: act.description,
      author: act.owner,
      dateStr: act.dateStr,
      vehicleId: act.vehicleId,
      vehicleName: act.vehicleName,
      images: act.images,
      imageUrl: act.photoUrl,
      linkPreview: act.linkPreview,
      likesCount: act.likesCount || 0,
      createdAt: new Date().toISOString(),
    };

    setEditingPost(found);
    setEditContent(found.content || '');
    setEditVehicleId(found.vehicleId || '');
    setEditImages(found.images && found.images.length > 0 ? [...found.images] : (found.imageUrl ? [found.imageUrl] : []));
    setEditLinkPreview(found.linkPreview || null);
    setEditDismissedUrl(null);
  };

  const handleEditFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setEditImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    if (e.target) e.target.value = '';
  };

  const handleEditDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsEditDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setEditImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveEditImage = (index: number) => {
    setEditImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveEditPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    if (!editContent.trim() && editImages.length === 0) return;

    const taggedVehicle = userVehicles.find((v) => v.id === editVehicleId);
    const updated: CommunityPost = {
      ...editingPost,
      content: editContent.trim(),
      vehicleId: editVehicleId || undefined,
      vehicleName: taggedVehicle ? `${taggedVehicle.year} ${taggedVehicle.make} ${taggedVehicle.model}` : undefined,
      images: editImages.length > 0 ? editImages : undefined,
      imageUrl: editImages[0] || undefined,
      linkPreview: editLinkPreview || undefined,
    };

    onUpdatePost?.(updated);
    setEditingPost(null);
  };

  const handleDeleteCurrentPost = () => {
    if (!editingPost) return;
    onDeletePost?.(editingPost.id);
    setEditingPost(null);
  };

  // Helper to parse dates into sortable timestamps with realistic live relative times
  const parseDateToTimestamp = (dateStr?: string, fallbackOffset = 0): { timestamp: number; display: string } => {
    if (!dateStr || dateStr.toLowerCase().includes('just now') || dateStr.toLowerCase().includes('recently')) {
      const now = Date.now() - fallbackOffset * 60000;
      return { timestamp: now, display: 'Recently' };
    }

    const parsed = Date.parse(dateStr);
    if (!isNaN(parsed)) {
      const diffMs = Date.now() - parsed;
      // If within recent real-time (last 7 days), preserve it
      if (diffMs > 0 && diffMs < 7 * 86400000) {
        return { timestamp: parsed, display: dateStr };
      }
      // Stagger seed data realistically: 2m ago, 18m ago, 45m ago, 2h ago, 5h ago...
      const staggerMinutes = fallbackOffset === 0 ? 2 : (fallbackOffset * 18 + 5);
      const staggered = Date.now() - staggerMinutes * 60000;
      return { timestamp: staggered, display: dateStr };
    }

    const staggerMinutes = fallbackOffset === 0 ? 2 : (fallbackOffset * 18 + 5);
    return { timestamp: Date.now() - staggerMinutes * 60000, display: dateStr };
  };

  // Helper to format human dates cleanly without noisy long strings
  const formatCleanDate = (dateStr?: string): string => {
    if (!dateStr) return 'Recently';
    if (dateStr.includes('•')) {
      const parts = dateStr.split('•');
      const datePart = parts[0].trim();
      const timePart = parts[1]?.trim()?.replace(/ PST| EST| CST| MST/g, '') || '';
      const match = datePart.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}/i);
      if (match) {
        return timePart ? `${match[0]} • ${timePart}` : match[0];
      }
    }
    const match = dateStr.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s*(\d{1,2})?,?\s*(\d{4})?/i);
    if (match) {
      const monthShort = match[1].slice(0, 3);
      const day = match[2] ? ` ${match[2]}` : '';
      return `${monthShort}${day}`;
    }
    return dateStr;
  };

  // Compile all activities across community posts and events (wrenching log feed removed)
  const activities = useMemo<ActivityItem[]>(() => {
    const list: ActivityItem[] = [];

    // 1. Events
    events.forEach((evt, eIndex) => {
      const { timestamp, display } = parseDateToTimestamp(evt.date, eIndex * 4);
      list.push({
        id: `act-evt-${evt.id}`,
        type: 'event',
        dateStr: `${evt.date} • ${evt.time}`,
        timestamp,
        owner: evt.organizer,
        title: evt.title,
        description: evt.description,
        badge: evt.eventType,
        photoUrl: evt.coverImage,
        eventData: evt,
        likesCount: evt.attendeesCount,
      });
    });

    // 2. Community Posts (Posts about updates, mods, photos, questions)
    posts.forEach((post, pIndex) => {
      const { timestamp, display } = parseDateToTimestamp(post.createdAt || post.dateStr, pIndex * 3);

      // Auto-extract linkPreview if not explicitly provided
      let effectiveLinkPreview = post.linkPreview;
      if (!effectiveLinkPreview && post.content) {
        const urlMatch = post.content.match(/https?:\/\/[^\s]+/i);
        if (urlMatch) {
          const foundUrl = urlMatch[0];
          const ytMatch = foundUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i);
          if (ytMatch) {
            effectiveLinkPreview = {
              type: 'youtube',
              url: foundUrl,
              youtubeId: ytMatch[1],
              title: 'YouTube Video',
              image: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`,
              domain: 'youtube.com',
            };
          } else {
            try {
              const u = new URL(foundUrl);
              effectiveLinkPreview = {
                type: 'website',
                url: foundUrl,
                title: u.hostname,
                domain: u.hostname,
                image: `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=128`,
              };
            } catch {}
          }
        }
      }

      const allImages = post.images && post.images.length > 0
        ? post.images
        : (post.imageUrl ? [post.imageUrl] : []);

      list.push({
        id: `act-post-${post.id}`,
        type: 'post',
        dateStr: post.dateStr || display,
        timestamp,
        vehicleId: post.vehicleId,
        vehicleName: post.vehicleName,
        owner: post.author,
        title: post.title || '',
        description: post.content,
        badge: post.category,
        photoUrl: allImages[0],
        images: allImages,
        linkPreview: effectiveLinkPreview,
        postCategory: post.category,
        likesCount: post.likesCount,
        postId: post.id,
        isAdvertisement: post.isAdvertisement,
        shopifyProduct: post.shopifyProduct,
      });
    });

    // 3. Community Polls
    (polls || []).forEach((poll, pIndex) => {
      const { timestamp } = parseDateToTimestamp(poll.createdAt, pIndex * 2);
      list.push({
        id: `act-poll-${poll.id}`,
        type: 'poll',
        dateStr: poll.createdAt || 'Active Poll',
        timestamp: timestamp || Date.now(),
        owner: poll.author,
        title: poll.question,
        description: poll.description || '',
        badge: 'COMMUNITY POLL',
        postCategory: poll.category || 'Community Polls',
        pollData: poll,
        likesCount: poll.totalVotes,
      });
    });

    // 4. Vehicle Registrations & Detailed Build Updates (Ensuring up to 100 rich current cards)
    vehicles.forEach((veh, vIndex) => {
      const { timestamp, display } = parseDateToTimestamp(veh.createdAt, vIndex * 3 + 2);
      const ownerFirstName = (veh.owner.name || '').trim().split(' ')[0] || 'User';
      const vehTitle = `${veh.year} ${veh.make} ${veh.model}`.trim();
      list.push({
        id: `act-veh-${veh.id}`,
        type: 'build_update',
        dateStr: veh.createdAt || display,
        timestamp,
        vehicleId: veh.id,
        vehicleName: vehTitle,
        owner: veh.owner,
        title: vehTitle,
        description: `${ownerFirstName} just added a ${vehTitle} to their garage.`,
        badge: '',
        photoUrl: veh.primaryImage,
        images: veh.galleryImages,
        likesCount: veh.likesCount,
        postCategory: 'Build Updates',
      });

      if (veh.buildUpdates && veh.buildUpdates.length > 0) {
        veh.buildUpdates.forEach((upd, uIndex) => {
          const { timestamp: updTs, display: updDisp } = parseDateToTimestamp(upd.date, uIndex * 2 + 1);
          list.push({
            id: `act-upd-${upd.id}`,
            type: 'build_update',
            dateStr: upd.date || updDisp,
            timestamp: updTs,
            vehicleId: veh.id,
            vehicleName: `${veh.year} ${veh.make} ${veh.model}`,
            owner: veh.owner,
            title: upd.title,
            description: upd.content,
            badge: 'Build Update',
            photoUrl: (upd.images && upd.images.length > 0) ? upd.images[0] : veh.primaryImage,
            images: upd.images,
            likesCount: upd.likesCount || 0,
            postCategory: 'Build Updates',
          });
        });
      }
    });

    // Sort strictly chronological descending and cap at 100 of the most current cards in total
    return list.sort((a, b) => b.timestamp - a.timestamp).slice(0, 100);
  }, [vehicles, events, posts, polls]);

  // Dynamic Locations list for Live Feed
  const availableLocations = useMemo(() => {
    const set = new Set<string>();
    activities.forEach(a => {
      if (a.owner?.location) set.add(a.owner.location);
    });
    return ['All Locations', ...Array.from(set).sort()];
  }, [activities]);

  // Categories list for Live Feed
  const availableCategories = useMemo(() => {
    return [
      'All Categories',
      'Sponsored Drops',
      'Community Posts',
      'Community Polls',
      'Build Updates',
      'Event News'
    ];
  }, []);

  const clearFilters = () => {
    setSelectedCategory('All Categories');
    setSelectedLocation('All Locations');
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const hasActiveFilters = selectedCategory !== 'All Categories' || selectedLocation !== 'All Locations' || searchQuery !== '';

  // Filter & Search (Category, Location, and Search query based)
  const filteredActivities = useMemo(() => {
    let result = activities.filter(act => {
      // 1. Category Filter
      if (selectedCategory !== 'All Categories') {
        if (selectedCategory === 'Sponsored Drops' && !act.isAdvertisement && act.postCategory !== 'Sponsored Drop') return false;
        if (selectedCategory === 'Community Posts' && (act.type !== 'post' || act.isAdvertisement)) return false;
        if (selectedCategory === 'Community Polls' && act.type !== 'poll') return false;
        if (selectedCategory === 'Build Updates' && act.type !== 'build_update' && act.type !== 'modification') return false;
        if (selectedCategory === 'Event News' && act.type !== 'event') return false;
      }

      // 2. Location Filter
      if (selectedLocation !== 'All Locations') {
        const loc = act.owner?.location?.toLowerCase() || '';
        if (!loc.includes(selectedLocation.toLowerCase())) return false;
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = 
          act.title.toLowerCase().includes(q) ||
          act.description.toLowerCase().includes(q) ||
          (act.vehicleName && act.vehicleName.toLowerCase().includes(q)) ||
          act.owner.name.toLowerCase().includes(q) ||
          act.owner.handle.toLowerCase().includes(q) ||
          (act.badge && act.badge.toLowerCase().includes(q)) ||
          (act.shopifyProduct && act.shopifyProduct.title.toLowerCase().includes(q)) ||
          (act.pollData && act.pollData.options.some(opt => opt.text.toLowerCase().includes(q)));
        if (!matches) return false;
      }

      return true;
    });

    if (limit && limit > 0) {
      result = result.slice(0, limit);
    }

    return result;
  }, [activities, selectedCategory, selectedLocation, searchQuery, limit]);

  // Spotlight vehicle for desktop sidebar (Controlled by Admin spotlightConfig)
  const spotlightVehicle = useMemo(() => {
    if (spotlightConfig && spotlightConfig.active === false) return null;
    if (spotlightConfig?.vehicleId) {
      const match = vehicles.find(v => v.id === spotlightConfig.vehicleId);
      if (match) return match;
    }
    return vehicles.find(v => v.featured) || vehicles[0];
  }, [vehicles, spotlightConfig]);

  // Upcoming events for desktop sidebar
  const upcomingEvents = useMemo(() => {
    return (events || []).slice(0, 3);
  }, [events]);

  return (
    <div className={compact ? "space-y-4" : "grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start"}>
      {/* Primary Column: Search & Live Activity Feed (8 cols on desktop) */}
      <div className={compact ? "space-y-4" : "lg:col-span-8 space-y-4 min-w-0"}>
        {/* Unified Categories & Location Filter Toolbar (Mirrored from Builds page) */}
        {!compact && (
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
                    aria-label="Filter feed by category"
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
                    aria-label="Filter feed by location"
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
                  placeholder="Search feed by vehicle, owner, tags, or keyword..."
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
        )}

        {/* Activity Timeline List (Up to 100 current cards with View More) */}
        <div className="space-y-4">
        {filteredActivities.length > 0 ? (
          (() => {
            const displayedActivities = filteredActivities.slice(0, visibleCount);
            return displayedActivities.map((act) => {
              const isEvent = act.type === 'event';
              const isPost = act.type === 'post';
              const isRegistration = act.id.startsWith('act-veh-');
              const vehicleId = act.vehicleId || act.id;
              const itemKey = act.postId || act.id;
            const itemComments = comments.filter(c => 
              c.postId === itemKey || 
              (act.postId && c.postId === act.postId) || 
              c.postId === act.id ||
              (act.id.startsWith('act-upd-') && c.postId === act.id.replace('act-upd-', '')) ||
              (act.id.startsWith('act-post-') && c.postId === act.id.replace('act-post-', ''))
            );
            const commentsCount = itemComments.length > 0 
              ? itemComments.length 
              : (act.type === 'post' ? (posts.find(p => p.id === act.postId)?.commentsCount || 0) : 0);
            const isCommentsExpanded = expandedCommentItemIds.has(itemKey);

            if (act.type === 'poll' && act.pollData) {
              return (
                <div key={act.id} className="animate-fade-in">
                  <CommunityPollCard
                    poll={act.pollData}
                    currentUser={currentUser}
                    onVote={onVotePoll || (() => {})}
                    onToggleStatus={onTogglePollStatus}
                    onDeletePoll={onDeletePoll}
                  />
                </div>
              );
            }

            const isAdvertisement = Boolean(act.isAdvertisement || act.shopifyProduct);

            if (isAdvertisement) {
              const productImg = (act.images && act.images.length > 0) ? act.images[0] : act.photoUrl;
              const displayTitle = act.shopifyProduct?.title || act.title || 'Featured Drop';
              const displayDesc = act.description || (posts.find(p => p.id === act.postId)?.content) || '';
              const productUrl = act.shopifyProduct?.productUrl || 'https://gascanco.com';
              const ctaText = act.shopifyProduct?.ctaText || 'Shop on Shopify';
              const price = act.shopifyProduct?.price;
              const originalPrice = act.shopifyProduct?.originalPrice;

              return (
                <article
                  key={act.id}
                  className="group relative bg-[#1c1c1f] border border-[#333333] hover:border-[#C8102E] transition-all duration-200 shadow-sm overflow-hidden"
                >
                  {/* Clean Single Container Layout: Text -> Image -> Pricing/Button */}
                  <div className="flex flex-col">
                    {/* 1. Header Text: Title with Sponsored on the far right, and Body Text */}
                    <div className="p-4 sm:p-6 pb-3 sm:pb-4 space-y-2">
                      <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center justify-between gap-2.5">
                        <h3 className="font-['Oswald'] text-xl sm:text-2xl font-bold uppercase text-white tracking-wide leading-snug flex-1 min-w-0 pr-1">
                          {displayTitle}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          {isHardAdmin(currentUser) && (
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEdit(act);
                                }}
                                className="px-2 py-0.5 bg-black/85 hover:bg-[#C8102E] text-white text-[10px] font-mono border border-white/20 transition-all duration-150 active:scale-[0.98] cursor-pointer"
                                title="Edit advertisement"
                              >
                                <Pencil className="w-2.5 h-2.5 inline mr-1" /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const targetPostId = act.postId || act.id.replace('act-post-', '');
                                  if (window.confirm('Super Admin: Delete this advertisement from the feed?')) {
                                    onDeletePost?.(targetPostId);
                                  }
                                }}
                                className="px-2 py-0.5 bg-black/85 hover:bg-[#C8102E] text-white text-[10px] font-mono border border-white/20 transition-all duration-150 active:scale-[0.98] cursor-pointer"
                                title="Delete advertisement"
                              >
                                <Trash2 className="w-2.5 h-2.5 inline mr-1 text-[#ff4d4d]" /> Delete
                              </button>
                            </div>
                          )}
                          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#ff4d6a] font-bold whitespace-nowrap px-1.5 py-0.5 bg-[#C8102E]/10 border border-[#C8102E]/25">
                            Sponsored
                          </span>
                        </div>
                      </div>
                      {displayDesc && (
                        <p className="text-xs sm:text-sm text-[#cccccc] leading-relaxed whitespace-pre-line">
                          {displayDesc}
                        </p>
                      )}
                    </div>

                    {/* 2. Middle Image (In between body text & pricing/button) */}
                    {productImg && (
                      <div
                        className="w-full relative aspect-video sm:aspect-[21/9] bg-black border-y border-[#2d2d30] overflow-hidden cursor-pointer group/img"
                        onClick={() => setActiveLightboxImage(productImg)}
                        title="Click to view full image"
                      >
                        <img
                          src={productImg}
                          alt={displayTitle}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                          <Maximize2 className="w-5 h-5 text-white drop-shadow-md" />
                        </div>
                      </div>
                    )}

                    {/* 3. Bottom Row: Pricing / Original Pricing / Button */}
                    <div className="p-4 sm:px-6 sm:py-4 flex flex-wrap items-center justify-between gap-3 bg-[#18181b]">
                      {price && (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base sm:text-lg font-bold text-white">
                            {price}
                          </span>
                          {originalPrice && (
                            <span className="font-mono text-xs text-[#777777] line-through">
                              {originalPrice}
                            </span>
                          )}
                        </div>
                      )}

                      <a
                        href={productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#C8102E] hover:bg-[#e01334] text-white text-xs sm:text-sm font-['Oswald'] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm ml-auto"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>{ctaText}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </article>
              );
            }

            return (
              <article
                key={act.id}
                onClick={() => act.vehicleId ? onSelectVehicle(act.vehicleId) : (act.type === 'event' && act.eventData ? (onSelectEvent ? onSelectEvent(act.eventData.id) : onExploreEvents?.()) : undefined)}
                className="group relative bg-[#242424] border border-[#383838] hover:border-[#C8102E] transition-all duration-200 shadow-sm overflow-hidden"
              >
                {/* 1. Clean Top Header: Author + Clean Date on left, Vehicle / Tag on right */}
                <div className="px-3.5 py-2.5 sm:px-4 sm:py-3.5 flex items-center justify-between gap-2.5 border-b border-[#2d2d2d] bg-[#202020]">
                  {/* Left: Author Avatar & Name & Date */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectOwner?.(act.owner.id);
                    }}
                    className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 cursor-pointer group/author"
                    title={`View ${act.owner.name}'s garage`}
                  >
                    <img
                      src={act.owner.avatar}
                      alt={act.owner.name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 sm:w-14 sm:h-14 shrink-0 object-cover border-2 border-[#C8102E] shadow-sm group-hover/author:border-white transition-colors"
                    />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="font-['Oswald'] text-base sm:text-lg font-bold text-white uppercase tracking-wider group-hover/author:text-[#C8102E] transition-colors truncate">
                          {act.owner.name}
                        </span>
                        {isHardAdmin(act.owner) && (
                          <span className="px-1.5 py-0.2 bg-[#C8102E] text-white font-['Oswald'] font-black text-[9px] tracking-wider uppercase inline-flex items-center gap-0.5 shadow-xs shrink-0">
                            <ShieldCheck className="w-2.5 h-2.5" /> ADMIN
                          </span>
                        )}
                        {act.isAdvertisement && (
                          <span className="px-1.5 py-0.5 bg-[#171719] border border-[#ff4d6a]/40 text-[#ff4d6a] font-['Oswald'] font-bold text-[9px] sm:text-[10px] tracking-wider uppercase inline-flex items-center gap-1 shrink-0">
                            <Tag className="w-2.5 h-2.5" /> SPONSORED
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono text-[#888888] whitespace-nowrap overflow-hidden text-ellipsis">
                        {act.owner.location && <span>{act.owner.location}</span>}
                        {act.owner.location && <span className="text-[#555555]">•</span>}
                        <span>{formatTimeAgo(act.timestamp || act.dateStr)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Edit / Delete button for author or Super Admin (Gascanco@gmail.com) */}
                  {isRegistration ? null : isPost ? (
                    (act.owner.id === currentUserId || isHardAdmin(currentUser)) ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(act);
                          }}
                          className="flex items-center gap-1 p-1.5 sm:px-2 sm:py-1 bg-[#282828] hover:bg-[#C8102E] text-[#dddddd] hover:text-white border border-[#444444] hover:border-[#C8102E] text-xs font-mono uppercase tracking-wider transition-all duration-150 active:scale-[0.98] cursor-pointer shadow-xs group/edit"
                          title={isHardAdmin(currentUser) && act.owner.id !== currentUserId ? "Admin: Edit post" : "Edit your post"}
                        >
                          <Pencil className="w-3 h-3 text-[#C8102E] group-hover/edit:text-white transition-colors" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        {isHardAdmin(currentUser) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const targetPostId = act.postId || act.id.replace('act-post-', '');
                              if (window.confirm('Super Admin: Delete this post from the feed?')) {
                                onDeletePost?.(targetPostId);
                              }
                            }}
                            className="flex items-center gap-1 p-1.5 sm:px-2 sm:py-1 bg-[#282828] hover:bg-[#C8102E] text-[#aaaaaa] hover:text-white border border-[#444444] hover:border-[#C8102E] text-xs font-mono uppercase transition-all duration-150 active:scale-[0.98] cursor-pointer"
                            title="Super Admin: Delete post"
                          >
                            <Trash2 className="w-3 h-3 text-[#ff4d4d] hover:text-white" />
                            <span className="hidden sm:inline text-[10px]">Delete</span>
                          </button>
                        )}
                      </div>
                    ) : null
                  ) : act.vehicleId && act.vehicleName ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectVehicle(act.vehicleId!);
                      }}
                      className="text-xs font-mono text-[#aaaaaa] hover:text-[#C8102E] transition-colors truncate max-w-[200px] cursor-pointer"
                    >
                      {act.vehicleName}
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono uppercase text-[#777777] tracking-wider">
                      {isEvent ? 'Event' : act.badge}
                    </span>
                  )}
                </div>

                {/* 2. Main Content Body */}
                {isPost ? (
                  /* Specific Post Layout: Content First, Link Previews, Multi-Photo Gallery - All Media Extends Full Width of Card */
                  <div className="flex flex-col">
                    {(act.title || act.description) && (
                      <div className="p-4 sm:p-5 pb-3 sm:pb-3.5 space-y-2">
                        {act.title && (
                          <h3 className="font-['Oswald'] text-lg sm:text-xl font-bold uppercase text-white group-hover:text-[#C8102E] transition-colors leading-snug">
                            {act.title}
                          </h3>
                        )}

                        {act.description && (
                          <p className="text-sm text-[#e0e0e0] leading-relaxed whitespace-pre-line">
                            {act.description}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Recognized Link Preview: YouTube Video or Website - Extends FULL WIDTH */}
                    {act.linkPreview && (
                      <div 
                        className="w-full bg-[#1c1c1c] border-t border-[#333333] hover:border-[#C8102E] transition-all overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {act.linkPreview.type === 'youtube' ? (
                          <div>
                            {playingYoutubeId === act.id && act.linkPreview.youtubeId ? (
                              <div className="relative aspect-video w-full bg-black">
                                <iframe
                                  src={`https://www.youtube-nocookie.com/embed/${act.linkPreview.youtubeId}?autoplay=1`}
                                  title={act.linkPreview.title || 'YouTube video'}
                                  className="w-full h-full border-0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                                <button
                                  type="button"
                                  onClick={() => setPlayingYoutubeId(null)}
                                  className="absolute top-2 right-2 px-2.5 py-1 bg-black/85 hover:bg-[#C8102E] text-white text-[10px] font-mono border border-white/20 transition-colors cursor-pointer"
                                >
                                  Close Player
                                </button>
                              </div>
                            ) : (
                              <div
                                onClick={() => setPlayingYoutubeId(act.id)}
                                className="relative group/yt aspect-video w-full bg-black overflow-hidden cursor-pointer"
                              >
                                {act.linkPreview.image && (
                                  <img
                                    src={act.linkPreview.image}
                                    alt={act.linkPreview.title || 'YouTube Video'}
                                    className="w-full h-full object-cover group-hover/yt:scale-105 transition-transform duration-300"
                                  />
                                )}
                                <div className="absolute inset-0 bg-black/40 group-hover/yt:bg-black/20 transition-colors flex items-center justify-center">
                                  <div className="w-14 h-14 rounded-full bg-[#C8102E] group-hover/yt:bg-[#e01334] text-white flex items-center justify-center shadow-2xl group-hover/yt:scale-110 transition-transform">
                                    <Play className="w-6 h-6 fill-white ml-1" />
                                  </div>
                                </div>
                                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/80 border border-white/10 text-white text-xs font-mono">
                                  <Youtube className="w-4 h-4 text-[#FF0000]" />
                                  <span>YouTube</span>
                                </div>
                              </div>
                            )}
                            <div className="p-3 sm:px-4 flex items-center justify-between gap-3 bg-[#1e1e1e] border-t border-[#333333]">
                              <div className="min-w-0">
                                <div className="text-xs sm:text-sm font-['Oswald'] font-bold text-white uppercase tracking-wider line-clamp-1">
                                  {act.linkPreview.title || 'YouTube Video'}
                                </div>
                                <div className="text-[11px] font-mono text-[#888888] truncate">
                                  {act.linkPreview.domain || 'youtube.com'}
                                </div>
                              </div>
                              <a
                                href={act.linkPreview.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 bg-[#292929] hover:bg-[#383838] text-white text-[10px] font-mono flex items-center gap-1 border border-[#444444] transition-colors shrink-0 cursor-pointer"
                              >
                                <span>Watch on YouTube</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        ) : (
                          <a
                            href={act.linkPreview.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full group/link hover:bg-[#252525] transition-colors cursor-pointer"
                          >
                            {/* Website Link Thumbnail - Extends FULL WIDTH */}
                            {act.linkPreview.image && (
                              <div className="w-full aspect-video sm:aspect-[21/9] bg-black overflow-hidden relative border-b border-[#333333]">
                                <img
                                  src={act.linkPreview.image}
                                  alt={act.linkPreview.title || 'Website Preview'}
                                  className="w-full h-full object-cover group-hover/link:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}
                            <div className="p-3 sm:px-4 space-y-1.5 bg-[#1e1e1e]">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#888888]">
                                  <Globe className="w-3.5 h-3.5 text-[#3b82f6]" />
                                  <span className="truncate">{act.linkPreview.domain || act.linkPreview.url}</span>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-[#777777] group-hover/link:text-white shrink-0" />
                              </div>
                              <div className="text-xs sm:text-sm font-['Oswald'] font-bold text-white uppercase tracking-wider line-clamp-1 group-hover/link:text-[#C8102E] transition-colors">
                                {act.linkPreview.title || act.linkPreview.domain}
                              </div>
                              {act.linkPreview.description && (
                                <p className="text-[11px] sm:text-xs text-[#aaaaaa] line-clamp-2 leading-relaxed">
                                  {act.linkPreview.description}
                                </p>
                              )}
                            </div>
                          </a>
                        )}
                      </div>
                    )}

                    {/* Multi-Photo Upload Gallery - Extends FULL WIDTH */}
                    {act.images && act.images.length > 1 && (
                      <div 
                        className={`w-full border-t border-[#333333] grid gap-0.5 sm:gap-1 bg-[#181818] overflow-hidden ${
                          act.images.length === 2 
                            ? 'grid-cols-2 aspect-[16/9]' 
                            : act.images.length === 3 
                            ? 'grid-cols-3 aspect-[16/9]' 
                            : 'grid-cols-2 sm:grid-cols-4 aspect-[16/9]'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {act.images.map((img, i) => (
                          <div
                            key={i}
                            onClick={() => setActiveLightboxImage(img)}
                            className="group/img relative w-full h-full bg-black overflow-hidden cursor-pointer"
                          >
                            <img
                              src={img}
                              alt={`Post attachment ${i + 1}`}
                              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                              <Maximize2 className="w-4 h-4 text-white drop-shadow-md" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Single Photo fallback if no multi-gallery and not already covered by link preview - Extends FULL WIDTH (Uncropped) */}
                    {act.images && act.images.length === 1 && !act.linkPreview && (
                      <div 
                        className="w-full relative max-h-[560px] bg-[#141416] border-t border-[#333333] flex items-center justify-center overflow-hidden cursor-pointer group/photo"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveLightboxImage(act.images![0]);
                        }}
                      >
                        <img
                          src={act.images[0]}
                          alt="Post photo"
                          className="w-full h-auto max-h-[560px] object-contain group-hover/photo:scale-[1.02] transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/photo:opacity-100 pointer-events-none">
                          <Maximize2 className="w-5 h-5 text-white drop-shadow-md" />
                        </div>
                      </div>
                    )}

                    {/* Single Photo fallback from photoUrl if images array was empty - Extends FULL WIDTH (Uncropped) */}
                    {(!act.images || act.images.length === 0) && act.photoUrl && !act.linkPreview && (
                      <div 
                        className="w-full relative max-h-[560px] bg-[#141416] border-t border-[#333333] flex items-center justify-center overflow-hidden cursor-pointer group/photo"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveLightboxImage(act.photoUrl!);
                        }}
                      >
                        <img
                          src={act.photoUrl}
                          alt="Post photo"
                          className="w-full h-auto max-h-[560px] object-contain group-hover/photo:scale-[1.02] transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/photo:opacity-100 pointer-events-none">
                          <Maximize2 className="w-5 h-5 text-white drop-shadow-md" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : isEvent ? (
                  /* Dedicated Event Layout: Details First, Preview Image Extends FULL WIDTH of Card (Clickable & Uncropped) */
                  <div className="flex flex-col">
                    <div className="p-4 sm:p-5 pb-3 sm:pb-3.5 space-y-2">
                      <h3 className="font-['Oswald'] text-lg sm:text-xl font-bold uppercase text-white group-hover:text-[#C8102E] transition-colors leading-snug">
                        {act.title}
                      </h3>

                      {act.eventData && (
                        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#bbbbbb]">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#C8102E] shrink-0" />
                            <span>{act.eventData.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[#aaaaaa]">
                            <Calendar className="w-3.5 h-3.5 text-[#C8102E] shrink-0" />
                            <span>{act.eventData.date} • {act.eventData.time}</span>
                          </div>
                        </div>
                      )}

                      {act.description && (
                        <p className="text-xs sm:text-sm text-[#aaaaaa] leading-relaxed line-clamp-3">
                          {act.description}
                        </p>
                      )}
                    </div>

                    {/* Event Preview Image - Full Width of Card & Clickable for Full Resolution (Uncropped) */}
                    {act.photoUrl && (
                      <div 
                        className="w-full relative max-h-[560px] overflow-hidden bg-[#141416] border-t border-[#333333] flex items-center justify-center cursor-pointer group/photo"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveLightboxImage(act.photoUrl!);
                        }}
                        title="Click to view full resolution"
                      >
                        <img
                          src={act.photoUrl}
                          alt={act.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-auto max-h-[560px] object-contain group-hover/photo:scale-[1.02] transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/photo:opacity-100 pointer-events-none">
                          <Maximize2 className="w-5 h-5 text-white drop-shadow-md" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : isRegistration ? (
                  /* Clean Automatic Registration Card - No specs, no duplicate category/titles, full uncropped photo */
                  <div className="flex flex-col">
                    <div className="p-4 sm:p-5 pb-3 sm:pb-3.5">
                      <p className="text-base sm:text-lg md:text-xl font-['Oswald'] font-bold text-white uppercase tracking-wide leading-snug">
                        <span className="text-[#C8102E]">{(act.owner.name || '').trim().split(' ')[0]}</span> just added a <span className="text-white">{act.vehicleName || act.title}</span> to their garage.
                      </p>
                    </div>

                    {act.photoUrl && (
                      <div
                        className="w-full relative max-h-[560px] bg-[#141416] border-t border-[#333336] flex items-center justify-center overflow-hidden cursor-pointer group/photo"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (act.vehicleId) {
                            onSelectVehicle(act.vehicleId);
                          } else {
                            setActiveLightboxImage(act.photoUrl!);
                          }
                        }}
                        title={`View ${act.vehicleName || 'vehicle'}`}
                      >
                        <img
                          src={act.photoUrl}
                          alt={act.vehicleName || act.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-auto max-h-[560px] object-contain group-hover/photo:scale-[1.02] transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/photo:opacity-100 pointer-events-none">
                          <Maximize2 className="w-5 h-5 text-white drop-shadow-md" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard Build Log / Mod Layout */
                  <div className="p-4 sm:p-5">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Text Details */}
                      <div className={`${act.photoUrl ? 'md:col-span-7' : 'md:col-span-12'} space-y-2`}>
                        <h3 className="font-['Oswald'] text-lg sm:text-xl font-bold uppercase text-white group-hover:text-[#C8102E] transition-colors leading-snug">
                          {act.title}
                        </h3>

                        {/* Description - clean 2 lines max */}
                        {act.description && (
                          <p className="text-xs sm:text-sm text-[#aaaaaa] leading-relaxed line-clamp-2">
                            {act.description}
                          </p>
                        )}
                      </div>

                      {/* Image - Clickable for Full Res (Uncropped) */}
                      {act.photoUrl && (
                        <div 
                          className="md:col-span-5 relative max-h-[320px] overflow-hidden bg-[#141416] border border-[#383838] cursor-pointer group/photo flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLightboxImage(act.photoUrl!);
                          }}
                          title="Click to view full resolution"
                        >
                          <img
                            src={act.photoUrl}
                            alt={act.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-auto max-h-[320px] object-contain group-hover/photo:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Clean Footer: Tagged Vehicle / Category on left, Reactions / RSVP on right */}
                <div className="px-4 py-2.5 bg-[#1e1e1e] border-t border-[#2d2d2d] flex items-center justify-between gap-3">
                  {/* Left: Tagged Car / Vehicle (replaces POST) */}
                  <div className="flex items-center min-w-0">
                    {isRegistration ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (act.vehicleId) onSelectVehicle(act.vehicleId);
                        }}
                        className="flex items-center gap-1.5 text-xs font-mono text-[#bbbbbb] hover:text-[#C8102E] transition-colors truncate cursor-pointer group/veh"
                        title={`View ${act.vehicleName} in garage`}
                      >
                        <Car className="w-3.5 h-3.5 text-[#C8102E] shrink-0" />
                        <span className="font-['Oswald'] font-bold uppercase tracking-wider text-[#C8102E] group-hover/veh:underline">
                          View In Garage
                        </span>
                      </button>
                    ) : isPost ? (
                      act.vehicleName ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (act.vehicleId) onSelectVehicle(act.vehicleId);
                          }}
                          className="flex items-center gap-1.5 text-xs font-mono text-[#bbbbbb] hover:text-[#C8102E] transition-colors truncate max-w-[280px] cursor-pointer group/veh"
                          title={`Tagged Vehicle: ${act.vehicleName}`}
                        >
                          <Car className="w-3.5 h-3.5 text-[#C8102E] shrink-0" />
                          <span className="font-['Oswald'] font-bold uppercase tracking-wider text-white group-hover/veh:text-[#C8102E] truncate">
                            {act.vehicleName}
                          </span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-['Oswald'] uppercase tracking-wider text-[#777777] font-semibold">
                          General Post
                        </span>
                      )
                    ) : (
                      <span className="text-[11px] font-['Oswald'] uppercase tracking-wider text-[#777777] font-semibold">
                        {isEvent ? (act.eventData?.eventType || 'Meet') : (act.badge || 'Update')}
                      </span>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 sm:gap-3" onClick={(e) => e.stopPropagation()}>
                    {/* Threaded Discussion Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleComments(itemKey)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono border transition-colors cursor-pointer ${
                        isCommentsExpanded
                          ? 'border-[#C8102E] text-white bg-[#C8102E]/20 font-bold'
                          : 'border-[#383838] text-[#aaaaaa] hover:text-white hover:border-[#555555]'
                      }`}
                      title={isCommentsExpanded ? 'Collapse discussion' : 'Join discussion'}
                      aria-label="Discussion and comments"
                    >
                      <MessageSquare className={`w-3.5 h-3.5 ${isCommentsExpanded ? 'text-[#C8102E]' : 'text-[#888888]'}`} />
                      <span>{commentsCount}</span>
                    </button>

                    {/* RSVP if event */}
                    {isEvent && act.eventData && (
                      <button
                        type="button"
                        onClick={() => onRsvpEvent?.(act.eventData!.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-['Oswald'] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                          act.eventData.isAttending
                            ? 'bg-[#C8102E] text-white shadow-xs'
                            : 'border border-[#444444] text-[#cccccc] hover:border-white hover:text-white'
                        }`}
                      >
                        {act.eventData.isAttending ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Going</span>
                          </>
                        ) : (
                          <>
                            <Calendar className="w-3 h-3" />
                            <span>RSVP</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Reactions */}
                    {!isEvent && (
                      <ReactionButtons
                        vehicleId={vehicleId}
                        likesCount={act.likesCount}
                        isLiked={likedVehicleIds.has(vehicleId)}
                        isDisliked={dislikedVehicleIds.has(vehicleId)}
                        onLikeToggle={onLikeToggle}
                        onDislikeToggle={onDislikeToggle}
                      />
                    )}
                  </div>
                </div>

                {/* Threaded Comment Section */}
                {isCommentsExpanded && currentUser && (
                  <div onClick={(e) => e.stopPropagation()} className="animate-fade-in">
                    <ThreadedComments
                      postId={itemKey}
                      postTitle={act.title || act.description}
                      postType={act.type}
                      comments={itemComments}
                      currentUser={currentUser}
                      onAddComment={onAddComment || (() => {})}
                      onUpdateComment={onUpdateComment || (() => {})}
                      onDeleteComment={onDeleteComment || (() => {})}
                      onOpenLightbox={(photoUrl) => setActiveLightboxImage(photoUrl)}
                    />
                  </div>
                )}
              </article>
            );
          });
        })()
        ) : (
          <div className="border border-[#3d3d3d] bg-[#242424] p-10 text-center max-w-md mx-auto my-8">
            <Clock className="w-8 h-8 text-[#888888] mx-auto mb-2" />
            <h4 className="font-['Oswald'] text-xl font-bold uppercase text-white">
              No entries found
            </h4>
            <p className="text-xs text-[#aaaaaa] mt-1">
              Try switching your filter or clearing your search query.
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 px-3 py-1.5 text-xs font-['Oswald'] font-bold uppercase tracking-wider bg-[#333333] hover:bg-[#444444] text-white transition-all duration-150 active:scale-[0.98] cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* View More Button - Displays up to 100 current cards */}
        {filteredActivities.length > 0 && visibleCount < Math.min(100, filteredActivities.length) && (
          <div className="pt-4 pb-2 flex flex-col items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setVisibleCount(prev => Math.min(100, prev + 10))}
              className="px-6 py-2.5 bg-[#222225] hover:bg-[#C8102E] text-white border border-[#3e3e42] hover:border-[#C8102E] font-['Oswald'] text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.98] cursor-pointer shadow-sm flex items-center gap-2"
            >
              <span>View More Cards</span>
              <span className="text-[11px] font-mono text-[#aaaaaa]">
                ({Math.min(visibleCount, filteredActivities.length)} of {Math.min(100, filteredActivities.length)})
              </span>
            </button>
          </div>
        )}
      </div>
      </div>

      {/* Secondary Column: Desktop Dual Column Sidebar (4 cols on desktop, hidden on mobile) */}
      {!compact && (
        <aside className="hidden lg:block lg:col-span-4 space-y-5 sticky top-6">
          {/* 1. Logged-in User Garage Profile Summary */}
          {currentUser && (
            <div className="bg-[#242424] border border-[#3d3d3d] p-5 shadow-sm">
              <div className="flex items-center gap-3.5 mb-3.5">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 object-cover border-2 border-[#C8102E] shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase text-[#C8102E] font-bold tracking-wider block">
                    {isHardAdmin(currentUser) ? 'VERIFIED SUPER ADMIN' : 'GASCANCO BUILDER'}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-['Oswald'] text-lg font-bold uppercase text-white truncate">
                      {currentUser.name}
                    </h3>
                    {isHardAdmin(currentUser) && (
                      <span className="px-1.5 py-0.2 bg-[#C8102E] text-white font-['Oswald'] font-black text-[9px] tracking-wider uppercase inline-flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" /> ADMIN
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#888888] truncate">
                    <MapPin className="w-3 h-3 text-[#C8102E] shrink-0" />
                    <span className="truncate">{currentUser.location}</span>
                  </div>
                  {isHardAdmin(currentUser) && (
                    <p className="text-[10px] text-[#ff4d4d] font-mono font-bold mt-0.5 truncate">
                      Linked: Gascanco@gmail.com
                    </p>
                  )}
                </div>
              </div>

              {currentUser.bio && (
                <p className="text-xs text-[#aaaaaa] font-mono leading-relaxed mb-4 line-clamp-2">
                  {currentUser.bio}
                </p>
              )}

              <div className="pt-3 border-t border-[#333333] flex items-center justify-between text-xs font-mono">
                <span className="text-[#888888]">GARAGE BUILDS</span>
                <span className="text-white font-bold">{userVehicles.length} Registered</span>
              </div>
            </div>
          )}

          {/* 2. Featured Community Spotlight Build (Admin Controlled) */}
          {spotlightVehicle && (
            <div className="bg-[#242424] border border-[#3d3d3d] overflow-hidden shadow-sm">
              <div className="px-4 py-2.5 bg-[#202020] border-b border-[#333333] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Star className="w-3.5 h-3.5 text-[#C8102E] shrink-0 fill-[#C8102E]" />
                  <span className="text-xs font-mono uppercase tracking-wider text-white font-bold truncate">
                    {spotlightConfig?.badge || 'COMMUNITY SPOTLIGHT'}
                  </span>
                </div>
                {isHardAdmin(currentUser) && onOpenSpotlightModal && (
                  <button
                    type="button"
                    onClick={onOpenSpotlightModal}
                    className="flex items-center gap-1 px-2 py-0.5 bg-[#2a2a2d] hover:bg-[#C8102E] text-[#dddddd] hover:text-white border border-[#444446] hover:border-[#C8102E] text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer group/spot shrink-0"
                    title="Admin: Full control over Community Spotlight"
                  >
                    <Star className="w-2.5 h-2.5 text-[#C8102E] group-hover/spot:text-white" />
                    <span>Manage</span>
                  </button>
                )}
              </div>

              <div 
                onClick={() => onSelectVehicle(spotlightVehicle.id)}
                className="relative aspect-video bg-black cursor-pointer group overflow-hidden"
              >
                <img
                  src={spotlightVehicle.primaryImage}
                  alt={`${spotlightVehicle.year} ${spotlightVehicle.make}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  {spotlightConfig?.headline && (
                    <span className="text-[10px] font-mono text-[#ff4d6a] uppercase tracking-wider font-bold block truncate">
                      {spotlightConfig.headline}
                    </span>
                  )}
                  <h4 className="font-['Oswald'] text-base font-bold uppercase tracking-wide group-hover:text-[#C8102E] transition-colors truncate">
                    {spotlightVehicle.year} {spotlightVehicle.make} {spotlightVehicle.model}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-[#cccccc]">
                    <span>{spotlightVehicle.engine}</span>
                    <span>·</span>
                    <span className="text-[#C8102E]">{spotlightVehicle.buildStatus}</span>
                  </div>
                </div>
              </div>

              {/* Admin Editorial Commentary Note */}
              {spotlightConfig?.reason && (
                <div className="px-3.5 py-2.5 bg-[#171719] border-t border-[#303032]">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-[#C8102E] uppercase font-bold mb-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span>Curator's Note</span>
                  </div>
                  <p className="text-[11px] font-mono text-[#aaaaaa] italic leading-relaxed">
                    "{spotlightConfig.reason}"
                  </p>
                </div>
              )}

              <div className="p-3 bg-[#1e1e1e] border-t border-[#2e2e30] flex items-center justify-between text-xs font-mono">
                <span className="text-[#888888] truncate">By {spotlightVehicle.owner.name}</span>
                <button
                  type="button"
                  onClick={() => onSelectVehicle(spotlightVehicle.id)}
                  className="text-white hover:text-[#C8102E] font-['Oswald'] uppercase font-bold text-xs tracking-wider cursor-pointer"
                >
                  View Build →
                </button>
              </div>
            </div>
          )}

          {/* 3. Community Poll Sidebar Widget */}
          {polls && polls.length > 0 && (
            <div className="bg-[#242424] border border-[#3d3d3d] overflow-hidden shadow-sm">
              <div className="px-4 py-2.5 bg-[#202020] border-b border-[#333333] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5 text-[#C8102E]" />
                  <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                    COMMUNITY POLL
                  </span>
                </div>
                {isHardAdmin(currentUser) && onOpenAddPoll && (
                  <button
                    type="button"
                    onClick={onOpenAddPoll}
                    className="text-[10px] font-mono uppercase text-[#C8102E] hover:text-white transition-colors cursor-pointer flex items-center gap-0.5 font-bold"
                    title="Admin: Create a new poll"
                  >
                    <Plus className="w-2.5 h-2.5" /> New Poll
                  </button>
                )}
              </div>
              <CommunityPollCard
                poll={polls[0]}
                currentUser={currentUser}
                onVote={onVotePoll || (() => {})}
                onToggleStatus={onTogglePollStatus}
                onDeletePoll={onDeletePoll}
                isSidebarWidget={true}
              />
            </div>
          )}

          {/* 3. Upcoming Community Events / Meets */}
          {upcomingEvents.length > 0 && (
            <div className="bg-[#242424] border border-[#3d3d3d] p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#333333]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#C8102E]" />
                  <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                    UPCOMING MEETS
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#888888]">{upcomingEvents.length} Active</span>
              </div>

              <div className="space-y-3">
                {upcomingEvents.map(evt => (
                  <div 
                    key={evt.id} 
                    onClick={() => onSelectEvent ? onSelectEvent(evt.id) : onExploreEvents?.()}
                    className="p-2.5 bg-[#1c1c1c] border border-[#383838] hover:border-[#C8102E] transition-all duration-150 space-y-1.5 cursor-pointer group/meet"
                    title={`View details for ${evt.title}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase font-bold text-[#C8102E] bg-[#C8102E]/10 px-1.5 py-0.5">
                        {evt.eventType}
                      </span>
                      <span className="text-[10px] font-mono text-[#888888]">{evt.attendeesCount} RSVP</span>
                    </div>
                    <h5 className="font-['Oswald'] text-sm font-bold uppercase text-white group-hover/meet:text-[#C8102E] transition-colors truncate">
                      {evt.title}
                    </h5>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#aaaaaa]">
                      <Clock className="w-3 h-3 text-[#777777] shrink-0" />
                      <span className="truncate">{evt.date} · {evt.time}</span>
                    </div>
                    {onRsvpEvent && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRsvpEvent(evt.id);
                        }}
                        className={`w-full mt-1.5 py-1 text-[11px] font-['Oswald'] font-bold uppercase tracking-wider transition-colors cursor-pointer text-center ${
                          evt.isAttending
                            ? 'bg-[#1e2533] text-[#10b981] border border-[#10b981]/40'
                            : 'bg-[#2a2a2a] hover:bg-[#C8102E] text-white'
                        }`}
                      >
                        {evt.isAttending ? 'RSVP Confirmed ✓' : 'RSVP to Meet'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Community Fast Topic Navigation */}
          <div className="p-4 bg-[#1e1e1e] border border-[#383838] text-xs font-mono text-[#888888] space-y-2">
            <span className="font-bold uppercase text-white block tracking-wider">
              GASCANCO GARAGE NETWORK
            </span>
            <p className="text-[11px] leading-relaxed">
              Real project cars, dirt bikes, side-by-sides, and track builds documented by verified builders.
            </p>
          </div>
        </aside>
      )}

      {/* Photo Full-Res View - No Box, No 'Close View' Button, Clicking Photo Closes & Returns to Live Feed */}
      {activeLightboxImage && (
        <div 
          onClick={() => setActiveLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm animate-fade-in cursor-pointer select-none"
          title="Click photo to return to live feed"
        >
          <img 
            src={activeLightboxImage} 
            alt="Full resolution view" 
            onClick={() => setActiveLightboxImage(null)}
            className="max-h-[96vh] max-w-[96vw] w-auto h-auto object-contain cursor-pointer transition-opacity duration-150 hover:opacity-95"
          />
        </div>
      )}

      {/* Edit Post Modal for Logged-In User's Posts */}
      {editingPost && (
        <div 
          onClick={() => setEditingPost(null)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-2.5 sm:p-4 backdrop-blur-xs animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[92dvh] sm:max-h-[88vh] flex flex-col bg-[#202020] border border-[#444444] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-[#181818] border-b border-[#333333] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-[#C8102E]" />
                <h3 className="font-['Oswald'] text-base font-bold uppercase tracking-wider text-white">
                  Edit Post
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="text-[#888888] hover:text-white transition-colors cursor-pointer p-1"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPost} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-3.5 sm:p-5 space-y-3 flex-1 overflow-y-auto overscroll-contain">
                {/* Tag Vehicle */}
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-[#aaaaaa] flex items-center gap-1.5 mb-1.5">
                    <Car className="w-3.5 h-3.5 text-[#C8102E]" />
                    <span>Tag Vehicle</span>
                  </label>
                  <select
                    value={editVehicleId}
                    onChange={(e) => setEditVehicleId(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#444444] px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#C8102E]"
                  >
                    <option value="">None / No Vehicle Tagged</option>
                    {userVehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.year} {v.make} {v.model} {v.trim ? `• ${v.trim}` : ''} {v.nickname ? `("${v.nickname}")` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Post Content */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#aaaaaa] mb-1.5">
                    Post Content
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Share updates, wrenching logs, or YouTube/website links..."
                    className="w-full bg-[#1c1c1c] border border-[#444444] px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#C8102E] leading-relaxed resize-none"
                  />
                </div>

                {/* Live Link Preview */}
                {editLinkPreview && (
                  <div className="bg-[#181818] border border-[#C8102E]/60 p-2 sm:p-2.5 space-y-1.5 relative animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-mono text-[#ff8080]">
                        {editLinkPreview.type === 'youtube' ? (
                          <>
                            <Youtube className="w-3.5 h-3.5 text-[#FF0000]" />
                            <span className="font-bold uppercase tracking-wider text-white text-[11px]">YouTube Video</span>
                          </>
                        ) : (
                          <>
                            <Globe className="w-3.5 h-3.5 text-[#3b82f6]" />
                            <span className="font-bold uppercase tracking-wider text-white text-[11px]">Website Link</span>
                          </>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditDismissedUrl(editLinkPreview.url);
                          setEditLinkPreview(null);
                        }}
                        className="text-[#888888] hover:text-white p-0.5 transition-colors cursor-pointer"
                        title="Remove preview"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 bg-[#202020] border border-[#333333] p-1.5">
                      {editLinkPreview.image && (
                        <div className="relative w-16 h-10 bg-black shrink-0 overflow-hidden border border-[#3d3d3d]">
                          <img
                            src={editLinkPreview.image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-['Oswald'] font-bold text-white uppercase tracking-wider truncate">
                          {editLinkPreview.title || editLinkPreview.domain}
                        </div>
                        <div className="text-[10px] font-mono text-[#888888] truncate">
                          {editLinkPreview.domain || editLinkPreview.url}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Photos Management */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#aaaaaa] flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#C8102E]" />
                      <span>Attached Photos</span>
                    </label>
                    {editImages.length > 0 && (
                      <span className="text-[10px] font-mono text-[#4ade80]">
                        {editImages.length} {editImages.length === 1 ? 'photo' : 'photos'}
                      </span>
                    )}
                  </div>

                  <input
                    ref={editFileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleEditFilesUpload}
                    className="hidden"
                  />

                  {/* Upload Staging */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsEditDragOver(true);
                    }}
                    onDragLeave={() => setIsEditDragOver(false)}
                    onDrop={handleEditDrop}
                    onClick={() => editFileInputRef.current?.click()}
                    className={`border border-dashed p-2 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isEditDragOver
                        ? 'border-[#C8102E] bg-[#C8102E]/10'
                        : 'border-[#444444] hover:border-[#888888] bg-[#1a1a1a]'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5 text-[#C8102E]" />
                    <span className="text-xs font-['Oswald'] font-bold uppercase tracking-wider text-white">
                      {editImages.length > 0 ? 'Upload More Photos' : 'Upload Photos'}
                    </span>
                  </div>

                  {/* Current Images Grid */}
                  {editImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                      {editImages.map((img, idx) => (
                        <div key={idx} className="group relative aspect-[4/3] bg-black border border-[#3d3d3d] overflow-hidden">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <div className="absolute top-0.5 left-0.5 bg-black/80 text-[8px] font-mono px-1 text-white">
                            #{idx + 1}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveEditImage(idx)}
                            className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#C8102E] text-white flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                            title="Remove photo"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer Actions: Pinned, strictly 1 horizontal row, NEVER stacked, NEVER off screen */}
              <div className="p-3 sm:px-5 sm:py-3.5 border-t border-[#333333] bg-[#181818] shrink-0">
                <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
                  <button
                    type="button"
                    onClick={handleDeleteCurrentPost}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-mono text-[#ef4444] hover:text-white bg-[#ef4444]/10 hover:bg-[#ef4444] border border-[#ef4444]/40 transition-colors cursor-pointer text-center"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Delete Post</span>
                  </button>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#C8102E] hover:bg-[#e01334] text-white text-xs font-['Oswald'] font-bold uppercase tracking-wider transition-colors cursor-pointer text-center shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
