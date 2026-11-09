/* ============================================================================
   Sunnyside Vines - Trade order sheet (trade.html)
   Renders every wine in shop-config.js as a row with a quantity, collects the
   buyer's details, and posts the order to TRADE.formEndpoint (Formspree), which
   emails it to the team. The order in progress and the buyer's details are
   kept in localStorage, so a buyer can wander off to a wine page and come back,
   and the last request sent can be filled in again with one click.
   ========================================================================== */
(function () {
  'use strict';

  const LINES_KEY = 'sv_trade_lines';
  const DETAILS_KEY = 'sv_trade_details';
  const LAST_KEY = 'sv_trade_last';
  const PRODUCER_ORDER = ['penafalcon', 'convento', 'losangeles'];
  // details that are worth remembering for the next order
  const REMEMBER = ['business', 'name', 'email', 'phone', 'address', 'invoice_email'];

  const t = (key, en, vars) => (window.SVI18N ? SVI18N.t(key, en, vars) : en);
  const loc = (obj, field) => (window.SVI18N ? SVI18N.loc(obj, field) : obj[field]);
  const byId = (id) => PRODUCTS.find((p) => p.id === id);
  const money = (n) => '$' + parseFloat(n).toFixed(2);
  const wineName = (p) => [p.name, p.vintage].filter(Boolean).join(' ');

  const form = document.getElementById('tradeForm');
  const sheet = document.getElementById('order-sheet');
  const summary = document.getElementById('order-summary');
  const status = document.getElementById('order-status');
  const submitBtn = document.getElementById('order-submit');

  /* ── Order state: { [id]: { qty, unit: 'cases' | 'bottles' } } ───────── */
  let lines = load(LINES_KEY, {});
  Object.keys(lines).forEach((id) => { if (!byId(id) || !(lines[id].qty > 0)) delete lines[id]; });

  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (_) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* storage disabled */ }
  }

  // wines/<id>.html links here as trade.html?add=<id>
  const params = new URLSearchParams(location.search);
  const added = params.get('add');
  if (added && byId(added) && !lines[added]) {
    lines[added] = { qty: 1, unit: 'cases' };
    save(LINES_KEY, lines);
  }
  if (added) history.replaceState(null, '', location.pathname);

  /* ── Order sheet ─────────────────────────────────────────────────────── */
  function rowHTML(p) {
    const line = lines[p.id] || { qty: 0, unit: 'cases' };
    const price = TRADE.showPrices && p.wholesale
      ? `<span class="sheet-price">${money(p.wholesale)}<small>/${t('trade.btl', 'btl')}</small></span>` : '';
    const unit = (u, en) =>
      `<button type="button" data-unit="${u}" aria-pressed="${line.unit === u}">${t('trade.' + u + 'Short', en)}</button>`;
    return `
      <div class="sheet-row${line.qty ? ' is-on' : ''}" data-row="${p.id}">
        <a class="sheet-name" href="wines/${p.id}.html">${p.name} <span class="sheet-vintage">${p.vintage}</span></a>
        <span class="sheet-leader" aria-hidden="true"></span>
        ${price}
        <input class="sheet-qty" type="number" min="0" max="999" step="1" inputmode="numeric" value="${line.qty || ''}" placeholder="–"
          aria-label="${t('trade.qtyFor', 'Quantity of {name}', { name: wineName(p) })}">
        <span class="unit" role="group" aria-label="${t('trade.unit', 'Unit')}">${unit('cases', 'cs')}${unit('bottles', 'btl')}</span>
        <span class="sheet-meta">${loc(p, 'meta')}${p.ficha ? ` · <a href="${encodeURI(p.ficha)}" target="_blank" rel="noopener">${t('trade.specSheet', 'Spec sheet')}</a>` : ''}</span>
      </div>`;
  }

  function renderSheet() {
    sheet.innerHTML = PRODUCER_ORDER.map((key) => {
      const wines = PRODUCTS.filter((p) => p.producer === key);
      if (!wines.length) return '';
      return `
        <div class="sheet-group">
          <h2 class="sheet-producer">${PRODUCERS[key].name} <span>${loc(PRODUCERS[key], 'region')}</span></h2>
          ${wines.map(rowHTML).join('')}
        </div>`;
    }).join('');
  }

  function setLine(id, qty, unit) {
    const prev = lines[id] || { qty: 0, unit: 'cases' };
    const next = { qty: Math.max(0, Math.min(999, Math.round(qty) || 0)), unit: unit || prev.unit };
    if (next.qty) lines[id] = next;
    else delete lines[id];
    save(LINES_KEY, lines);

    // update just this row, so typing in the box isn't interrupted
    const row = sheet.querySelector(`[data-row="${id}"]`);
    row.classList.toggle('is-on', next.qty > 0);
    const input = row.querySelector('input');
    if (document.activeElement !== input) input.value = next.qty || '';
    row.querySelectorAll('[data-unit]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.unit === next.unit)));
    renderSummary();
  }

  sheet.addEventListener('click', (e) => {
    // wine names open a quick look; cmd/ctrl-click still opens the full page
    const name = e.target.closest('.sheet-name');
    if (name && !(e.metaKey || e.ctrlKey || e.shiftKey || e.button)) {
      e.preventDefault();
      openWine(name.closest('[data-row]').dataset.row);
      return;
    }
    const unit = e.target.closest('[data-unit]');
    if (!unit) return;
    const id = unit.closest('[data-row]').dataset.row;
    setLine(id, (lines[id] && lines[id].qty) || 1, unit.dataset.unit);
  });
  sheet.addEventListener('input', (e) => {
    if (e.target.matches('input')) setLine(e.target.closest('[data-row]').dataset.row, parseInt(e.target.value, 10));
  });
  sheet.addEventListener('change', (e) => {
    if (!e.target.matches('input')) return;
    const id = e.target.closest('[data-row]').dataset.row;
    e.target.value = (lines[id] && lines[id].qty) || '';
  });

  /* ── Quick look (the same details block as the wine pages) ────────────── */
  const modal = document.getElementById('wine-modal');
  const modalBody = document.getElementById('wine-modal-body');
  let modalWine = null;

  function renderModal() {
    const p = byId(modalWine);
    const line = lines[p.id];
    const actions = `<div class="modal-actions">
                        ${line
                          ? `<span class="modal-in">✓ ${t('trade.inRequest', 'In your request')}: ${line.qty} ${unitLabel(line)}</span>`
                          : `<button type="button" class="btn" data-modal-add>${t('trade.addToRequest', 'Add to request')}</button>`}
                        ${p.ficha ? `<a class="modal-link" href="${encodeURI(p.ficha)}" target="_blank" rel="noopener">${t('trade.specSheet', 'Spec sheet')} (PDF)</a>` : ''}
                        <a class="modal-link" href="wines/${p.id}.html">${t('trade.fullPage', 'Full wine page')} →</a>
                    </div>`;
    modalBody.innerHTML = SVWineDetail.html(p, PRODUCERS[p.producer], { heading: 'h2', nameId: 'wine-modal-name', actions, image: bottleImage(p, 'large') });
    if (window.SVI18N) SVI18N.apply();
  }
  function openWine(id) {
    modalWine = id;
    renderModal();
    modal.showModal();
    modal.scrollTop = 0;
  }

  document.getElementById('wine-modal-close').addEventListener('click', () => modal.close());
  // a click on the backdrop lands on the dialog element itself
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });
  modalBody.addEventListener('click', (e) => {
    if (!e.target.closest('[data-modal-add]')) return;
    setLine(modalWine, 1, 'cases');
    modal.close();
  });

  /* ── Summary ─────────────────────────────────────────────────────────── */
  const chosen = () => PRODUCTS.filter((p) => lines[p.id]).map((p) => ({ p, ...lines[p.id] }));
  const unitLabel = (l) => (l.unit === 'cases'
    ? t(l.qty === 1 ? 'trade.case' : 'trade.cases', l.qty === 1 ? 'case' : 'cases')
    : t(l.qty === 1 ? 'trade.bottle' : 'trade.bottles', l.qty === 1 ? 'bottle' : 'bottles'));

  const bar = document.getElementById('order-bar');
  let reviewInView = false;

  // We'd rather have an incomplete request than none: the only things needed
  // to send are a wine and an email to reply to. Ops can ask for the rest.
  const emailInput = form.elements.email;
  function syncSubmit() {
    const needWine = !chosen().length;
    const needEmail = !emailInput.value.trim() || !emailInput.checkValidity();
    submitBtn.disabled = needWine || needEmail;
    document.getElementById('order-needs').textContent =
      needWine && needEmail ? t('trade.needBoth', 'Add a wine and your email to send.')
      : needWine ? t('trade.needWineShort', 'Add at least one wine to send.')
      : needEmail ? t('trade.needEmail', 'Add your email so we can reply.')
      : '';
  }
  ['input', 'change'].forEach((ev) => emailInput.addEventListener(ev, syncSubmit)); // change: browser autofill

  function renderSummary() {
    const items = chosen();
    const cases = items.filter((l) => l.unit === 'cases').reduce((n, l) => n + l.qty, 0);
    const bottles = items.filter((l) => l.unit === 'bottles').reduce((n, l) => n + l.qty, 0);
    document.getElementById('order-bar-text').innerHTML = [
      t(items.length === 1 ? 'trade.wine' : 'trade.wines', items.length === 1 ? '{n} wine' : '{n} wines', { n: items.length }),
      cases && `${cases} ${unitLabel({ unit: 'cases', qty: cases })}`,
      bottles && `${bottles} ${unitLabel({ unit: 'bottles', qty: bottles })}`,
    ].filter(Boolean).join(' <span aria-hidden="true">·</span> ');
    syncBar();
    summary.innerHTML = items.length
      ? `<ul class="summary-list">${items.map((l) => `
          <li><span class="summary-qty">${l.qty} ${unitLabel(l)}</span> <span>${wineName(l.p)}</span></li>`).join('')}
        </ul>`
      : `<p class="summary-empty">${t('trade.none', 'No wines chosen yet. Add quantities above.')}</p>`;
    syncSubmit();
  }

  // a floating "review & send" bar while wines are chosen and the review block is offscreen
  function syncBar() {
    const show = chosen().length > 0 && !reviewInView && !form.hidden;
    bar.classList.toggle('show', show);
    bar.setAttribute('aria-hidden', String(!show));
    bar.querySelector('a').tabIndex = show ? 0 : -1;
  }
  new IntersectionObserver(([entry]) => { reviewInView = entry.isIntersecting; syncBar(); })
    .observe(document.getElementById('order-review'));

  /* ── Details form ────────────────────────────────────────────────────── */
  const firstBox = form.elements.first_order;
  const firstFields = document.getElementById('first-order-fields');
  function syncFirstOrder() {
    firstFields.hidden = !firstBox.checked;
  }
  firstBox.addEventListener('change', syncFirstOrder);

  /* ── Delivery date + live cutoff ─────────────────────────────────────── */
  // A request in by TRADE.cutoffHourET (New York time) on a delivery day is
  // delivered the next delivery day; anything later counts as received the
  // following delivery day. Dates are handled as UTC midnights so the weekday
  // maths doesn't drift with the visitor's time zone.
  function nowInNewYork() {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York', hourCycle: 'h23',
      year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric',
    }).formatToParts(new Date()).map((x) => [x.type, x.value]));
    return { date: Date.UTC(+parts.year, +parts.month - 1, +parts.day), minutes: +parts.hour * 60 + +parts.minute };
  }
  const DAY = 86400000;
  const isDeliveryDay = (d) => TRADE.deliveryDays.includes(new Date(d).getUTCDay());
  const isoDate = (d) => new Date(d).toISOString().slice(0, 10);

  function earliestDelivery() {
    const now = nowInNewYork();
    const minutesLeft = TRADE.cutoffHourET * 60 - now.minutes;
    let received = now.date;
    if (!isDeliveryDay(received) || minutesLeft <= 0) {
      do received += DAY; while (!isDeliveryDay(received));
    }
    let d = received + DAY;
    while (!isDeliveryDay(d)) d += DAY;
    return { date: d, inTime: received === now.date, tomorrow: d === now.date + DAY, minutesLeft };
  }

  const cutoffEl = document.getElementById('cutoff-live');
  const dateInput = form.elements.delivery_date;
  function syncDelivery() {
    const next = earliestDelivery();
    const locale = window.SVI18N && SVI18N.lang === 'es' ? 'es-ES' : 'en-US';
    if (next.inTime) {
      const h = Math.floor(next.minutesLeft / 60);
      const m = next.minutesLeft % 60;
      const time = `<b>${[h && `${h} h`, (m || !h) && `${m} min`].filter(Boolean).join(' ')}</b>`;
      const day = next.tomorrow
        ? t('trade.tomorrow', 'tomorrow')
        : t('trade.onDay', '{day}', { day: new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(new Date(next.date)) });
      cutoffEl.innerHTML = t('trade.cutoffIn', 'Order in the next {time} for delivery {day}', { time, day });
    } else {
      const date = new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(next.date));
      cutoffEl.innerHTML = t('trade.nextDelivery', 'Next delivery: <b>{date}</b>', { date });
    }
    const earliest = isoDate(next.date);
    dateInput.min = earliest;
    // suggest the earliest date, unless the buyer picked a (still possible) one
    if (!dateInput.value || dateInput.value < earliest) dateInput.value = earliest;
  }

  const remembered = load(DETAILS_KEY, {});
  REMEMBER.forEach((k) => { if (remembered[k] && !form.elements[k].value) form.elements[k].value = remembered[k]; });
  form.addEventListener('input', (e) => {
    if (!REMEMBER.includes(e.target.name)) return;
    remembered[e.target.name] = e.target.value;
    save(DETAILS_KEY, remembered);
  });

  /* ── Reorder the last request ────────────────────────────────────────── */
  const reorder = document.getElementById('reorder');
  function renderReorder() {
    const last = load(LAST_KEY, null);
    const items = last ? PRODUCTS.filter((p) => last.lines[p.id]).map((p) => ({ p, ...last.lines[p.id] })) : [];
    reorder.hidden = !items.length;
    if (!items.length) return;
    const date = new Intl.DateTimeFormat(window.SVI18N && SVI18N.lang === 'es' ? 'es-ES' : 'en-US',
      { month: 'short', day: 'numeric' }).format(new Date(last.sent));
    document.getElementById('reorder-list').textContent =
      `(${date}): ` + items.map((l) => `${l.qty} ${unitLabel(l)} ${wineName(l.p)}`).join(', ');
  }
  document.getElementById('reorder-btn').addEventListener('click', () => {
    const last = load(LAST_KEY, null);
    if (!last) return;
    lines = {};
    Object.keys(last.lines).forEach((id) => { if (byId(id)) lines[id] = { ...last.lines[id] }; });
    save(LINES_KEY, lines);
    renderSheet();
    renderSummary();
  });

  /* ── Sending ─────────────────────────────────────────────────────────── */
  // The email to the team is always in English, whatever language the page is in.
  function orderText() {
    const v = (k) => (form.elements[k].value || '').trim() || '-';
    const items = chosen().map((l) =>
      `${l.qty} ${l.unit === 'cases' ? (l.qty === 1 ? 'case' : 'cases') : (l.qty === 1 ? 'bottle' : 'bottles')}  ${wineName(l.p)} (${PRODUCERS[l.p.producer].name})`);
    return [
      'WINES',
      ...items,
      '',
      `Business: ${v('business')}`,
      `Contact: ${v('name')}`,
      `Email: ${v('email')}`,
      `Phone: ${v('phone')}`,
      `Delivery address: ${v('address')}`,
      `Invoice email: ${form.elements.invoice_email.value.trim() || v('email')}`,
      `Requested delivery date: ${v('delivery_date')}`,
      `Special delivery instructions: ${v('instructions')}`,
      firstBox.checked ? `FIRST ORDER - NYSLA license number: ${v('nysla_license')}` : 'Existing account',
    ].join('\n');
  }
  const subject = () => `Trade order request: ${form.elements.business.value.trim() || form.elements.email.value.trim()}`;

  function showStatus(html, kind) {
    status.innerHTML = html;
    status.className = 'order-status' + (kind ? ` is-${kind}` : '');
    status.hidden = !html;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!chosen().length) {
      showStatus(t('trade.needWine', 'Add a quantity for at least one wine.'), 'error');
      sheet.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    data.set('order', orderText());
    data.set('_subject', subject());
    data.set('first_order', firstBox.checked ? 'yes' : 'no');

    submitBtn.disabled = true;
    submitBtn.textContent = t('trade.sending', 'Sending…');
    showStatus('');
    try {
      const res = await fetch(TRADE.formEndpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: data });
      if (!res.ok) throw new Error(res.status);
      sent();
    } catch (_) {
      const mailto = `mailto:${TRADE.email}?subject=${encodeURIComponent(subject())}&body=${encodeURIComponent(orderText())}`;
      showStatus(
        `${t('trade.failed', 'Your request couldn’t be sent from here. Nothing was lost: send it by email instead.')}
         <a class="btn" href="${mailto}">${t('trade.emailInstead', 'Open as an email')}</a>`,
        'error'
      );
    }
    submitBtn.textContent = t('trade.submit', 'Send request');
    syncSubmit();
  });

  function sent() {
    const items = chosen();
    // the main conversion, for GA4 / Google Ads
    if (typeof gtag === 'function') {
      gtag('event', 'generate_lead', {
        form_name: 'trade_request',
        first_order: firstBox.checked,
        items: items.map((l) => ({ item_id: l.p.id, item_name: wineName(l.p), quantity: l.qty, item_variant: l.unit })),
      });
    }
    document.getElementById('order-sent-list').innerHTML = items
      .map((l) => `<li><span class="summary-qty">${l.qty} ${unitLabel(l)}</span> <span>${wineName(l.p)}</span></li>`)
      .join('');
    document.getElementById('order-sent-email').textContent = form.elements.email.value.trim();
    document.getElementById('order-sent-first').hidden = !firstBox.checked;
    save(LAST_KEY, { sent: Date.now(), lines });
    lines = {};
    save(LINES_KEY, lines);
    form.elements.instructions.value = '';
    dateInput.value = '';
    form.hidden = true;
    syncBar();
    const done = document.getElementById('order-sent');
    done.hidden = false;
    done.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  document.getElementById('order-again').addEventListener('click', () => {
    renderSheet();
    renderSummary();
    renderReorder();
    syncDelivery();
    document.getElementById('order-sent').hidden = true;
    form.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── Wire up ─────────────────────────────────────────────────────────── */
  renderSheet();
  renderSummary();
  renderReorder();
  syncFirstOrder();
  syncDelivery();
  setInterval(syncDelivery, 30000);
  if (added && byId(added)) {
    const row = sheet.querySelector(`[data-row="${added}"]`);
    row.scrollIntoView({ block: 'center' });
    row.querySelector('input').focus({ preventScroll: true });
  }

  document.addEventListener('sv:lang', () => {
    if (modal.open) renderModal();
    renderSheet();
    renderSummary();
    renderReorder();
    syncDelivery();
  });

  // Mobile menu (shared nav markup with the homepage)
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
    });
  }
})();
