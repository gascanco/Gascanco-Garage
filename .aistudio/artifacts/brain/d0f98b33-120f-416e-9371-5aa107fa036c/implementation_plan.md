# Implementation Plan: Feed Streamlining, Pure Drag & Drop, and Garage Upgrades

This plan details the changes required to refine the Live Feed, Builds & Rides filters, ADD Modal update flow, My Garage specs, and social sharing links.

---

## 1. Live Feed & Card Layout Upgrades
- **Body Text as Primary Lead**: In `ActivityFeed.tsx`, replace the generic "Logged a Milestone" banner with the actual post body/content text. For lengthy notes, add a clean, mobile-friendly "Show more / Show less" toggle.
- **Vehicle Info & Matching Icon**: Replace "Build Update" badge text with the vehicle's `[Year] [Make] [Model]` along with its category-matched icon (Car, Truck, Motorcycle, etc.).
- **Remove "All" from Filter Dropdowns**:
  - In `ActivityFeed.tsx` and `DiscoverView.tsx`, update category and location dropdown labels: replace "All Categories" with "Categories", and "All Locations" with "Locations".
  - Display clean, unclipped state names directly to prevent mobile text cutoff.

---

## 2. Builds & Rides Filter Polish
- **Filter Labels**: Remove "All" from category, type, and location filters in `DiscoverView.tsx`.
- **Text Wrapping & Overflow**: Ensure filter pills and selects have flex-wrap or overflow containment so text is never truncated on small phone viewports.

---

## 3. ADD Modal & Vehicle Update Streamlining
- **Remove "Headlines"**:
  - Eliminate headline/title inputs from community post and vehicle update forms. All posts now lead directly with the update narrative/content.
- **Eliminate Duplicate Activity Posts**:
  - In `App.tsx` and `VehicleDetailView.tsx`, fix the build update flow so that posting a vehicle update generates exactly **one** syndicated Live Feed post with only the uploaded photos.
  - Verify that the post has full Edit and Delete functionality in the feed.
- **Compact Mod Auto-Add in Vehicle Update**:
  - Add a compact modification input (Part Name and Category dropdown) with an "Add to Vehicle Mods" checkbox.
  - When checked, submitting the update automatically registers the part into the vehicle's `modifications` list (up to 50 mods) and logs the update to the vehicle's build log and Live Feed simultaneously.
- **Pure Drag & Drop / File Upload (No URL Boxes)**:
  - Remove all URL input fields across photo uploaders in the app (Vehicle photos, Update photos, Modification photos, Milestone photos, Event photos).
  - Standardize photo selection strictly to native Drag & Drop and tap-to-upload file picker (PNG, JPG, WEBP, HEIC).
- **20 Vehicle Photos**:
  - Increase the vehicle photo upload capacity from 5 to 20 photos with primary photo selection.

---

## 4. My Garage & Vehicle Detail Refinements
- **Remove "Public" / "Private" Everywhere**:
  - Remove visibility badges ("PUBLIC", "PRIVATE"), visibility filters, and visibility toggles across the entire application. All registered vehicles are public.
- **Rename "Build Sheet"**:
  - Change "Build Sheet" tab label to "Details" in `VehicleDetailView.tsx` and throughout the app.
- **Mod Count in Place of Horsepower**:
  - Replace the floating Horsepower stat on the vehicle cover with the number of logged modifications (e.g. `12 Mods Logged`), cleanly positioned in the vehicle details header rather than floating over the photo.
- **50 Modifications Cap**:
  - Support up to 50 modifications per vehicle, displaying category counts and status pills cleanly.

---

## 5. Share Modal & Messenger Link Fix
- **Facebook Messenger Fix**:
  - Update the Facebook Messenger share action in `ShareAppModal.tsx` to use direct mobile and desktop Messenger endpoints (`https://m.me/` / `fb-messenger://share`) with prefilled text: `"Check out my Garage on GASCANCO: Add your vehicles to the Garage!"`.
- **Share Copy & Previews**:
  - Ensure all share buttons (Copy Link, X/Twitter, Messenger, SMS) use concise inviting copy: `"Add your vehicles to the Garage!"` and `"Check out my Garage"`.

---

## 6. Verification Plan
- **Lint Check**: Run `lint_applet` (`tsc --noEmit`) to verify zero syntax and type issues.
- **Compile Check**: Run `compile_applet` (`npm run build`) to ensure clean compilation.
- **Manual Verification**:
  - Post a vehicle update and verify only 1 post appears on the Live Feed without headline, showing only uploaded photos.
  - Verify compact mod input automatically appends to the vehicle's mods.
  - Verify all URL input boxes are gone and replaced with drag & drop / file upload.
  - Verify 20 photos can be uploaded for a vehicle.
  - Verify horsepower on top of photo is replaced with mod count.
  - Test Facebook Messenger link.
