# Redesign Module 4 — Complete Admin Panel

The last planned module. With this, **every page in the application is
on the new BK_Bakers design system**, and the legacy (pre-redesign)
color tokens have been deleted from `tailwind.config.js` entirely —
confirmed by a repo-wide grep that no file references them, and by a
clean build after removing them.

## Layout & navigation (`AdminLayout.jsx`)

- **Desktop**: sticky sidebar with the real logo, **collapsible to an
  icon-only rail** (brief: "collapsible if appropriate") — useful on
  1024px laptops where every pixel of the data tables matters; a page
  title bar sits above content
- **Mobile**: compact top bar with a menu button, the current page's
  title, and the logo; the nav opens as a slide-down panel (scrollable
  if the list outgrows the screen)
- Live badge counts (pending payment verifications, pending custom
  requests) still show on Orders / Custom Requests in both layouts
- The layout now owns each page's title, so individual pages no longer
  repeat their own `<h1>` — replaced with a one-line description of the
  page's purpose instead

## Pages

| Page | What changed |
|---|---|
| **Admin Login** | Berry-dark background, real logo on a white disc (needs the contrast on a dark surface — different situation from the light storefront), same auth logic |
| **Dashboard** | Redesigned `StatCard` (icon chip, display-serif numbers); pending-verification alert now sits *above* the stats so it's the first thing seen |
| **Orders** | Table on desktop → **card list on mobile** (order #, customer, product, fulfillment icon, both status badges, total); filters collapse into a **bottom sheet** with an active-filter count badge on phones |
| **Order Detail** | Restyled; payment verify/reject buttons and the status-advance control now use full-height touch targets — the most important owner action on a phone |
| **Products** | List is a table on desktop / **card list with thumbnail on mobile**; the large option-editor form restyled |
| **Categories, Custom Requests, Reviews, Gallery, Payment Accounts, Time Slots, Availability, Settings** | Full token migration, consistent `card-flat` surfaces, 44px touch targets on primary actions and delete/toggle icons |
| **Customers** | Table on desktop → **card list on mobile** with total spent and order counts |

## What I deliberately did *not* touch

- **No backend, API, or business-logic changes.** Every admin action
  (verify/reject a receipt, advance status, quote a custom cake, etc.)
  calls exactly the endpoints it did before.
- The tiny "×" remove buttons inside the Product form's nested option
  editors (weight/shape/flavor rows) stay compact rather than 44px —
  that's a dense power-user data-entry area where full-size buttons
  would make each row twice as tall. Everything primary on that screen
  (save, add product, edit/delete) does meet the touch-target size.

## Verified

- `npm run build` clean, after removing the legacy tokens.
- Grepped the whole frontend: **zero** references to legacy tokens.
- Backend re-booted: health check 200, zero changes.
- Rendered the admin login in a headless browser to check the dark-
  surface treatment of the logo.

## Honest limits of what I could test

I could not log in as an admin in this sandbox (no database is
reachable from here), so **the authenticated admin screens
(Dashboard/Orders/Products, etc.) were verified by build success and
code review, not by looking at live-rendered screenshots with real
data.** The public pages and admin login I did render and inspect. When
you run this against your real database, the first thing worth eyeballing
on a phone is Admin → Orders (the card layout + filter sheet) and
Order Detail (receipt review + verify buttons).
