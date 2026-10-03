# Testing & Edge-Case Checklist

This build was developed and verified inside a sandboxed container with
**no outbound access to a real MongoDB instance** — every module's
delivery included what that environment allows:

1. **Syntax verification** — every backend file checked with `node --check`
   after every change.
2. **Live boot tests** — the Express app started for real and hit with
   actual HTTP requests (via `fetch`) for each new route, confirming:
   correct middleware order, auth guards (401 for missing tokens, 403 for
   wrong roles), validation error shapes, and — for routes that reach
   Mongoose — that they get exactly as far as the database call before
   failing (proving the whole chain above the DB is wired correctly).
3. **Frontend production builds** (`vite build`) after every module,
   catching import errors, JSX errors, and bad references immediately.

What it could **not** do here is run against a live database end-to-end
(create a real order, watch a slot's capacity actually decrement, etc.).
**Before going live, run through this checklist yourself** with
`npm run seed && npm run seed:admins && npm run dev` on a real
`MONGO_URI` — it should take about 20–30 minutes and is the single
highest-value thing left to do.

## Edge cases and how the code handles them

| Edge case | Where it's handled |
|---|---|
| Full time slot | `availabilityEngine.js` marks a slot `"full"` once `booked >= capacity`; `orderController.createOrder` re-checks this at submission time and rejects with 409 if it filled since checkout |
| Blocked date | `BlockedDate` model + `availabilityEngine.js` excludes it from the returned days entirely |
| Disabled product | `Product.isActive` — excluded from public `getProducts`/`getProductBySlug`, and `createOrder` re-checks `product.isActive` |
| Disabled payment method | `BusinessSettings.payments` toggles checked in `createOrder`; frontend `PaymentMethodCard` also disables the button, but the backend check is the real gate |
| Payment account deactivated | `createOrder` checks `account.isActive` before accepting `paymentAccountId` |
| Price changes mid-checkout | `createOrder` always recomputes via `buildPriceSnapshot(product, selections)` from the *current* product document — never trusts any price the client sends |
| Missing/failed receipt upload | `createOrder` throws 400 if `paymentMethod === "online"` and `!req.file`; the order is never created without it |
| Self-pickup delivery fee | Computed as a literal `0` in `createOrder`'s fulfillment branch, not just hidden in the UI |
| Duplicate order submission | `idempotencyKey` — a repeat request with the same key returns the original order (200, `deduplicated: true`) instead of creating a second one |
| Category deletion with products still in it | `categoryController.deleteCategory` counts products first and returns 409 if any exist |
| Order status skipping/going backwards | `updateOrderStatus` looks up both statuses in the fulfillment-specific flow array and rejects if `nextIndex <= currentIndex` |
| Wrong status for fulfillment type | Same function rejects a status that isn't in that order's own flow (e.g. `"out_for_delivery"` on a pickup order) |
| Confirming an unverified online order | `updateOrderStatus` blocks `status: "confirmed"` for online orders unless `paymentStatus === "verified"` |
| Customer viewing/cancelling another customer's order | `getOrderByNumber` / `cancelOrder` compare `order.customer` to `req.user._id` and 403 otherwise |
| Customer cancelling a mid-prep order | `cancelOrder` only allows customer self-cancel while status is `pending`/`confirmed`; admin can cancel anytime pre-completion |
| Reviewing an order that isn't completed / isn't yours / already reviewed | `reviewController.createReview` checks all three explicitly |
| Product with zero weight options | Blocked at the schema level (`weightOptions` validator requires `length > 0`) and again in `productController` on update |
| Slow network / accidental double-click | Same idempotency key mechanism as duplicate submission above |
| Mobile layout | Every page built mobile-first with Tailwind; admin panel has a dedicated slide-down nav under `md:` breakpoint |

## Known simplifications (called out honestly, not hidden)

- **Custom cake → normal Order conversion** (spec section 61) stops at
  the customer accepting a quotation (`status: "accepted"`); turning
  that into a real `Order` is a manual admin step for now rather than
  automated. Flagged in the Module 5 README section.
- **Notifications** (spec section 66) are implemented as a 60-second
  poll of the dashboard-stats endpoint feeding sidebar badge counts —
  real and live, but not push/email notifications. A proper
  notifications system (WebSocket or email via Nodemailer) is a
  reasonable next step beyond these six modules.
- **sitemap.xml** is a static file with relative URLs as a starting
  point — for production SEO, regenerate it with your real domain and
  live product URLs (a small script hitting `GET /api/v1/products` is
  enough).
- **Audit log** covers the highest-value actions (payment verification,
  status changes, settings updates, price changes) rather than every
  possible admin action — extend `logAdminAction(...)` calls to any
  other controller as needed.

## Recommended manual run-through before launch

1. `npm run seed && npm run seed:admins` on a real database.
2. Register a customer account, browse `/shop`, open a product, submit
   a Cash order → confirm it appears in `/admin/orders` and `/my-orders`.
3. Submit an Online order with a receipt image → verify it in the admin
   panel → confirm the customer's order detail page reflects "Verified."
4. Walk an order through its full status sequence in the admin panel;
   confirm a pickup order never offers "Out for Delivery" as an option.
5. Block today's date in Availability → confirm it disappears from
   checkout's date picker for a new order.
6. Turn off "Pay Online" in Settings → confirm it disappears from
   Checkout's payment method options.
7. Submit a custom cake request → send it a quotation from the admin
   panel → confirm the request's status updates.
