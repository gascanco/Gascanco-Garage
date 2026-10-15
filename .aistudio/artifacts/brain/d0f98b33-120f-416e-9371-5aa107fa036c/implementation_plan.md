# Implementation Plan: Feed Enhancements, Unified Navigation Filters & Deep Charcoal Theme

This plan addresses all items from your latest request:
1. **Larger Profile Pictures on "Live" Cards**: Increasing author avatar size from 32px to 48px–52px with sharp contrast borders, verified admin emblems, and improved visual hierarchy.
2. **Super Admin "Advertisement" Cards on Live Feed**: Empowering the Super Admin (`Gascanco@gmail.com`) to post official sponsored drops and advertisement cards directly linked to Shopify apparel products and collections (with product tag, pricing, promotional banner, and direct Shopify button).
3. **Remove "Shopify Admin: Gascanco@gmail.com"**: Removing the raw email text label from the My Garage profile view while keeping the official Verified Admin badge.
4. **Unified "Category, Location, Search" Bar across Live, Builds & Events**: Bringing the exact same responsive 2-column mobile / flex desktop toolbar across all three primary browsing views with domain-relevant options.
5. **Vehicle Details - "Built By"**: Updating the builder attribution from "Wrenched by" to "Built By".
6. **Vehicle Details - Apparel Replacement Container**: Harmonizing the container colors with the rest of the dark panels (`#242424` / border `#3d3d3d`), replacing parts store compatibility with **GASCANCO Official Garage Apparel & Gear** (heavy hoodies, shop tees, trucker hats, banners) with direct collection links.
7. **Darker Base Background**: Transitioning the overall background from medium grey (`#303030`) to deep charcoal black (`#0e0e10` / `#121212`) for crisp contrast.

---

## 1. Background Darkness & Color Contrast Refinement

### Problem
The current application uses `#303030` (RGB 48,48,48) for the body and root canvas background, which feels light grey rather than an aggressive, automotive-grade dark theme.

### Solution
- **Base Background**: Update `body` and root wrapper from `#303030` to deep charcoal black `#0e0e10`.
- **Card Surfaces**: Maintain layered depth with `#1c1c1e` (primary card background) and `#242426` (elevated headers / modals).
- **Borders & Dividers**: Crisp graphite borders `#363638` and `#444446` for sharp structural lines.
- **Accents**: High-contrast GASCANCO Racing Red (`#C8102E`) and pure white headings (`#ffffff`).

---

## 2. Live Feed Improvements

### A. Larger Profile Picture on Live Cards
- **Scale Up**: Increase avatar dimensions from `w-8 h-8` (32px) to `w-12 h-12` (48px) on mobile and `w-14 h-14` (56px) on desktop.
- **Visual Polish**: Sharp red accent border (`border border-[#C8102E]`), clean author name typography, and official verified admin badge for GASCANCO posts.
- **Consistent Layout**: Maintain aligned metadata (author name, admin tag, relative timestamp, and vehicle link) with enhanced touch targets.

### B. Super Admin Advertisement / Sponsored Cards
- **Super Admin Creation**: When `GASCANCO` (`Gascanco@gmail.com`) is logged in, the Add Modal (`AddVehicleModal.tsx`) will offer a dedicated **"Create Advertisement / Sponsored Drop"** option or toggle.
- **Shopify Link Fields**:
  - Ad Title / Collection Headline (e.g. *"Official Heavyweight Garage Hoodie Drop"*).
  - Apparel Category / Tag (e.g. *"Limited Apparel"*, *"Shopify Official Drop"*, *"Garage Gear"*).
  - Price Tag / Promotional Text (e.g. *"$58.00 USD"*, *"New Fall Drop"*).
  - Target Shopify URL (defaults to `https://gascanco.com` or custom collection path).
  - High-res product/drop photograph upload or selection.
  - Action Button Text (e.g. *"Shop Collection"*, *"View Product"*, *"Shop Drop"*).
- **Live Feed Rendering**: Sponsored posts render with a distinctive red `SPONSORED` badge, official GASCANCO logo, bold typography, product price tag, and prominent interactive CTA opening the Shopify product/collection.
- **Admin Moderation**: Super Admin can edit or delete advertisement cards directly from the feed.

---

## 3. Unified "Category, Location, Search" Toolbar

All three primary feeds (**Live**, **Builds**, and **Events**) will share the exact same responsive layout:
- **Mobile**: Clean 2-column grid (`grid grid-cols-2 gap-1.5`) featuring Category and Location dropdowns side-by-side, plus expandable Search bar.
- **Desktop**: Clean horizontal flex bar (`flex items-center gap-3`) with Category select, Location select, Search toggle button, and Reset button.
- **Styling**: `#242426` container, `#1a1a1c` dropdown boxes, `#38383a` borders, `#C8102E` red icons (`Layers`, `MapPin`, `Search`).

### Per-View Relevant Data:
1. **Builds (DiscoverView)**:
   - Categories: All Categories, Tuner & JDM, Overland & 4x4, Muscle & Classic, Track & Race, Euro Performance, Restomod, Mini Truck & Air Ride.
   - Locations: All Locations + distinct builder locations.
   - Search: Model, chassis, engine, builder name.
2. **Live (ActivityFeed)**:
   - Categories: All Categories, Updates, Event News, Build Progress, Community Posts, Sponsored Drops.
   - Locations: All Locations + distinct poster/builder locations.
   - Search: Post keywords, vehicle names, author handles.
3. **Events (EventsView)**:
   - Categories: All Categories, Car Meet, Track Day, Canyon Cruise, Cars & Coffee, Drag Night, Overland Trek, Dyno Day.
   - Locations: All Locations + distinct event cities/states.
   - Search: Event title, venue, host name, description.

---

## 4. My Garage & Vehicle Details Page Updates

### A. My Garage Profile Cleanup
- Remove the text string `"Shopify Admin: Gascanco@gmail.com"` from lines 153–157 in `MyGarageView.tsx`.
- Retain the official `GASCANCO` branding and verified `ADMIN` shield badge in the profile header.

### B. Vehicle Details Updates
1. **Attribution**: Change `"WRENCHED BY"` to `"BUILT BY"` on line 389 in `VehicleDetailView.tsx`.
2. **Container Color Theme**: Update the lower container from blueish `#141823` / border `#293245` to match the dark theme: `#242426` with border `#38383a`.
3. **Apparel Replacement Feature**: Replace parts compatibility with **"GASCANCO OFFICIAL APPAREL & GEAR"**:
   - Showcase official GASCANCO apparel engineered for garage and car enthusiasts (e.g., Heavyweight Mechanic Hoodie, Vintage Shop Tee, Low-Profile Snapback, Heavy Duty Garage Flag).
   - Display product title, price, and clean "Explore GASCANCO Apparel" button linking directly to the Shopify store collection.
   - Provide interactive preview modal / toast linking to the official collection.

---

## 5. Verification Plan

1. **Visual Background Check**: Verify the deep charcoal black theme across desktop and mobile screens.
2. **Live Feed Cards**: Confirm author profile pictures are significantly larger (48px–56px) with clean alignment.
3. **Super Admin Advertisement Creation**: Verify that the Super Admin can create a sponsored post with Shopify product information, and that it renders properly in the Live feed.
4. **Navigation Filter Toolbars**: Verify that Live, Builds, and Events all render the exact same Category, Location, and Search toolbar structure.
5. **My Garage Check**: Verify the `Shopify Admin: Gascanco@gmail.com` text is removed.
6. **Vehicle Detail Check**: Confirm "Built By" label and the new GASCANCO Official Apparel container with matching dark palette.
7. **Compilation & Linting**: Run `compile_applet` and `lint_applet` to ensure zero compilation or syntax errors.
