# Builds Page Aspect Ratios, Feed Deduplication, State Merging & Vehicle Detail Polish

Comprehensive implementation plan to eliminate dead space across Builds and Feed cards via standard 16:10 / 16:9 automotive cropping, suppress redundant "New Vehicle" duplicate cards, merge all location dropdowns into Full US States, add the compact "Community Builders" showcase, and streamline the vehicle detail header.

---

## Confirmed User Specifications

> [!IMPORTANT]
> The following design and architectural choices were confirmed:
> - **Card Aspect Ratio**: Uniform `16:10` / `16:9` automotive landscape crop with `object-cover` across all build cards (grid, featured spotlight, and activity feed vehicle cards) to eliminate pillarboxes and blank empty areas.
> - **Location Grouping**: Merge all location dropdowns into **Full US State names** (e.g. *California*, *Florida*, *Ohio*, *Texas*, *Kentucky*) rather than fragmented city/state strings.
> - **Community Builders Layout**: Compact horizontal cards shrunk to the content width, featuring larger builder avatars, Builder Name, Full State Location, and Build Count (e.g., `2 BUILDS`), removing the `@builder` handles, and capped to 10 builders.
> - **Vehicle Detail Header**: Remove the "Fullscreen" button overlay from the hero photo. Strip out "Nick Name", "Build Intent", and "Category" from the top vehicle title block.
> - **Feed Deduplication**: Suppress redundant / empty "New Vehicle" posts that duplicate the automatic garage registration card.

---

## 1. Technical Architecture & File Changes

```
┌────────────────────────────────────────────────────────────────────────┐
│                              GASCAN CO APP                             │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [ BUILDS & MARKETPLACE VIEWS ]      [ CARD PRESENTATION ]             │
│  DiscoverView.tsx                    VehicleCard.tsx                   │
│  ├── Dynamic Full US States list     ├── Featured Spotlight 16:9/16:10 │
│  ├── Filter by State match           └── Standard Grid Card 16:10      │
│  └── Community Builders Section          └── object-cover, zero dead   │
│      ├── Compact horizontal cards            empty vertical gaps       │
│      ├── Larger avatar thumbnails                                      │
│      └── Name, State, Build Count    [ LIVE ACTIVITY FEED ]            │
│                                      ActivityFeed.tsx                  │
│  [ VEHICLE DETAIL VIEW ]             ├── Deduplicate 'New Vehicle'     │
│  VehicleDetailView.tsx               │   cards from feed generation    │
│  ├── Remove "Fullscreen" overlay     └── Registration Card Crop:       │
│  └── Title header cleanup                16:10 / 16:9 object-cover     │
│      (remove Nickname, Intent, Cat)      (no black pillarbox bars)     │
│                                                                        │
│  [ UTILS: LOCATION NORMALIZATION ]                                     │
│  dateAndLocationUtils.ts                                               │
│  └── extractStateName(loc) -> "California", "Florida", "Ohio", etc.    │
└────────────────────────────────────────────────────────────────────────┘
```

### Proposed Changes

### 1. `src/components/cards/VehicleCard.tsx`
- **Featured Spotlight Variant (`variant === 'featured'`)**:
  - Replace variable unconstrained height (`min-h-[220px] md:min-h-[300px] h-52 sm:h-64 md:h-auto`) with a fixed proportional container `aspect-[16/9]` (or `aspect-[16/10]` on mobile, clamped height on desktop) and `w-full h-full object-cover object-center`.
  - Fix right-hand specs column height so portrait images do not cause the right panel to stretch with empty dead space.
- **Grid Variant (`variant === 'grid' | 'my-garage'`)**:
  - Replace unconstrained `<div className="relative w-full overflow-hidden bg-transparent shrink-0"><img className="w-full h-auto block object-contain" /></div>` with a standardized aspect ratio wrapper:
    `aspect-[16/10] w-full overflow-hidden bg-[#18181a] shrink-0`
  - Style `<img>` as `w-full h-full object-cover object-center` with smooth hover zoom.
  - Ensures every single card in the 3-column / 4-column grid has identical height, perfectly aligning rows and eliminating all vertical whitespace disparities.

### 2. `src/components/common/ActivityFeed.tsx`
- **Registration Card Aspect Ratio**:
  - In `isRegistration` (`act-veh-...` cards), update the image container from `max-h-[560px] object-contain` (which causes wide black bars for portrait photos like the RSX in Screenshot 2) to a standardized `aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-[#161618]`.
  - Set image to `w-full h-full object-cover object-center` to eliminate side and top pillarboxing.
- **Deduplicate "New Vehicle" Feed Cards**:
  - In the `activities` aggregation `useMemo`, add a filter condition:
    Suppress any post item whose title is `"NEW VEHICLE"` or whose content is `"Added a new vehicle"` or which redundantly mirrors a vehicle registration that already exists in the same batch.
  - Prevent duplicate generation so only the rich automatic garage registration card (`[First Name] just added a [Year Make Model Trim] to his garage`) appears.

### 3. `src/utils/dateAndLocationUtils.ts`
- Implement `extractStateName(location?: string): string`:
  - Full two-way dictionary covering all 50 US states (`AL -> Alabama`, `CA -> California`, `FL -> Florida`, `OH -> Ohio`, `KY -> Kentucky`, `WV -> West Virginia`, etc.).
  - Parses comma-delimited strings (`"Pensacola, Florida, United State"` -> `"Florida"`, `"Costa Mesa, CA"` -> `"California"`, `"South Point, OH"` -> `"Ohio"`).
  - Handles standalone state names or abbreviations.
  - Exports helper for consistent state extraction across all components.

### 4. `src/components/views/DiscoverView.tsx` & `src/components/views/MarketplaceView.tsx`
- **Location Filter**:
  - Derive `availableLocations` using `extractStateName`:
    `['All Locations', ...Array.from(new Set(vehicles.map(v => extractStateName(v.owner.location)).filter(Boolean))).sort()]`
  - Match vehicles/items when `selectedLocation === 'All Locations' || extractStateName(v.owner.location) === selectedLocation`.
  - Display full State names like `California`, `Florida`, `Ohio` in the select dropdown.
- **Community Builders Section** (at bottom of `DiscoverView.tsx`):
  - Extract unique builders from `vehicles`, counting their active builds.
  - Limit to 10 randomly sampled/shuffled builders.
  - Render compact horizontal cards:
    - Shrink horizontally to fit content (`inline-flex items-center gap-3 px-3 py-2 bg-[#222222] border border-[#383838] hover:border-[#C8102E]`).
    - Enlarge avatar thumbnail (`w-11 h-11 sm:w-12 sm:h-12`).
    - Display Builder Name (`font-['Oswald'] font-bold uppercase text-white`), Full State Location (`text-[11px] font-mono text-[#999999]`), and Build Count badge (`text-[10px] font-mono text-[#C8102E] font-bold`).
    - Strictly exclude `@builder` handles.
    - Clickable to navigate to builder's garage/profile via `onSelectOwner`.

### 5. `src/components/views/VehicleDetailView.tsx`
- **Remove "Fullscreen" button**:
  - Remove `<button>Fullscreen</button>` overlay element from the main hero image.
- **Vehicle Title Header Block**:
  - Remove `vehicle.category` ("Category") and `vehicle.buildStatus` ("Build Intent") from the top title badge bar.
  - Remove `vehicle.nickname` ("Nick Name") text block.
  - Display clean, prominent headline: `{vehicle.year} {vehicle.make} {vehicle.model}` with back button and admin spotlight button.

---

## 2. Verification & Validation Steps

1. **Builds Page Visual Check**:
   - Verify every card in the grid has identical image height (`aspect-[16/10]`) with zero blank letterboxing/pillarboxing.
   - Verify Spotlight Build at the top maintains a balanced layout without stretching into empty space.
2. **Feed Activity Check**:
   - Check that vehicle registration cards fill the width with crisp `16:10`/`16:9` cropping.
   - Confirm no duplicate "New Vehicle / Added a new vehicle" card appears alongside the registration card.
3. **Location Filter Check**:
   - Check the location dropdown in Builds and Marketplace to verify entries are clean full state names (e.g. *California*, *Florida*, *Ohio*).
   - Selecting a state filters builds correctly.
4. **Community Builders Check**:
   - Inspect the bottom of Builds: cards are compact and horizontal, avatars are enlarged, `@handle` is gone, shows builder name, state, and build count, capped at 10 users.
5. **Vehicle Details Check**:
   - Open any vehicle: verify "Fullscreen" is removed from the photo.
   - Verify top header shows only Year Make Model without Nickname, Build Intent, or Category.
6. **Code Quality**:
   - Run `lint_applet` and `compile_applet` to confirm zero TypeScript and syntax errors.
