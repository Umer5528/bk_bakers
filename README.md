# Bk_Bakers — Cake & Food Ordering Platform

**Slogan:** *Artistry You Can Taste*

## Roles

- **Customer** — browses, orders, tracks orders
- **Admin** — runs day-to-day business operations (products, orders,
  payments, scheduling — built out fully in Module 5)
- **Superadmin ("The Developer")** — the developer/owner-level account.
  Has every admin privilege automatically (`authorize("admin")` checks
  pass for superadmin too) plus anything superadmin-only added later,
  such as managing other admin accounts.

### Login credentials

Created via `npm run seed:admins` (see Module 1 setup below):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@bkbakers.com` | `rHWKLPRyBt7R4F` |
| Super Admin (The Developer) | `developer@bkbakers.com` | `ADuB!qGTH99juN` |

**Please change both passwords after your first login** (via Profile →
Change Password once that screen is wired up, or `PUT /auth/change-password`
directly). These are strong, randomly generated placeholder credentials
meant only to get you started.

---

**Module 1 of 6: Foundation, Authentication & Design System**

## What's included in this module

- Full MERN project scaffold (`frontend/` + `backend/`), clean architecture
  (controllers/models/routes/middleware/services on the backend; pages/
  components/context/services on the frontend)
- Customer registration & login (JWT + httpOnly cookie, bcrypt hashing)
- Admin registration (gated by `ADMIN_SETUP_KEY`) & Super Admin
  registration (gated by its own separate `SUPER_ADMIN_SETUP_KEY`) &
  login — same login endpoint for every role, role comes from the stored
  user and is enforced server-side
- Protected routes (customer) and admin-only routes, enforced by backend
  middleware (`protect`, `authorize("admin")`) — never trust the frontend
  guard alone
- Password reset flow (request + token-based reset; email sending is
  stubbed to a console log for now — wire up Nodemailer in Module 6)
- Profile view/update, change password
- Rate limiting, Helmet, CORS, Mongo sanitization, centralized error
  handling with friendly customer-facing messages
- Full design system: warm bakery palette (cream/blush/peach/cocoa),
  Playfair Display + Inter typography, reusable `.btn-primary`,
  `.btn-secondary`, `.input-field`, `.card` classes
- Mobile-first responsive Navbar/Footer, admin sidebar layout
- Landing page, auth pages, profile page, admin dashboard placeholder,
  loading screen, skeleton, empty state components — all built and ready
  to be wired into Module 2 (categories/products)

Both `npm run build` (frontend) and a live boot test (backend, hitting
`/api/v1/health` and a validation error) were run against this code
before delivery — see the setup steps below to run it yourself.

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# then fill in MONGO_URI, JWT_SECRET, CLOUDINARY_*, ADMIN_SETUP_KEY
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`.

### 3. Create the Admin and Super Admin accounts

The easiest way — creates both accounts in one go with the credentials
listed at the top of this README:

```bash
cd backend
npm run seed:admins
```

Then log in at `http://localhost:5173/admin/login` with either account.
The Super Admin ("The Developer") sees a **Super Admin** badge in the
sidebar and can do everything an Admin can, plus more as later modules
add superadmin-only tools.

<details>
<summary>Alternative: create accounts via the API instead</summary>

```bash
# Admin
curl -X POST http://localhost:5000/api/v1/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bk_Bakers Admin",
    "email": "admin@bkbakers.com",
    "phone": "03000000001",
    "password": "a-strong-password",
    "setupKey": "the ADMIN_SETUP_KEY value from your .env"
  }'

# Super Admin
curl -X POST http://localhost:5000/api/v1/auth/superadmin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "The Developer",
    "email": "developer@bkbakers.com",
    "phone": "03000000000",
    "password": "a-strong-password",
    "setupKey": "the SUPER_ADMIN_SETUP_KEY value from your .env"
  }'
```
</details>

## Module 2 of 6: Categories, Products & Customer Browsing

**Added in this module:**

- Dynamic categories (create/edit/delete/reorder — never hardcoded), with
  Cloudinary image upload
- Generic `Category → Product → Options` architecture: every product has
  admin-defined **weight/size options** (these drive the base price),
  plus optional **shape / flavor / filling** option sets (cake vocabulary),
  plus fully generic **extra option groups** (single or multi-select —
  e.g. Burger "Size"/"Spice Level"/"Add-ons", Pizza "Crust"/"Toppings")
  so the same schema serves cakes, fast food, or any future category
  without a rewrite
- Admin CRUD APIs for categories and products (image upload, multi-image
  products, per-image delete), all backend-enforced via `authorize("admin")`
- Public browsing APIs: list with search/filter-by-category/sort/pagination,
  single-product detail by slug
- Server-authoritative price calculation (`services/priceCalculator.js` +
  `POST /products/:slug/calculate-price`) — the same function Module 3/4's
  checkout will call again so a price is never trusted from the browser
- Demo data seed script (4 categories, 7 products spanning cakes, cupcakes,
  desserts, and fast food) so you can browse a populated catalog immediately
- Frontend: category grid + featured products on the Home page, a
  `/shop` catalog page (category chips, search, sort), a `/category/:slug`
  page, and a premium **Product Details** page — image gallery, weight/
  shape/flavor/filling/extra-option selectors, and an instantly updating
  price breakdown as options change

Both a production `vite build` and a live backend boot test (health
check, unauthenticated admin route correctly rejected with 401, DB-backed
routes correctly wired through to Mongoose) were run before delivery.

### Try it with real data

```bash
cd backend
npm install
npm run seed     # populates categories + demo products (needs MONGO_URI set)
npm run dev
```

Then visit `http://localhost:5173/shop`.

## Module 3 of 6: Customization, Fulfillment, Scheduling & Checkout

**Added in this module:**

- **BusinessSettings** (singleton, admin-editable): business info, delivery
  config (on/off, default fee, zones), pickup config (on/off, address,
  hours, instructions), scheduling defaults (minimum advance notice,
  same-day cutoff time, max orders/day, scheduling horizon)
- **TimeSlot** model + admin CRUD — global by default; a product can
  override with its own subset via `customTimeSlotIds`
- **BlockedDate** model + admin CRUD — block dates or mark holidays
- **The Smart Availability Engine** (`services/availabilityEngine.js`):
  given a product + fulfillment type, computes exactly which dates and
  slots can actually be fulfilled — folding in product prep time, the
  business's minimum advance notice, the same-day cutoff, per-slot and
  per-day capacity (checked against real `Order` counts), and any
  blocked/holiday dates. The frontend never has to work this out itself;
  it only ever renders what this engine returns.
- **Order** model — the full historical-snapshot schema (product +
  option labels, every price line, fulfillment + schedule, payment
  fields) is in place now so Module 4 can wire payment and submission
  straight onto it without a schema rewrite
- **CustomOrder** model + customer-facing submission flow (reference
  image upload, desired weight/shape/flavor/filling, message, theme,
  description, preferred fulfillment/date, contact info) — the dedicated
  custom cake request flow from the spec
- Frontend: `FulfillmentSelector`, `DateSelector` (color-coded by
  availability), `TimeSlotSelector` (shows remaining capacity per slot),
  and a full **Checkout** page tying it together — order summary,
  fulfillment choice (delivery address form vs. pickup info pulled live
  from settings, delivery fee forced to Rs. 0 on pickup), live-computed
  date/slot availability, and a Review section with the full price
  breakdown
- A **Custom Cake** page (`/custom-cake`) for submitting custom requests
- Product Details now has a working quantity stepper and "Proceed to
  Checkout," which hands the selected product + options into an
  in-memory `OrderDraftContext` for Checkout to pick up

Checkout intentionally stops at **Review** — "Continue to Payment" is
wired up and shows the final assembled order in the console, but actual
payment method selection, receipt upload, and order submission are
Module 4's job (per the spec's own module split). Nothing here needs to
be rebuilt for that — Module 4 adds a payment step and a
`POST /api/v1/orders` endpoint on top of the `Order` model that's
already in place.

### Try it

```bash
cd backend
npm run seed          # categories, products, time slots, business settings
npm run seed:admins   # Admin + Super Admin accounts
npm run dev
```

```bash
cd frontend
npm run dev
```

Visit `/shop`, open a product, pick options and quantity, click
**Proceed to Checkout** (you'll be asked to log in if you haven't), then
walk through fulfillment → date → time slot → review.

Verified with a production `vite build` and a live backend boot test
(health check 200; every new route correctly reaching its DB call,
confirming middleware/auth wiring; unauthenticated admin-only routes for
settings/blocked-dates/custom-orders correctly returning 401).

## Module 4 of 6: Payment System & Complete Order Workflow

**Added in this module:**

- **PaymentAccount** model + admin CRUD — EasyPaisa/JazzCash/Bank/Other,
  each independently active/inactive; `BusinessSettings.payments`
  (`onlineEnabled`/`cashEnabled`) toggles the methods themselves,
  enforced on both frontend and backend
- **`POST /api/v1/orders`** — the real order-creation endpoint, fully
  server-authoritative:
  - Recomputes the price from scratch (`buildPriceSnapshot`) — a
    tampered client-side price is never trusted
  - Re-runs the availability engine against the chosen date/slot so a
    slot that filled up between Checkout-review and Submit is correctly
    rejected (409), not silently accepted
  - Self-pickup's delivery charge is computed as exactly `0` server-side,
    not just hidden in the UI
  - Online payment requires a real receipt upload (rejected with 400
    otherwise) and snapshots the chosen payment account; cash requires
    neither
  - `idempotencyKey` dedup — a double-click or retried request returns
    the original order instead of creating a duplicate
  - Freezes a full historical snapshot (product name, every selected
    option's label, every price line) onto the order, immune to later
    catalog/price changes
- Order status workflow: `verifyPayment` (admin verifies/rejects an
  online receipt), `updateOrderStatus` (forward-only, fulfillment-type-
  aware — a pickup order can never be set to "Out for Delivery" and
  vice versa; confirming an online-paid order requires payment
  verification first), `cancelOrder` (customers can self-cancel before
  preparation begins; admins can cancel anytime pre-completion)
- Admin order listing with search/filter (status, payment status,
  fulfillment type, date)
- Frontend: `PaymentMethodCard`, `PaymentAccountCard`, `ReceiptUploader`
  (with a "Receipt uploaded ✓" confirmation state), `StatusBadge`,
  `OrderTimeline`, `OrderCard` — Checkout now actually **places the
  order** end to end, redirecting to a real **Order Details** page
  (timeline, full price breakdown, payment status, self-cancel button)
  with a **My Orders** list

### Try it

```bash
cd backend
npm run seed          # + payment accounts (EasyPaisa/JazzCash/Bank) this time
npm run seed:admins
npm run dev
```

Walk through Shop → Product → Checkout → pick fulfillment/date/slot →
pick Cash or Online (upload any image as the receipt) → Place Order →
land on the order's detail page, then check `/my-orders`.

Verified with a production `vite build` and a live backend boot test
(health check, and every new route — order creation, listing, payment
verification, status update, cancellation — correctly rejecting
unauthenticated requests with 401 before reaching the database).

## Module 5 of 6: Admin Business Management

The Admin Panel is now a real day-to-day tool, not just an API. Every
page below is wired to a live backend endpoint — nothing is mocked.

**New backend pieces:**

- **Dashboard stats** (`GET /dashboard/stats`) — orders today/this week/
  this month, pending payment verifications, total revenue, completed/
  cancelled counts, pending custom requests, today's pickups vs.
  deliveries, popular products, and the delivery-vs-pickup /
  online-vs-cash split — all computed with Mongo aggregation, not
  hardcoded
- **Customer management** (`GET /customers`) — every customer with their
  live order count, completed/cancelled counts, and total spend, joined
  in with an aggregation rather than N+1 queries
- **Reviews**: customers can review a *completed* order (one review per
  order, enforced); admin moderates (approve/reject/hide); a product's
  `ratingAverage`/`ratingCount` recompute automatically from approved
  reviews whenever moderation happens
- **Gallery**: admin-managed photo gallery with captions and categories
- **Custom cake quoting**: admin can now send a quotation
  (`PUT /custom-orders/:id/quote`) or reject a request outright; the
  customer can accept/reject a quote via `PUT /custom-orders/:id/respond`
  (converting an accepted quote into a full Order is a manual step for
  now — flagged as a natural Module 6 polish item)
- **Audit log**: a lightweight trail of consequential admin actions
  (payment verification, order status changes, settings updates, product
  price changes) — enough to answer "who did what, when" without a full
  audit framework

**Admin Panel pages (all in the sidebar, all mobile-friendly with a
slide-down nav on small screens):**

- **Dashboard** — the stat cards above, plus a shortcut straight to
  orders awaiting payment verification when there are any
- **Orders** — searchable, filterable (status/payment status/
  fulfillment type) table → **Order Detail** with the full timeline,
  verify/reject payment, advance to the next fulfillment-aware status
  (prompting for an expected time when confirming), cancel, and print
- **Products** — full CRUD with the same generic option architecture
  from Module 2: dynamic weight/shape/flavor/filling editors plus a
  nested extra-option-group editor (single/multi-select) for non-cake
  products, multi-image upload
- **Categories** — CRUD with image upload
- **Custom Requests** — review each request (reference image, desired
  options, description) and send a quotation or reject
- **Reviews** — approve / reject / hide
- **Gallery** — upload / caption / remove photos
- **Customers** — searchable list with order stats and total spend
- **Payment Accounts** — add EasyPaisa/JazzCash/Bank/Other accounts,
  toggle active/inactive, delete
- **Time Slots** — create slots with start/end time, capacity, and
  which fulfillment type(s) they apply to; toggle active/inactive
- **Availability** — block dates or mark holidays; unblock with one
  click
- **Settings** — business info, delivery (on/off, fee, instructions),
  pickup (on/off, address, hours, instructions), payment toggles
  (online/cash), and scheduling defaults (advance notice, same-day
  cutoff, max orders/day, scheduling horizon) — every one of these
  is read live by the availability engine and checkout flow built in
  Modules 3-4

### Try it

```bash
cd backend
npm run seed
npm run seed:admins
npm run dev
```

Log in at `/admin/login`, then explore the sidebar. Try placing an order
as a customer first (see Module 4's steps) so the dashboard and Orders
page have real data to show.

Verified with a production `vite build` (frontend now large enough to
trigger Vite's routine >500kB chunk-size advisory — informational only,
not an error; code-splitting the admin bundle is a reasonable Module 6
polish item) and a live backend boot test confirming every new endpoint
is properly auth-gated.

## Module 6 of 6: Security, Performance, Polish & Deployment Readiness

This is the final module — the project is now feature-complete against
the original spec's six modules.

**Security hardening:**
- The server now **fails fast at boot** if `MONGO_URI` or `JWT_SECRET`
  is missing, instead of limping along into a broken, insecure state
- `app.set("trust proxy", 1)` — required for `express-rate-limit` and
  `req.ip` to see the real client IP once deployed behind Render/
  Vercel/Railway's reverse proxy, not the proxy's own IP
- Multer's own errors (file too large, too many files) now translate
  into the same friendly `ApiError` shape as everything else, instead
  of leaking a raw stack-shaped error
- Graceful `SIGTERM` handling — finishes in-flight requests instead of
  dropping them mid-order when a host redeploys or scales down
- (Carried forward from earlier modules, confirmed still in place:
  Helmet, CORS locked to `CLIENT_URL`, `express-mongo-sanitize`,
  bcrypt password hashing, JWT with httpOnly cookies, role-based
  `authorize()` enforced server-side on every admin route, file type/
  size validation on every upload, server-authoritative pricing)

**Performance:**
- The admin panel is now **code-split** with `React.lazy`/`Suspense` —
  a customer visiting the storefront no longer downloads any admin-panel
  code at all; each admin page loads its own small chunk on first visit.
  This also resolved Module 5's bundle-size build warning.
- Confirmed indexes exist on every frequently-queried field (order
  status/date/customer, product category/featured, text search on
  product name+description, etc.) — see each model file

**Polish:**
- Live-updating notification badges in the admin sidebar (Orders /
  Custom Requests) — polls the same dashboard-stats endpoint every 60s,
  so it's real data, not a mock
- Per-page document titles (`useDocumentTitle` hook) instead of one
  static title for the whole app
- `robots.txt` + a starter `sitemap.xml` (see the note in `TESTING.md`
  about regenerating it with real URLs before launch)
- Open Graph / Twitter meta tags for link-preview quality when shared

**A written testing & edge-case log:** see **`TESTING.md`** — it maps
every edge case from the original spec (full slots, blocked dates,
disabled payment methods, mid-checkout price changes, duplicate
submissions, cancellation rules, etc.) to exactly where in the code it's
handled, is honest about what was verified by boot-testing inside this
sandboxed build environment vs. what still needs a real database run-
through, and includes a 10-minute manual smoke-test script for before
launch.

### Deployment

- **Backend** → Render or Railway. Set `NODE_ENV=production` and every
  variable from `.env.example` (the server refuses to start if
  `MONGO_URI` or `JWT_SECRET` is missing — a deliberate safety net).
  Start command: `npm start`.
- **Database** → MongoDB Atlas. Use its connection string as `MONGO_URI`.
- **Images/receipts** → Cloudinary (already wired throughout).
- **Frontend** → Vercel or Netlify. Set `VITE_API_URL` to your deployed
  backend's `/api/v1` URL. Build command: `npm run build`, output dir:
  `dist`.
- Set the backend's `CLIENT_URL` to your deployed frontend's URL (CORS
  is locked to exactly this origin).
- No localhost URLs are hardcoded anywhere in the app — everything reads
  from `CLIENT_URL` / `VITE_API_URL`, confirmed by a repo-wide grep
  before this module shipped.

### Try it

```bash
cd backend
npm run seed
npm run seed:admins
npm run dev
```

```bash
cd frontend
npm run dev
```

Then work through `TESTING.md`'s manual run-through.

---

## Project status: all 6 modules complete

Foundation & auth → catalog & browsing → customization/scheduling/
checkout → payments & order workflow → admin business management →
security/performance/deployment polish. Every module was built,
syntax-checked, boot-tested, and (for the frontend) production-built
before being handed over. `TESTING.md` is the honest record of what's
been verified versus what still needs a real database run-through —
that run-through is the natural next step whenever you're ready to
deploy this for real.
