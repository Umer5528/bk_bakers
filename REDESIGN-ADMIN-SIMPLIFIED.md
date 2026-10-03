# Admin Panel — Made Simple

Reworked for a non-technical owner using her phone. Same backend, same
data, same permissions — only how it's presented changed.

## The big changes

**Plain words everywhere.** "Verify Payment" → "Payment received?".
"Fulfillment Type" → "Delivery or Pickup". "Display Order" → up/down
arrows. Every menu item is a job she'd recognise ("How Customers Pay",
"Days Off"), not a database term.

**One thing to do at a time.** Order Detail now leads with a single
"What to do now" box — one sentence telling her the next step, and one
big button to do it. Payments needing a check are literally spelled
out: "Step 1: Check the payment... look at your account, then tap
Payment received."

**Real labels, not placeholder-only fields.** Every input has a visible
label above it (`FormField`), an example in the field itself
("e.g. Chocolate Dream Cake"), and a one-line hint under trickier ones
(prep time, cutoff time). Nothing relies on a placeholder that
disappears the moment she starts typing.

**On/off switches instead of checkboxes**, always spelled out in words
("Accepting" / "Not accepting", "Showing" / "Hidden") — never just a
tick with no context.

**Friendly confirmations.** Every delete/cancel now opens a proper
dialog with a plain-language question and consequence ("Customers won't
be able to choose it any more"), replacing the browser's blunt "Are you
sure?" popup. Cancelling an order lets her type why, in her own words.

**Products form got a full rebuild** — six short, numbered sections
(Basics → Photos → Sizes → Extra choices → More details → Who can see
it) instead of one long form. Optional stuff (shapes, flavors,
toppings) lives behind labelled "tap to add" boxes so a simple cake
with just sizes takes under a minute, but nothing's hidden for owners
who need more.

**Navigation is grouped by what she's doing** ("Every day" / "What you
sell" / "Your customers" / "Shop setup") instead of one long flat list.
On her phone, the four things she'll touch daily — Home, Orders, Cakes,
and a "More" button for everything else — sit in a real bottom bar.

**Home screen re-purposed** from a stats wall into "what needs your
attention" cards (payments to check, new custom requests, today's
deliveries/pickups) plus a **"Get your shop ready" checklist** that
appears automatically until she's added a menu section, an item, a
payment account, a delivery time, and her shop details — then quietly
disappears.

**Orders list** now has simple tabs (New / In progress / Payments to
check / Completed / Cancelled) instead of three dropdown filters, and
every order shows the delivery/pickup date as "Today" / "Tomorrow" /
"Sat, 3 Oct" rather than a raw ISO date.

**Call and WhatsApp buttons** appear next to every customer's name — on
the order, the custom-cake request, and the customer list — so she
never has to leave the app to reach someone.

**Days Off** is now a real calendar she taps, plus an "I'm taking
tomorrow off" shortcut — no date-typing.

## What did *not* change

No backend, schema, or permission changes beyond one tiny, additive
tweak: the order list's `status` filter now also accepts a
comma-separated list (`confirmed,preparing,ready,...`) so the "In
progress" tab can ask for everything between New and Completed in one
request. A single status still works exactly as before.

## Verified

`npm run build` — clean, every admin page still code-splits into its
own chunk. Backend re-booted and health-checked after the filter tweak.
Grepped the whole frontend — zero legacy color tokens anywhere,
including every new file added this round.
