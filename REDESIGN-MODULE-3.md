# Redesign Module 3 — Transactional Flows

Checkout, Custom Cake, and every Customer Account screen. Builds
entirely on Modules 1-2's tokens/components — no new design decisions
needed, just consistent application.

## Pages redesigned

**Checkout** (`/checkout`)
- Numbered section headers (1 Your Order → 5 Review) give the existing
  single-page flow a clear sense of progress, without forcing a rigid
  multi-step wizard the order-draft architecture wasn't built for
- **Sticky mobile checkout bar**: live total + "Place Order" fixed above
  the tab bar, using the `form="checkout-form"` attribute so it submits
  the real form from outside it — desktop keeps the button inline in the
  Review card instead, since there's no need for stickiness there
- Every underlying component (fulfillment/date/slot/payment pickers)
  restyled — see "Shared components" below
- Business logic untouched: still server-authoritative pricing, still
  re-validates availability, still requires a receipt for online
  payment — this module only touched presentation

**Custom Cake** (`/custom-cake`) — rebuilt as a guided consultation:
- Same numbered-section pattern as Checkout for visual consistency
- **Image preview with replace/remove** before submission (brief's
  explicit requirement) — previously there was no way to remove or swap
  an already-selected image without reloading the page
- **Real upload progress bar** — added `onUploadProgress` wiring through
  `customOrderService.create()` (a minimal, backward-compatible service
  change — no backend/API change) so the progress bar reflects actual
  bytes sent, not a fake animation
- Success state redesigned to point at My Orders for tracking

**Login / Register** — elegant centered card on a soft blush background,
consistent field labels/errors via the new `.field-label`/`.field-error`
classes, `touch-target` buttons

**Profile** — added a **Change Password** section using the existing
`PUT /auth/change-password` endpoint (built in Module 1's backend but
never previously exposed in the UI) — no new API, just finishing a
screen that was left incomplete

**My Orders** — now has an **Orders / Custom Requests** tab toggle. The
Custom Requests tab is new here: shows each request's status, and for a
`"quoted"` request, lets the customer **Accept or Decline** the quotation
right from this screen (wired to the existing `PUT /custom-orders/:id/respond`
endpoint, which existed on the backend but had no frontend surface until
now)

**Order Details** (customer) & **NotFound** — restyled to match

## Shared components redesigned (used across the above)

`FulfillmentSelector`, `DateSelector`, `TimeSlotSelector`,
`PaymentMethodCard`, `PaymentAccountCard`, `StatusBadge`, `OrderTimeline`,
`OrderCard`, and **`ReceiptUploader`** — which now shows an actual image
preview of the uploaded receipt with a remove button, instead of just a
filename (brief: "Show the uploaded receipt preview").

## Backend / API changes

**None required a schema or endpoint change.** Two small, backward-
compatible frontend service additions to reach *existing* endpoints that
had no UI before:
- `customOrderService.respond(id, accept)` → existing `PUT /custom-orders/:id/respond`
- `customOrderService.create()` gained an optional `onProgress` callback
  parameter (purely additive — old call sites without it still work
  identically)

No models, controllers, or routes were touched.

## Verified

- `npm run build` — clean.
- Grepped every file in this module for legacy color tokens — none remain.
- Backend re-confirmed untouched and healthy via boot test.
- Traced the `changePassword` and `respond` request/response shapes
  against their existing controllers to confirm the frontend calls match
  exactly (field names, methods, routes) — no guessing.

## About the logo

You mentioned a `.png` logo — it didn't come through as an attachment on
my end (checked the uploads folder directly, it's empty). Send it over
whenever's convenient and I'll wire it into the Header, Footer, mobile
tab bar brand mark, and the browser favicon in a small follow-up — it
doesn't block Module 4.

## Not in this module

The entire Admin Panel — that's Module 4, the last one.
