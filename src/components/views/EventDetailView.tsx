import React, { useState, useMemo, useEffect } from 'react';
import { GarageEvent, Owner, PostComment, isHardAdmin } from '../../types/garage';
import { ThreadedComments } from '../common/ThreadedComments';
import { 
  ArrowLeft, Calendar, MapPin, Users, Share2, 
  Check, Star, Radio, ShieldCheck, Clock, AlertCircle,
  ExternalLink, ChevronRight, MessageSquare, Compass, Info
} from 'lucide-react';

interface EventDetailViewProps {
  event: GarageEvent;
  currentUser: Owner;
  onBack: () => void;
  onRsvp: (eventId: string, status: 'going' | 'interested' | 'none') => void;
  onSelectOwner: (ownerId: string) => void;
  comments: PostComment[];
  onAddComment: (comment: Omit<PostComment, 'id' | 'createdAt'>) => void;
  onUpdateComment: (commentId: string, content: string, photoUrl?: string) => void;
  onDeleteComment: (commentId: string) => void;
  allEvents?: GarageEvent[];
  onSelectEvent?: (eventId: string) => void;
}

export const EventDetailView: React.FC<EventDetailViewProps> = ({
  event,
  currentUser,
  onBack,
  onRsvp,
  onSelectOwner,
  comments,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  allEvents = [],
  onSelectEvent,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendees' | 'discussions'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);
  const [userRsvpStatus, setUserRsvpStatus] = useState<'going' | 'interested' | 'none'>(
    event.rsvpStatus || (event.isAttending ? 'going' : 'none')
  );

  useEffect(() => {
    setUserRsvpStatus(event.rsvpStatus || (event.isAttending ? 'going' : 'none'));
  }, [event]);

  // Event comments
  const eventComments = useMemo(() => {
    return comments.filter(c => c.postId === event.id || c.postId === `evt-${event.id}`);
  }, [comments, event.id]);

  // Handle Share link
  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // RSVP Toggle handler
  const handleRsvpChange = (status: 'going' | 'interested' | 'none') => {
    setUserRsvpStatus(status);
    onRsvp(event.id, status);
  };

  // Countdown timer to event
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 4,
    hours: 12,
    minutes: 38,
    seconds: 45
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Other upcoming events
  const otherEvents = useMemo(() => {
    return allEvents.filter(e => e.id !== event.id).slice(0, 3);
  }, [allEvents, event.id]);

  // Mock Attendees list
  const attendeesList = useMemo(() => {
    if (event.attendees && event.attendees.length > 0) return event.attendees;
    return [
      event.organizer,
      {
        id: 'att-1',
        name: 'Cole Fox',
        handle: 'Cole Fox',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        location: 'Bakersfield, CA',
        bio: 'Driver & Prerunner builder.',
        memberSince: 'March 2021',
      },
      {
        id: 'att-2',
        name: 'Taylor Henderson',
        handle: 'Taylor Henderson',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        location: 'Costa Mesa, CA',
        bio: 'Track day regular.',
        memberSince: 'May 2022',
      },
      {
        id: 'att-3',
        name: 'Sam Delgado',
        handle: 'Sam Delgado',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        location: 'San Diego, CA',
        bio: 'Desert runner and overland builder.',
        memberSince: 'January 2023',
      },
      {
        id: 'att-4',
        name: 'Elena Rostova',
        handle: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        location: 'Los Angeles, CA',
        bio: 'Time attack enthusiast.',
        memberSince: 'August 2022',
      }
    ];
  }, [event]);

  return (
    <div className="min-h-screen pb-24 bg-[#303030] text-[#eaeaea]">
      {/* Top Navigation Bar: Back & Share */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#222224] hover:bg-[#2c2c30] text-white border border-[#444446] font-['Oswald'] text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.98] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#C8102E]" />
            <span>Back to Events</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#222224] hover:bg-[#2c2c30] text-[#cccccc] hover:text-white border border-[#444446] font-mono text-xs transition-all duration-150 active:scale-[0.98] cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#10b981]" />
                <span className="text-[#10b981] font-bold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#C8102E]" />
                <span>Share Event</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Marquee Hero Cover Image */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-black border border-[#444446] overflow-hidden shadow-2xl">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

          {/* Hero Content Overlay */}
          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 bg-[#C8102E] text-white font-['Oswald'] font-bold text-xs uppercase tracking-wider shadow">
                  {event.eventType}
                </span>
                <span className="px-2.5 py-1 bg-black/70 backdrop-blur-sm border border-white/20 text-[#eeeeee] font-mono text-xs">
                  {event.date} • {event.time}
                </span>
              </div>

              <h1 className="font-['Oswald'] text-2xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-white leading-none">
                {event.title}
              </h1>

              <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-[#cccccc]">
                <MapPin className="w-3.5 h-3.5 text-[#C8102E] shrink-0" />
                <span>{event.location}</span>
              </div>
            </div>

            {/* Countdown Clock */}
            <div className="bg-[#18181a]/90 backdrop-blur-md border border-[#38383a] p-3 sm:p-4 shrink-0 flex items-center gap-3 self-start sm:self-end">
              <div className="text-center">
                <span className="font-['Oswald'] text-xl sm:text-2xl font-bold text-white block leading-none tabular-nums">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[9px] font-mono uppercase text-[#888888]">Days</span>
              </div>
              <span className="text-white/40 font-bold">:</span>
              <div className="text-center">
                <span className="font-['Oswald'] text-xl sm:text-2xl font-bold text-white block leading-none tabular-nums">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[9px] font-mono uppercase text-[#888888]">Hours</span>
              </div>
              <span className="text-white/40 font-bold">:</span>
              <div className="text-center">
                <span className="font-['Oswald'] text-xl sm:text-2xl font-bold text-white block leading-none tabular-nums">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[9px] font-mono uppercase text-[#888888]">Mins</span>
              </div>
              <span className="text-white/40 font-bold">:</span>
              <div className="text-center">
                <span className="font-['Oswald'] text-xl sm:text-2xl font-bold text-[#ff4d6a] block leading-none tabular-nums">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[9px] font-mono uppercase text-[#888888]">Secs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RSVP Action Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="bg-[#242426] border border-[#38383a] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C8102E]/20 border border-[#C8102E]/50 flex items-center justify-center text-[#C8102E] shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#888888] block">
                RSVP & Attendance Status
              </span>
              <span className="font-['Oswald'] text-base sm:text-lg font-bold uppercase text-white tracking-wide">
                {event.attendeesCount} Confirmed Drivers Going
              </span>
            </div>
          </div>

          {/* Interactive RSVP Buttons with animation feedback */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleRsvpChange('going')}
              className={`px-4 py-2 text-xs sm:text-sm font-['Oswald'] font-bold uppercase tracking-wider flex items-center gap-2 border transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                userRsvpStatus === 'going'
                  ? 'bg-[#C8102E] text-white border-[#C8102E] shadow'
                  : 'bg-[#1a1a1c] text-[#bbbbbb] hover:text-white border-[#38383a] hover:border-white'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{userRsvpStatus === 'going' ? '✓ You Are Going' : 'Count Me In (Going)'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleRsvpChange('interested')}
              className={`px-4 py-2 text-xs sm:text-sm font-['Oswald'] font-bold uppercase tracking-wider flex items-center gap-2 border transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                userRsvpStatus === 'interested'
                  ? 'bg-[#3b82f6] text-white border-[#3b82f6] shadow'
                  : 'bg-[#1a1a1c] text-[#bbbbbb] hover:text-white border-[#38383a] hover:border-white'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Interested</span>
            </button>

            {userRsvpStatus !== 'none' && (
              <button
                type="button"
                onClick={() => handleRsvpChange('none')}
                className="px-3 py-2 text-xs font-mono text-[#888888] hover:text-[#ff4d4d] border border-transparent hover:border-[#444446] transition-colors cursor-pointer"
              >
                Can't Go
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation: Overview | Attendees | Discussions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-[#38383a] flex items-center gap-4 sm:gap-8 font-['Oswald'] text-sm sm:text-base font-bold uppercase tracking-wider overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 flex items-center gap-2 shrink-0 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#C8102E] text-[#C8102E]'
                : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Event Overview & Route</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('attendees')}
            className={`py-3 border-b-2 flex items-center gap-2 shrink-0 transition-colors cursor-pointer ${
              activeTab === 'attendees'
                ? 'border-[#C8102E] text-[#C8102E]'
                : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Attendees ({attendeesList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('discussions')}
            className={`py-3 border-b-2 flex items-center gap-2 shrink-0 transition-colors cursor-pointer ${
              activeTab === 'discussions'
                ? 'border-[#C8102E] text-[#C8102E]'
                : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Discussions ({eventComments.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-6 min-w-0">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Description Body */}
                <div className="bg-[#242426] border border-[#38383a] p-5 sm:p-6 space-y-4">
                  <h3 className="font-['Oswald'] text-xl font-bold uppercase tracking-wide text-white">
                    About This Meet
                  </h3>
                  <p className="text-sm sm:text-base text-[#cccccc] leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                </div>

                {/* Staging & Location Details */}
                <div className="bg-[#242426] border border-[#38383a] p-5 sm:p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#C8102E]" />
                    <h3 className="font-['Oswald'] text-xl font-bold uppercase tracking-wide text-white">
                      Staging & Route Details
                    </h3>
                  </div>
                  <div className="p-3.5 bg-[#171719] border border-[#333336] space-y-2 font-mono text-xs text-[#bbbbbb]">
                    <div className="flex items-start gap-2">
                      <span className="text-[#C8102E] font-bold uppercase">Staging Area:</span>
                      <span className="text-white">{event.location}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#C8102E] font-bold uppercase">Meeting Time:</span>
                      <span className="text-white">{event.time}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#C8102E] font-bold uppercase">Radio Channel:</span>
                      <span className="text-white">FRS Channel 4-0 (Sub-channel 7)</span>
                    </div>
                  </div>
                </div>

                {/* Schedule Table */}
                <div className="bg-[#242426] border border-[#38383a] p-5 sm:p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#C8102E]" />
                    <h3 className="font-['Oswald'] text-xl font-bold uppercase tracking-wide text-white">
                      Meet Schedule & Milestones
                    </h3>
                  </div>
                  <div className="divide-y divide-[#333336] border border-[#333336] bg-[#171719]">
                    <div className="p-3 flex items-center justify-between text-xs font-mono">
                      <span className="text-[#C8102E] font-bold">6:15 AM</span>
                      <span className="text-white">Staging lot opens, parking marshals on site</span>
                    </div>
                    <div className="p-3 flex items-center justify-between text-xs font-mono">
                      <span className="text-[#C8102E] font-bold">6:40 AM</span>
                      <span className="text-white">Mandatory driver safety & route briefing</span>
                    </div>
                    <div className="p-3 flex items-center justify-between text-xs font-mono">
                      <span className="text-[#C8102E] font-bold">7:00 AM</span>
                      <span className="text-white">Rollout in designated lead/chase groups</span>
                    </div>
                    <div className="p-3 flex items-center justify-between text-xs font-mono">
                      <span className="text-[#C8102E] font-bold">8:30 AM</span>
                      <span className="text-white">Overlook regroup, photography & coffee break</span>
                    </div>
                  </div>
                </div>

                {/* Organizer Bulletins */}
                {event.updates && event.updates.length > 0 && (
                  <div className="bg-[#242426] border border-[#38383a] p-5 sm:p-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-[#C8102E]" />
                      <h3 className="font-['Oswald'] text-xl font-bold uppercase tracking-wide text-white">
                        Organizer Bulletins
                      </h3>
                    </div>
                    <div className="space-y-2.5">
                      {event.updates.map(upd => (
                        <div key={upd.id} className="p-3 bg-[#1a1a1c] border-l-2 border-[#C8102E] space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-['Oswald'] text-sm font-bold uppercase text-white">
                              {upd.title}
                            </span>
                            <span className="text-[10px] font-mono text-[#888888]">{upd.date}</span>
                          </div>
                          <p className="text-xs text-[#aaaaaa] leading-relaxed">
                            {upd.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ATTENDEES */}
            {activeTab === 'attendees' && (
              <div className="bg-[#242426] border border-[#38383a] p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-['Oswald'] text-xl font-bold uppercase tracking-wide text-white">
                    Registered Drivers & Attendees
                  </h3>
                  <span className="text-xs font-mono text-[#aaaaaa]">
                    {attendeesList.length} Drivers
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {attendeesList.map((attendee, idx) => (
                    <div
                      key={attendee.id || idx}
                      onClick={() => onSelectOwner(attendee.id)}
                      className="p-3 bg-[#1a1a1c] border border-[#38383a] hover:border-[#C8102E] flex items-center gap-3 transition-colors cursor-pointer group"
                    >
                      <img
                        src={attendee.avatar}
                        alt={attendee.name}
                        className="w-12 h-12 object-cover border-2 border-[#C8102E] shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-['Oswald'] text-base font-bold uppercase text-white group-hover:text-[#C8102E] transition-colors truncate">
                            {attendee.name}
                          </span>
                          {attendee.id === event.organizer.id && (
                            <span className="px-1.5 py-0.2 bg-[#C8102E] text-white font-['Oswald'] text-[9px] uppercase font-bold tracking-wider">
                              HOST
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-mono text-[#888888] block truncate">
                          {attendee.location}
                        </span>
                        <span className="text-[10px] font-mono text-[#4ade80]">
                          ✓ Confirmed Going
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: DISCUSSIONS (Full Threaded Conversation Thread) */}
            {activeTab === 'discussions' && (
              <div className="bg-[#242426] border border-[#38383a] p-4 sm:p-6 space-y-4">
                <div>
                  <h3 className="font-['Oswald'] text-xl font-bold uppercase tracking-wide text-white">
                    Event Coordination & Chat
                  </h3>
                  <p className="text-xs text-[#888888] font-mono mt-0.5">
                    Coordinate carpools, radio channels, pacing groups, and meetups with participants.
                  </p>
                </div>

                <ThreadedComments
                  postId={event.id}
                  postTitle={event.title}
                  postType="event"
                  comments={eventComments}
                  currentUser={currentUser}
                  onAddComment={onAddComment}
                  onUpdateComment={onUpdateComment}
                  onDeleteComment={onDeleteComment}
                />
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Host Card (Clean without @ handle) */}
            <div className="bg-[#242426] border border-[#38383a] p-5 space-y-4 shadow-sm">
              <span className="text-xs font-mono text-[#C8102E] uppercase tracking-wider block font-bold">
                EVENT ORGANIZER
              </span>

              <div 
                onClick={() => onSelectOwner(event.organizer.id)}
                className="flex items-center gap-3.5 group cursor-pointer"
              >
                <img
                  src={event.organizer.avatar}
                  alt={event.organizer.name}
                  className="w-14 h-14 object-cover border-2 border-[#C8102E] shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-['Oswald'] text-lg sm:text-xl font-bold uppercase text-white group-hover:text-[#C8102E] transition-colors truncate">
                      {event.organizer.name}
                    </h4>
                    {isHardAdmin(event.organizer) && (
                      <span className="px-1.5 py-0.5 bg-[#C8102E] text-white font-['Oswald'] text-[9px] uppercase font-black tracking-wider">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-[#aaaaaa]">
                    {event.organizer.location}
                  </p>
                  <p className="text-[11px] font-mono text-[#777777]">
                    Member Since {event.organizer.memberSince}
                  </p>
                </div>
              </div>

              {event.organizer.bio && (
                <p className="text-xs text-[#aaaaaa] leading-relaxed pt-2 border-t border-[#333336]">
                  {event.organizer.bio}
                </p>
              )}
            </div>

            {/* Quick Guidelines */}
            <div className="bg-[#242426] border border-[#38383a] p-5 space-y-3 shadow-sm">
              <span className="text-xs font-mono text-white uppercase tracking-wider block font-bold">
                COMMUNITY DRIVER ETIQUETTE
              </span>
              <ul className="text-xs font-mono text-[#aaaaaa] space-y-2 list-disc list-inside">
                <li>Drive your own pace; no tailgating in canyon sections.</li>
                <li>Keep FRS radio on channel 4-0 for road hazards.</li>
                <li>Respect all venues; strictly zero revving or burnouts.</li>
                <li>Pack out all trash from staging lots and overlooks.</li>
              </ul>
            </div>

            {/* More Upcoming Events */}
            {otherEvents.length > 0 && onSelectEvent && (
              <div className="bg-[#242426] border border-[#38383a] p-5 space-y-3 shadow-sm">
                <span className="text-xs font-mono text-white uppercase tracking-wider block font-bold">
                  OTHER UPCOMING MEETS
                </span>
                <div className="space-y-2.5">
                  {otherEvents.map(evt => (
                    <div
                      key={evt.id}
                      onClick={() => onSelectEvent(evt.id)}
                      className="p-2.5 bg-[#1a1a1c] border border-[#333336] hover:border-[#C8102E] transition-colors cursor-pointer group flex items-center gap-3"
                    >
                      <img
                        src={evt.coverImage}
                        alt=""
                        className="w-12 h-12 object-cover border border-[#444446] shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-['Oswald'] text-sm font-bold uppercase text-white group-hover:text-[#C8102E] transition-colors truncate block">
                          {evt.title}
                        </span>
                        <span className="text-[11px] font-mono text-[#888888] block truncate">
                          {evt.date} • {evt.location}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
