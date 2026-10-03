# Redesign Module 1 — Design Foundation & Global Shell

## What changed

**Design tokens** (`frontend/tailwind.config.js`)
- Full new palette matching your exact spec: Warm Cream, Pure White, Soft
  Blush, Rose Pink, Deep Rose, Warm Peach, Berry Brown, Muted Mauve —
  each expanded into a usable shade ramp (e.g. `rose-300`→`rose-700`)
  rather than one flat hex per name.
- Typography: Cormorant Garamond (display/headings) + Inter (body),
  loaded via Google Fonts in `index.html`, with a deliberate display
  scale (`text-display-sm` → `text-display-xl`) sized for the serif to
  read as confident rather than thin.
- New shadow/radius/easing tokens (`shadow-soft/card/lift`, `rounded-xl3`,
  `ease-soft-out`) used consistently instead of ad hoc values per page.
- **Legacy color aliases kept on purpose**: pages not yet redesigned
  (everything except Home/Header/Footer right now) still reference the
  old palette names directly in their JSX. Rather than let those pages
  go colorless mid-redesign, I kept the old tokens defined alongside the
  new ones — so the whole site still looks fully styled today, just with
  Home/Header/Footer/mobile-nav already on the new premium identity.
  These legacy aliases get removed page-by-page as Modules 2-4 land.

**Global CSS system** (`frontend/src/index.css`)
- Rewrote every component class (`.btn-primary`, `.btn-secondary`,
  `.input-field`, `.card`, etc.) against the new tokens, plus new ones:
  `.btn-ghost`, `.btn-icon`, `.field-label`/`.field-error`, safe-area
  helpers (`.pt-safe`/`.pb-safe`), `.touch-target` (44px minimum, per
  your mobile usability requirement), and `.scrollbar-none` for the
  horizontally-scrolling chip/date rows used later in checkout.
- Visible focus outlines, text-selection color, and a
  `prefers-reduced-motion` block that disables animation for anyone
  who's asked their OS to reduce motion.

**Native-feeling mobile navigation** (new: `MobileTabBar.jsx`)
- A real fixed bottom tab bar (Home / Shop / Custom / Orders / Account),
  safe-area aware, active-tab highlighting — this is what makes the
  storefront read as an app rather than a shrunk website. Wired into
  `MainLayout` with matching bottom padding so it never covers content
  or a sticky action button.

**Header** (`Navbar.jsx`) — rebuilt as two coherent halves: a compact
mobile top bar (brand + search, since navigation now lives in the tab
bar) and a full desktop header (brand + wordmark + slogan, nav links,
live search, account dropdown / sign-in).

**Footer** (`Footer.jsx`) — redesigned, and importantly: **contact/pickup
info now comes live from `GET /api/v1/settings`**, not hardcoded text —
matching your instruction not to fabricate business facts. If settings
haven't loaded, those lines simply don't render yet.

**Home page** — full rebuild: editorial hero (compact on mobile, gets to
products fast; asymmetrical two-column on desktop), feature strip,
dynamic categories (still fully backend-driven), featured products,
a bespoke custom-cake consultation callout, and a real gallery preview
pulling from the admin-managed Gallery API (Module 5) — empty and
hidden gracefully if the admin hasn't added photos yet, never faked.

**Foundation components redesigned** (used everywhere, so done now
rather than duplicated per page later): `CategoryCard`, `ProductCard`,
`LoadingScreen`, `Skeleton`, `EmptyState`.

Framer Motion used for entrance/reveal animations on the hero, feature
cards, category grid, and product grid — respects reduced-motion.

## Backend

**Untouched.** No API, schema, or business-logic changes. Confirmed by
booting the existing server and hitting `/api/v1/health` — still 200.

## Verified

- `npm run build` — clean, no errors or warnings.
- Backend boot test — still healthy, zero changes.
- Manually traced every not-yet-redesigned page's Tailwind classes
  against the new config to confirm nothing silently lost its styling.

## Not in this module (coming next)

Shop/Category/Product Details pages, Checkout/Custom Cake/Account
screens, and the entire Admin Panel are still on the pre-redesign look —
that's Modules 2-4, landing once you approve this one.
