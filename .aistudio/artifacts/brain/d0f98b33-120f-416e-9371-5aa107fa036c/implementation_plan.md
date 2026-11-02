# Feed Card Standardization, Vehicle Updates & Crew Management, and Layout Polish

A targeted polish and refinement plan to standardize Live Feed update cards to match post cards (text top, full-width photo below), eliminate duplicate vehicle titles, enable complete edit and delete workflows for Vehicle Updates and Build Crew via modal dialogs, remove redundant filter text on Builds & Rides, and eradicate duplicate sidebar sections in Vehicle Details.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and user experience decisions have been aligned and confirmed:

- **Confirmed Decision 1 (Edit Experience)**: Vehicle Updates and Build Crew members will feature intuitive modal popups for editing text, roles, links, and photos, matching the desktop and mobile modals used across Gascanco.
- **Confirmed Decision 2 (Sidebar Redundancy Removal)**: Redundant duplicate right-hand sidebar sections ("About this [Model]" and "Build Crew & Sponsors") on the Updates tab and other secondary tabs will be removed. Full-width focus is given to updates, specs, and gallery, while the "About & Crew" tab serves as the single authoritative home for owner bio, crew/sponsors, and the vehicle story.
- **Confirmed Decision 3 (Feed Card Hierarchy)**: Feed update cards will be standardized so they no longer split side-by-side on desktop. All feed cards will lead with author header, clean text context on top, full-width photo container below, and a single bottom vehicle tag with Car icon, removing the redundant top-right title.

---

### 1. Overview & Core Concept

- **What It Does**:
  1. **Standardized Live Feed Cards**: Replaces the awkward 2-column side-by-side layout on build updates with a unified vertical layout: author header $\to$ text notes (with expandable "Click to expand" for long updates) $\to$ full-width uncropped media container $\to$ bottom footer with vehicle tag and interaction counters.
  2. **Zero Duplicate Vehicle Titles**: Strips the duplicate vehicle name from the top-right header of feed cards, keeping only the prominent bottom vehicle button.
  3. **Edit & Delete for Vehicle Updates**: Adds edit (pencil) and delete (trash) buttons to all vehicle update entries. Clicking edit opens a modal to adjust the date, title, work notes, and attached photo.
  4. **Edit & Delete for Build Crew & Sponsors**: Adds an edit button alongside the existing delete button on crew/sponsor cards, opening a modal to edit name, role, partner URL, and classification.
  5. **Clean Filter UI on Builds & Rides**: Removes the `SHOWING [X] BUILDS · ...` indicator line beneath the category and location dropdowns.
  6. **Eradication of Duplicate Sections in Vehicle Details**: Eliminates the secondary sidebar duplicate blocks that caused "About this [Model]" and "Build Crew & Sponsors" to render repeatedly.
- **Target Audience / Persona**: Automotive builders, shop owners, and community members logging parts, showing off stances, and inspecting build logs without visual clutter.
- **Key Value**: Cohesive feed browsing, streamlined mobile/desktop responsiveness, and effortless editing of build history and crew credits.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Live Feed Browsing**:
   - Every card follows an identical vertical rhythm: Author avatar & name on top left $\to$ text body $\to$ full-width uncropped photo display $\to$ footer bar with tagged vehicle on the left and reaction buttons on the right.
   - Long update notes gracefully truncate at 3 lines with a clean `Click to expand` text button.
2. **Editing a Vehicle Update**:
   - In Vehicle Details $\to$ Updates tab, each update card displays `Edit` and `Delete` action buttons for the vehicle owner and admins.
   - Clicking `Edit` opens a dark-themed modal (`#171719` container, `#C8102E` accent) pre-filled with the update title, date, notes, and current photo preview.
   - User can modify notes, replace the photo via drag-and-drop or file upload, and save. The changes immediately update in state.
3. **Editing a Build Crew Member / Sponsor**:
   - In Vehicle Details $\to$ About & Crew tab, each crew card displays `Edit` and `Delete` buttons.
   - Clicking `Edit` opens a modal pre-populated with Name, Role, Type (Shop, Crew, Sponsor, Parts Manufacturer), and Website URL.
4. **Discover View (Builds & Rides)**:
   - Filter bar with Category, Location, and Search sits directly above the responsive vehicle grid without the redundant `SHOWING [X] BUILDS` text bar.

#### Visual Identity & Theme
- **Theme**: Dark industrial garage aesthetic (`#171719` dominant canvas, `#242426` elevated cards, `#C8102E` Gascanco crimson accent).
- **Typography**:
  - `Oswald`: Vehicle titles, section headings, and action buttons.
  - `Inter`: Body prose, build notes, and tabular metadata.
  - `La Raptida`: Exclusive Gascanco wordmark branding.
- **Anti-Slop Compliance**:
  - Unboxed metadata with typographic dots (`·`).
  - No pill badge sandwiches or decorative pulsing dots.
  - Clean hairline borders (`border-[#38383a]`) with no thick left colored accent bars.

---

### 3. Key Product Decisions & Trade-Offs

- **Standardized Feed Layout**:
  - *Chosen Approach*: Unify all feed cards to vertical text-over-photo structure.
  - *Why*: The split 7/5 column layout caused photos to look tiny and cropped on tablets and desktops, breaking visual rhythm across the feed.
  - *Alternatives Considered*: Keeping side-by-side for milestone updates—rejected as it broke visual consistency and caused text squishing.
- **Dedicated Edit Modals**:
  - *Chosen Approach*: Modal popups for updating vehicle updates and crew members.
  - *Why*: Keeps cards clean and uncluttered; prevents layout shifts and gives ample space for photo drag-and-drop replacement.
- **Sidebar Elimination on Non-About Tabs**:
  - *Chosen Approach*: On the Updates tab, render a clean, focused layout without the redundant sidebar; keep owner, crew, and vehicle story exclusively inside the "About & Crew" tab.
  - *Why*: Resolves the exact issue highlighted in Screenshot 2 where the user saw multiple identical "About this Integra" and "Build Crew" cards on the same screen.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                          App.tsx                            │
│  - vehicles: Vehicle[]                                      │
│  - communityPosts: Post[]                                   │
│  - onUpdateVehicle (persists updates, mods, crew changes)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌──────────────────────────────┐    ┌──────────────────────────────┐
│       ActivityFeed.tsx       │    │    VehicleDetailView.tsx     │
│  - Full-width media layout   │    │  - Full-width Updates tab    │
│  - Single bottom vehicle tag │    │  - Edit & Delete Update Modal│
│  - Edit & Delete feed actions│    │  - Edit & Delete Crew Modal  │
└──────────────────────────────┘    └──────────────────────────────┘
            │                                     │
            ▼                                     ▼
┌──────────────────────────────┐    ┌──────────────────────────────┐
│       DiscoverView.tsx       │    │     Single Authoritative     │
│  - Remove count bar below    │    │      About & Crew Tab        │
│    category & location filter│    │  - No redundant right column │
└──────────────────────────────┘    └──────────────────────────────┘
```

#### State & Handler Mappings
1. **`VehicleDetailView.tsx`**:
   - `handleEditVehicleUpdate(updateId, updatedData)`: Updates `vehicle.buildUpdates` array, closes modal, and invokes `onUpdateVehicle`.
   - `handleDeleteVehicleUpdate(updateId)`: Prompts confirmation, filters out the update from `vehicle.buildUpdates`, and invokes `onUpdateVehicle`.
   - `handleEditShoutout(crewId, updatedData)`: Updates `vehicle.crewAndSponsors` array and calls `onUpdateVehicle`.
   - `activeTab` rendering logic: On `activeTab === 'updates'` and `activeTab === 'photos'`, use full-width grid layout without rendering the redundant right sidebar column.
2. **`ActivityFeed.tsx`**:
   - Adjust lines 965-980: Remove top-right duplicate vehicle button for `act.type !== 'post'`.
   - Adjust lines 1273-1320: Replace 12-column split with stacked text $\to$ full-width photo.
3. **`DiscoverView.tsx`**:
   - Remove lines 283-291 (`Count Bar`).
