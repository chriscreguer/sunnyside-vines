#!/usr/bin/env node
/* ============================================================================
   Sunnyside Vines - Wine page generator
   ----------------------------------------------------------------------------
   Reads shop-config.js (the single source of truth for products) and writes
   one static page per wine into wines/<id>.html.

   Run it whenever shop-config.js changes, then commit the output:

       node generate-wine-pages.js

   The pages are plain static HTML so search engines index every wine; cart
   and checkout behavior comes from the shared shop.js.
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SITE_ORIGIN = 'https://sunnyside-vines.vercel.app'; // update when a custom domain lands

const root = __dirname;
const config = fs.readFileSync(path.join(root, 'shop-config.js'), 'utf8');
const { PRODUCERS, PRODUCTS } = vm.runInNewContext(config + ';({ PRODUCERS, PRODUCTS })', {});

const esc = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const money = (n) => '$' + parseFloat(n).toFixed(2);

function pageHTML(p) {
  const meta = PRODUCERS[p.producer];
  const title = `${p.name} ${p.vintage} — ${meta.name}`;
  const canonical = `${SITE_ORIGIN}/wines/${p.id}.html`;
  const imageURL = `${SITE_ORIGIN}/${encodeURI(p.image)}`;
  const specs = (p.details || [])
    .map(([k, v]) => `<div class="detail-row"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
    .join('\n            ');

  const otherWines = PRODUCTS.filter((o) => o.producer === p.producer && o.id !== p.id);
  const moreFromHTML = otherWines.length ? `
            <section class="more-from reveal-fade">
                <h2 class="more-from-heading">More from ${esc(meta.name)}</h2>
                <div class="wine-grid">
                    ${otherWines.map((o) => `<a class="wine-card producer-${o.producer}" href="${o.id}.html">
                        <div class="wine-media fit-${o.fit} producer-${o.producer}">
                            <img src="../${esc(o.image)}" alt="${esc(`${o.name} ${o.vintage}`)}" loading="lazy">
                        </div>
                        <div class="wine-body">
                            <h3 class="wine-name">${esc(o.name)} <span class="wine-vintage">${esc(o.vintage)}</span></h3>
                            <p class="wine-meta">${esc(o.meta)}</p>
                            <div class="wine-foot"><span class="wine-price">${money(o.price)}</span></div>
                        </div>
                    </a>`).join('\n                    ')}
                </div>
            </section>` : '';

  const jsonld = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${p.name} ${p.vintage}`,
    image: imageURL,
    description: p.note,
    brand: { '@type': 'Brand', name: meta.name },
    offers: {
      '@type': 'Offer',
      url: canonical,
      priceCurrency: 'USD',
      price: p.price,
      availability: 'https://schema.org/InStock',
    },
  }, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(title)} · Sunnyside Vines</title>
    <meta name="description" content="${esc(p.note)}">
    <link rel="canonical" href="${canonical}">

    <meta property="og:type" content="product">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(p.note)}">
    <meta property="og:image" content="${esc(imageURL)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:site_name" content="Sunnyside Vines">

    <script type="application/ld+json">
${jsonld}
    </script>

    <!-- Favicons -->
    <link rel="apple-touch-icon" sizes="180x180" href="../img/favicon/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="../img/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../img/favicon/favicon-16x16.png">
    <link rel="manifest" href="../img/favicon/site.webmanifest">
    <link rel="shortcut icon" href="../img/favicon/favicon.ico">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,650;1,9..144,500&family=Hanken+Grotesk:ital,wght@0,300..800;1,400..600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../styles-v4.css">
    <link rel="stylesheet" href="../shop.css">

    <!-- Shopify Buy Button SDK (used only when a store is configured) -->
    <script src="https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js" defer></script>

    <!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-1P28ZYLYGQ"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-1P28ZYLYGQ');
    </script>
</head>
<body class="shop-page wine-page" data-asset-root="../">
    <!-- Navigation (shared with the homepage) -->
    <nav class="nav" id="nav">
        <a href="../index.html" class="nav-mark" aria-label="Sunnyside Vines home">
            <img src="../img/logo_hero.svg" alt="">
        </a>
        <div class="nav-right">
            <div class="nav-links" id="navLinks">
                <a href="../index.html#producer">Producers</a>
                <a href="../index.html#wines">Wines</a>
                <a href="../index.html#story">About</a>
                <a href="../index.html#contact">Contact</a>
                <a href="../shop.html" class="cta">Shop</a>
            </div>
            <button class="cart-toggle" id="cart-toggle" aria-label="Open cart">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <circle cx="9.5" cy="20" r="1.4" fill="currentColor"/>
                    <circle cx="18" cy="20" r="1.4" fill="currentColor"/>
                    <path d="M2.5 3.5h2.6l2.5 11.4a1.8 1.8 0 0 0 1.76 1.4h8.5a1.8 1.8 0 0 0 1.76-1.4L21.5 7.5H6.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="cart-label">Cart</span>
                <span class="cart-count hidden" id="cart-count">0</span>
            </button>
            <button class="nav-toggle" id="navToggle" aria-label="Toggle menu">
                <span></span><span></span><span></span>
            </button>
        </div>
    </nav>

    <!-- Wine detail -->
    <main class="shop-main wine-page-main">
        <div class="wrap">
            <nav class="crumbs" aria-label="Breadcrumb">
                <a href="../shop.html">&larr; All wines</a>
            </nav>
            <article class="wine-detail">
                <div class="detail-media fit-${p.fit} producer-${p.producer} enter">
                    <img src="../${esc(p.image)}" alt="${esc(`${p.name} ${p.vintage}`)}">
                </div>
                <div class="detail-body enter" data-enter-delay="1">
                    <p class="detail-producer">${esc(meta.name)} · ${esc(meta.region)}</p>
                    <h1 class="detail-name">${esc(p.name)} <span class="wine-vintage">${esc(p.vintage)}</span></h1>
                    <p class="wine-meta">${esc(p.meta)}</p>
                    <p class="detail-note">${esc(p.tasting || p.note)}</p>
                    ${specs ? `<dl class="detail-specs">\n            ${specs}\n          </dl>` : ''}
                    <div class="detail-foot">
                        <span class="wine-price">${money(p.price)}</span>
                        <button class="add-btn" data-add="${p.id}">Add to cart</button>
                    </div>
                    ${p.ficha ? `<a class="ficha-link detail-pdf" href="../${encodeURI(p.ficha)}" target="_blank" rel="noopener">Producer spec sheet (PDF) →</a>` : ''}
                </div>
            </article>${moreFromHTML}
        </div>
    </main>

    <!-- Cart drawer -->
    <div class="cart-overlay" id="cart-overlay"></div>
    <aside class="cart-drawer" id="cart-drawer" aria-label="Shopping cart">
        <div class="cart-head">
            <h2>Your Cart</h2>
            <button class="cart-close" id="cart-close" aria-label="Close cart">&times;</button>
        </div>
        <div class="cart-items" id="cart-items"></div>
        <div class="cart-foot">
            <div class="cart-subtotal">
                <span>Subtotal</span>
                <span id="cart-subtotal-value">$0.00</span>
            </div>
            <button class="checkout-btn" id="checkout-btn" disabled>Checkout</button>
        </div>
    </aside>

    <div class="toast" id="toast"></div>

    <!-- Footer (shared with the homepage) -->
    <footer class="footer">
        <div class="wrap">
            <div class="footer-top">
                <div>
                    <div class="footer-brand">Sunnyside Vines</div>
                    <p class="muted">Wine imports · New York City</p>
                    <div class="footer-links">
                        <a href="../index.html#producer">Producers</a>
                        <a href="../index.html#wines">Wines</a>
                        <a href="../shop.html">Shop</a>
                        <a href="../index.html#contact">Contact</a>
                    </div>
                </div>
                <img src="../img/logomark_white.svg" alt="" class="footer-logo">
            </div>
            <div class="footer-bottom">
                <span>© 2026 Sunnyside Vines. All rights reserved.</span>
                <span>info@sunnysidevines.com</span>
            </div>
        </div>
    </footer>

    <script src="../shop-config.js"></script>
    <script src="../shop.js"></script>
</body>
</html>
`;
}

const outDir = path.join(root, 'wines');
fs.mkdirSync(outDir, { recursive: true });

// remove pages for wines no longer in the config
for (const f of fs.readdirSync(outDir)) {
  if (f.endsWith('.html') && !PRODUCTS.some((p) => `${p.id}.html` === f)) {
    fs.unlinkSync(path.join(outDir, f));
    console.log(`removed wines/${f}`);
  }
}

for (const p of PRODUCTS) {
  const file = path.join(outDir, `${p.id}.html`);
  fs.writeFileSync(file, pageHTML(p));
  console.log(`wrote wines/${p.id}.html`);
}
console.log(`${PRODUCTS.length} pages generated.`);
