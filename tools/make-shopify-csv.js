/* Builds tools/shopify-products.csv, a Shopify product import, from
   shop-config.js plus the distributor sheet (UPCs, case sizes, ABV, type).
   Run: node tools/make-shopify-csv.js   then Products > Import in Shopify. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const config = fs.readFileSync(path.join(root, 'shop-config.js'), 'utf8');
const { PRODUCERS, PRODUCTS, bottleImage } = vm.runInNewContext(config + ';({ PRODUCERS, PRODUCTS, bottleImage })', {});

const SITE = 'https://www.sunnysidevines.com';

// From the distributor price sheet (Reuben, Oct 2026)
const SHEET = {
  'convento-roble-2025':            { upc: '810196112001', caseOf: 12, abv: '14%',   type: 'Red wine' },
  'convento-crianza-2022':          { upc: '810196112018', caseOf: 12, abv: '14.5%', type: 'Red wine' },
  'convento-memoria-reserva-2022':  { upc: '810196112025', caseOf: 6,  abv: '15%',   type: 'Red wine' },
  'los-angeles-las-suertes':        { upc: '810196112032', caseOf: 12, abv: '12%',   type: 'Orange wine' },
  'los-angeles-cruz-alta-2025':     { upc: '810196112070', caseOf: 12, abv: '14%',   type: 'Red wine' },
  'los-angeles-romeroso-2021':      { upc: '810196112087', caseOf: 12, abv: '14.5%', type: 'Red wine' },
  'penafalcon-10-meses-2021':       { upc: '810196112094', caseOf: 6,  abv: '14%',   type: 'Red wine' },
  'penafalcon-tinto-de-autor-2004': { upc: '810196112100', caseOf: 6,  abv: '14.5%', type: 'Red wine' },
  'penafalcon-gran-reserva-2007':   { upc: '810196112117', caseOf: 6,  abv: '15%',   type: 'Red wine' },
  'penafalcon-14-anos-2003':        { upc: '810196112124', caseOf: 6,  abv: '15%',   type: 'Red wine' },
};

const COLUMNS = [
  'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category', 'Type', 'Tags', 'Published',
  'Option1 Name', 'Option1 Value', 'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker',
  'Variant Inventory Policy', 'Variant Fulfillment Service', 'Variant Price', 'Variant Requires Shipping',
  'Variant Taxable', 'Variant Barcode', 'Variant Weight Unit', 'Image Src', 'Image Position', 'Image Alt Text',
  'Gift Card', 'SEO Title', 'SEO Description', 'Status',
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const cell = (v) => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const rows = PRODUCTS.map((p) => {
  const s = SHEET[p.id];
  if (!s) throw new Error(`No sheet data for ${p.id}`);
  const producer = PRODUCERS[p.producer];
  const title = `${p.name} ${p.vintage}`.trim();
  const specs = (p.details || []).map(([k, v]) => `<li><strong>${esc(k)}:</strong> ${esc(v)}</li>`).join('');
  const body = `<p>${esc(p.tasting || p.note)}</p>` +
    `<ul>${specs}<li><strong>Bottle:</strong> 750 ml</li><li><strong>Case:</strong> ${s.caseOf} bottles</li></ul>`;
  return {
    'Handle': p.id,
    'Title': title,
    'Body (HTML)': body,
    'Vendor': producer.name,
    'Product Category': 'Food, Beverages & Tobacco > Beverages > Alcoholic Beverages > Wine',
    'Type': s.type,
    'Tags': [producer.name, producer.region, s.type, p.vintage && `Vintage ${p.vintage}`, `Case of ${s.caseOf}`, `ABV ${s.abv}`].filter(Boolean).join(', '),
    'Published': 'FALSE',
    'Option1 Name': 'Title',
    'Option1 Value': 'Default Title',
    'Variant SKU': s.upc,
    'Variant Grams': 1300,                 // a filled 750 ml bottle, roughly
    'Variant Inventory Tracker': '',       // not tracked until BevStack says how stock works
    'Variant Inventory Policy': 'deny',
    'Variant Fulfillment Service': 'manual',
    'Variant Price': p.price,
    'Variant Requires Shipping': 'TRUE',
    'Variant Taxable': 'TRUE',
    'Variant Barcode': s.upc,
    'Variant Weight Unit': 'g',
    'Image Src': `${SITE}/${bottleImage(p, 'large')}`,
    'Image Position': 1,
    'Image Alt Text': `${title}, ${producer.name}`,
    'Gift Card': 'FALSE',
    'SEO Title': `${title} · ${producer.name}`,
    'SEO Description': p.note,
    'Status': 'draft',
  };
});

const out = [COLUMNS.join(','), ...rows.map((r) => COLUMNS.map((c) => cell(r[c])).join(','))].join('\n') + '\n';
const file = path.join(__dirname, 'shopify-products.csv');
fs.writeFileSync(file, out);
console.log(`wrote ${path.relative(root, file)} (${rows.length} products)`);
