# Redesign Module 2 — Shop & Product Experience

Builds directly on Module 1's foundation (tokens, `.btn-*`/`.input-field`/
`.card` classes, `touch-target`, `scrollbar-none`). No new tokens needed.

## Pages redesigned

**Shop** (`/shop`)
- Editorial header, restyled search field, horizontally-scrolling category
  pill row (native `scrollbar-none` swipe, no visible scrollbar)
- **Sort moved to a real mobile bottom sheet** on small screens (brief's
  "use mobile bottom sheets... when they improve usability") instead of
  a cramped `<select>`; desktop keeps an inline dropdown since there's
  room for it
- All controls sized to the `touch-target` (44px) minimum

**CategoryPage** (`/category/:slug`)
- New editorial banner using the category's own admin-uploaded image
  (subtle, low-opacity background treatment) instead of a plain heading
- Same search/sort pattern as Shop for consistency

**ProductDetails** (`/product/:slug`) — the main piece of this module
- **ImageGallery**: real swipeable carousel on mobile (native scroll-snap,
  not a fake button-click gallery), with dot indicators; thumbnail strip
  appears once there's room, on `sm:` and up
- **OptionSelector**: pills now show a check icon and use the new rose/
  berry palette with a soft shadow on the selected state
- **Sticky mobile checkout bar**: quantity stepper + live total + a
  "Checkout" button fixed above the bottom tab bar — exactly the
  "sticky Add to Cart/Checkout" pattern the brief calls for, positioned
  so it never overlaps the tab bar or hides content (verified padding
  math, not guessed)
- **Desktop**: the same quantity/price panel instead becomes a
  `sticky top-24` sidebar card that stays in view while scrolling a long
  option list — a deliberate difference between the two device
  experiences, not the same component just resized
- **"You May Also Like"**: a real related-products strip, pulling other
  products from the same category via the existing `GET /products`
  endpoint (`category` filter) — no fabricated recommendations
- Server-authoritative pricing is unchanged: this page still only ever
  *previews* a price locally; Checkout (Module 3) still re-verifies
  everything with the backend before an order is created

## Backend

Untouched — confirmed by boot-testing `/api/v1/health` again after this
module's changes.

## Verified

- `npm run build` — clean.
- Grepped the redesigned files specifically to confirm zero references
  to the legacy (pre-redesign) color tokens remain in them.
- Confirmed the mobile sticky bar's positioning against the tab bar and
  page bottom padding so nothing gets hidden underneath it.

## Not in this module

Checkout, Custom Cake, and the Customer Account screens (Login/Register/
Profile/My Orders/Order Details) are still pre-redesign — that's
Module 3. Admin panel is Module 4.
