# Gascanco Garage: UX, Navigation, Typography & Vehicle Details Refinement

Comprehensive implementation blueprint to purge AI capabilities, standardize brand typography, restructure bottom navigation with a social Share modal, split Vehicle Details into a pure Photos gallery and an Update feed with automatic parts integration, and streamline mobile layout ergonomics.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product decisions were confirmed during Phase 1 clarification:
> - **Share Behavior**: Native share modal combining the Web Share API with quick 1-click copy-link and direct social buttons (X/Twitter, Facebook, WhatsApp, SMS/iMessage).
> - **Vehicle Updates & Mods**: When posting a vehicle update, an optional "Installed a new part / modification" toggle allows users to specify part details that automatically populate into "Modifications & Parts".
> - **Bottom Navigation Sequence**: Exactly 5 evenly spaced, thumb-friendly items: `Live Feed` → `Builds & Rides` → `ADD` (prominent raised center button) → `My Garage` → `Share`.

---

## 1. Overview & Core Concept

- **What It Does**: Refines Gascanco Garage into a focused, human-crafted automotive enthusiast platform. Purges all AI and generative endpoints, establishes a disciplined typographic hierarchy (Inter, Oswald, La Raptida/racing branding), balances the bottom navigation with a central Add button and a community growth Share modal, and reorganizes vehicle profiles into a dedicated 2-column swipeable photo gallery, a chronological build update feed with auto-mod logging, and reordered story sections.
- **Target Audience**: Automotive, truck, SXS, and motorcycle builders, garage hobbyists, and Gascanco community members browsing on mobile and desktop.
- **Key Value**: Crisp performance, zero AI gimmicks, intuitive mobile touch ergonomics, and authentic builder documentation.

---

## 2. User Experience & Visual Design

### A. Navigation & Social Share Flow
- **5-Slot Bottom Navigation**:
  - Slot 1: **Live Feed** (`Activity` icon)
  - Slot 2: **Builds & Rides** (`SlammedTruckIcon` icon)
  - Slot 3: **ADD** (Prominent raised circular center button in `#C8102E`, elevated `-mt-6`)
  - Slot 4: **My Garage** (`Wrench` icon)
  - Slot 5: **Share** (`Share2` icon)
- **Share App Experience**:
  - Tapping **Share** triggers a high-impact community invite modal.
  - Automatically attempts `navigator.share` on compatible mobile browsers (iOS Safari, Android Chrome) with rich title and URL.
  - Modal provides:
    - 1-click **Copy Invite Link** with instant visual feedback and toast confirmation.
    - Social share buttons for **X / Twitter**, **Facebook**, **WhatsApp**, and **SMS / iMessage**.
    - Clean dark aesthetic styled to match Gascanco branding.

### B. Typography Standardization
- **Body & App Interface (Inter)**: Navigation labels, vehicle descriptions, comments, spec sheets, user bios, and form inputs.
- **Headlines & Figures (Oswald)**: Vehicle titles, horsepower numbers, section headers, badge tags, and prominent numbers.
- **Branding (La Raptida / Racing Identity)**: Custom branded font family (`"La Raptida", "La Rapida", "Barlow Condensed", sans-serif`) with italic racing skew for Gascanco brand marks and logos.

### C. Builds & Rides Community Builders
- Shuffles the unique builder community dynamically and selects **10 random builders** on mount, giving equal discovery spotlight to all active builders in the registry.

### D. Vehicle Details Experience: Photos & Updates Split
- **Tabs Restructured**:
  1. `Build Sheet` (Hero spec badges, factory specs, and "Modifications & Parts")
  2. `Photos` (Pure photo gallery)
  3. `Updates` (Chronological build log & timeline)
  4. `About` (Owner, Crew & Sponsors, and "About this [Model]")
  5. `Q&A` (Threaded builder discussion)
- **Modifications & Parts**:
  - Renamed from "Modifications & Build Checklist" to **"Modifications & Parts"**.
  - Subtext removed for clean, focused minimalism.
  - Category buttons (`All`, `Engine & Performance`, `Suspension & Chassis`, etc.) wrap responsively on mobile (`flex flex-wrap gap-2`) to prevent cutoff.
- **Pure Photo Gallery (Photos Tab)**:
  - Clean **2-column layout** (`grid grid-cols-2 gap-3 sm:gap-4`).
  - **Zero text or badges** on the photos—pure visual focus on the vehicles.
  - Tapping any photo opens the **full-screen lightbox** with touch swipe left/right (`onTouchStart`, `onTouchMove`, `onTouchEnd`), desktop arrow buttons, and a photo counter (`[3 / 12]`).
- **Vehicle Update Feed (Updates Tab)**:
  - Dedicated feed of chronological vehicle updates.
  - "Post Update" button opens the update form.
  - Optional toggle: **"Includes a new part / modification"**. When toggled, reveals category, brand, and part name fields. Upon submission, the update is logged, the part is added to "Modifications & Parts", and a matching post is broadcast to the Live Feed.
- **About Tab Reordering**:
  1. **User / Owner** Profile Signature
  2. **Build Crew & Sponsors** (Fabricators, tuners, and partners)
  3. **"About this [Vehicle Model]"** (Renamed from "The Story Behind This Build", featuring rich builder narrative)

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Why & Alternatives Considered |
| :--- | :--- | :--- |
| **Purging AI Capabilities** | Completely remove Gemini endpoints (`/api/generate-image`), `@google/genai` imports, and AI cover generator tabs. | Explicit user directive to eliminate AI features; restores 100% human-crafted authenticity and removes external API quota friction. |
| **Bottom Nav Center Add & Share** | 5 buttons with raised center ADD button and right-aligned Share. | Creates a symmetrical mobile thumb zone with primary creation in the center and viral growth invite on the right. |
| **Touch Swipe in Lightbox** | Native pointer/touch event delta calculation without heavy external libraries. | Eliminates unnecessary npm dependencies, guarantees zero bundle bloat, and provides instant 60fps swipe response on iOS and Android. |
| **Auto-Mod Integration** | Checkbox in vehicle update form to automatically append to `vehicle.modifications`. | Seamless builder workflow: logging an install automatically updates the build sheet without double-entry. |

---

## 4. Technical Architecture & Component Structure

```
┌────────────────────────────────────────────────────────────────────────┐
│                               App.tsx                                  │
│   ├── State: vehicles, posts, activeView, isShareModalOpen             │
│   ├── Handlers: handleBuildUpdateAdded (auto-mod & live feed sync)     │
│   └── Top Header + MobileBottomNav (5 items)                           │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼                                 ▼
┌─────────────────────────────────────┐  ┌────────────────────────────────┐
│        MobileBottomNav.tsx          │  │       ShareAppModal.tsx        │
│  [Feed] [Builds] [ADD] [Garage] [★] │  │  Native Share / Copy Link /    │
│            (center raised)  (share) │  │  Twitter, FB, WhatsApp, SMS    │
└─────────────────────────────────────┘  └────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       VehicleDetailView.tsx                            │
│  ├── Tab 1: Build Sheet -> "Modifications & Parts" (wrapping buttons)   │
│  ├── Tab 2: Photos -> Clean 2-column grid + Swipeable Lightbox Modal   │
│  ├── Tab 3: Updates -> Update feed + New Update Form with Mod Toggle   │
│  ├── Tab 4: About -> 1. User -> 2. Crew/Sponsors -> 3. About [Model]   │
│  └── Tab 5: Q&A -> Threaded community comments                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Verification & Testing Plan

1. **AI Capability Removal**: Verify that no `/api/generate-image` route, `@google/genai` imports, or AI prompts exist in the codebase.
2. **Typography Check**: Ensure `Inter` is active on body text, descriptions, comments, and specs; `Oswald` on titles, headings, and horsepower; and `La Raptida` styling on Gascanco logos.
3. **Bottom Navigation & Share**:
   - Verify all 5 navigation buttons navigate correctly.
   - Tap Share: verify native share invocation when available, and test Copy Link, Twitter, Facebook, WhatsApp, and SMS modal buttons.
4. **Builds & Rides**: Verify that "Community Builders" selects 10 randomized builders without duplication.
5. **Vehicle Details**:
   - Check "Modifications & Parts" title, subtext absence, and button wrapping on mobile.
   - Verify Photos tab: pure 2-column photos, zero text overlays, and touch-swipe left/right in full screen.
   - Verify Updates tab: post update with part toggle, verify part shows up in "Modifications & Parts" and on Live Feed.
   - Verify About tab order: User → Crew & Sponsors → "About this [Model]".
6. **Compilation**: Run `tsc --noEmit` and `npm run build` to guarantee clean compilation.
