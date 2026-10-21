# Mobile Layout, Wrapping Refinements & Vehicle Details Navigation

Comprehensive architectural plan to eliminate text clipping, awkward line breaks, and horizontal scrollbars on mobile devices, alongside introducing a streamlined full-width navigation and dedicated "About the Build" section on mobile vehicle details.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following design choices have been confirmed based on user feedback:
> - **Mobile Tab Navigation Style**: Full-width button bar displaying all options simultaneously (no horizontal scrollbar or clipped tabs).
> - **New Mobile Section Name**: **"About the Build"**, situated before "Photos" on mobile viewports.
> - **Mobile Section Scope**: Houses "The Story Behind This Build", "Builder / Owner Container", "Build Crew & Sponsors", and "More Builds".
> - **Desktop Continuity**: Desktop retains the spacious dual-column layout (Specs & Story in main column, Builder/Crew/Related Builds in sidebar).

---

## 1. Overview & Core Concept

### What It Delivers
1. **App-Wide Mobile Wrapping Resolution**:
   - Fixes cramped author card headers in `CommunityPollCard` and feed post cards where long names, badges, and action buttons squeeze into orphan lines (e.g. orphan bullet `•` dots, vertically split locations, and truncated names).
   - Eliminates clipping on the "SPONSORED" badge in advertisement drops.
   - Converts bulky desktop action buttons (like EDIT/DELETE in mobile post headers) into responsive, high-density icon buttons on small screens.
2. **Zero-Scroll Mobile Vehicle Details Navigation**:
   - Replaces the `overflow-x-auto` tab row with an integrated, full-width 4-button segmented bar that fits 100% of the mobile viewport width.
   - Moves secondary actions (Edit Build, Share) into a clean, dedicated utility bar above or integrated alongside the tabs.
3. **Dedicated "About the Build" Mobile Section**:
   - On mobile, extracts the long-form Story, Builder Profile, Crew & Sponsors list, and Related Manufacturer Builds into a dedicated tab before "Photos":
     `[ Technical Sheet ] [ About the Build ] [ Photos ] [ Discussions ]`
   - Keeps the desktop view intact with its sidebar layout.

---

## 2. User Experience & Visual Design

### Mobile Navigation Structure (Vehicle Details)
```
┌─────────────────────────────────────────────────────────────┐
│ ‹ Back to Builds                               [Share] [Edit]│
│ 1999 NISSAN SKYLINE GT-R                                    │
│ [=================== HERO PHOTO CAROUSEL ==================]│
├─────────────────────────────────────────────────────────────┤
│  FULL-WIDTH SEGMENTED MOBILE BUTTON BAR (All 4 visible)    │
│ ┌──────────────┬──────────────┬──────────────┬─────────────┐│
│ │ ⚙️ Specs     │ 📖 About     │ 📷 Photos(4) │ 💬 Chat(12) ││
│ └──────────────┴──────────────┴──────────────┴─────────────┘│
├─────────────────────────────────────────────────────────────┤
│ TAB CONTENT AREA:                                           │
│ - Tab 1 [Specs]: Complete Factory & Build Spec Table        │
│ - Tab 2 [About the Build]:                                  │
│     • The Story Behind This Build (Markdown & Links)        │
│     • Builder Profile Card (Avatar, Location, Member Since) │
│     • Build Crew & Sponsors (Verified partners & links)     │
│     • More Builds from Manufacturer                         │
│ - Tab 3 [Photos]: Responsive Photo Grid & Lightbox          │
│ - Tab 4 [Discussions]: Threaded Community Conversation       │
└─────────────────────────────────────────────────────────────┘
```

### Visual & Layout Adjustments by Component
- **Standard Feed Posts (`ActivityFeed.tsx`)**:
  - Author meta row uses `whitespace-nowrap` for `${location} • ${date}` so bullets never drop to lonely lines.
  - Action buttons (`Edit`, `Delete`) collapse to compact icon buttons (`p-1.5`) on `< sm` viewports and expand to text + icon on `sm:`.
  - Author name flexes with `min-w-0` and graceful typography scaling.
- **Community Poll Cards (`CommunityPollCard.tsx`)**:
  - Re-architects header layout for mobile:
    - Author avatar + name + ADMIN badge take primary row.
    - Category pill (`ENGINE TECH & TRACK`) and admin toggles adjust gracefully on mobile so they don't crush the author's name.
- **Advertisement Drops**:
  - Title and "SPONSORED" label wrap with `flex-wrap sm:flex-nowrap`, guaranteeing the red "SPONSORED" tag has protected right margin and zero character truncation.
- **Vehicle Detail Tab Bar**:
  - Replaces `overflow-x-auto` with a clean `grid grid-cols-4` on mobile, transitioning to an inline flex row on `sm:` and desktop.
  - Active tab uses distinct high-contrast red accent (`bg-[#C8102E] text-white` or `border-b-2 border-[#C8102E] text-[#C8102E]`), tactile press effect (`active:scale-[0.98]`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Width 4-Tab Button Bar vs. Dropdown**:
  - *Chosen Approach*: 4-button segmented grid bar.
  - *Why*: Allows single-tap instant access across all sections without hiding options behind a select modal or dropdown. The 4 tab labels ("Specs", "About", "Photos", "Chat") fit comfortably across 360px+ mobile screens.
- **Decision 2: Mobile "About the Build" Tab vs. Desktop Dual-Column**:
  - *Chosen Approach*: Conditional rendering based on viewport and tab state:
    - On desktop (`lg:block`), the sidebar continues displaying the Owner Card, Crew & Sponsors, and More Builds, while the main column shows Technical Sheet & Story.
    - On mobile (`lg:hidden`), these 4 sections are grouped exclusively inside the "About the Build" tab, keeping the "Specs" tab clean and lightweight.
- **Decision 3: Mobile Action Buttons in Feed Headers**:
  - *Chosen Approach*: Icon-only buttons with tooltips on mobile screens under 640px.
  - *Why*: Prevents text buttons ("EDIT", "DELETE") from consuming 140px of horizontal width and squeezing user names and locations.

---

## 4. Technical Architecture & Component Mapping

```
┌──────────────────────────────────────────────────────────────┐
│                    GasCanCo Mobile Layout                    │
├──────────────────────────────────────────────────────────────┤
│ ActivityFeed                                                 │
│ ├─ FeedPostCard Header (Responsive flex layout, icon buttons)│
│ ├─ AdvertisementCard (Unconstrained title & pinned badge)    │
│ └─ CommunityPollCard (Re-ordered header & adaptive actions)  │
├──────────────────────────────────────────────────────────────┤
│ VehicleDetailView                                            │
│ ├─ Mobile Utility Row (Share & Edit actions cleanly placed)  │
│ ├─ FullWidthTabBar (grid grid-cols-4 on mobile, no scrollbar)│
│ ├─ Tab 1: Specs (Technical Sheet table only)                 │
│ ├─ Tab 2: About the Build (Story + Owner + Crew + Related)   │
│ ├─ Tab 3: Photos (Gallery & Lightbox)                        │
│ ├─ Tab 4: Discussions (Threaded Comments)                    │
│ └─ Desktop Sidebar (Rendered on lg:block only)               │
└──────────────────────────────────────────────────────────────┘
```

### Component State & Props
- `activeTab`: Extended from `'specs' | 'photos' | 'discussion'` to `'specs' | 'about' | 'photos' | 'discussion'`.
- On desktop, clicking `'specs'` displays specifications, while `'about'` displays the narrative; desktop sidebar remains consistently visible on `lg:` viewports.
- On mobile, clicking `'about'` renders all 4 requested containers in vertical rhythm before photos.
