# Bug Fix — Hiding an item made it disappear from the admin's own list

## What was happening

Marking a cake, menu section, time slot, or payment account as
"Hidden" / "Inactive" in the Admin Panel made it vanish from the admin's
own list too — with no way to find it again to switch it back on.

## Root cause

Four public "browse" endpoints (`GET /products`, `GET /categories`,
`GET /time-slots`, `GET /payment-accounts`) each had logic meaning
*"show hidden items too, if the person asking is an admin"* — but none
of those routes had **any** authentication middleware attached. So
`req.user` was always `undefined`, for every request, including ones
coming from the Admin Panel itself while genuinely logged in as an
admin. The "is this an admin?" check always failed, silently, and the
hidden-items filter applied to everyone — including the admin viewing
her own shop.

Two single-item endpoints (`GET /products/:slug`,
`GET /categories/:slug`) had the identical gap. On top of that, all of
these checks only recognized the `"admin"` role by name and would have
excluded a `superadmin` account even once the routing is fixed.

This was never a data-loss bug — nothing was deleted. The item was
always safely in the database with `isActive: false`; the admin panel
just couldn't see it anymore to flip it back.

## The fix

- Added a new `identify` middleware (`backend/src/middleware/auth.js`):
  for routes that must stay public, it populates `req.user` **if** a
  valid session is present, but — unlike `protect` — never blocks the
  request if there isn't one. Proved this with a real request carrying
  a garbage token: still reaches the route, never a 401.
- Wired `identify` onto the six routes above
  (`productRoutes.js`, `categoryRoutes.js`, `timeSlotRoutes.js`,
  `paymentAccountRoutes.js`).
- Made every one of these admin-detection checks recognize `superadmin`
  as well as `admin` (`productController.js`, `categoryController.js`
  — `timeSlotController.js` and `paymentAccountController.js` already
  did this correctly).

No frontend changes were needed — the Admin Panel was always asking the
right question, the backend just never knew who was asking.

## Tested

Since there's no live database in this environment, I verified the
actual shipped code directly rather than skip testing:

- Called the real `identify` middleware + the real `getProducts`
  controller function with `Product.find`/`User.findById` stubbed only
  at the database I/O boundary (not the logic being tested). Result:
  - Anonymous visitor → `{ isActive: true }` (hidden items correctly
    stay hidden from the public storefront)
  - Logged in as **admin** → `{}` (hidden items now included — the fix)
  - Logged in as **superadmin** → `{}` (the fix, including the
    previously-missed role)
- Same test for Categories, including the `?all=true` parameter the
  admin panel actually sends — confirmed the real request shape works.
- Booted the full server: health check still 200; a bad/garbage auth
  token on the now-public `/products` route still reaches the database
  layer rather than being rejected (proves `identify` never blocks);
  `POST /products` with no auth still correctly returns 401 (proves
  write routes are untouched and still fully protected).
- Full syntax check across every backend file.

## Files changed

`backend/src/middleware/auth.js`,
`backend/src/routes/{product,category,timeSlot,paymentAccount}Routes.js`,
`backend/src/controllers/{product,category}Controller.js`.
No frontend files, no database schema changes.
