# Logo Integration — Update

## What I did

The provided `.png` had a solid white square background behind the
circular badge — placed directly on any of our tinted page sections
(blush, cream, white cards), that white square would have shown as a
visible edge, exactly the "sticker pasted on top" look you flagged.

I processed the logo (flood-filled the background to transparent,
stopping cleanly at the badge's own closed brown ring — verified this
didn't eat into the badge's interior light-gray halo, which is part of
its actual design) and used the resulting transparent PNG everywhere:

- **Header** — replaced the text wordmark with the real logo (since the
  logo already contains "BK_BAKERS," a separate text name next to it
  would have been redundant); the "Artistry You Can Taste" tagline stays
  as text beside it on desktop
- **Footer** — same treatment, larger
- **Hero section** — this is the "proper branding" placement: the logo
  now appears prominently above the headline at a generous size, with a
  soft rose-toned glow behind it so it reads as an integrated emblem
  rather than a dropped-in image
- **Favicon / browser tab icon / apple-touch-icon** — generated from the
  same processed logo

## How I verified it actually looks right

I didn't just assume the transparency fix worked — I built the app,
served it, and used a headless browser to screenshot the real rendered
Header, Hero, and Footer at both desktop (1440px) and mobile (390px)
widths, then cropped in close on the logo in each spot to check for
any leftover white edge. None remain — confirmed by looking at the
actual rendered pixels, not just the source image.

## Files touched

New: `frontend/src/assets/logo.png`, `frontend/src/components/common/BrandLogo.jsx`,
`frontend/public/favicon.png`, `frontend/public/logo-192.png`, `frontend/public/logo-512.png`.
Updated: `Navbar.jsx`, `Footer.jsx`, `Home.jsx` (hero), `index.html` (favicon links + OG image).

No backend changes. No other pages touched.
