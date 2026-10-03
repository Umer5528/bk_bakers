# Module 3 — Floating WhatsApp Button & Contact Settings

## Audit

`BusinessSettings` already had a `whatsapp` field, already editable via
the existing `PUT /settings` endpoint and shown in Admin → Shop Settings.
No duplicate field created, no backend changes needed — reused exactly
as instructed.

## What I built

- `FloatingWhatsApp.jsx` — reads the number from the real `/settings`
  endpoint; renders nothing if the admin hasn't set one (no fake/empty
  button). Official WhatsApp glyph on a green circle, fixed bottom-right,
  44px+ touch target, `aria-label` for screen readers, keyboard-focusable
  (it's a real link).
- Added once to `MainLayout`, so it appears on every customer page
  (Home, Shop, Category, Product, Checkout, Custom Cake, Account) —
  never on the Admin Panel, which uses a different layout.
- **Placement:** positioned to clear the tallest possible stack on
  mobile (bottom tab bar + Checkout/Product Details' own sticky action
  bar) on every page, rather than special-casing each page — guarantees
  it never covers a checkout or order button, at the minor cost of
  floating a little higher than strictly necessary on simpler pages.
- Number normalization reuses the existing `whatsappLink()` helper
  (built in an earlier phase): local Pakistani numbers starting with
  `0` convert to `+92`; anything else (e.g. `+44 7911 123456`) passes
  through as typed — already handles non-Pakistani numbers correctly
  with zero code changes, confirmed by reading the function.
- Added a plain-language hint on the admin's WhatsApp field explaining
  the country-code behavior, since the input itself is unchanged.

## Tested

`npm run build` — clean (caught and fixed one JSX mistake of my own
mid-build — a dropped closing tag — before shipping). Backend health
re-confirmed; zero backend files touched this module.

## Files changed

New: `frontend/src/components/common/FloatingWhatsApp.jsx`.
Updated: `frontend/src/layouts/MainLayout.jsx`,
`frontend/src/pages/admin/AdminSettings.jsx`. No backend changes.
