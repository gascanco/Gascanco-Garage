# Implementation Plan: Builds Navigation, Modal Dismissal & Hard Admin Account

This plan outlines the architecture and execution for:
1. Updating the bottom navigation tab from **"FIND"** to **"BUILDS"** with a custom **slammed Chevy S10 on air ride** (mini truck) icon.
2. Enabling **backdrop dismiss** on the Add Modal so clicking the empty space around it closes the dialog cleanly.
3. Establishing **one HARD Admin account** linked exclusively to **`Gascanco@gmail.com`** with official GASCANCO branding, Verified Admin badge, and Super Admin data management powers (deleting any post/build, pinning builds, official event management, and access controls).

---

## 1. User Review & Confirmed Specifications
- **Navigation Label**: "BUILDS" (replacing "FIND").
- **Truck Icon**: Slammed Chevy S10 mini-truck laid out on the ground on air ride suspension (tucked wheels, low cabover profile, open cargo bed, notched chassis).
- **Modal Dismissal**: Clicking the backdrop/empty space outside the Add Modal immediately closes it.
- **Admin Identity**: `Gascanco@gmail.com` styled as `GASCANCO` with the official brand logo, Verified Admin badge, and Shopify Customer synchronization.
- **Admin Capabilities**: Super Admin privileges with complete data management (delete/moderate any community post or vehicle, pin featured builds, official announcements, and strict single-admin security).

---

## 2. Proposed Changes & Architecture

### A. Custom Slammed S10 on Air Ride Icon & Navigation
- **File**: `src/components/common/SlammedTruckIcon.tsx` (new component)
  - Create a precision 24x24 SVG matching Lucide icon geometry and stroke styling (`strokeWidth="2"` or fill accent):
    - Ultra-low ride height: rocker panels and frame laid flat on the ground.
    - Slammed S10 squarebody silhouette: classic 90s/early-2000s mini-truck profile, horizontal front grille, squarish cab, step/standard bed with rear tailgate.
    - Wheels tucked high into the wheel arches (air suspension dropped state).
- **File**: `src/components/navigation/MobileBottomNav.tsx`
  - Change button label from `FIND` to `BUILDS`.
  - Replace `<Search />` icon with `<SlammedTruckIcon />`.
  - Ensure minimum touch target dimensions ($\ge 44 \times 44\text{px}$) and responsive scaling across mobile, tablet, and embedded iframe widths.
- **File**: `src/components/navigation/Header.tsx`
  - Update any secondary navigation links or desktop buttons referencing the builds section to use the matching slammed truck icon and cohesive terminology.

### B. Add Modal Empty Space / Backdrop Click-to-Dismiss
- **File**: `src/components/views/AddVehicleModal.tsx`
  - The outer modal wrapper `<div className="fixed inset-0 z-50 bg-black/85 ...">` will have an explicit backdrop click handler.
  - Implement a clean mouse event check (`if (e.target === e.currentTarget) handleCloseModal();`) and `onClick={(e) => e.stopPropagation()}` on the inner modal card so clicks inside forms, dropdowns, inputs, and preset pickers never trigger closing.
  - Handle both click and ESC key down consistently without resetting user form state unintentionally.

### C. Hard Admin Account: `Gascanco@gmail.com` (Super Admin)
- **Files**:
  - `src/types/garage.ts`:
    - Extend `Owner` interface with `email?: string`, `role?: 'admin' | 'member'`, `isAdmin?: boolean`.
  - `src/data/mockGarageData.ts`:
    - Define `GASCANCO_ADMIN_USER`:
      - `id`: `'user-gascanco-admin'`
      - `email`: `'Gascanco@gmail.com'`
      - `name`: `'GASCANCO'`
      - `handle`: `'gascanco'`
      - `role`: `'admin'`
      - `isAdmin`: true
      - `shopifyCustomerId`: `'SH-ADMIN-01'`
      - `avatar`: Official Gascanco logo asset / emblem
      - `bio`: `'Official Gascanco Garage Administrator. Curating builds, track events, and automotive culture.'`
      - `location`: `'Costa Mesa, CA'`
      - `memberSince`: `'January 2020'`
    - Hardcoded check utility: `export const isHardAdmin = (user?: Owner | null) => user?.email?.toLowerCase() === 'gascanco@gmail.com' || user?.id === 'user-gascanco-admin';`
    - Update `CURRENT_MOCK_USER` to default to `GASCANCO_ADMIN_USER` as requested ("one HARD Admin Account only - linked to Gascanco@gmail.com").
  - `src/App.tsx`:
    - Initialize `currentUser` with `GASCANCO_ADMIN_USER`.
    - Provide super admin actions:
      - Delete vehicle (any vehicle if admin, or owner vehicle).
      - Delete community post or comment (super admin moderation).
      - Toggle featured/pinned status on any vehicle build.
  - `src/components/navigation/Header.tsx`:
    - Render official **`VERIFIED ADMIN`** badge next to the user's name in the header and account dropdown.
    - Display Shopify Customer linkage (`Shopify: Gascanco@gmail.com`) in the account dropdown menu.
  - `src/components/views/MyGarageView.tsx` & `src/components/cards/VehicleCard.tsx`:
    - Render red-bordered Admin badge with shield/checkmark on Gascanco profile and authored builds.
    - Super admin quick-action controls: Pin Build to Top of Community Feed, Edit Build, Delete Build.
  - `src/components/common/ActivityFeed.tsx`:
    - Render "ADMIN" badge on posts and comments by `GASCANCO`.
    - Allow Super Admin to delete inappropriate posts or pin important community announcements.

---

## 3. Verification & Acceptance Criteria
1. **Navigation Bar Verification**:
   - Tab 4 displays "BUILDS" with the custom slammed S10 on air ride icon.
   - Active state lights up in `#C8102E` (Gascanco red) when viewing community builds or discover views.
2. **Backdrop Click Verification**:
   - Clicking the darkened backdrop outside the modal dialog closes it immediately.
   - Clicking inside the modal (inputs, tabs, buttons, preset photos) does NOT close the modal.
3. **Hard Admin Account Verification**:
   - Current user is `GASCANCO` with email `Gascanco@gmail.com`.
   - Verified Admin badge rendered in Header, Profile, and Activity Feed.
   - Only `Gascanco@gmail.com` has Super Admin moderation privileges (delete any post/vehicle, pin builds).
4. **Applet Compilation**:
   - Run `lint_applet` and `compile_applet` to guarantee zero TypeScript or build errors.
