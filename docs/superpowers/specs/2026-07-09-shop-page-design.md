# Sunnyside Vines — Shop Page Design

**Date:** 2026-07-09
**Status:** Approved (design), pending spec review

## Goal

Add a shopping page to the Sunnyside Vines site that sells the wines in the
`new assets/` folder through a **real Shopify checkout**, styled to match the
existing main site (`index.html`). The Shopify store does not exist yet, so the
page is built against a single config seam with placeholder IDs and a demo mode,
plus a setup guide for standing up the store later.

## Decisions (locked)

- **Commerce:** Real Shopify checkout via the Shopify Buy Button JS SDK
  (`shopify-buy` from CDN). Custom-designed cards; SDK owns cart + hosted checkout.
- **Store state:** None yet. Build against a config file; ship a `DEMO_MODE`
  fallback so the page is fully demoable, plus `SHOPIFY-SETUP.md`.
- **Visual style:** Match `index.html` (cream `#F5F1EE`, Fraunces / Geist Mono /
  NuGELO, terracotta accent `#B15321` / `#AC4B1F`, dark brown `#1a1008`).
- **Structure:** New standalone `shop.html`; add a **Shop** link to the navbar on
  both `index.html` and `shop.html`.
- **Convento Oreja images:** Their PDFs are TTB COLA regulatory forms, not clean
  label art. Convento Oreja uses styled typographic placeholder cards until real
  label images are provided. (Los Ángeles and Peñafalcón have usable label photos.)

## Architecture

Static site, no build step (matches the rest of the repo). New files:

| File | Purpose |
|------|---------|
| `shop.html` | The shop page. Reuses navbar + footer markup from `index.html`; adds cart icon and cart drawer. |
| `shop.css` | Shop-scoped styles. Imports/relies on the same fonts as `styles.css`; does not modify `styles.css`. |
| `shop.js` | Renders product cards from config, wires Add-to-cart, cart drawer, Shopify checkout, and demo mode. |
| `shop-config.js` | The single commerce seam: `SHOPIFY` credentials + `PRODUCTS` array. Hand-edited when the store goes live. |
| `SHOPIFY-SETUP.md` | Step-by-step: create store, add products, get Storefront token, paste IDs. |
| `img/shop/*` | Optimized label images (Los Ángeles, Peñafalcón). |

`index.html` change: add `<a href="shop.html">Shop</a>` to `.navbar-links` and
`.mobile-menu` (uncomment/replace the existing dormant "Wines" slot).

### Data model — `shop-config.js`

```js
const SHOPIFY = {
  domain: '',                 // e.g. 'sunnyside-vines.myshopify.com' — blank ⇒ DEMO_MODE
  storefrontAccessToken: '',  // Storefront API token
};

const PRODUCTS = [
  {
    id: 'penafalcon-gran-reserva-2007',
    producer: 'Bodega Peñafalcón',
    name: 'Gran Reserva',
    vintage: '2007',
    varietal: 'Tempranillo',
    appellation: 'Ribera del Duero',
    note: '5 años en barrica — ...',        // one-line tasting note from ficha
    price: '0.00',                          // demo-only display price
    image: 'img/shop/penafalcon-gran-reserva-2007.jpg',
    ficha: 'new assets/Peñafalcon/ficha60mb2007.pdf', // "Ficha técnica" link
    shopify: { productId: '', variantId: '' },        // filled when store is live
  },
  // ...
];
```

`DEMO_MODE` is derived: `!SHOPIFY.domain || !SHOPIFY.storefrontAccessToken`.

### Runtime behavior — `shop.js`

1. On load, render product cards grouped by `producer` (producer subheading per group).
2. **Live mode** (`shopify-buy` SDK): build a client, create/persist a checkout
   (localStorage `checkoutId`). Add-to-cart → `addLineItems`; cart drawer reads
   the checkout; **Checkout** → `window.location = checkout.webUrl`.
3. **Demo mode:** a local in-memory cart. Add-to-cart animates and updates the
   count/drawer; **Checkout** shows a friendly "store coming soon" message.
   No SDK network calls; page never errors on missing credentials.
4. Cart count badge on the navbar cart icon reflects total quantity.

Load the SDK with `defer`; guard all SDK access behind a `DEMO_MODE` check so the
page works even if the CDN script is blocked.

## Page layout — `shop.html`

1. **Navbar** (shared) — logo, links (Featured Producer, Shop, Contact), cart icon + count, hamburger.
2. **Shop header** — Geist Mono eyebrow ("The Cellar"), Fraunces/NuGELO title, one-line intro.
3. **Product grid**, grouped by producer:
   - Peñafalcón — Gran Reserva 2007, 14 años 2003, Tinto de Autor 2004, 10 meses 2021
   - Los Ángeles — Cruz Alta, Las Suertes, Romeroso
   - Convento Oreja — Roble, Crianza 2022, Selección de Familia 2020 (placeholder art)
   - Card: label image, name, vintage, varietal + appellation, one-line note, price, **Add to cart**, "Ficha técnica" PDF link.
4. **Cart drawer** — slide-in from right; line items (thumb, name, qty ±, remove), subtotal, **Checkout**, empty state.
5. **Footer** (shared).

Responsive: grid collapses to 1 column on mobile; cart drawer becomes full-width;
navbar uses the existing hamburger pattern.

## Content sourcing

- Product names/vintages/varietals: from `new assets/` filenames + fichas
  (e.g. COLA confirms Convento Oreja Roble = Tempranillo, Ribera del Duero).
- One-line tasting notes: read from the English fichas (rendered via `qlmanage`
  during implementation) where available; otherwise a short editorial line.
- Prices: none provided — demo placeholders in `shop-config.js`; real prices live
  in Shopify.
- `Ficha técnica` link points at the corresponding PDF in `new assets/`.

## Image pipeline

- Los Ángeles fronts (`*.jpeg`) and Peñafalcón fronts (`*.jpg/JPG`): copy →
  `img/shop/` with web-friendly names, downscale/optimize via `sips` (max ~1000px,
  quality-reduced) to keep the page light.
- Convento Oreja: no clean label image; render a styled typographic placeholder
  card (brand wordmark on a label-like frame) consistent with the site palette.

## Out of scope (YAGNI)

- No real payment processing wired to live money until the store exists (config swap only).
- No inventory/stock display, reviews, search, filtering, or accounts.
- No CMS / dynamic backend — products live in `shop-config.js`.
- No changes to `styles.css` or the aged-document `index-v2` variant.

## Success criteria

- `shop.html` renders all ~10 wines grouped by producer, matching the main-site look, responsive on mobile.
- Add-to-cart, quantity edit, remove, and cart count work in demo mode with zero console errors and no store configured.
- Filling `SHOPIFY` + per-product `shopify` IDs switches the page to real Shopify checkout with no other code changes.
- `SHOPIFY-SETUP.md` lets a non-developer stand up the store and go live.
