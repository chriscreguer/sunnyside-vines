/* ============================================================================
   Sunnyside Vines - English / Spanish
   ----------------------------------------------------------------------------
   English lives in the HTML. Elements tagged data-i18n="key" swap their
   contents to the Spanish strings below; data-i18n-attr="placeholder:key"
   does the same for attributes; data-i18n-data="product:<id>:<field>" or
   "producer:<key>:<field>" pulls Spanish copy from the `es` objects in
   shop-config.js; [data-lang-only="es"] blocks show for one language only.
   Scripts that render text call SVI18N.t(key, english) / SVI18N.loc(obj, field)
   and re-render on the `sv:lang` event.

   Load after shop-config.js and before the page scripts.
   ========================================================================== */
(() => {
  'use strict';

  const STORAGE_KEY = 'sv_lang';

  const ES = {
    // Titles
    'title.shop': 'Tienda · Sunnyside Vines',
    'title.faq': 'Preguntas frecuentes · Sunnyside Vines',
    'title.terms': 'Términos y condiciones · Sunnyside Vines',
    'title.privacy': 'Política de privacidad · Sunnyside Vines',

    // Navigation
    'nav.producers': 'Productores',
    'nav.wines': 'Vinos',
    'nav.about': 'Nosotros',
    'nav.trade': 'Profesionales',
    'nav.contact': 'Contacto',
    'nav.shop': 'Tienda',
    'nav.menu': 'Abrir menú',
    'lang.group': 'Idioma',

    // Homepage
    'home.heroSub': 'Vinos españoles de pequeña producción, importados directamente de viticultores a los que conocemos por su nombre.',
    'home.shopWines': 'Comprar vinos',
    'home.tradeOrders': 'Pedidos profesionales',
    'home.mission': 'Creemos que los vinos más memorables nacen en <em>pequeños viñedos familiares,</em> donde se honra la tradición y cada botella cuenta una historia.',
    'home.producersTitle': 'Nuestros productores',
    'home.penafalcon': 'Tempranillo ecológico de laderas calizas sobre el río, con largas crianzas en barrica. La familia de Casimiro elabora vino en las bodegas de Peñafiel desde el siglo XVII.',
    'home.convento': 'Tinta del País de viñas viejas en las parcelas de Mélida, una pedanía de Peñafiel cuatro kilómetros valle arriba.',
    'home.angeles': 'Vinos de mínima intervención y viñedo único del viticultor Michael Cooper: viñas viejas de secano en la cuenca del Ebro, a los pies del Moncayo.',
    'home.seeWines': 'Ver vinos →',
    'home.winesTitle': 'Lo que servimos ahora',
    'home.winesSub': 'Nuestras botellas favoritas, importadas de fincas familiares de España.',
    'home.viewAll': 'Ver todos los vinos →',
    'home.story': 'Lleva nuestros vinos a tu bar, restaurante o tienda.',

    // Trade (homepage story card)
    'trade.start': 'Solicitar un pedido profesional',
    'trade.orEmail': 'o escribe a ops@sunnysidevines.com',

    // Trade order page
    'title.trade': 'Pedidos profesionales · Sunnyside Vines',
    'trade.sheetTitle': 'Solicitud de pedido',
    'trade.termPrices': 'Precios a consultar',
    'trade.cutoffIn': 'Pide en las próximas {time} para recibirlo {day}',
    'trade.tomorrow': 'mañana',
    'trade.onDay': 'el {day}',
    'trade.nextDelivery': 'Próxima entrega: <b>{date}</b>',
    'trade.lastRequest': 'Tu última solicitud',
    'trade.close': 'Cerrar',
    'trade.inRequest': 'En tu solicitud',
    'trade.addToRequest': 'Añadir a la solicitud',
    'trade.fullPage': 'Ficha completa del vino',
    'trade.reorder': 'Repetir pedido',
    'trade.detailsTitle': 'Entrega y cuenta',
    'trade.casesShort': 'cj',
    'trade.bottlesShort': 'bot',
    'trade.btl': 'bot',
    'trade.wine': '{n} vino',
    'trade.wines': '{n} vinos',
    'trade.review': 'Revisar y enviar',
    'trade.specSheet': 'Ficha técnica',
    'trade.qtyFor': 'Cantidad de {name}',
    'trade.unit': 'Unidad',
    'trade.case': 'caja',
    'trade.cases': 'cajas',
    'trade.bottle': 'botella',
    'trade.bottles': 'botellas',
    'trade.business': 'Nombre del negocio',
    'trade.contact': 'Nombre de contacto',
    'trade.email': 'Email',
    'trade.required': '(obligatorio)',
    'trade.needBoth': 'Añade un vino y tu email para enviar.',
    'trade.needWineShort': 'Añade al menos un vino para enviar.',
    'trade.needEmail': 'Añade tu email para que podamos responderte.',
    'trade.phone': 'Teléfono',
    'trade.address': 'Dirección de entrega',
    'trade.invoice': 'Email de facturación',
    'trade.ifDifferent': '(si es otro)',
    'trade.date': 'Fecha de entrega deseada',
    'trade.instructions': 'Instrucciones especiales de entrega',
    'trade.optional': '(opcional)',
    'trade.firstOrder': 'Es nuestro primer pedido a Sunnyside Vines',
    'trade.license': 'Número de licencia de la NYSLA',
    'trade.st120Note': 'También necesitaremos el <a href="https://www.tax.ny.gov/pdf/current_forms/st/st120_fill_in.pdf" target="_blank" rel="noopener">formulario ST-120</a> completado. Envíalo a <a href="mailto:ops@sunnysidevines.com">ops@sunnysidevines.com</a> o adjúntalo al responder a nuestra confirmación.',
    'trade.yourOrder': 'Tu solicitud',
    'trade.none': 'Aún no has elegido vinos. Añade cantidades en la lista.',
    'trade.submit': 'Enviar solicitud',
    'trade.sending': 'Enviando…',
    'trade.needWine': 'Añade la cantidad de al menos un vino.',
    'trade.failed': 'No hemos podido enviar tu solicitud desde aquí. No se ha perdido nada: envíala por email.',
    'trade.emailInstead': 'Abrir como email',
    'trade.fine': 'Te confirmaremos la disponibilidad y los precios por email y después te enviaremos la factura.',
    'trade.prefer': 'O escríbenos: <a href="mailto:ops@sunnysidevines.com">ops@sunnysidevines.com</a>',
    'trade.sentTitle': 'Solicitud enviada',
    'trade.sentCopy': 'Gracias. Te confirmaremos la disponibilidad y los precios por email en',
    'trade.sentFirst': 'Como es tu primer pedido, envía el formulario ST-120 completado a <a href="mailto:ops@sunnysidevines.com">ops@sunnysidevines.com</a>.',
    'trade.again': 'Hacer otra solicitud',

    // Contact
    'contact.title': 'Contacta con nosotros',
    'contact.email': 'Email',
    'contact.copy': 'Copiar dirección de email',
    'contact.phone': 'Teléfono',
    'contact.based': 'Ubicación',
    'contact.city': 'Nueva York, Nueva York',
    'contact.name': 'Tu nombre',
    'contact.yourEmail': 'Tu email',
    'contact.message': 'Mensaje',
    'contact.placeholder': '¿En qué podemos ayudarte?',
    'contact.send': 'Enviar mensaje',
    'contact.thanks': 'Gracias, te responderemos pronto',
    'contact.failed': 'No se pudo enviar. Escribe a info@sunnysidevines.com',

    // Footer + newsletter
    'footer.tagline': 'Importación de vinos · Nueva York',
    'footer.trade': 'Pedidos profesionales',
    'footer.faq': 'Preguntas frecuentes',
    'footer.newsletter': 'Boletín',
    'footer.newsletterCopy': 'Novedades y noticias, unas pocas veces al año.',
    'footer.emailPlaceholder': 'Tu email',
    'footer.subscribe': 'Suscribirme',
    'footer.rights': '© 2026 Sunnyside Vines. Todos los derechos reservados.',
    'footer.terms': 'Términos y condiciones',
    'footer.privacy': 'Política de privacidad',
    'newsletter.thanks': 'Gracias',
    'newsletter.subscribed': 'Suscripción confirmada',
    'newsletter.retry': 'Inténtalo de nuevo',

    // Shop + cart
    'shop.title': 'Todos los vinos',
    'shop.details': 'Ver detalles',
    'shop.detailsFor': 'Ver detalles de {name}',
    'shop.tradeQ': '¿Compras para una tienda o un restaurante?',
    'shop.tradeCta': 'Solicitar un pedido profesional →',
    'cart.label': 'Carrito',
    'cart.open': 'Abrir carrito',
    'cart.close': 'Cerrar carrito',
    'cart.title': 'Tu carrito',
    'cart.subtotal': 'Subtotal',
    'cart.checkout': 'Finalizar compra',
    'cart.empty': 'Tu carrito está vacío.',
    'cart.each': '{price} c/u',
    'cart.decrease': 'Quitar uno',
    'cart.increase': 'Añadir uno',
    'cart.remove': 'Eliminar',
    'cart.removed': '{name} eliminado',
    'cart.undo': 'Deshacer',
    'cart.add': 'Añadir al carrito',
    'cart.added': 'Añadido ✓',
    'cart.addedToast': 'Añadido al carrito',
    'checkout.email': 'Envíanos este pedido por email',
    'checkout.note': 'La compra en línea estará disponible muy pronto. Mientras tanto, envíanos tu pedido por email y organizaremos el pago y la entrega.',
    'checkout.redirecting': 'Redirigiendo…',
    'checkout.error': 'Lo sentimos, no hemos podido conectar con el pago.',

    // Wine pages
    'wine.allWines': '&larr; Todos los vinos',
    'wine.specPdf': 'Ficha técnica (PDF)',
    'wine.theProducer': 'El productor',
    'wine.meet': 'Conoce al productor &rarr;',
    'wine.moreFrom': 'Más de',
    'wine.tradeAdd': 'Añadir a un pedido profesional →',
    'spec.Grape': 'Uva',
    'spec.Grapes': 'Uvas',
    'spec.Alcohol': 'Alcohol',
    'spec.Aging': 'Crianza',
    'spec.Serve': 'Servir',
    'spec.Pairs with': 'Maridaje',
    'spec.Vineyard': 'Viñedo',
    'spec.Style': 'Estilo',
    'spec.Skin contact': 'Maceración con pieles',
    'spec.Production': 'Producción',
    'spec.Bottled': 'Embotellado',

    // Age gate
    'age.question': '¿Tienes {age} años o más?',
    'age.yes': 'Sí',
    'age.no': 'No',
    'age.denied': 'Debes tener {age} años o más.',
    'age.leave': 'Salir del sitio',

    // Text pages
    'faq.title': 'Preguntas frecuentes',
    'faq.sub': 'Pedidos, cuentas profesionales y los propios vinos.',
    'terms.title': 'Términos y condiciones',
    'terms.sub': 'Las condiciones que se aplican cuando usas este sitio o nos haces un pedido.',
    'privacy.title': 'Política de privacidad',
    'privacy.sub': 'Qué datos recogemos, por qué y qué opciones tienes.',
  };

  let lang = null;
  try { lang = localStorage.getItem(STORAGE_KEY); } catch (_) { /* storage disabled */ }
  if (lang !== 'en' && lang !== 'es') {
    lang = (navigator.language || '').toLowerCase().startsWith('es') ? 'es' : 'en';
  }

  const fill = (s, vars) => (vars ? s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : '')) : s);
  const t = (key, en, vars) => fill(lang === 'es' && ES[key] != null ? ES[key] : en, vars);
  const loc = (obj, field) =>
    (lang === 'es' && obj && obj.es && obj.es[field] != null ? obj.es[field] : obj[field]);

  // "product:<id>:<field>[:<index>]" / "producer:<key>:<field>" -> Spanish copy, or null
  function spanishData(spec) {
    const [kind, id, field, index] = spec.split(':');
    let es = null;
    if (kind === 'product' && typeof PRODUCTS !== 'undefined') {
      const p = PRODUCTS.find((x) => x.id === id);
      es = p && p.es;
    } else if (kind === 'producer' && typeof PRODUCERS !== 'undefined') {
      es = PRODUCERS[id] && PRODUCERS[id].es;
    }
    if (!es || es[field] == null) return null;
    return index != null ? es[field][+index] : es[field];
  }

  // English originals, captured the first time an element is translated
  const originalHTML = new WeakMap();
  const originalAttrs = new WeakMap();
  const keep = (el) => { if (!originalHTML.has(el)) originalHTML.set(el, el.innerHTML); return originalHTML.get(el); };

  function apply() {
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const en = keep(el);
      const es = ES[el.dataset.i18n];
      el.innerHTML = lang === 'es' && es != null ? es : en;
    });

    document.querySelectorAll('[data-i18n-data]').forEach((el) => {
      const en = keep(el);
      const es = lang === 'es' ? spanishData(el.dataset.i18nData) : null;
      if (es != null) el.textContent = es;
      else el.innerHTML = en;
    });

    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      if (!originalAttrs.has(el)) originalAttrs.set(el, {});
      const saved = originalAttrs.get(el);
      el.dataset.i18nAttr.split(',').forEach((pair) => {
        const [attr, key] = pair.split(':').map((s) => s.trim());
        if (!(attr in saved)) saved[attr] = el.getAttribute(attr) || '';
        el.setAttribute(attr, lang === 'es' && ES[key] != null ? ES[key] : saved[attr]);
      });
    });

    document.querySelectorAll('[data-lang-only]').forEach((el) => {
      el.hidden = el.dataset.langOnly !== lang;
    });

    document.querySelectorAll('.lang-toggle button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
  }

  function setLang(next) {
    if (next === lang || (next !== 'en' && next !== 'es')) return;
    lang = next;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) { /* storage disabled */ }
    apply();
    document.dispatchEvent(new CustomEvent('sv:lang', { detail: lang }));
  }

  // EN / ES switch, placed beside the nav links (before the cart / menu button)
  function mountToggle() {
    const nav = document.getElementById('nav');
    if (!nav || nav.querySelector('.lang-toggle')) return;
    const group = document.createElement('div');
    group.className = 'lang-toggle';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', 'Language');
    group.dataset.i18nAttr = 'aria-label:lang.group';
    group.innerHTML =
      '<button type="button" data-lang="en" lang="en" aria-label="English">EN</button>' +
      '<button type="button" data-lang="es" lang="es" aria-label="Español">ES</button>';
    group.addEventListener('click', (e) => {
      const b = e.target.closest('[data-lang]');
      if (b) setLang(b.dataset.lang);
    });
    const links = document.getElementById('navLinks');
    if (links) links.after(group);
    else nav.appendChild(group);
  }

  // apply(): re-translate the page, e.g. after a script inserts tagged markup
  window.SVI18N = { t, loc, setLang, apply, get lang() { return lang; } };

  // The page above this script is already parsed: translate before first paint.
  mountToggle();
  apply();
})();
