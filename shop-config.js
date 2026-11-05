/* ============================================================================
   Sunnyside Vines - Shop configuration
   ----------------------------------------------------------------------------
   This is the ONLY file you edit to connect the shop to a real Shopify store.
   See SHOPIFY-SETUP.md for the full walkthrough.

   1. Create a Shopify store and add each wine below as a product.
   2. Enable the Storefront API and paste your domain + token into SHOPIFY.
   3. For each wine, paste its Shopify `productId` and `variantId`.

   While SHOPIFY.domain or SHOPIFY.storefrontAccessToken is empty, the page runs
   in DEMO MODE: the cart works locally, and the checkout button emails the
   order to info@ instead of sending anyone to a real (non-existent) checkout.
   ========================================================================== */

const SHOPIFY = {
  // e.g. 'sunnyside-vines.myshopify.com'  (leave blank to stay in demo mode)
  domain: '',
  // Storefront API access token (leave blank to stay in demo mode)
  storefrontAccessToken: '',
};

/* Trade orders (trade.html). Each order is posted to `formEndpoint`
   (Formspree), which emails it on; replies go to the buyer. Point this at a
   Formspree form that delivers to ops@ when there is one. Flip `showPrices`
   on, and add a `wholesale` price to each wine, once the trade price list can
   be public; until then the order sheet says "Price on request". */
const TRADE = {
  formEndpoint: 'https://formspree.io/f/xjkalwan',
  email: 'ops@sunnysidevines.com',
  showPrices: false,
  // orders in by this hour (New York time) deliver on the next delivery day
  cutoffHourET: 11,
  // days deliveries go out, 0 = Sunday ... 6 = Saturday
  deliveryDays: [1, 2, 3, 4, 5],
};

/* Producer blurbs shown above each group of wines. `es` holds the Spanish copy
   (see js/i18n.js). */
const PRODUCERS = {
  penafalcon: {
    name: 'Bodega Peñafalcón',
    region: 'Ribera del Duero, Spain',
    blurb:
      'A family winery in Peñafiel producing bold, expressive Tempranillo: organic ' +
      'vineyards, meticulous hand-selection, and long barrel aging over limestone soils.',
    image: 'img/opt/roseto_family_vineyard_landscape.webp',
    anchor: 'producer-penafalcon',
    es: {
      region: "Ribera del Duero, España",
      blurb: "Una bodega familiar de Peñafiel que elabora Tempranillo intenso y expresivo: viñedos ecológicos, selección manual minuciosa y largas crianzas en barrica sobre suelos calizos.",
    },
  },
  losangeles: {
    name: 'Cooper Cellars – Los Ángeles',
    region: 'Campo de Borja, Spain',
    blurb:
      'Zero-intervention, single-vineyard wines from grower Michael Cooper. Each label ' +
      'carries a Romantic-period painting, chosen to express the spirit of natural winemaking.',
    image: 'img/opt/cooper-vines.webp',
    anchor: 'producer-angeles',
    es: {
      region: "Campo de Borja, España",
      blurb: "Vinos de mínima intervención y viñedo único del viticultor Michael Cooper. Cada etiqueta lleva una pintura del Romanticismo, elegida para expresar el espíritu del vino natural.",
    },
  },
  convento: {
    name: 'Convento Oreja',
    region: 'Ribera del Duero, Spain',
    blurb:
      'Tinta del País grown at over 900 metres in Peñafiel. Founded in 2002, the estate ' +
      'crafts elegant, balsamic-tinged reds from old vines and French oak.',
    image: 'img/opt/convento-oreja.webp',
    anchor: 'producer-convento',
    es: {
      region: "Ribera del Duero, España",
      blurb: "Tinta del País cultivada a más de 900 metros en Peñafiel. Fundada en 2002, la bodega elabora tintos elegantes con notas balsámicas a partir de viñas viejas y roble francés.",
    },
  },
};

/* The wines. `price` is the website suggested retail price (USD) from the
   distributor price sheet, shown until a real Shopify store is connected;
   real prices come from Shopify once live. `es` holds the Spanish copy, with
   `details` listing just the values, in the same order as the English rows. */
const PRODUCTS = [
  // ── Bodega Peñafalcón ─────────────────────────────────────────────────────
  {
    id: 'penafalcon-gran-reserva-2007',
    producer: 'penafalcon',
    name: 'Gran Reserva',
    vintage: '2007',
    meta: 'Tempranillo',
    badge: 'Two Grand Gold',
    note: "Sixty months in French and American oak. Stewed red and black fruit, roasted coffee and toasted wood, with a full, velvety palate and mature tannins.",
    price: '120.99',
    tasting: "A complex, full-bodied Tempranillo from Ribera del Duero. Deep cherry-red with subtle mahogany hints; stewed red and black fruits meet roasted coffee and toasted wood. Hand-picked grapes are selected in the vineyard and winery, then aged for sixty months in French and American oak. The palate is velvety and rich, with mature tannins. Decant for 30–60 minutes before serving.",
    details: [
      ["Grape", "100% Tempranillo (Tinto Fino)"],
      ["Alcohol", "15% vol"],
      ["Aging", "60 months in French and American oak"],
      ["Serve", "16–18 °C; decant 30–60 minutes"],
      ["Pairs with", "Ribeye, rich stews, roast lamb and aged cheeses"],
    ],
    image: "img/catalog-2026/penafalcon-gran-reserva-2007.png",
    fit: "bottle",
    ficha: "docs/catalog-2026/penafalcon-gran-reserva-2007.pdf",
    shopify: { productId: '', variantId: '' },
    es: {
      meta: "Tempranillo",
      note: "Sesenta meses en roble francés y americano. Fruta roja y negra en compota, café tostado y madera tostada, con un paladar amplio y aterciopelado y taninos maduros.",
      tasting: "Un Tempranillo complejo y con cuerpo de Ribera del Duero. Rojo cereza intenso con sutiles reflejos caoba; la fruta roja y negra en compota se une al café tostado y la madera tostada. La uva, vendimiada a mano, se selecciona en el viñedo y en bodega y envejece sesenta meses en roble francés y americano. En boca es aterciopelado y rico, con taninos maduros. Decantar de 30 a 60 minutos antes de servir.",
      details: [
        "100% Tempranillo (Tinto Fino)",
        "15% vol",
        "60 meses en roble francés y americano",
        "16–18 °C; decantar 30–60 minutos",
        "Chuletón, guisos contundentes, cordero asado y quesos curados",
      ],
    },
  },
  {
    id: 'penafalcon-14-anos-2003',
    producer: 'penafalcon',
    name: 'Vendimia Seleccionada',
    vintage: '2003',
    meta: 'Tempranillo',
    badge: 'Three Great Gold',
    note: "A patiently aged Tempranillo from stony, high-altitude vineyards in Peñafiel. Dark cherry, ripe fruit and vanilla, with a velvety, structured palate.",
    price: '552.99',
    tasting: "Made from Tempranillo grown on the high-altitude Santacruz, Carraovejas and La Blanquera plots in Peñafiel, where stony, limestone-rich soils concentrate the fruit. Dark cherry in color, with ripe fruit and vanilla alongside red and black berries, pastry, spice and balsamic notes. Soft, rounded tannins balance the acidity in a broad, velvety and persistent palate.",
    details: [
      ["Grape", "100% Tempranillo (Tinta del País)"],
      ["Alcohol", "15% vol"],
      ["Pairs with", "Prime beef, roasted lamb, flavorful stews and cured cheeses"],
    ],
    image: "img/catalog-2026/penafalcon-14-anos-2003.jpeg",
    fit: "bottle",
    ficha: "docs/catalog-2026/penafalcon-14-anos-2003.pdf",
    shopify: { productId: '', variantId: '' },
    es: {
      meta: "Tempranillo",
      note: "Un Tempranillo de larga crianza de viñedos pedregosos y de altura en Peñafiel. Cereza oscura, fruta madura y vainilla, con un paladar aterciopelado y estructurado.",
      tasting: "Elaborado con Tempranillo de las parcelas de altura Santacruz, Carraovejas y La Blanquera, en Peñafiel, donde los suelos pedregosos y calizos concentran la fruta. Color cereza oscuro, con fruta madura y vainilla junto a frutos rojos y negros, notas de pastelería, especias y balsámicos. Taninos suaves y redondos equilibran la acidez en un paladar amplio, aterciopelado y persistente.",
      details: [
        "100% Tempranillo (Tinta del País)",
        "15% vol",
        "Carne de vacuno de primera, cordero asado, guisos sabrosos y quesos curados",
      ],
    },
  },
  {
    id: 'penafalcon-tinto-de-autor-2004',
    producer: 'penafalcon',
    name: 'Tinto de Autor',
    vintage: '2004',
    meta: 'Tempranillo',
    badge: 'Gold & Great Gold',
    note: "Thirty-six months in French and American oak. Ripe red and black fruit compote, spice and toasted wood, with firm structure and a long, fresh finish.",
    price: '112.99',
    tasting: "Hand-harvested Tempranillo from high-altitude vineyard plots including Santacruz and Carraovejas. Long pre-fermentation maceration is followed by fermentation with native yeasts and malolactic fermentation in American oak. Thirty-six months in French and American oak build a deep cherry-red wine with mahogany hints, ripe fruit compote and complex spice. Savory, structured and persistent, with mature tannins and a fresh finish.",
    details: [
      ["Grape", "100% Tempranillo (Tinto del País)"],
      ["Alcohol", "14.5% vol"],
      ["Aging", "36 months in French and American oak"],
      ["Serve", "17 °C; decant 45 minutes"],
      ["Pairs with", "Roast lamb, dry-aged ribeye, wild game stews and mature Manchego"],
    ],
    image: "img/catalog-2026/penafalcon-tinto-de-autor-2004.jpeg",
    fit: "bottle",
    ficha: "docs/catalog-2026/penafalcon-tinto-de-autor-2004.pdf",
    shopify: { productId: '', variantId: '' },
    es: {
      meta: "Tempranillo",
      note: "Treinta y seis meses en roble francés y americano. Compota de fruta roja y negra madura, especias y madera tostada, con estructura firme y un final largo y fresco.",
      tasting: "Tempranillo vendimiado a mano en parcelas de altura como Santacruz y Carraovejas. Tras una larga maceración prefermentativa, fermenta con levaduras autóctonas y realiza la maloláctica en roble americano. Treinta y seis meses en roble francés y americano dan un vino rojo cereza intenso con reflejos caoba, compota de fruta madura y especias complejas. Sabroso, estructurado y persistente, con taninos maduros y un final fresco.",
      details: [
        "100% Tempranillo (Tinto del País)",
        "14,5% vol",
        "36 meses en roble francés y americano",
        "17 °C; decantar 45 minutos",
        "Cordero asado, chuletón madurado, guisos de caza y Manchego curado",
      ],
    },
  },
  {
    id: 'penafalcon-10-meses-2021',
    producer: 'penafalcon',
    name: '10 Meses en Barrica',
    vintage: '2021',
    meta: 'Tempranillo',
    badge: 'Gold 2024',
    note: "Ten months in French and American oak. Deep cherry-red, with stewed red and black fruit, a rounded palate and a lingering finish.",
    price: '31.99',
    tasting: "Tempranillo grown on limestone and clay soils at roughly 750–850 metres. Ten months in a selection of fine-grained, medium-plus toasted French and American oak barrels are followed by rest in the estate’s underground cellars. Deep cherry-red with subtle mahogany rims, intense stewed red and black fruit, and a flavorful, rounded palate shaped by mature tannins.",
    details: [
      ["Grape", "100% Tempranillo (Tinto del País)"],
      ["Alcohol", "14% vol"],
      ["Aging", "10 months in French and American oak"],
      ["Serve", "14–16 °C"],
      ["Pairs with", "Roasted lamb, grilled Iberian pork, cured sheep’s cheese and mushroom risotto"],
    ],
    image: "img/catalog-2026/penafalcon-10-meses-2021.jpeg",
    fit: "bottle",
    ficha: "docs/catalog-2026/penafalcon-10-meses-2021.pdf",
    shopify: { productId: '', variantId: '' },
    es: {
      meta: "Tempranillo",
      note: "Diez meses en roble francés y americano. Rojo cereza intenso, con fruta roja y negra en compota, un paladar redondo y un final largo.",
      tasting: "Tempranillo cultivado en suelos calizos y arcillosos a unos 750–850 metros. Diez meses en una selección de barricas de roble francés y americano de grano fino y tostado medio-alto, seguidos de reposo en los calados subterráneos de la bodega. Rojo cereza intenso con sutiles ribetes caoba, fruta roja y negra en compota intensa y un paladar sabroso y redondo, con taninos maduros.",
      details: [
        "100% Tempranillo (Tinto del País)",
        "14% vol",
        "10 meses en roble francés y americano",
        "14–16 °C",
        "Cordero asado, cerdo ibérico a la brasa, queso de oveja curado y risotto de setas",
      ],
    },
  },

  // ── Cooper Cellars – Los Ángeles ──────────────────────────────────────────
  {
    id: 'los-angeles-romeroso-2021',
    producer: 'losangeles',
    name: 'Romeroso',
    vintage: '2021',
    meta: 'Garnacha',
    badge: 'Natural',
    note: "Old-vine Garnacha, hand-picked and spontaneously fermented. Blackberry, black cherry and white pepper, with energetic acidity and a mineral finish.",
    price: '36.99',
    tasting: "Dry-farmed Garnacha from vines over 35 years old, grown above 700 metres on ferrous clay and limestone. Hand-picked in small baskets and spontaneously fermented with wild yeasts, with minimal oak and total sulfites below 30 mg/L. Deep ruby in color, with blackberry, black cherry and white pepper. Juicy and balanced, with energetic acidity and a strong mineral backbone. Production is around 3,900 bottles per vintage.",
    details: [
      ["Grape", "100% Garnacha"],
      ["Alcohol", "14.5% vol"],
      ["Vineyard", "Dry-farmed old vines; over 700 metres"],
      ["Pairs with", "Duck, goose, quail, roasted root vegetables and hearty stews"],
    ],
    image: "img/catalog-2026/los-angeles-romeroso.jpeg",
    fit: "bottle",
    ficha: "docs/catalog-2026/los-angeles-romeroso-2021.pdf",
    shopify: { productId: '', variantId: '' },
    es: {
      meta: "Garnacha",
      note: "Garnacha de viñas viejas, vendimiada a mano y de fermentación espontánea. Mora, cereza negra y pimienta blanca, con acidez vibrante y final mineral.",
      tasting: "Garnacha de secano de viñas de más de 35 años, a más de 700 metros sobre arcillas ferrosas y caliza. Vendimiada a mano en cestos pequeños y fermentada de forma espontánea con levaduras salvajes, con mínimo uso de madera y sulfitos totales por debajo de 30 mg/L. Rojo rubí intenso, con mora, cereza negra y pimienta blanca. Jugoso y equilibrado, con acidez vibrante y una marcada columna mineral. Se producen unas 3.900 botellas por añada.",
      details: [
        "100% Garnacha",
        "14,5% vol",
        "Viñas viejas de secano; a más de 700 metros",
        "Pato, oca, codorniz, tubérculos asados y guisos contundentes",
      ],
    },
  },
  {
    id: 'los-angeles-cruz-alta-2025',
    producer: 'losangeles',
    name: 'Cruz Alta',
    vintage: '2025',
    meta: "Garnacha",
    badge: 'Natural',
    note: "A natural Garnacha from dry-farmed old vines. Blackberry, black cherry and white pepper, carried by bright acidity and a mineral backbone.",
    price: '22.99',
    tasting: "Hand-harvested Garnacha from dry-farmed vines over 35 years old, grown above 700 metres on ferrous clay and limestone. Spontaneous fermentation with wild yeasts and minimal oak express the vineyard, with total sulfites below 30 mg/L. Deep ruby, juicy and balanced, with blackberry, black cherry, white pepper and energetic acidity. Production is around 3,900 bottles per vintage.",
    details: [
      ["Grape", "100% Garnacha"],
      ["Alcohol", "14% vol"],
      ["Vineyard", "Dry-farmed old vines; over 700 metres"],
      ["Pairs with", "Duck, goose, quail, roasted root vegetables and hearty stews"],
    ],
    image: "img/catalog-2026/los-angeles-cruz-alta.jpeg",
    fit: "bottle",
    ficha: "docs/catalog-2026/los-angeles-cruz-alta-2025.pdf",
    shopify: { productId: '', variantId: '' },
    es: {
      meta: "Garnacha",
      note: "Una Garnacha natural de viñas viejas de secano. Mora, cereza negra y pimienta blanca, con acidez viva y una columna mineral.",
      tasting: "Garnacha vendimiada a mano de viñas de secano de más de 35 años, a más de 700 metros sobre arcillas ferrosas y caliza. La fermentación espontánea con levaduras salvajes y el mínimo uso de madera expresan el viñedo, con sulfitos totales por debajo de 30 mg/L. Rojo rubí intenso, jugoso y equilibrado, con mora, cereza negra, pimienta blanca y acidez vibrante. Se producen unas 3.900 botellas por añada.",
      details: [
        "100% Garnacha",
        "14% vol",
        "Viñas viejas de secano; a más de 700 metros",
        "Pato, oca, codorniz, tubérculos asados y guisos contundentes",
      ],
    },
  },
  {
    id: 'los-angeles-las-suertes',
    producer: 'losangeles',
    name: 'Las Suertes',
    vintage: "2024",
    meta: "Moscatel · Orange wine",
    badge: 'Natural',
    note: "Skin-contact Moscatel de Alejandría from high-altitude vines. Amber, dry and crisp, with lychee, quince, apricot and bitter orange.",
    price: '22.99',
    tasting: "A natural orange wine made from Moscatel de Alejandría grown above 700 metres. Fermented in stainless steel with one month on the skins, then matured for twelve months in 300-litre oak barrels. Amber in color, with intense lychee and quince aromas. Dry, crisp and refreshing, with hints of honey, apricot and bitter orange marmalade. Limited production of 4,000 bottles.",
    details: [
      ["Grape", "100% Moscatel de Alejandría"],
      ["Style", "Orange wine"],
      ["Alcohol", "12% vol"],
      ["Skin contact", "1 month"],
      ["Aging", "12 months in 300-litre oak barrels"],
      ["Production", "4,000 bottles"],
    ],
    image: "img/catalog-2026/los-angeles-las-suertes.png",
    fit: "bottle",
    ficha: "docs/catalog-2026/los-angeles-las-suertes.pdf",
    shopify: { productId: '', variantId: '' },
    es: {
      meta: "Moscatel · Vino naranja",
      note: "Moscatel de Alejandría con maceración con pieles, de viñas de altura. Ámbar, seco y fresco, con lichi, membrillo, albaricoque y naranja amarga.",
      tasting: "Un vino naranja natural elaborado con Moscatel de Alejandría cultivado a más de 700 metros. Fermenta en acero inoxidable con un mes de maceración con sus pieles y después madura doce meses en barricas de roble de 300 litros. Color ámbar, con intensos aromas de lichi y membrillo. Seco, fresco y vivo, con notas de miel, albaricoque y mermelada de naranja amarga. Producción limitada de 4.000 botellas.",
      details: [
        "100% Moscatel de Alejandría",
        "Vino naranja",
        "12% vol",
        "1 mes",
        "12 meses en barricas de roble de 300 litros",
        "4.000 botellas",
      ],
    },
  },

  // ── Convento Oreja ────────────────────────────────────────────────────────
  {
    id: "convento-memoria-reserva-2022",
    producer: 'convento',
    name: "Memoria Reserva",
    vintage: "2022",
    meta: 'Tempranillo',
    badge: 'Limited edition',
    note: "High-altitude Tempranillo aged thirteen months in French oak. Black fruit, sweet spice, coffee and cocoa, with a smooth, velvety palate. Just 5,400 bottles.",
    price: '52.99',
    tasting: "Tempranillo from a special vineyard at 950 metres, with clay and limestone soils and vines averaging twenty years old. Fermented in temperature-controlled stainless steel, followed by malolactic fermentation and thirteen months of aging in French oak. Deep cardinal red, with blackberries and dark berries, sweet spice, coffee, vanilla, leather, cocoa and subtle mineral notes. Fruit-forward, balanced and smooth, with a velvety mouthfeel. Annual production is approximately 5,400 bottles.",
    details: [
      ["Grape", "100% Tempranillo"],
      ["Alcohol", "15% vol"],
      ["Aging", "13 months in French oak"],
      ["Serve", "14–16 °C"],
      ["Pairs with", "Game and hearty roasted meats"],
      ["Production", "5,400 bottles per year"],
    ],
    image: "img/catalog-2026/convento-memoria-reserva-2022.png",
    fit: "bottle",
    ficha: "docs/catalog-2026/convento-memoria-reserva-2022.pdf",
    shopify: { productId: '', variantId: '' },
    es: {
      meta: "Tempranillo",
      note: "Tempranillo de altura con trece meses en roble francés. Fruta negra, especias dulces, café y cacao, con un paladar suave y aterciopelado. Solo 5.400 botellas.",
      tasting: "Tempranillo de un viñedo singular a 950 metros, con suelos arcillo-calcáreos y viñas de unos veinte años de media. Fermenta en acero inoxidable con temperatura controlada, realiza la maloláctica y envejece trece meses en roble francés. Rojo cardenal intenso, con moras y frutos negros, especias dulces, café, vainilla, cuero, cacao y sutiles notas minerales. Frutal, equilibrado y suave, con una textura aterciopelada. Producción anual de unas 5.400 botellas.",
      details: [
        "100% Tempranillo",
        "15% vol",
        "13 meses en roble francés",
        "14–16 °C",
        "Caza y carnes asadas contundentes",
        "5.400 botellas al año",
      ],
    },
  },
  {
    id: 'convento-crianza-2022',
    producer: 'convento',
    name: 'Crianza',
    vintage: '2022',
    meta: "Tempranillo · Cabernet Sauvignon",
    badge: '',
    note: "Twelve months in French oak. Red and black berries, pastry, gentle spice and balsamic notes, with soft, rounded tannins and a velvety finish.",
    price: '33.99',
    tasting: "A blend of 98% Tempranillo and 2% Cabernet Sauvignon from Mélida and Langayo in the Comarca de Peñafiel. Fermented in temperature-controlled stainless steel and matured for twelve months in medium- and low-toast French oak; bottled in May 2024. Cherry-red, clean and crystalline, with blueberry, raspberry and blackberry, pastry aromas, light spice and balsamic touches. Soft, rounded tannins balance the acidity in a broad, velvety and persistent palate.",
    details: [
      ["Grapes", "98% Tempranillo, 2% Cabernet Sauvignon"],
      ["Alcohol", "14.5% vol"],
      ["Aging", "12 months in French oak"],
      ["Bottled", "May 2024"],
      ["Pairs with", "Grilled red meat, roasted lamb, mushrooms and cured sheep’s cheese"],
    ],
    image: "img/catalog-2026/convento-crianza-2022.jpeg",
    fit: "bottle",
    ficha: "docs/catalog-2026/convento-crianza-2022.pdf",
    shopify: { productId: '', variantId: '' },
    es: {
      meta: "Tempranillo · Cabernet Sauvignon",
      note: "Doce meses en roble francés. Frutos rojos y negros, pastelería, especias suaves y notas balsámicas, con taninos suaves y redondos y un final aterciopelado.",
      tasting: "Un coupage de 98% Tempranillo y 2% Cabernet Sauvignon de Mélida y Langayo, en la comarca de Peñafiel. Fermenta en acero inoxidable con temperatura controlada y madura doce meses en roble francés de tostado medio y bajo; embotellado en mayo de 2024. Rojo cereza, limpio y brillante, con arándano, frambuesa y mora, aromas de pastelería, especias suaves y toques balsámicos. Taninos suaves y redondos equilibran la acidez en un paladar amplio, aterciopelado y persistente.",
      details: [
        "98% Tempranillo, 2% Cabernet Sauvignon",
        "14,5% vol",
        "12 meses en roble francés",
        "Mayo de 2024",
        "Carne roja a la brasa, cordero asado, setas y queso de oveja curado",
      ],
    },
  },
  {
    id: 'convento-roble-2025',
    producer: 'convento',
    name: 'Roble',
    vintage: '2025',
    meta: 'Tempranillo',
    badge: 'Everyday',
    note: "Tempranillo aged three months in French and American oak. Cherry-red, with red and black berries, pastry, light spice and soft, rounded tannins.",
    price: '22.99',
    tasting: "Tempranillo fermented in temperature-controlled stainless steel and aged for three months in equal parts French and American oak. Cherry-red, clean and crystalline. Blueberry, raspberry and blackberry meet pastry aromas, light spice and balsamic notes. Soft, rounded tannins bring a broad, velvety texture, balanced acidity and a persistent finish.",
    details: [
      ["Grape", "100% Tempranillo (Tinto del País)"],
      ["Alcohol", "14% vol"],
      ["Aging", "3 months in French and American oak (50% each)"],
      ["Pairs with", "Grilled red meat, roasted lamb, portobello mushrooms and Manchego"],
    ],
    image: "img/catalog-2026/convento-roble-2025.jpeg",
    fit: "bottle",
    ficha: "docs/catalog-2026/convento-roble-2025.pdf",
    shopify: { productId: '', variantId: '' },
    es: {
      meta: "Tempranillo",
      note: "Tempranillo con tres meses en roble francés y americano. Rojo cereza, con frutos rojos y negros, pastelería, especias suaves y taninos suaves y redondos.",
      tasting: "Tempranillo fermentado en acero inoxidable con temperatura controlada y envejecido tres meses en roble francés y americano a partes iguales. Rojo cereza, limpio y brillante. Arándano, frambuesa y mora se unen a aromas de pastelería, especias suaves y notas balsámicas. Taninos suaves y redondos aportan una textura amplia y aterciopelada, acidez equilibrada y un final persistente.",
      details: [
        "100% Tempranillo (Tinto del País)",
        "14% vol",
        "3 meses en roble francés y americano (50% cada uno)",
        "Carne roja a la brasa, cordero asado, setas portobello y Manchego",
      ],
    },
  },
];

/* The bottle as shown on the site: a transparent, tightly trimmed cutout of
   `image`, made by make-shelf-cutouts.py (re-run it after changing a photo).
   'small' (640px tall) for cards and the homepage lineup, 'large' (900px)
   for the wine pages; WebP by default, 'png' for places that need it (the
   Shopify import). `image` itself stays the source photo. */
function bottleImage(p, size = 'small', ext = 'webp') {
  return `img/bottles/${size}/` + p.image.split('/').pop().replace(/\.\w+$/, '.' + ext);
}
