# Module 2 — Custom Cake Requests & Quotations

## Audit result

Traced the full path: submission → DB save → admin inbox → request
detail → quotation → customer view → response. Checked the model,
controllers, routes, and both frontend pages against each other.

**The described bug ("admin can't see the original request") does not
reproduce in this codebase.** Every request is saved with its customer
reference and image, `getAllCustomOrders` returns every request
(no filtering bug like the one found in the previous fix), and
`quoteCustomOrder` updates the *same* record by its real `_id` — it
never creates a duplicate or loses the original. Confirmed the field
names match exactly between backend responses and frontend reads.

## What I actually fixed

One real, small gap found during the audit: quotes and responses had
no timestamp, so the admin brief's ask for "quotation date" / "response
date" had nothing to show.

- Added `quotedAt` / `respondedAt` to the `CustomOrder` model.
- Set automatically in `quoteCustomOrder` / `respondToQuote`.
- Shown in the admin request view ("You quoted Rs. 4,500 on 3 Oct").

## Tested

Called the real `quoteCustomOrder` function with `CustomOrder.findById`
stubbed at the DB boundary only — confirmed `quotedAt` gets set and
status moves to `"quoted"`. Full backend syntax sweep, clean. Frontend
`npm run build`, clean.

## Files changed

`backend/src/models/CustomOrder.js`,
`backend/src/controllers/customOrderController.js`,
`frontend/src/pages/admin/AdminCustomRequests.jsx`.
