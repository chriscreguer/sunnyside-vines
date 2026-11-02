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
// the wine details block, shared with the quick-look modal on trade.html
const WineDetail = require('./js/wine-detail.js');

const SITE_ORIGIN = 'https://www.sunnysidevines.com';

const root = __dirname;
const config = fs.readFileSync(path.join(root, 'shop-config.js'), 'utf8');
const { PRODUCERS, PRODUCTS, bottleImage } = vm.runInNewContext(config + ';({ PRODUCERS, PRODUCTS, bottleImage })', {});
// Keep existing links usable when the catalog replaces a wine.
const REDIRECTS = {
  'convento-seleccion-familia-2020': 'convento-memoria-reserva-2022',
};

const { esc } = WineDetail;

const money = (n) => '$' + parseFloat(n).toFixed(2);

function pageHTML(p) {
  const meta = PRODUCERS[p.producer];
  const title = `${[p.name, p.vintage].filter(Boolean).join(' ')} — ${meta.name}`;
  const canonical = `${SITE_ORIGIN}/wines/${p.id}.html`;
  const imageURL = `${SITE_ORIGIN}/${encodeURI(p.image)}`;

  // the producer (photo beside their blurb), then their other wines as shop cards
  const producerNoteHTML = `
            <section class="producer-note">
                <figure class="producer-note-img"><img src="../${esc(meta.image)}" alt="${esc(meta.name)}" loading="lazy"></figure>
                <div class="producer-note-body">
                    <h2 class="producer-note-name">${esc(meta.name)}</h2>
                    <p data-i18n-data="producer:${p.producer}:blurb">${esc(meta.blurb)}</p>
                    <a class="producer-note-link" href="../index.html#${esc(meta.anchor)}" data-i18n="wine.meet">Meet the producer &rarr;</a>
                </div>
            </section>`;

  const otherWines = PRODUCTS.filter((o) => o.producer === p.producer && o.id !== p.id);
  const moreFromHTML = otherWines.length ? `
            <section class="more-from">
                <h2 class="more-from-heading"><span data-i18n="wine.moreFrom">More from</span> ${esc(meta.name)}</h2>
                <div class="wine-grid">
                    ${otherWines.map((o) => `<a class="wine-card producer-${o.producer}" href="${o.id}.html">
                        <div class="wine-media fit-${o.fit} producer-${o.producer}">
                            <img src="../${esc(bottleImage(o))}" alt="${esc(`${o.name} ${o.vintage}`)}" loading="lazy">
                        </div>
                        <div class="wine-body">
                            <h3 class="wine-name">${esc(o.name)} <span class="wine-vintage">${esc(o.vintage)}</span></h3>
                            <p class="wine-meta" data-i18n-data="product:${o.id}:meta">${esc(o.meta)}</p>
                            <div class="wine-foot"><span class="wine-price">${money(o.price)}</span></div>
                        </div>
                    </a>`).join('\n                    ')}
                </div>
            </section>` : '';

  const jsonld = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${p.name} ${p.vintage}`,
    image: `${SITE_ORIGIN}/${encodeURI(bottleImage(p, 'large', 'png'))}`, // the clean cutout for search results
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
    <link rel="stylesheet" href="../age-gate.css">
    <script src="../age-gate.js" defer></script>
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
    <noscript><div class="age-gate-noscript">You must be 21 or older to visit Sunnyside Vines.<br>Please enable JavaScript to confirm your age.</div></noscript>
    <!-- Navigation (shared with the homepage) -->
    <nav class="nav" id="nav">
        <a href="../index.html" class="nav-mark" aria-label="Sunnyside Vines home">
            <img src="../img/logo_hero.svg" alt="">
        </a>
        <div class="nav-right">
            <div class="nav-links" id="navLinks">
                <a href="../index.html#producer" data-i18n="nav.producers">Producers</a>
                <a href="../index.html#wines" data-i18n="nav.wines">Wines</a>
                <a href="../index.html#story" data-i18n="nav.about">About</a>
                <a href="../trade.html" data-i18n="nav.trade">Trade</a>
                <a href="../index.html#contact" data-i18n="nav.contact">Contact</a>
                <a href="../shop.html" class="cta" data-i18n="nav.shop">Shop</a>
            </div>
            <button class="cart-toggle" id="cart-toggle" aria-label="Open cart" data-i18n-attr="aria-label:cart.open">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <circle cx="9.5" cy="20" r="1.4" fill="currentColor"/>
                    <circle cx="18" cy="20" r="1.4" fill="currentColor"/>
                    <path d="M2.5 3.5h2.6l2.5 11.4a1.8 1.8 0 0 0 1.76 1.4h8.5a1.8 1.8 0 0 0 1.76-1.4L21.5 7.5H6.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="cart-label" data-i18n="cart.label">Cart</span>
                <span class="cart-count hidden" id="cart-count">0</span>
            </button>
            <button class="nav-toggle" id="navToggle" aria-label="Toggle menu" data-i18n-attr="aria-label:nav.menu">
                <span></span><span></span><span></span>
            </button>
        </div>
    </nav>

    <!-- Wine detail -->
    <main class="shop-main wine-page-main">
        <div class="wrap">
            <nav class="crumbs" aria-label="Breadcrumb">
                <a href="../shop.html" data-i18n="wine.allWines">&larr; All wines</a>
            </nav>
            ${WineDetail.html(p, meta, {
              assetRoot: '../',
              image: bottleImage(p, 'large'),
              actions: `<div class="detail-foot">
                        <span class="wine-price">${money(p.price)}</span>
                        <button class="add-btn" data-add="${p.id}" data-i18n="cart.add">Add to cart</button>
                    </div>
                    <p class="detail-links">
                        ${p.ficha ? `<a href="../${encodeURI(p.ficha)}" target="_blank" rel="noopener" data-i18n="wine.specPdf">Spec sheet (PDF)</a><span aria-hidden="true">·</span>` : ''}
                        <a href="../trade.html?add=${p.id}" data-i18n="wine.tradeAdd">Add to a trade order →</a>
                    </p>`,
            })}${producerNoteHTML}${moreFromHTML}
        </div>
    </main>

    <!-- Cart drawer -->
    <div class="cart-overlay" id="cart-overlay"></div>
    <aside class="cart-drawer" id="cart-drawer" aria-label="Shopping cart">
        <div class="cart-head">
            <h2 data-i18n="cart.title">Your Cart</h2>
            <button class="cart-close" id="cart-close" aria-label="Close cart" data-i18n-attr="aria-label:cart.close">&times;</button>
        </div>
        <div class="cart-items" id="cart-items"></div>
        <div class="cart-foot">
            <div class="cart-subtotal">
                <span data-i18n="cart.subtotal">Subtotal</span>
                <span id="cart-subtotal-value">$0.00</span>
            </div>
            <button class="checkout-btn" id="checkout-btn" disabled data-i18n="cart.checkout">Checkout</button>
        </div>
    </aside>

    <div class="toast" id="toast"></div>

    <!-- Footer (shared with the homepage) -->
    <footer class="footer">
        <div class="wrap">
            <div class="footer-top">
                <div>
                    <div class="footer-brand">Sunnyside Vines</div>
                    <p class="muted" data-i18n="footer.tagline">Wine imports · New York City</p>
                    <div class="footer-links">
                        <a href="../index.html#producer" data-i18n="nav.producers">Producers</a>
                        <a href="../shop.html" data-i18n="nav.shop">Shop</a>
                        <a href="../trade.html" data-i18n="footer.trade">Trade orders</a>
                        <a href="../faq.html" data-i18n="footer.faq">FAQ</a>
                        <a href="../index.html#contact" data-i18n="nav.contact">Contact</a>
                    </div>
                </div>
                <form class="newsletter" data-newsletter>
                    <label for="newsletter-email" data-i18n="footer.newsletter">Newsletter</label>
                    <p data-i18n="footer.newsletterCopy">New arrivals and updates, sent a few times a year.</p>
                    <div class="newsletter-row">
                        <input type="email" id="newsletter-email" name="email" placeholder="Your email" data-i18n-attr="placeholder:footer.emailPlaceholder" autocomplete="email" required>
                        <button type="submit" class="btn" data-i18n="footer.subscribe">Subscribe</button>
                    </div>
                </form>
            </div>
            <div class="footer-bottom">
                <span data-i18n="footer.rights">© 2026 Sunnyside Vines. All rights reserved.</span>
                <span class="footer-legal">
                    <a href="../terms.html" data-i18n="footer.terms">Terms &amp; Conditions</a>
                    <a href="../privacy.html" data-i18n="footer.privacy">Privacy Policy</a>
                    <a href="tel:+19297389424">+1 929.738.9424</a>
                    <a href="mailto:info@sunnysidevines.com">info@sunnysidevines.com</a>
                </span>
            </div>
        </div>
    </footer>

    <script src="../js/newsletter.js"></script>
    <script src="../shop-config.js"></script>
    <script src="../js/i18n.js"></script>
    <script src="../shop.js"></script>
</body>
</html>
`;
}

const outDir = path.join(root, 'wines');
fs.mkdirSync(outDir, { recursive: true });

// remove pages for wines no longer in the config
for (const f of fs.readdirSync(outDir)) {
  if (f.endsWith('.html') && !PRODUCTS.some((p) => `${p.id}.html` === f) && !REDIRECTS[f.slice(0, -5)]) {
    fs.unlinkSync(path.join(outDir, f));
    console.log(`removed wines/${f}`);
  }
}

for (const p of PRODUCTS) {
  const file = path.join(outDir, `${p.id}.html`);
  fs.writeFileSync(file, pageHTML(p));
  console.log(`wrote wines/${p.id}.html`);
}
for (const [oldId, newId] of Object.entries(REDIRECTS)) {
  const product = PRODUCTS.find((p) => p.id === newId);
  if (!product) throw new Error(`Missing redirect target: ${newId}`);
  fs.writeFileSync(path.join(outDir, `${oldId}.html`), `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../age-gate.css">
    <script src="../age-gate.js" defer></script>
    <meta http-equiv="refresh" content="0;url=${newId}.html">
    <link rel="canonical" href="${SITE_ORIGIN}/wines/${newId}.html">
    <title>Updated wine selection · Sunnyside Vines</title>
</head>
<body>
    <noscript><div class="age-gate-noscript">You must be 21 or older to visit Sunnyside Vines.<br>Please enable JavaScript to confirm your age.</div></noscript>
    <p>Our current Convento Oreja selection features <a href="${newId}.html">${esc(product.name)} ${esc(product.vintage)}</a>.</p>
</body>
</html>
`);
}
console.log(`${PRODUCTS.length} pages generated.`);
