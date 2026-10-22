# Live Feed Refresh, Builds Grid Overhaul & Database Standardization

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during Phase 1:
> - **Builds Page Card Layout**: Vehicle Year, Make & Model arranged on the left side with larger typography, and Builder Name & Location aligned to the right side.
> - **Live Feed Registration Cards**: Simplified announcement format ("[User First Name] just added a [Year Make Model] to their garage") with full-width uncropped vehicle photo, stripping out duplicate titles, categories, and technical specs dumps.
> - **Location Formatting**: Standardized `City, State` database sourcing with auto-normalization to prevent typos and deduplicate city/state filters.
> - **Navigation Bar Order**: Reordered to strictly `Live` → `Builds` → `Add` → `Events` → `My Garage`.

---

## 1. Overview & Core Concept

This update refines the primary social and browsing surfaces across the Gascan Co. automotive community platform:
1. **Live Activity Feed**: Uncropped photography in all feed items, natural relative timestamps ("2 Minutes Ago"), and streamlined vehicle registration cards that read like social updates.
2. **Mobile & Desktop Navigation**: Reordering the bottom navigation bar to `Live` · `Builds` · `Add` · `Events` · `My Garage` without altering other styling or functionality.
3. **User Profile & Registry**: Updating "Member Since" formatting to written-out Month & Year (`October 2026`) and standardizing user/vehicle locations in the database.
4. **Builds Page**: Removing "Community Builders" on mobile screens, displaying full uncropped vehicle photos in each card, increasing typography size, and balancing Year/Make/Model on the left with Builder/Location on the right.

---

## 2. User Experience & Visual Design

### A. Live Feed Photo Presentation & Relative Timestamps
- **Uncropped Media**: Replace fixed aspect ratios and `object-cover` cropping with responsive `object-contain w-full max-h-[520px] bg-[#141414]`, ensuring the entire vehicle, wheel setup, and photo framing is visible.
- **Relative Time Format**: Replace static date strings with human-friendly elapsed time badges:
  - `< 1 min`: "Just Now"
  - `1 - 59 mins`: "N Minutes Ago"
  - `1 - 23 hrs`: "N Hours Ago"
  - `1 day`: "Yesterday" or "1 Day Ago"
  - `2 - 6 days`: "N Days Ago"
  - `1 - 3 weeks`: "N Weeks Ago"
  - `1 - 11 months`: "N Months Ago"
  - `1+ years`: "N Years Ago"

### B. Simplified Automatic Registration Cards
- **Announcement Text**: Clean, unboxed bold announcement:
  `"[First Name] just added a [Year] [Make] [Model] to their garage."`
- **Removed Elements**: Suppress category badges, specs dumps (engine, transmission, drivetrain specs strings), and duplicate header text.
- **Card Flow**: Author Header (Avatar, Name, Location • Relative Time) → Clear Social Headline → Full Uncropped Vehicle Showcase → Interactive Reactions & Comments.

### C. Builds Page Grid & Card Redesign
- **Uncropped Photography**: Vehicle cards utilize `object-contain w-full aspect-[4/3] sm:aspect-[16/10] bg-[#181818]` to prevent wheel/spoiler clipping.
- **Enlarged Left/Right Card Body**:
  - **Left**: Bold uppercase Year Make Model (`text-base sm:text-lg font-['Oswald']`) with Trim below (`text-xs sm:text-sm font-mono text-[#aaaaaa]`).
  - **Right**: Builder Name (`text-sm sm:text-base font-['Oswald'] text-[#e0e0e0]`) and Location with MapPin icon (`text-xs sm:text-sm font-mono text-[#888888]`).
- **Mobile Clutter Elimination**: "Community Builders" / builder sidebar showcase hidden on mobile (`hidden sm:block`) so mobile users dive directly into the builds grid.

### D. Navigation Bar Order
- Update `MobileBottomNav.tsx` order strictly to:
  1. **Live** (`Activity`)
  2. **Builds** (`SlammedTruckIcon`)
  3. **Add** (Center Crimson Plus Button)
  4. **Events** (`Calendar`)
  5. **My Garage** (`Wrench`)

### E. Location Database Standardization
- Structured auto-formatting for City and State (e.g., `Costa Mesa, CA`).
- Searchable city/state auto-suggest or structured selection in `AddVehicleModal` and `MyGarageView` profile editing to prevent typos like `costa mesa ca` or `Costa Mesa California`.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Uncropped Photos vs. Uniform Card Heights**
  - *Chosen Approach*: Card media containers maintain consistent frame boundaries with subtle letterboxing/pillarboxing (`bg-[#141414]` and `object-contain`), ensuring every custom bumper, roof rack, and wheel fitment is 100% visible without breaking grid rhythm.
  - *Why*: Automotive enthusiasts care deeply about full vehicle proportions; cropping cuts off wheels and aero.
- **Decision 2: Automatic Registration Card Streamlining**
  - *Chosen Approach*: Convert dense technical specification cards in the feed into punchy social announcement cards. Users who want technical specs can tap the vehicle to view the full Technical Sheet.
  - *Why*: Enhances feed scannability and prevents repetitive duplicate headers.
- **Decision 3: Location Sourcing**
  - *Chosen Approach*: Implement a normalization utility (`normalizeCityState`) combined with curated US metropolitan suggestions to keep database queries consistent across all views and filters.

---

## 4. Technical Architecture & Component Structure

```
┌────────────────────────────────────────────────────────────────────────┐
│                             GASCAN CO APP                              │
├────────────────────────────────────────────────────────────────────────┤
│ Header: Wordmark · Store Links · Cart · Add Vehicle                    │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [ LIVE FEED VIEW ]               [ BUILDS GRID VIEW ]                 │
│  ActivityFeed.tsx                 DiscoverView.tsx                     │
│  ├── Relative Timestamp Helper    ├── Mobile: Builders hidden          │
│  ├── Uncropped Photos (contain)   └── VehicleCard.tsx                  │
│  │   └── Max-h container              ├── Uncropped photo              │
│  └── Registration Card Format         └── Left: Year Make Model        │
│      └── "[User] added [Vehicle]"         Right: Builder & Location    │
│                                                                        │
│  [ MY GARAGE VIEW ]               [ NAVIGATION ]                       │
│  MyGarageView.tsx                 MobileBottomNav.tsx                  │
│  ├── Member Since: Month & Year   └── Reordered Buttons:               │
│  └── City & State Normalizer          1. LIVE                          │
│                                       2. BUILDS                        │
│  [ DATA LAYER ]                       3. ADD (+)                       │
│  src/utils/dateAndLocationUtils.ts    4. EVENTS                        │
│  ├── formatTimeAgo()                  5. MY GARAGE                     │
│  ├── formatMemberSince()                                               │
│  └── normalizeCityState()                                              │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Component & File Mapping

1. `src/utils/dateAndLocationUtils.ts`:
   - `formatTimeAgo(dateStrOrTimestamp: string | number): string`
   - `formatMemberSince(dateStr?: string): string`
   - `normalizeCityState(input: string): string`
   - Curated `POPULAR_US_CITIES` list for location auto-completion.
2. `src/components/common/ActivityFeed.tsx`:
   - Integrate `formatTimeAgo()` across feed items.
   - For `type === 'build_update'`, render simplified "[First Name] just added a [Year Make Model] to their garage" card.
   - Update all image containers (`post`, `event`, `build_update`) to `object-contain` without cropping.
3. `src/components/navigation/MobileBottomNav.tsx`:
   - Rearrange button JSX order: `Live` → `Builds` → `Add` → `Events` → `My Garage`.
4. `src/components/views/MyGarageView.tsx`:
   - Display `Member since {formatMemberSince(currentUser.memberSince)}`.
   - Incorporate normalized location selection.
5. `src/components/views/DiscoverView.tsx`:
   - Hide "Community Builders" spotlight/sidebar on mobile screens (`hidden sm:block`).
6. `src/components/cards/VehicleCard.tsx`:
   - Update `variant="grid"` to display full uncropped photo (`object-contain`).
   - Increase text size and split layout: Left side (Year Make Model + Trim), Right side (Builder Name + Location).
   - On mobile, hide builder name if mobile builder hiding applies.
