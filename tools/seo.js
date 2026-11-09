/* ============================================================================
   Sunnyside Vines - search + sharing tags, sitemap.xml and robots.txt
   ----------------------------------------------------------------------------
   Writes a marked block of meta tags (description, canonical address, Open
   Graph / Twitter share tags) into each top-level page, right after its
   <title> - plus, on the homepage, the business details Google reads - and
   regenerates sitemap.xml and robots.txt at the site root.
   The wine pages get their own tags from generate-wine-pages.js.

   Run after editing a page's copy below, or after adding a wine:
     node tools/seo.js
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const SITE = 'https://www.sunnysidevines.com';
const SHARE_IMAGE = `${SITE}/img/share.jpg`; // 1200 x 630, Peñafiel at sunset

const PAGES = {
  'index.html': {
    path: '/',
    title: 'Sunnyside Vines · Spanish wine imports, New York City',
    description: 'Small-production Spanish wines imported direct from family estates in Ribera del Duero and Campo de Borja. Shop online, or order for your bar, restaurant or shop in New York.',
  },
  'shop.html': {
    path: '/shop.html',
    description: 'Every wine we import from Bodega Peñafalcón, Convento Oreja and Cooper Cellars – Los Ángeles: Tempranillo, Garnacha and orange wine from family estates in Spain.',
  },
  'trade.html': {
    path: '/trade.html',
    description: 'Wholesale orders for New York bars, restaurants and wine shops. Request small-production Spanish wines by the case or bottle; orders in by 11 am ET are delivered the next day.',
  },
  'faq.html': {
    path: '/faq.html',
    description: 'Answers about buying our wines, trade accounts, delivery and the producers behind them.',
  },
  'terms.html': {
    path: '/terms.html',
    description: 'The terms that apply when you use sunnysidevines.com or order from Sunnyside Vines.',
  },
  'privacy.html': {
    path: '/privacy.html',
    description: 'What information Sunnyside Vines collects, why, and the choices you have.',
  },
  'accessibility.html': {
    path: '/accessibility.html',
    description: 'How Sunnyside Vines makes its website accessible, and how to tell us about a problem.',
  },
};

// who we are, for search engines (homepage only)
const ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Sunnyside Vines',
  url: `${SITE}/`,
  logo: `${SITE}/img/favicon/android-chrome-512x512.png`,
  description: 'New York importer of small-production Spanish wines from family estates in Ribera del Duero and Campo de Borja.',
  email: 'info@sunnysidevines.com',
  telephone: '+1-929-738-9424',
  address: { '@type': 'PostalAddress', addressLocality: 'New York', addressRegion: 'NY', addressCountry: 'US' },
  areaServed: 'New York',
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const START = '<!-- seo (tools/seo.js) -->';
const END = '<!-- /seo -->';

for (const [file, page] of Object.entries(PAGES)) {
  const full = path.join(root, file);
  let html = fs.readFileSync(full, 'utf8');

  // the page's own <title> (index.html's is replaced with the fuller one above)
  const titleRe = /<title([^>]*)>([^<]*)<\/title>/;
  const m = html.match(titleRe);
  if (!m) throw new Error(`${file}: no <title>`);
  if (page.title) html = html.replace(titleRe, `<title$1>${esc(page.title)}</title>`);
  const title = page.title || m[2];

  const url = SITE + page.path;
  const block = [
    START,
    `<meta name="description" content="${esc(page.description)}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="Sunnyside Vines">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(page.description)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${SHARE_IMAGE}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    ...(file === 'index.html' ? [`<script type="application/ld+json">${JSON.stringify(ORGANIZATION)}</script>`] : []),
    END,
  ].map((l) => '    ' + l).join('\n');

  const existing = new RegExp(`\\n?[ \\t]*${START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${END}`);
  html = existing.test(html)
    ? html.replace(existing, '\n' + block)
    : html.replace(/(<title[^>]*>[^<]*<\/title>)/, `$1\n${block}`);
  fs.writeFileSync(full, html);
}

// sitemap: the pages above plus one entry per wine page
const config = fs.readFileSync(path.join(root, 'shop-config.js'), 'utf8');
const { PRODUCTS } = vm.runInNewContext(config + ';({ PRODUCTS })', {});
const urls = [
  ...Object.values(PAGES).map((p) => SITE + p.path),
  ...PRODUCTS.map((p) => `${SITE}/wines/${p.id}.html`),
];
fs.writeFileSync(path.join(root, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n') + '\n</urlset>\n');

// robots: everything public except old design drafts and the API
fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *
Disallow: /api/
Disallow: /concepts/
Disallow: /index-v1.html
Disallow: /index-v2.html
Disallow: /index-v3.html
Disallow: /index-v4.html
Disallow: /penafalcon-v2.html

Sitemap: ${SITE}/sitemap.xml
`);

console.log(`tagged ${Object.keys(PAGES).length} pages; sitemap.xml has ${urls.length} URLs; wrote robots.txt`);
