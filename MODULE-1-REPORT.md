# Phase 2, Module 1 — Authentication, Role-Based Navigation & Admin Access

## 1. Root cause of the admin redirect bug

Found by inspection (`AuthContext.jsx`, `AdminRoute.jsx`, `ProtectedRoute.jsx`,
`Login.jsx`, `AdminLogin.jsx`, `Navbar.jsx`, `App.jsx`), not assumption:

**The route guards were never broken.** `AdminRoute` correctly checks
`role === "admin" || role === "superadmin"` and the backend's
`authorize("admin")` middleware correctly enforces the same rule on
every admin API call — both confirmed still working by test (see below).

The actual bug is two compounding gaps in the *customer-facing* login
flow:

1. **`Login.jsx` (the only login page most people would ever find)
   never checked the logged-in user's role.** After a successful
   login it unconditionally ran
   `navigate(location.state?.from?.pathname || "/")` — every user,
   admin or not, landed on the customer homepage. Only the separate
   `AdminLogin.jsx` page (at `/admin/login`) had role-aware routing.
2. **Nothing on the customer-facing site links to `/admin/login` or
   `/admin`.** I grepped the whole frontend to confirm this — the only
   references to that route are the guard's own redirect-when-
   unauthenticated, and `AdminLogin.jsx`'s own internal `navigate("/admin")`
   after success. There was no menu item, button, or link anywhere a
   logged-in admin could use to reach their panel.

So: an admin goes to the site, uses the login form they can actually
find, authenticates successfully (their `role` in the database was
always correct) — and is dropped on the customer homepage with no way
to discover the Admin Panel short of typing the URL from memory. It
looks like "admin can sign in but can't reach the Admin Panel," but the
session, the token, and the role were fine the whole time.

## 2. Files changed

- `frontend/src/pages/auth/Login.jsx` — after login, checks
  `user.role`; sends admin/superadmin to `/admin`, preserves the
  existing "return to intended page" behavior for everyone else
  unchanged.
- `frontend/src/services/authService.js` — removed the unused,
  byte-for-byte-identical `adminLogin()` method (dead code left over
  from an earlier attempt at this same problem; confirmed unused via
  grep before removing).
- `frontend/src/components/layout/Navbar.jsx` — added a real mobile
  hamburger menu (there wasn't one — mobile nav was previously only the
  bottom tab bar), and a rose/blush **Admin Panel capsule** that only
  renders when `isAdmin` is true, in both the new mobile menu and the
  existing desktop nav. It's a plain `<Link to="/admin">` — a
  navigation convenience, not a permission check; `AdminRoute` and the
  backend remain the actual authorization boundary, untouched.

No backend files changed. No models, routes, or middleware touched —
this was entirely a frontend routing/discoverability problem.

## 3. Tests actually performed (and results)

No live database was available in this sandbox, so rather than skip
testing, I built the real app, served the production build, and used a
headless browser to drive it — mocking only the network responses
(`/auth/me`, `/auth/login`, and a few read-only endpoints so background
fetches don't error), never mocking or bypassing any application logic.
Every redirect, guard, and role check below is the real code running.

| Test | Result |
|---|---|
| Customer submits the real login form at `/login` | Lands on `/` ✅ |
| Admin submits the *same* `/login` form (the bug scenario) | Lands on `/admin` ✅ |
| Customer redirected to `/login` from a protected page (`/my-orders`), then logs in | Returns to `/my-orders`, not `/` or `/admin` ✅ |
| Hamburger menu, logged out | No Admin Panel capsule; shows Log In / Sign Up ✅ |
| Hamburger menu, logged in as customer | No Admin Panel capsule ✅ |
| Hamburger menu, logged in as admin | Capsule visible, styled, tappable ✅ |
| Tapping the capsule (mobile) | Navigates to `/admin` and renders the real Dashboard ("Hello, Sarah") ✅ |
| Desktop nav, logged in as admin | Capsule visible in the top bar ✅ |
| Direct URL navigation to `/admin/orders` while already authenticated as admin (refresh/bookmark scenario) | Loads directly, no flash-redirect to login, no race condition ✅ |
| Direct URL navigation to `/admin/orders` while authenticated as a **customer** | Bounced to `/admin/login`, panel never renders ✅ |
| `npm run build` | Clean, all admin pages still code-split correctly ✅ |
| Backend boot + health check after all changes | Unaffected, 200 OK ✅ |

Screenshots were taken and visually reviewed at each step (not just DOM
assertions) to confirm the capsule actually looks right and the
Dashboard actually renders, not just that a URL changed.

**What this testing method does and doesn't prove:** mocking the network
layer proves the frontend's routing, role-check, and rendering logic is
correct for any user object shaped like the real backend's response. It
does not exercise the real Mongo/Express stack end-to-end (registration,
password hashing, JWT signing) — that part was unchanged in this module
and was already covered by the boot tests from earlier phases.

## 4. Unresolved issues / things worth knowing

- The production bundle's main chunk is ~500KB, just over Vite's
  advisory warning threshold. This is pre-existing, unrelated to this
  module's changes, not an error, and not something Module 1 asked me
  to fix — flagging it honestly rather than silently ignoring it.
- I did not add "Categories" or "Contact/WhatsApp" as separate menu
  items, per the instruction to "only include routes and features
  supported by the existing application" — there's no standalone
  categories index page (categories are reached via Shop) and no
  dedicated Contact page yet. A floating WhatsApp button is explicitly
  Module 3 of this phase, so I left that for then rather than bolting
  on a placeholder now.
