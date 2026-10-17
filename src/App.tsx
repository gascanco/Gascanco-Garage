/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Vehicle, ActiveView, Owner, GarageEvent, CommunityPost, 
  BuildUpdate, PostComment, SpotlightConfig, CommunityPoll 
} from './types/garage';
import { 
  INITIAL_VEHICLES, CURRENT_MOCK_USER, INITIAL_EVENTS, 
  INITIAL_POSTS, INITIAL_COMMENTS, INITIAL_SPOTLIGHT_CONFIG, INITIAL_POLLS 
} from './data/mockGarageData';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';
import { DiscoverView } from './components/views/DiscoverView';
import { ActivityFeed } from './components/common/ActivityFeed';
import { VehicleDetailView } from './components/views/VehicleDetailView';
import { MyGarageView } from './components/views/MyGarageView';
import { SavedBuildsView } from './components/views/SavedBuildsView';
import { EventsView } from './components/views/EventsView';
import { EventDetailView } from './components/views/EventDetailView';
import { AddVehicleModal } from './components/views/AddVehicleModal';
import { SpotlightManagerModal } from './components/modals/SpotlightManagerModal';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [currentUser, setCurrentUser] = useState<Owner>(CURRENT_MOCK_USER);
  const [events, setEvents] = useState<GarageEvent[]>(INITIAL_EVENTS);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [comments, setComments] = useState<PostComment[]>(INITIAL_COMMENTS);
  // Community Spotlight Admin Configuration
  const [spotlightConfig, setSpotlightConfig] = useState<SpotlightConfig>(INITIAL_SPOTLIGHT_CONFIG);
  const [isSpotlightModalOpen, setIsSpotlightModalOpen] = useState(false);
  // Community Polls State
  const [polls, setPolls] = useState<CommunityPoll[]>(INITIAL_POLLS);
  // Primary Home Page is the Live Activity Feed
  const [activeView, setActiveView] = useState<ActiveView>({ type: 'activity-feed' });
  const [likedVehicleIds, setLikedVehicleIds] = useState<Set<string>>(new Set(['veh-skyline-r34', 'veh-ford-f100']));
  const [dislikedVehicleIds, setDislikedVehicleIds] = useState<Set<string>>(new Set());
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [addModalInitialMode, setAddModalInitialMode] = useState<'select' | 'event' | 'vehicle' | 'post' | 'advertisement' | 'poll'>('select');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenAddVehicle = () => {
    setEditingVehicle(null);
    setAddModalInitialMode('vehicle');
    setIsAddVehicleOpen(true);
  };

  const handleOpenEditVehicle = (vehicleId: string) => {
    const target = vehicles.find(v => v.id === vehicleId);
    if (target) {
      setEditingVehicle(target);
      setAddModalInitialMode('vehicle');
      setIsAddVehicleOpen(true);
    }
  };

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView]);

  // Support deep links e.g. shared garage or vehicle URLs
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const garageParam = params.get('garage');
    const vehicleParam = params.get('vehicle');
    if (garageParam) {
      setActiveView({ type: 'my-garage' });
    } else if (vehicleParam) {
      setActiveView({ type: 'vehicle-detail', vehicleId: vehicleParam });
    }
  }, [currentUser.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Like Toggle (Love-you gesture 🤟)
  const handleLikeToggle = (vehicleId: string) => {
    setLikedVehicleIds(prev => {
      const next = new Set(prev);
      if (next.has(vehicleId)) {
        next.delete(vehicleId);
        showToast("Removed reaction");
      } else {
        next.add(vehicleId);
        // Clear dislike if present
        setDislikedVehicleIds(prevDis => {
          const nextDis = new Set(prevDis);
          nextDis.delete(vehicleId);
          return nextDis;
        });
        showToast("Loved this build! 🤟");
      }
      return next;
    });
  };

  // Dislike Toggle (Thumbs-down 👎)
  const handleDislikeToggle = (vehicleId: string) => {
    setDislikedVehicleIds(prev => {
      const next = new Set(prev);
      if (next.has(vehicleId)) {
        next.delete(vehicleId);
        showToast("Removed dislike");
      } else {
        next.add(vehicleId);
        // Clear like if present
        setLikedVehicleIds(prevLike => {
          const nextLike = new Set(prevLike);
          nextLike.delete(vehicleId);
          return nextLike;
        });
        showToast("Marked thumbs-down");
      }
      return next;
    });
  };

  // 1. Add vehicle
  const handleVehicleAdded = (newVehicle: Vehicle) => {
    setVehicles(prev => [newVehicle, ...prev]);
    showToast(`Registered ${newVehicle.year} ${newVehicle.make} ${newVehicle.model} to your Garage!`);
    setActiveView({ type: 'vehicle-detail', vehicleId: newVehicle.id });
  };

  // 2. Add build update
  const handleBuildUpdateAdded = (payload: { vehicleId: string; update: BuildUpdate }) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === payload.vehicleId) {
        return {
          ...v,
          buildUpdates: [payload.update, ...(v.buildUpdates || [])],
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return v;
    }));
    const targetVeh = vehicles.find(v => v.id === payload.vehicleId);
    showToast(`Published build update for ${targetVeh ? `${targetVeh.make} ${targetVeh.model}` : 'your vehicle'}! 🤟`);
    setActiveView({ type: 'activity-feed' });
  };

  // 3. Add event
  const handleEventAdded = (newEvent: GarageEvent) => {
    setEvents(prev => [newEvent, ...prev]);
    showToast(`Published event "${newEvent.title}"! 📅`);
    setActiveView({ type: 'activity-feed' });
  };

  // 4. Add community post
  const handlePostAdded = (newPost: CommunityPost) => {
    setCommunityPosts(prev => [newPost, ...prev]);
    showToast(`Community post shared to live feed! 💬`);
    setActiveView({ type: 'activity-feed' });
  };

  // 5. Update community post
  const handleUpdatePost = (updatedPost: CommunityPost) => {
    setCommunityPosts(prev => prev.map(p => (p.id === updatedPost.id ? updatedPost : p)));
    showToast(`Post updated successfully! ✏️`);
  };

  // 6. Delete community post
  const handleDeletePost = (postId: string) => {
    setCommunityPosts(prev => prev.filter(p => p.id !== postId));
    showToast(`Post removed from live feed 🗑️`);
  };

  // Comment Handlers (Threaded Discussions & Build Notes)
  const handleAddComment = (newCommentData: Omit<PostComment, 'id' | 'createdAt'>) => {
    const newComment: PostComment = {
      ...newCommentData,
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: 'Just now',
      likesCount: 0,
    };
    setComments(prev => [...prev, newComment]);

    // Increment post commentsCount if targeting a post
    setCommunityPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === newCommentData.postId
          ? { ...p, commentsCount: (p.commentsCount || 0) + 1 }
          : p
      )
    );
    showToast("Comment posted!");
  };

  const handleUpdateComment = (commentId: string, content: string, photoUrl?: string) => {
    setComments(prev =>
      prev.map(c =>
        c.id === commentId
          ? { ...c, content, photoUrl, updatedAt: 'Edited just now' }
          : c
      )
    );
    showToast("Comment updated!");
  };

  const handleDeleteComment = (commentId: string) => {
    const target = comments.find(c => c.id === commentId);
    setComments(prev => prev.filter(c => c.id !== commentId && c.parentId !== commentId));

    if (target) {
      setCommunityPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === target.postId
            ? { ...p, commentsCount: Math.max(0, (p.commentsCount || 1) - 1) }
            : p
        )
      );
    }
    showToast("Comment deleted");
  };

  // RSVP Event toggle & status handler
  const handleRsvpEvent = (eventId: string, status?: 'going' | 'interested' | 'none') => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        const nextAttending = status ? (status === 'going') : !evt.isAttending;
        const nextStatus: 'going' | 'interested' | 'none' = status || (nextAttending ? 'going' : 'none');
        if (nextStatus === 'going') {
          showToast(`You're attending ${evt.title}!`);
        } else if (nextStatus === 'interested') {
          showToast(`Marked interested in ${evt.title}`);
        } else {
          showToast(`Removed RSVP for ${evt.title}`);
        }
        const delta = nextAttending ? (evt.isAttending ? 0 : 1) : (evt.isAttending ? -1 : 0);
        return {
          ...evt,
          isAttending: nextAttending,
          rsvpStatus: nextStatus,
          attendeesCount: Math.max(0, evt.attendeesCount + delta)
        };
      }
      return evt;
    }));
  };

  // Update vehicle
  const handleUpdateVehicle = (updated: Vehicle) => {
    setVehicles(prev => prev.map(v => (v.id === updated.id ? updated : v)));
    showToast("Vehicle specifications updated");
  };

  // Delete vehicle
  const handleDeleteVehicle = (vehicleId: string) => {
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    showToast("Vehicle removed from your Garage registry");
  };

  // Spotlight Handlers (Full Super Admin Control)
  const handleSaveSpotlightConfig = (updated: SpotlightConfig) => {
    setSpotlightConfig(updated);
    setVehicles(prev => prev.map(v => ({
      ...v,
      featured: v.id === updated.vehicleId ? updated.active : (v.id === spotlightConfig.vehicleId ? false : v.featured)
    })));
    showToast(`Updated Community Spotlight: ${updated.badge}! ★`);
  };

  const handleSetVehicleAsSpotlight = (vehicleId: string) => {
    const target = vehicles.find(v => v.id === vehicleId);
    if (!target) return;
    setSpotlightConfig(prev => ({
      ...prev,
      vehicleId,
      active: true,
      headline: `${target.year} ${target.make} ${target.model}`,
      updatedAt: new Date().toISOString(),
    }));
    setVehicles(prev => prev.map(v => ({
      ...v,
      featured: v.id === vehicleId ? true : (v.id === spotlightConfig.vehicleId ? false : v.featured)
    })));
    showToast(`Set ${target.year} ${target.make} ${target.model} as Community Spotlight! ★`);
  };

  // Poll Handlers (Super Admin Creation & Community Voting)
  const handleVotePoll = (pollId: string, optionId: string) => {
    setPolls(prev => prev.map(poll => {
      if (poll.id !== pollId) return poll;

      const previousVoteId = poll.userVotedOptionId || poll.options.find(o => o.voterUserIds?.includes(currentUser.id))?.id;

      const updatedOptions = poll.options.map(opt => {
        let votes = opt.votes || 0;
        let voters = [...(opt.voterUserIds || [])];

        // Remove previous vote if any
        if (previousVoteId && opt.id === previousVoteId) {
          votes = Math.max(0, votes - 1);
          voters = voters.filter(uid => uid !== currentUser.id);
        }

        // Add new vote
        if (opt.id === optionId) {
          votes += 1;
          if (!voters.includes(currentUser.id)) voters.push(currentUser.id);
        }

        return {
          ...opt,
          votes,
          voterUserIds: voters,
        };
      });

      const totalVotes = updatedOptions.reduce((acc, cur) => acc + cur.votes, 0);

      return {
        ...poll,
        options: updatedOptions,
        totalVotes,
        userVotedOptionId: optionId,
      };
    }));
    showToast("Vote recorded! 🗳️");
  };

  const handleCreatePoll = (newPoll: CommunityPoll) => {
    setPolls(prev => [newPoll, ...prev]);
    showToast("Community Poll published to Live Feed! 📊");
    setActiveView({ type: 'activity-feed' });
  };

  const handleTogglePollStatus = (pollId: string) => {
    setPolls(prev => prev.map(p => {
      if (p.id === pollId) {
        const nextStatus = p.status === 'closed' ? 'active' : 'closed';
        showToast(nextStatus === 'closed' ? "Poll closed to new votes" : "Poll reopened");
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  const handleDeletePoll = (pollId: string) => {
    setPolls(prev => prev.filter(p => p.id !== pollId));
    showToast("Poll deleted from community");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0e0e10] text-white">
      {/* Main View Router */}
      <main className="flex-1">
        {/* 1. Primary Home Page: Live Activity Feed */}
        {activeView.type === 'activity-feed' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
            <ActivityFeed
              vehicles={vehicles}
              events={events}
              posts={communityPosts}
              comments={comments}
              onSelectVehicle={(id) => setActiveView({ type: 'vehicle-detail', vehicleId: id })}
              onSelectOwner={(ownerId) => setActiveView({ type: 'user-profile', ownerId })}
              onLikeToggle={handleLikeToggle}
              onDislikeToggle={handleDislikeToggle}
              onRsvpEvent={handleRsvpEvent}
              likedVehicleIds={likedVehicleIds}
              dislikedVehicleIds={dislikedVehicleIds}
              currentUserId={currentUser.id}
              currentUser={currentUser}
              onUpdatePost={handleUpdatePost}
              onDeletePost={handleDeletePost}
              onAddComment={handleAddComment}
              onUpdateComment={handleUpdateComment}
              onDeleteComment={handleDeleteComment}
              onOpenAddVehicle={handleOpenAddVehicle}
              onExploreEvents={() => setActiveView({ type: 'events' })}
              onSelectEvent={(eventId) => setActiveView({ type: 'event-detail', eventId })}
              onExploreBuilds={() => setActiveView({ type: 'community-builds' })}
              spotlightConfig={spotlightConfig}
              onOpenSpotlightModal={() => setIsSpotlightModalOpen(true)}
              polls={polls}
              onVotePoll={handleVotePoll}
              onTogglePollStatus={handleTogglePollStatus}
              onDeletePoll={handleDeletePoll}
              onOpenAddPoll={() => {
                setEditingVehicle(null);
                setAddModalInitialMode('poll');
                setIsAddVehicleOpen(true);
              }}
            />
          </div>
        )}

        {/* 2. Secondary View: Community Builds */}
        {(activeView.type === 'community-builds' || activeView.type === 'discover') && (
          <DiscoverView
            vehicles={vehicles}
            onSelectVehicle={(id) => setActiveView({ type: 'vehicle-detail', vehicleId: id })}
            onSelectOwner={(ownerId) => setActiveView({ type: 'user-profile', ownerId })}
            onLikeToggle={handleLikeToggle}
            onDislikeToggle={handleDislikeToggle}
            likedVehicleIds={likedVehicleIds}
            dislikedVehicleIds={dislikedVehicleIds}
            onOpenAddVehicle={() => setIsAddVehicleOpen(true)}
            spotlightConfig={spotlightConfig}
            onOpenSpotlightModal={() => setIsSpotlightModalOpen(true)}
          />
        )}

        {/* Vehicle Detail View */}
        {activeView.type === 'vehicle-detail' && (() => {
          const vehicle = vehicles.find(v => v.id === activeView.vehicleId) || vehicles[0];
          return (
            <VehicleDetailView
              vehicle={vehicle}
              currentUser={currentUser}
              onBack={() => setActiveView({ type: 'community-builds' })}
              onSelectOwner={(ownerId) => setActiveView({ type: 'user-profile', ownerId })}
              onEditVehicle={handleOpenEditVehicle}
              onUpdateVehicle={handleUpdateVehicle}
              onDeleteVehicle={(id) => {
                handleDeleteVehicle(id);
                setActiveView({ type: 'community-builds' });
              }}
              onAddUpdate={(id) => setActiveView({ type: 'my-garage' })}
              onLikeToggle={handleLikeToggle}
              onDislikeToggle={handleDislikeToggle}
              isLiked={likedVehicleIds.has(vehicle.id)}
              isDisliked={dislikedVehicleIds.has(vehicle.id)}
              onSelectRelated={(id) => setActiveView({ type: 'vehicle-detail', vehicleId: id })}
              allVehicles={vehicles}
              comments={comments}
              onAddComment={handleAddComment}
              onUpdateComment={handleUpdateComment}
              onDeleteComment={handleDeleteComment}
              onSetAsSpotlight={handleSetVehicleAsSpotlight}
              isCurrentSpotlight={spotlightConfig.active && spotlightConfig.vehicleId === vehicle.id}
            />
          );
        })()}

        {/* Events View */}
        {activeView.type === 'events' && (
          <EventsView
            events={events}
            currentUser={currentUser}
            onRsvpEvent={handleRsvpEvent}
            onSelectOwner={(ownerId) => setActiveView({ type: 'user-profile', ownerId })}
            onOpenAddEvent={() => {
              setAddModalInitialMode('event');
              setIsAddVehicleOpen(true);
            }}
            onSelectEvent={(eventId) => setActiveView({ type: 'event-detail', eventId })}
          />
        )}

        {/* Event Detail View */}
        {activeView.type === 'event-detail' && (() => {
          const targetEvent = events.find(e => e.id === activeView.eventId) || events[0];
          return (
            <EventDetailView
              event={targetEvent}
              currentUser={currentUser}
              onBack={() => setActiveView({ type: 'events' })}
              onRsvp={handleRsvpEvent}
              onSelectOwner={(ownerId) => setActiveView({ type: 'user-profile', ownerId })}
              comments={comments}
              onAddComment={handleAddComment}
              onUpdateComment={handleUpdateComment}
              onDeleteComment={handleDeleteComment}
              allEvents={events}
              onSelectEvent={(eventId) => setActiveView({ type: 'event-detail', eventId })}
            />
          );
        })()}

        {/* Saved Builds View */}
        {activeView.type === 'saved-builds' && (
          <SavedBuildsView
            vehicles={vehicles}
            likedVehicleIds={likedVehicleIds}
            dislikedVehicleIds={dislikedVehicleIds}
            onSelectVehicle={(id) => setActiveView({ type: 'vehicle-detail', vehicleId: id })}
            onSelectOwner={(ownerId) => setActiveView({ type: 'user-profile', ownerId })}
            onLikeToggle={handleLikeToggle}
            onDislikeToggle={handleDislikeToggle}
            onExploreBuilds={() => setActiveView({ type: 'community-builds' })}
          />
        )}

        {/* 3. Combined My Garage & Profile Hub */}
        {(activeView.type === 'my-garage' || activeView.type === 'user-profile') && (
          <MyGarageView
            currentUser={currentUser}
            vehicles={vehicles}
            onSelectVehicle={(id) => setActiveView({ type: 'vehicle-detail', vehicleId: id })}
            onOpenAddVehicle={handleOpenAddVehicle}
            onEditVehicle={handleOpenEditVehicle}
            onUpdateVehicle={handleUpdateVehicle}
            onDeleteVehicle={handleDeleteVehicle}
            onUpdateCurrentUser={(updated) => {
              setCurrentUser(updated);
              setVehicles(prev => prev.map(v => v.owner.id === updated.id ? { ...v, owner: updated } : v));
              showToast("Profile updated");
            }}
            likedVehicleIds={likedVehicleIds}
            dislikedVehicleIds={dislikedVehicleIds}
            onLikeToggle={handleLikeToggle}
            onDislikeToggle={handleDislikeToggle}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAddVehicle={() => {
          setEditingVehicle(null);
          setAddModalInitialMode('select');
          setIsAddVehicleOpen(true);
        }}
        currentUserId={currentUser.id}
      />

      {/* Add / Create Modal ("Add an Event", "Add a Vehicle", "Add a Build Update", "Add a Post", "Create Poll") */}
      <AddVehicleModal
        isOpen={isAddVehicleOpen}
        onClose={() => {
          setIsAddVehicleOpen(false);
          setEditingVehicle(null);
        }}
        currentUser={currentUser}
        vehicles={vehicles}
        onVehicleAdded={handleVehicleAdded}
        onVehicleUpdated={handleUpdateVehicle}
        editingVehicle={editingVehicle}
        onBuildUpdateAdded={handleBuildUpdateAdded}
        onEventAdded={handleEventAdded}
        onPostAdded={handlePostAdded}
        onPollAdded={handleCreatePoll}
        initialMode={addModalInitialMode}
      />

      {/* Admin Spotlight Manager Modal */}
      <SpotlightManagerModal
        isOpen={isSpotlightModalOpen}
        onClose={() => setIsSpotlightModalOpen(false)}
        allVehicles={vehicles}
        currentConfig={spotlightConfig}
        onSaveConfig={handleSaveSpotlightConfig}
      />

      {/* Action Toast Feedback - Zero radius */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 bg-[#202020] text-white px-4 py-2.5 border border-[#444444] shadow-2xl flex items-center gap-2 text-xs font-mono animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#C8102E]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
