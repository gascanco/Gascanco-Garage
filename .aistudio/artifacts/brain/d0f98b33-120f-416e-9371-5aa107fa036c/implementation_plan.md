# Modal State Fix, Custom Reactions & Social Sharing Overhaul

Comprehensive plan to resolve form input persistence across all creation/edit modals, upgrade the reaction toast system to "Kickass" / "Not Cool" with matching iconic glyphs, implement Facebook & social garage sharing with customized copy, and ensure automatic feed cards render full vehicle details and owner first names.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during Phase 1:
> - **Modal Form Scope**: All modal forms—Vehicle Registration, Community Posts, Meets & Events, and Polls—will be hardened against unexpected state wipes so user input never vanishes during typing or photo upload.
> - **Reaction Notification Style**: When clicking the like icon, replace the generic toast with **"Kickass"** accompanied by the crimson Love-You gesture glyph (🤟). When clicking dislike, show **"Not Cool"** accompanied by the thumbs-down glyph (👎).
> - **Garage Sharing Experience**: Provide a dedicated social share sheet with one-click direct Facebook share intent pre-filled with `"Check out [User's first name]'s Garage on Gascanco."`, alongside native Web Share API and formatted clipboard copying.
> - **Feed Automatic Registration Cards**: Strictly ensure automatic cards populate with the owner's first name and complete vehicle information (e.g. `"Sean just added a 1994 Mazda RX-7 FD to his garage"`).

---

## 1. Overview & Core Concept

1. **Modal Form Input Stability**: Fix the root cause in `AddVehicleModal.tsx` and feed post modals where broad dependency arrays in `useEffect` or unkeyed component re-renders reset local state (`make`, `model`, `content`, `photos`) on input events or asynchronous image reading.
2. **Branded Micro-Reactions ("Kickass" & "Not Cool")**: Upgrade the application's global toast notification system in `App.tsx` from generic plain text (`"Updated"` / `"Marked thumbs-down"`) to distinct automotive enthusiast feedback featuring the hand-crafted Love-You SVG glyph and thumbs-down icons.
3. **Personalized Social Garage Sharing**: In `MyGarageView.tsx`, enhance the Share action to open a modal/sheet offering Facebook sharing (`facebook.com/sharer/sharer.php?quote=...`), Web Share API integration, and clean link copying formatted with the owner's first name.
4. **Automatic Vehicle Registration Cards**: Refine the card generator and presentation layer in `ActivityFeed.tsx` to reliably extract the builder's first name and full vehicle specification (Year, Make, Model, Trim) with proper phrasing.

---

## 2. User Experience & Visual Design

### A. Modal Input Persistence & Smooth Media Uploads
- **Zero Input Loss**: Typing in text fields, switching focus, or uploading multiple images in Vehicle, Post, Event, or Poll forms will never trigger an accidental state reset.
- **Immediate Visual Staging**: Uploaded photos appear in real time with remove/reorder affordances without clearing accompanying text descriptions or spec inputs.
- **Initial Mode Lock**: The modal will only initialize default state on opening transitions (`isOpen: false -> true`), never while the user is actively working inside it.

### B. "Kickass" & "Not Cool" Reaction Notifications
- **"Kickass" Toast**:
  - Icon: Crimson Love-You hand gesture (🤟) matching the like button style.
  - Typography: Bold `font-['Oswald'] tracking-wide` uppercase with accompanying subtext or icon badge.
  - Duration: 2.5s smooth fade and slide in the lower-right desktop corner (above bottom nav on mobile).
- **"Not Cool" Toast**:
  - Icon: Subtle muted slate / amber Thumbs-Down (👎).
  - Copy: `"Not Cool"`.

### C. Social Garage Sharing Sheet
- **Trigger**: Tapping the "Share" button on any user's garage profile.
- **Display**: A clean, dark-mode overlay matching Gascanco's industrial design language (`#242426` background, `#38383a` border, crimson accents):
  - **Header**: `"Share [Name]'s Garage"`.
  - **Preview Quote**: `"Check out Sean's Garage on Gascanco."` with canonical URL.
  - **Action 1: Facebook Share**: Direct link to Facebook's feed dialog with the pre-filled message and preview.
  - **Action 2: Copy Link & Text**: Copies both the formatted message and direct URL to the clipboard with instant checkmark feedback.
  - **Action 3: Device Share (if supported)**: Invokes native iOS / Android share drawer.

### D. Automatic Feed Registration Cards
- **Announcement Format**:
  `"[Owner First Name] just added a [Year] [Make] [Model] [Trim] to his garage."`
- **Typography & Styling**:
  - Owner First Name highlighted in `#C8102E` bold Oswald font.
  - Vehicle details highlighted in crisp white font.
  - Full uncropped vehicle photo displayed below with zero aspect clipping.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Guarding Modal Initialization with a Transition Ref**
  - *Chosen Approach*: Track `prevIsOpenRef` and only initialize form values when `isOpen` flips from `false` to `true`, or when `editingVehicle?.id` explicitly changes.
  - *Why*: Prevents re-render cascades from parent state updates (such as location updates, timer intervals, or prop changes) from clearing user input midway through form entry.
- **Decision 2: Rich Toast Payload in `App.tsx`**
  - *Chosen Approach*: Expand `toastMessage` state from string-only to `{ message: string; iconType?: 'kickass' | 'not_cool' | 'check' | 'trash' }`.
  - *Why*: Allows any view (Feed, Vehicle Detail, Garage) to trigger the correct branded icon alongside the message.
- **Decision 3: Dedicated Social Share Dialog vs. Silent Clipboard Copy**
  - *Chosen Approach*: When tapping "Share", offer a dedicated social modal featuring Facebook sharing, copy link, and native mobile sharing.
  - *Why*: Direct Facebook web intent requires user navigation to Facebook's sharer URL; clipboard alone doesn't satisfy social media sharing workflows.

---

## 4. Technical Architecture & Component Mapping

```
┌────────────────────────────────────────────────────────────────────────┐
│                              GASCAN CO APP                             │
├────────────────────────────────────────────────────────────────────────┤
│ App.tsx: Global Toast System (iconType: 'kickass' | 'not_cool')        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [ ADD / EDIT MODALS ]               [ LIVE ACTIVITY FEED ]            │
│  AddVehicleModal.tsx                 ActivityFeed.tsx                  │
│  ├── PrevIsOpenRef guarding          ├── Automatic Registration Cards  │
│  ├── Vehicle Form (No text loss)     │   └── "[First Name] just added  │
│  ├── Community Post Form             │       a [Vehicle] to his garage"│
│  ├── Event Form & Poll Form          └── ReactionButtons click handler │
│  └── Safe photo staging Reader           └── Toasts: Kickass/Not Cool  │
│                                                                        │
│  [ MY GARAGE VIEW ]                  [ REACTION TOASTS ]               │
│  MyGarageView.tsx                    App.tsx Toast Component           │
│  ├── handleShareGarage()             ├── 'kickass'  -> LoveYouGesture  │
│  └── SocialShareModal                └── 'not_cool' -> ThumbsDown      │
│      ├── Facebook Sharer Intent                                        │
│      └── "Check out [Name]'s Garage"                                   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Component & File Mapping

1. **`src/components/views/AddVehicleModal.tsx`**:
   - Replace open-ended `useEffect([isOpen, editingVehicle, initialMode, currentUser.location])` with strict transition detection via `prevIsOpenRef`.
   - Prevent background effect triggers when `postContent`, `eventDescription`, or file inputs change.
   - Guard against form resets during asynchronous `FileReader` photo loading.
2. **`src/App.tsx`**:
   - Update toast state: `const [toast, setToast] = useState<{ message: string; iconType?: 'kickass' | 'not_cool' | 'check' | 'trash' } | null>(null);`.
   - In `handleLikeToggle`: Trigger toast `"Kickass"` with `iconType: 'kickass'`.
   - In `handleDislikeToggle`: Trigger toast `"Not Cool"` with `iconType: 'not_cool'`.
   - Render the custom toast with `LoveYouGesture` (🤟) and `ThumbsDown` (👎).
3. **`src/components/views/MyGarageView.tsx`**:
   - Add `SocialShareModal` component or embed a share card.
   - Extract first name: `const firstName = currentUser.name.trim().split(' ')[0] || 'User';`.
   - Build share text: `Check out ${firstName}'s Garage on Gascanco.`.
   - Integrate Facebook share URL: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(garageUrl)}&quote=${encodeURIComponent(shareText)}`.
4. **`src/components/common/ActivityFeed.tsx`**:
   - For `isRegistration` cards:
     - Pull owner first name: `(act.owner.name || '').trim().split(' ')[0]`.
     - Extract complete vehicle info: Year, Make, Model, and Trim.
     - Headline text: `"[First Name] just added a [Year Make Model Trim] to his garage."`.
