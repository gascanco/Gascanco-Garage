# App Refinements & Community Events Overhaul

Comprehensive implementation plan covering application-wide interaction polish, handle removal, Live Feed feed/poll enhancements, Vehicle Details narrative & discussion tabs, and a complete Events page restructuring mirroring the Builds layout with a dedicated Event Details experience.

> [!IMPORTANT]
> **Strict Layout & Feature Invariants**:
> - **Main Navigation Bar**: The main navigation bar **remains at the bottom untouched and unaltered** (exact styling, items, positioning, and actions are 100% preserved).
> - **My Garage View**: Preserved as-is (untouched and unaltered per instructions).
> - **Builds View**: Preserved as-is (untouched and unaltered per instructions).
> - **Vehicle Story / Narrative**: Open-ended long-form text area supporting stories, build notes, and hyperlinks, editable by the owner in both the edit modal and directly on the details page.
> - **Events Page Spotlight**: Hero banner at the top featuring a real-time countdown timer to the next upcoming meet, RSVP status toggle, and attendee avatar stack.
> - **Event Details Experience**: Full dedicated view mirroring Vehicle Details, structured with tabs for Event Overview, Attendees Roster, and a Dedicated Discussions thread using the Live Feed comment style.

---

## 1. Overview & Core Concept

This milestone delivers four key areas of refinement across GASCANCO / The Garage while keeping the bottom navigation bar and established garage/build views completely intact:
1. **Global App Cleanliness & Interactivity**: Elimination of Twitter-style `@` handles across all owner profiles and cards in favor of bold display names; interactive micro-animations and tactile press feedback (`active:scale-[0.98]`, brightness transitions) on all buttons; comprehensive link validation ensuring every vehicle, event, and profile route resolves smoothly.
2. **Live Feed & Poll Harmonization**: Redesign of `CommunityPollCard` to inherit the exact card geometry, avatar dimensions (`w-10 h-10`), and header alignment of standard build update posts; expansion of the activity feed pipeline to support up to 100 items with a seamless "Load More Builds & Posts" pagination button; and strictly chronological bottom-stacked commenting.
3. **Vehicle Details Storytelling & Discussions**: Adding a rich, open-ended Vehicle Narrative ("The Story Behind the Machine") with link parsing; enlarging the owner signature while removing redundant "Built By" labels; verifying manufacturer matching in "More Builds" with graceful empty states; and introducing a third navigation tab for Community Discussions next to Technical Sheet and Photos.
4. **Events View Modernization & Event Details**: Removing the "Planning a Cruise" callout, mirroring the high-energy layout of the Builds registry with a marquee upcoming event spotlight hero, decluttering event cards, and implementing a full `EventDetailView` with RSVP controls and dedicated attendee conversations.

---

## 2. User Experience & Visual Design

### Visual Identity & Theme
- **Theme**: Dark utilitarian garage aesthetic (`#18181a`, `#222224`, `#282828`, `#0f0f10`).
- **Accents**: High-octane crimson (`#C8102E`, `#ff4d6a`) reserved strictly for primary actions, active tabs, and live status tags.
- **Typography**: `Oswald` for bold athletic headlines and action markers; clean sans-serif for readable body copy and comments; monospace strictly for specs, dates, and tabular numbers.
- **Micro-Interactions**: 
  - Buttons: `active:scale-[0.98] transition-all duration-150 hover:brightness-110 shadow-sm cursor-pointer`
  - Cards: `hover:border-[#555555] transition-colors`
  - Links: Underline hover effects with smooth color shifts.

### Key Layout Upgrades

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOP HEADER (Branding, Search, User Quick Profile)                     │
├────────────────────────────────────────────────────────────────────────┤
│ EVENTS VIEW (Mirrors Builds Layout):                                  │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ FEATURED UPCOMING EVENT HERO SPOTLIGHT                             │ │
│ │ [Photo Backdrop]  "NEXT OFFICIAL MEET"  ·  04d : 12h : 38m        │ │
│ │ Title: Angeles Crest Canyon Run & Sunrise Coffee                   │ │
│ │ Location · Date/Time · [RSVP: GOING / INTERESTED] · [Avatars (42)]  │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ [Filter Bar: All Events | Track Days | Meets | Cruises | Dirt/Dune]    │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────┐ │
│ │ Event Card 1         │ │ Event Card 2         │ │ Event Card 3     │ │
│ │ Clean Photo + Title  │ │ Clean Photo + Title  │ │ Clean Photo      │ │
│ │ Date & Location      │ │ Date & Location      │ │ Date & Location  │ │
│ │ [View Event Details] │ │ [View Event Details] │ │ [View Event]     │ │
│ └──────────────────────┘ └──────────────────────┘ └──────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│ MAIN NAVIGATION (UNTOUCHED & UNALTERED AT BOTTOM):                     │
│ [LIVE FEED]       [MY GARAGE]       [BUILDS]       [EVENTS]       [+]  │
└────────────────────────────────────────────────────────────────────────┘
```

```
┌────────────────────────────────────────────────────────────────────────┐
│ VEHICLE DETAILS VIEW:                                                 │
│ [<- Back to Feed]                   [Admin: Feature Build] [Share]    │
│ [HERO GALLERY CAROUSEL WITH FULL RESOLUTION LIGHTBOX]                 │
│                                                                        │
│ OWNER HEADER (Refined):                                               │
│ [Large Avatar]  **COLE FOX**                                          │
│                 Bakersfield, California · Member since 2024           │
│                 (No "@cfox" handle, No "Built By" clutter)             │
│                                                                        │
│ TAB NAVIGATION:                                                        │
│ [ 1. TECHNICAL SHEET ]   [ 2. PHOTOS (12) ]   [ 3. DISCUSSIONS (8) ]  │
│                                                                        │
│ TAB 1 / MAIN CONTENT:                                                  │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ THE STORY BEHIND THIS BUILD (Open-Ended Long Text Body)            │ │
│ │ "Purchased bone-stock in 2021 from a rancher in Oregon. The goal   │ │
│ │ was to build a bulletproof dual-sport prerunner that could handle  │ │
│ │ 80mph desert whoops and drive to work on Monday. Check out the dyno│ │
│ │ pulls at https://youtu.be/example..."                              │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ [Factory Specifications & Modifications Grid]                          │
│                                                                        │
│ MORE BUILDS FROM CAN-AM (Strict Manufacturer Matching):               │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────────┐ │
│ │ Can-Am X3 RS     │ │ Can-Am Defender  │ │ (Empty state if none)    │ │
│ └──────────────────┘ └──────────────────┘ └──────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│ MAIN NAVIGATION (UNTOUCHED & UNALTERED AT BOTTOM):                     │
│ [LIVE FEED]       [MY GARAGE]       [BUILDS]       [EVENTS]       [+]  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Product Decisions & Implementation Steps

### A. Whole Application Polish
1. **Remove All User Handles/Tags (`@...`)**:
   - Audit `mockGarageData.ts`, `garage.ts`, `ActivityFeed.tsx`, `VehicleDetailView.tsx`, `CommunityPollCard.tsx`, and `AddVehicleModal.tsx`.
   - Remove all occurrences of `@username` or `handle` prefixes in owner cards, comment author lines, and modal headers. Show pure author names (`Cole Fox`, `GASCANCO`, `T. Henderson`).
2. **Button Interactivity & Micro-Interactions**:
   - Ensure every button component and interactive link includes active states (`active:scale-[0.98]`), transitions (`transition-all duration-150`), and noticeable hover feedback (`hover:bg-...`, `hover:brightness-110`).
3. **Link & Click Target Verification**:
   - Ensure every author avatar and name navigates to user profiles / garage.
   - Ensure every vehicle mention and thumbnail navigates to `VehicleDetailView`.
   - Ensure external links (Shopify drops, social media, YouTube build videos) open safely with `rel="noreferrer" target="_blank"`.
4. **Bottom Navigation**:
   - Left strictly untouched and unaltered.

### B. Live Feed & Community Polls
1. **Community Poll Card Visual Harmonization**:
   - Refactor `CommunityPollCard.tsx` so its header matches standard activity feed cards:
     - Avatar dimensions: `w-10 h-10` with border.
     - Author name on top with quiet category indicator (no clutter or excessive badge stacks).
     - Standardized outer padding (`p-4 sm:p-5`) and background border colors matching post cards.
2. **Up to 100 Cards Capacity & "View More" Pagination**:
   - Increase internal feed collection limit up to 100 activities.
   - Implement incremental pagination: render the first 15–20 cards with a prominent, styled "VIEW MORE BUILDS & POSTS" button at the bottom of the feed that dynamically reveals the next batch until 100 items are reached.
3. **Chronological Comment Ordering (Bottom-Stacked)**:
   - Ensure all comment lists in the feed and details views order comments chronologically from earliest to newest, with the latest comment at the bottom.
   - Auto-scroll the comment box to the bottom when a new comment is posted.

### C. Vehicle Details Upgrades
1. **"The Story" Long-Form Narrative**:
   - Add optional `story?: string;` property to `Vehicle` interface.
   - Seed authentic backstory narratives across initial vehicles (e.g. desert adventures, engine swap chronicles).
   - Render a dedicated narrative section on `VehicleDetailView` with rich paragraph formatting and automatic URL hyperlinking.
   - Add an open-ended narrative textarea in `AddVehicleModal` (Step 1 or Step 2) and an inline quick-edit option for the vehicle owner.
2. **Refined Owner Signature**:
   - Remove the phrase `"Built By"`.
   - Enlarge the owner avatar (`w-12 h-12` -> `w-14 h-14`), name (`text-lg sm:text-xl font-bold font-['Oswald']`), and location (`text-xs font-mono`).
3. **Conversation Thread Tab**:
   - Add a 3rd tab to the navigation header: `Technical Sheet`, `Photos (count)`, and `Discussions (count)`.
   - Selecting `Discussions` displays the full community conversation thread utilizing the same interactive comment system as the Live Feed (support for likes, replies, and new comments).
4. **Manufacturer Verification in "More Builds"**:
   - Filter `allVehicles.filter(v => v.id !== vehicle.id && v.make.trim().toLowerCase() === vehicle.make.trim().toLowerCase())`.
   - If empty, display a clean, quiet state: `"No other registered builds from [Make] yet. Be the first to add another!"` with a direct "+ Add Build" shortcut.

### D. Events Redesign & Dedicated Event Details
1. **Declutter & Remove Meet Banner**:
   - Delete the `"Planning a Cruise or meet?"` callout container entirely.
   - Clean up duplicate action buttons and unnecessary subtexts.
2. **Mirror Builds Layout with Upcoming Event Hero**:
   - Restructure `EventsView.tsx` to match `CommunityBuildsView.tsx`:
     - Top Hero: The next chronological upcoming event spotlight with dynamic countdown timer (Days : Hours : Minutes), RSVP toggle, and attendee roster preview.
     - Filter Bar: Category filters (`All Meets`, `Track Days`, `Cruises`, `Off-Road / Dunes`, `Cars & Coffee`).
     - Events Grid: Clean cards with 16:9 photography, date badges, location, RSVP count, and a direct click-through to the Event Details page.
3. **New `EventDetailView.tsx` Component**:
   - Full-page detailed view with:
     - Header with back navigation to Events.
     - Marquee event photography with calendar badge and location badge.
     - Host profile card (name and location without `@` handles).
     - Live RSVP buttons (`Going`, `Interested`, `Can't Go`) updating attendee counts.
     - Event schedule, route details, and requirements.
     - Tabbed or dedicated Discussions section for participants to coordinate meetups, radios, and routes.

---

## 4. Technical Architecture & Component Mapping

```
                               ┌──────────────┐
                               │   App.tsx    │
                               └──────┬───────┘
                                      │
         ┌───────────────────┬────────┴────────────┬──────────────────┐
         ▼                   ▼                     ▼                  ▼
┌──────────────────┐ ┌───────────────────┐ ┌───────────────┐ ┌────────────────┐
│   ActivityFeed   │ │ VehicleDetailView │ │  EventsView   │ │EventDetailView │
│ - Up to 100 items│ │ - Story Narrative │ │ - Hero Count  │ │ - Event Header │
│ - View More Btn  │ │ - Discussions Tab │ │ - Builds-Style│ │ - RSVP Actions │
│ - Poll Harmonize │ │ - Exact Make Match│ │ - Clean Grid  │ │ - Discussions  │
│ - Bottom Comments│ │ - Enlarged Owner  │ └───────────────┘ └────────────────┘
└──────────────────┘ └───────────────────┘
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │    Main Bottom Navigation     │
                      │   (UNTOUCHED & UNALTERED)     │
                      └───────────────────────────────┘
```

### State & Handler Strategy
- `App.tsx`:
  - Extend `activeView` to support `{ type: 'event-detail'; eventId: string }`.
  - Provide global event discussion comments state synced with `event.id`.
  - Provide event RSVP toggle handler updating `event.attendeesCount` and user's RSVP status.
  - Extend vehicle update handler to persist the new `story` property across sessions.

---

## 5. Verification Plan

1. **Compilation & Linting**: Run `compile_applet` and `lint_applet` after edits to verify zero TypeScript errors.
2. **Bottom Navigation**: Confirm the bottom navigation bar is identical and intact.
3. **Link Auditing**: Click through every author, vehicle, event, and shop link across the Feed, Builds, Vehicle Details, Events, and Event Details.
4. **Handle Audit**: Verify no instances of `@` handles appear on screen.
5. **Interactive Feedback**: Verify button hover and active scale animations across all views.
6. **Manufacturer Filter**: Test vehicles from different makes (Can-Am, Honda, Porsche, Ford) to verify matching logic and empty states.
7. **Events Workflow**: Test RSVP toggling, event countdown, navigation to Event Details, and posting comments in the Event Discussions tab.
