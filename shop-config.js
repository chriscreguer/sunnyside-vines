/* ============================================================================
   Sunnyside Vines - Shop configuration
   ----------------------------------------------------------------------------
   This is the ONLY file you edit to connect the shop to a real Shopify store.
   See SHOPIFY-SETUP.md for the full walkthrough.

   1. Create a Shopify store and add each wine below as a product.
   2. Enable the Storefront API and paste your domain + token into SHOPIFY.
   3. For each wine, paste its Shopify `productId` and `variantId`.

   While SHOPIFY.domain or SHOPIFY.storefrontAccessToken is empty, the page runs
   in DEMO MODE: the cart works locally and checkout shows a "coming soon"
   message instead of sending anyone to a real (non-existent) checkout.
   ========================================================================== */

const SHOPIFY = {
  // e.g. 'sunnyside-vines.myshopify.com'  (leave blank to stay in demo mode)
  domain: '',
  // Storefront API access token (leave blank to stay in demo mode)
  storefrontAccessToken: '',
};

/* Producer blurbs shown above each group of wines. */
const PRODUCERS = {
  penafalcon: {
    name: 'Bodega Peñafalcón',
    region: 'Ribera del Duero, Spain',
    blurb:
      'A family winery in Peñafiel producing bold, expressive Tempranillo: organic ' +
      'vineyards, meticulous hand-selection, and long barrel aging over limestone soils.',
  },
  losangeles: {
    name: 'Los Ángeles',
    region: 'Campo de Borja, Spain',
    blurb:
      'Zero-intervention, single-vineyard wines from grower Michael Cooper. Each label ' +
      'carries a Romantic-period painting, chosen to express the spirit of natural winemaking.',
  },
  convento: {
    name: 'Convento Oreja',
    region: 'Ribera del Duero, Spain',
    blurb:
      'Tinta del País grown at over 900 metres in Peñafiel. Founded in 2002, the estate ' +
      'crafts elegant, balsamic-tinged reds from old vines and French oak.',
  },
};

/* The wines. `price` is a DEMO placeholder (in USD) shown until a real Shopify
   store is connected - edit freely. Real prices come from Shopify once live. */
const PRODUCTS = [
  // ── Bodega Peñafalcón ─────────────────────────────────────────────────────
  {
    id: 'penafalcon-gran-reserva-2007',
    producer: 'penafalcon',
    name: 'Gran Reserva',
    vintage: '2007',
    meta: 'Tempranillo',
    badge: 'Two Grand Gold',
    note: 'Five years in barrel. Cherry-red with a tile rim; black-fruit compote, plum jam, fig, ' +
          'nutmeg, licorice and cigar leaf. A silky, velvety attack that builds to a long finish.',
    price: '75.00',
    tasting: 'Cherry-red with a tile rim, clean and bright. An intense, complex nose of compoted ' +
             'black fruit — plum jam, raspberry, ripe fig — over spice and roast: black licorice, ' +
             'nutmeg, cigar leaf. Soft on entry, building to a full-bodied burst of flavor with ' +
             'silky, velvety tannins and a long, persistent finish. Grown in the family’s own ' +
             'vineyards in Peñafiel and aged sixty months in fine-grain American and French oak; ' +
             'twice awarded Grand Gold internationally.',
    details: [
      ['Serve', '16–18 °C'],
      ['Pairs with', 'Roast lamb, game and well-aged cheeses — or nothing at all'],
    ],
    image: 'img/shop/penafalcon-gran-reserva-2007.jpg',
    fit: 'label',
    ficha: 'new assets/Peñafalcon/ficha60mb2007.pdf',
    shopify: { productId: '', variantId: '' },
  },
  {
    id: 'penafalcon-14-anos-2003',
    producer: 'penafalcon',
    name: '14 Años',
    vintage: '2003',
    meta: 'Tempranillo',
    badge: 'Three Great Gold',
    note: 'A selected-vintage rarity from a family cellar, patiently aged in American and French ' +
          'oak, decorated with two international and one national Great Gold. Serve at 16–18 °C.',
    price: '95.00',
    details: [
      ['Serve', '16–18 °C'],
      ['Pairs with', 'A slow dinner: aged beef, Ibérico ham, mature Manchego'],
    ],
    image: 'img/shop/penafalcon-14-anos-2003.jpg',
    fit: 'label',
    ficha: 'new assets/Peñafalcon/14 anos 2003 contra.pdf',
    shopify: { productId: '', variantId: '' },
  },
  {
    id: 'penafalcon-tinto-de-autor-2004',
    producer: 'penafalcon',
    name: 'Tinto de Autor',
    vintage: '2004',
    meta: 'Tempranillo',
    badge: 'Gold & Great Gold',
    note: 'The winemaker’s signature cuvée: thirty-six months in American and French oak from a ' +
          'single selected vintage. Deep, structured and built to keep.',
    price: '65.00',
    tasting: 'The winemaker’s signature cuvée: thirty-six months in American and French oak ' +
             'from a single selected vintage. Deep, structured and built to keep. Twice ' +
             'gold-medalled internationally, alongside a national Great Gold.',
    details: [
      ['Serve', '16–18 °C'],
      ['Pairs with', 'Braised and roasted meats, mature cheeses'],
    ],
    image: 'img/shop/penafalcon-tinto-de-autor-2004.jpg',
    fit: 'label',
    ficha: 'new assets/Peñafalcon/Tinto de Autor 2004 contra.pdf',
    shopify: { productId: '', variantId: '' },
  },
  {
    id: 'penafalcon-10-meses-2021',
    producer: 'penafalcon',
    name: '10 Meses en Barrica',
    vintage: '2021',
    meta: 'Tempranillo',
    badge: 'Gold 2024',
    note: 'The perfect introduction to Peñafalcón. Bright picota red; ripe plum, blackberry and ' +
          'cherry over gentle toast, vanilla and spice. Round, honest and easy to love.',
    price: '24.00',
    tasting: 'Picota-cherry red of medium depth, clean and bright. Medium-high intensity on the ' +
             'nose: abundant ripe fruit — plum, blackberry, cherry — over a subtle toasted ' +
             'background of sweet spices, vanilla, black licorice and faint balsamic notes. Soft, ' +
             'ripe tannin and a surprising roundness; sincere, honest and very easy to drink. ' +
             'Fermented with native yeasts and aged ten months in used American and French oak. ' +
             'Gold medal, International Wine Awards Spain 2024.',
    details: [
      ['Serve', '16–18 °C'],
      ['Pairs with', 'Tapas, grilled chorizo, weeknight roast chicken'],
    ],
    image: 'img/shop/penafalcon-10-meses-2021.jpg',
    fit: 'label',
    ficha: 'new assets/Peñafalcon/ficha10mb2021.pdf',
    shopify: { productId: '', variantId: '' },
  },

  // ── Los Ángeles ───────────────────────────────────────────────────────────
  {
    id: 'los-angeles-romeroso-2021',
    producer: 'losangeles',
    name: 'Romeroso',
    vintage: '2021',
    meta: 'Garnacha',
    badge: 'Natural',
    note: 'A single-vineyard Garnacha, hand-harvested and made with zero intervention. The label ' +
          'bears Simon Denis’ “Study of Clouds with a Sunset near Rome.”',
    price: '34.00',
    tasting: 'A natural Garnacha from the single “Romeroso” vineyard — sustainably grown, ' +
             'hand-harvested and made with zero intervention. Each bottle is individually ' +
             'numbered from a run of 3,250. The label bears Simon Denis’ “Study of Clouds ' +
             'with a Sunset near Rome.”',
    details: [
      ['Serve', '14–16 °C, lightly cooled'],
      ['Pairs with', 'Charcuterie, mushroom rice, grilled vegetables'],
    ],
    image: 'img/shop/los-angeles-romeroso.jpg',
    fit: 'art',
    ficha: 'new assets/Los Angeles/Romeroso back.pdf',
    shopify: { productId: '', variantId: '' },
  },
  {
    id: 'los-angeles-cruz-alta-2025',
    producer: 'losangeles',
    name: 'Cruz Alta',
    vintage: '2025',
    meta: 'Red',
    badge: 'Natural',
    note: 'A sustainably grown, single-vineyard red named for its “lieu-dit.” The label carries ' +
          'Jacques Blanchard’s “Danaë.”',
    price: '32.00',
    tasting: 'A sustainably grown, single-vineyard natural red from grower Michael Cooper, named ' +
             'for its “lieu-dit.” Each bottle is individually numbered from a run of 3,250. The ' +
             'label carries Jacques Blanchard’s “Danaë.”',
    details: [
      ['Serve', '14–16 °C, lightly cooled'],
      ['Pairs with', 'Lamb chops, paella, hard sheep’s cheeses'],
    ],
    image: 'img/shop/los-angeles-cruz-alta.jpg',
    fit: 'art',
    ficha: 'new assets/Los Angeles/Cruz Alta back.pdf',
    shopify: { productId: '', variantId: '' },
  },
  {
    id: 'los-angeles-las-suertes',
    producer: 'losangeles',
    name: 'Las Suertes',
    vintage: 'Blanco',
    meta: 'White',
    badge: 'Natural',
    note: 'A zero-intervention white from a single vineyard, fresh and low in alcohol. Dressed in ' +
          'Turner’s “The Morning After the Deluge.”',
    price: '28.00',
    tasting: 'A zero-intervention white from the single “Las Suertes” vineyard, fresh and low ' +
             'in alcohol. Each bottle is individually numbered from a run of 3,850. Dressed in ' +
             'Turner’s “The Morning After the Deluge.”',
    details: [
      ['Serve', '8–10 °C, chilled'],
      ['Pairs with', 'Shellfish, ceviche, fresh goat cheese'],
    ],
    image: 'img/shop/los-angeles-las-suertes.jpg',
    fit: 'art',
    ficha: 'new assets/Los Angeles/Las Suertes back.pdf',
    shopify: { productId: '', variantId: '' },
  },

  // ── Convento Oreja ────────────────────────────────────────────────────────
  {
    id: 'convento-seleccion-familia-2020',
    producer: 'convento',
    name: 'Selección de Familia',
    vintage: '2020',
    meta: 'Tempranillo',
    badge: 'Limited edition',
    note: 'From 20-year-old vines in Pago de Tordementes. Deep cherry; mature black fruit, spice, ' +
          'balsamic and mineral notes with powerful, fine-grained tannins. Only 1,227 bottles.',
    price: '55.00',
    tasting: 'Deep cherry. Elegant and complex: fantastic mature black fruit — blackberry and ' +
             'blueberry — with spicy, balsamic, toasted and mineral notes. Powerful yet round, ' +
             'with elegant fine-grained tannins in fine balance and a long, persistent finish. ' +
             'From twenty-year-old vines at 900 metres in Pago de Tordementes, aged twenty-three ' +
             'months in six specially selected French oak barrels — a limited edition of 1,227 ' +
             'bottles.',
    details: [
      ['Serve', '16–18 °C'],
      ['Pairs with', 'Prime rib, roast duck, truffle dishes'],
    ],
    image: 'img/shop/convento-seleccion-familia-2020.png',
    fit: 'bottle',
    ficha: 'new assets/Convento Oreja/ficha_seleccion_de_familia_ingles_2020.pdf',
    shopify: { productId: '', variantId: '' },
  },
  {
    id: 'convento-crianza-2022',
    producer: 'convento',
    name: 'Crianza',
    vintage: '2022',
    meta: 'Tempranillo',
    badge: '',
    note: 'Cherry-red and crystalline. Elegant red and black fruit (blueberry, raspberry, ' +
          'blackberry) with pastry, light spice and balsamic. Soft, round, velvety tannins.',
    price: '30.00',
    tasting: 'Cherry red of good depth, clean and crystalline. An elegant, intense nose of red ' +
             'fruit — blueberry, raspberry — alongside blackberry, with pleasant pastry ' +
             'fragrances, light spice and balsamic touches. Soft, round tannins in perfect ' +
             'balance with the acidity: broad, velvety and persistent. From twenty-five-year-old ' +
             'vines above 900 metres, matured twelve months in French oak of medium and low toast.',
    details: [
      ['Serve', '16–18 °C'],
      ['Pairs with', 'Roast pork, semi-cured cheeses, wild mushrooms'],
    ],
    image: 'img/shop/convento-crianza-2022.png',
    fit: 'bottle',
    ficha: 'new assets/Convento Oreja/Ficha_Técnica_Convento_Oreja_Crianza_2022_Ingles.pdf',
    shopify: { productId: '', variantId: '' },
  },
  {
    id: 'convento-roble-2025',
    producer: 'convento',
    name: 'Roble',
    vintage: '2025',
    meta: 'Tempranillo',
    badge: 'Everyday',
    note: 'Bright cherry with violet tones. Fresh strawberry and raspberry laced with spice and a ' +
          'whisper of balsamic. Juicy, balanced and endlessly drinkable.',
    price: '19.00',
    tasting: 'Bright cherry with violet tones. Intense fresh fruit on the nose — strawberry and ' +
             'raspberry mingled with hints of spice and a slight balsamic fragrance. Fresh, full ' +
             'and fruity on the palate; well balanced, easy to drink, with a long finish. Raised ' +
             'three months in French and American oak from vines fifteen to twenty-five years old.',
    details: [
      ['Serve', '14–16 °C, lightly cooled'],
      ['Pairs with', 'Pizza, burgers, midweek tapas'],
    ],
    image: 'img/shop/convento-roble-2025.png',
    fit: 'bottle',
    ficha: 'new assets/Convento Oreja/ficha_tecnica_roble 2025_ingles.pdf',
    shopify: { productId: '', variantId: '' },
  },
];
