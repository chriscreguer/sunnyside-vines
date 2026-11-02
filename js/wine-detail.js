/* ============================================================================
   Sunnyside Vines - Wine details component
   The bottle, producer, name, tasting note and spec table for one wine.
   Shared by the generated wine pages (generate-wine-pages.js, in Node) and the
   quick-look modal on trade.html (in the browser), so both always match:
   change the markup here, then re-run `node generate-wine-pages.js`.

   Text carries the same data-i18n hooks as the rest of the site; in the
   browser, call SVI18N.apply() after inserting it to show Spanish.
   ========================================================================== */
(function (root) {
  'use strict';

  const esc = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  /**
   * @param {object} p        a wine from PRODUCTS
   * @param {object} producer its entry in PRODUCERS
   * @param {object} [opts]
   * @param {string} [opts.assetRoot='']  path prefix for images ('../' on wines/*.html)
   * @param {string} [opts.heading='h1']  tag for the wine name
   * @param {string} [opts.nameId]        id for the name, e.g. to label a dialog
   * @param {string} [opts.actions='']    page-specific HTML after the specs
   * @param {string} [opts.image=p.image] which picture of the bottle to show
   */
  function html(p, producer, opts = {}) {
    const { assetRoot = '', heading = 'h1', nameId, actions = '', image = p.image } = opts;
    const specs = (p.details || [])
      .map(([k, v], i) => `<div class="detail-row"><dt data-i18n="spec.${esc(k)}">${esc(k)}</dt><dd data-i18n-data="product:${p.id}:details:${i}">${esc(v)}</dd></div>`)
      .join('\n                        ');
    return `<article class="wine-detail">
                <div class="detail-media fit-${p.fit} producer-${p.producer}">
                    <img src="${assetRoot}${esc(image)}" alt="${esc(`${p.name} ${p.vintage}`)}">
                </div>
                <div class="detail-body">
                    <p class="detail-producer">${esc(producer.name)} · <span data-i18n-data="producer:${p.producer}:region">${esc(producer.region)}</span></p>
                    <${heading} class="detail-name"${nameId ? ` id="${nameId}"` : ''}>${esc(p.name)} <span class="wine-vintage">${esc(p.vintage)}</span></${heading}>
                    <p class="detail-note" data-i18n-data="product:${p.id}:${p.tasting ? 'tasting' : 'note'}">${esc(p.tasting || p.note)}</p>
                    ${specs ? `<dl class="detail-specs">\n                        ${specs}\n                    </dl>` : ''}
                    ${actions}
                </div>
            </article>`;
  }

  const api = { html, esc };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SVWineDetail = api;
})(typeof window !== 'undefined' ? window : this);
