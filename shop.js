/* ============================================================================
   Sunnyside Vines - Shop behavior
   Renders products from shop-config.js, runs a cart, and checks out through
   Shopify when configured (otherwise a friendly demo mode).
   ========================================================================== */
(function () {
  'use strict';

  const DEMO_MODE = !SHOPIFY.domain || !SHOPIFY.storefrontAccessToken;
  const STORAGE_KEY = 'sv_cart';
  // '' on shop.html; '../' on the generated wines/*.html pages
  const ASSET_ROOT = (document.body && document.body.dataset.assetRoot) || '';
  // same order and numbering as the map on the homepage
  const PRODUCER_ORDER = ['penafalcon', 'convento', 'losangeles'];

  const byId = (id) => PRODUCTS.find((p) => p.id === id);
  // bottles per case for a wine (shop-config.js `caseSize`, default 6)
  const caseSize = (p) => p.caseSize || 6;
  // A tasting's discount code (shop-config.js TASTING), remembered once the
  // visitor opens the tasting page and applied at Shopify checkout
  const DISCOUNT_KEY = 'sv_discount';
  const savedDiscount = () => { try { return localStorage.getItem(DISCOUNT_KEY) || ''; } catch (e) { return ''; } };
  // GA4 ecommerce events (also importable into Google Ads as conversions)
  const track = (name, params) => { if (typeof gtag === 'function') gtag('event', name, params); };
  const gaItem = (p, quantity) => ({ item_id: p.id, item_name: `${p.name} ${p.vintage}`, item_brand: PRODUCERS[p.producer].name, price: parseFloat(p.price), quantity });
  const money = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  // English / Spanish (js/i18n.js); falls back to English if it isn't loaded
  const t = (key, en, vars) => (window.SVI18N ? SVI18N.t(key, en, vars) : en);
  const loc = (obj, field) => (window.SVI18N ? SVI18N.loc(obj, field) : obj[field]);

  /* ── Cart state (persisted) ──────────────────────────────────────────── */
  let cart = loadCart();

  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return raw.filter((i) => byId(i.id) && i.qty > 0);
    } catch (e) {
      return [];
    }
  }
  function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  /* ── Render product grid ─────────────────────────────────────────────── */
  function renderProducts() {
    const root = document.getElementById('shop-groups');
    root.innerHTML = PRODUCER_ORDER.map((key, i) => {
      const meta = PRODUCERS[key];
      const wines = PRODUCTS.filter((p) => p.producer === key);
      if (!wines.length) return '';
      return `
        <section class="producer-group" id="${key}">
          <header class="producer-group-header">
            <div>
              <div class="producer-title">
                <h2 class="producer-name">${meta.name}</h2>
                <span class="producer-region">${loc(meta, 'region')}</span>
              </div>
              <p class="producer-blurb">${loc(meta, 'blurb')}</p>
            </div>
          </header>
          <div class="wine-grid">
            ${wines.map(cardHTML).join('')}
          </div>
        </section>`;
    }).join('');
  }

  function cardHTML(p) {
    return `
      <article class="wine-card producer-${p.producer}" data-details="${p.id}">
        <div class="wine-media fit-${p.fit} producer-${p.producer}">
          <img src="${ASSET_ROOT}${bottleImage(p)}" alt="${p.name} ${p.vintage}" loading="lazy">
        </div>
        <div class="wine-body">
          <h3 class="wine-name" id="name-${p.id}">${p.name} <span class="wine-vintage">${p.vintage}</span></h3>
          <p class="wine-meta">${loc(p, 'meta')}</p>
          <p class="wine-note">${loc(p, 'note')}</p>
          <div class="wine-foot">
            <span class="wine-price">${money(parseFloat(p.price))}</span>
          </div>
          ${qtyPickHTML(p)}
          <a class="details-hint" href="wines/${p.id}.html" aria-label="${t('shop.detailsFor', 'View details for {name}', { name: `${p.name} ${p.vintage}` })}">${t('shop.details', 'View details')} <span class="details-arrow" aria-hidden="true">→</span></a>
        </div>
      </article>`;
  }

  // Quantity picker, the usual wine-shop pattern: − 1 + stepper beside Add
  // to cart, and an "Add a case" shortcut under it (the wine's caseSize).
  // Used on the shop grid and the tasting page.
  function qtyPickHTML(p) {
    const name = `${p.name} ${p.vintage}`;
    return `
      <div class="qty-pick" data-pick="${p.id}">
        <div class="qty-pick-row">
          <div class="qty qty-lg">
            <button type="button" data-step="-1" aria-label="${t('cart.decrease', 'Decrease')}, ${name}" disabled>−</button>
            <span class="qty-val" aria-live="polite">1</span>
            <button type="button" data-step="1" aria-label="${t('cart.increase', 'Increase')}, ${name}">+</button>
          </div>
          <button class="add-btn" data-add="${p.id}" data-qty="1" aria-describedby="name-${p.id}">${t('cart.add', 'Add to cart')}</button>
        </div>
        ${caseBtnHTML(p)}
      </div>`;
  }
  function setPick(pick, n) {
    n = Math.max(1, Math.min(240, parseInt(n, 10) || 1));
    pick.querySelector('.qty-val').textContent = n;
    pick.querySelector('[data-step="-1"]').disabled = n <= 1;
    pick.querySelector('.qty-pick-row [data-add]').dataset.qty = n;
  }

  // "Add a case of 12 · $275.88" - adds a full case in one tap
  function caseBtnHTML(p) {
    const n = caseSize(p);
    return `<button class="case-btn" data-add="${p.id}" data-qty="${n}" aria-describedby="name-${p.id}">${caseLabel(p)}</button>`;
  }
  function caseLabel(p) {
    const n = caseSize(p);
    return t('cart.addCase', 'Add a case of {n} · {price}', { n, price: money(parseFloat(p.price) * n) });
  }

  /* ── Tasting page (tasting/index.html) ───────────────────────────────── */
  function renderTasting() {
    const root = document.getElementById('tasting-groups');
    document.getElementById('tasting-title').textContent = TASTING.title;
    document.getElementById('tasting-sub').textContent = TASTING.sub;
    const codeEl = document.getElementById('tasting-code');
    codeEl.hidden = !TASTING.discountCode || DEMO_MODE;
    codeEl.innerHTML = t('tasting.code', 'Your code <strong>{code}</strong> ({label}) is applied automatically at checkout.', { code: TASTING.discountCode, label: TASTING.discountLabel || t('tasting.discount', 'discount') });
    document.getElementById('tasting-jump').innerHTML = TASTING.groups
      .map((g) => `<a href="#${g.producer}">${PRODUCERS[g.producer].name}</a>`).join('');
    root.innerHTML = TASTING.groups.map((g) => {
      const meta = PRODUCERS[g.producer];
      return `
        <section class="tasting-group" id="${g.producer}">
          <header class="tasting-group-head">
            <h2 class="producer-name">${meta.name}</h2>
            <p class="tasting-host">${g.host ? `${g.host} · ` : ''}${loc(meta, 'region')}</p>
          </header>
          <ol class="tasting-list">
            ${g.wines.map((id, i) => tastingRowHTML(byId(id), i + 1)).join('')}
          </ol>
        </section>`;
    }).join('');
  }

  function tastingRowHTML(p, num) {
    const n = caseSize(p);
    return `
      <li class="tasting-row producer-${p.producer}">
        <span class="tasting-num" aria-hidden="true">${String(num).padStart(2, '0')}</span>
        <a class="tasting-media fit-${p.fit}" href="${ASSET_ROOT}wines/${p.id}.html" tabindex="-1" aria-hidden="true">
          <img src="${ASSET_ROOT}${bottleImage(p)}" alt="" loading="lazy">
        </a>
        <div class="tasting-body">
          <h3 class="wine-name" id="name-${p.id}"><a href="${ASSET_ROOT}wines/${p.id}.html">${p.name} <span class="wine-vintage">${p.vintage}</span></a></h3>
          <p class="wine-note">${loc(p, 'note')}</p>
          <p class="tasting-prices">
            <span>${t('tasting.perBottle', '{price} / bottle', { price: money(parseFloat(p.price)) })}</span>
            <span>${t('tasting.perCase', '{price} / case of {n}', { price: money(parseFloat(p.price) * n), n })}</span>
          </p>
          ${qtyPickHTML(p)}
        </div>
      </li>`;
  }

  /* ── Cart mutations ──────────────────────────────────────────────────── */
  function addToCart(id, qty = 1) {
    const line = cart.find((i) => i.id === id);
    if (line) line.qty += qty;
    else cart.push({ id, qty });
    saveCart();
    updateCartUI();
    const p = byId(id);
    track('add_to_cart', { currency: 'USD', value: parseFloat(p.price) * qty, items: [gaItem(p, qty)] });
  }
  function setQty(id, delta) {
    const line = cart.find((i) => i.id === id);
    if (!line) return;
    line.qty = Math.max(1, line.qty + delta);
    saveCart();
    updateCartUI();
  }
  function removeFromCart(id) {
    const idx = cart.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const removed = cart[idx];
    cart.splice(idx, 1);
    saveCart();
    updateCartUI();
    toast(t('cart.removed', '{name} removed', { name: byId(id).name }), {
      label: t('cart.undo', 'Undo'),
      onClick: () => {
        if (!cart.some((i) => i.id === id)) {
          cart.splice(Math.min(idx, cart.length), 0, removed);
          saveCart();
          updateCartUI();
        }
      },
    });
  }
  function cartCount() {
    return cart.reduce((n, i) => n + i.qty, 0);
  }
  function cartSubtotal() {
    return cart.reduce((sum, i) => sum + parseFloat(byId(i.id).price) * i.qty, 0);
  }

  /* ── Cart UI ─────────────────────────────────────────────────────────── */
  function updateCartUI() {
    const count = cartCount();
    const badge = document.getElementById('cart-count');
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
    // the "Cart" word is hidden on phones, so the name is set here (and includes the count)
    document.getElementById('cart-toggle').setAttribute('aria-label', count ? `${t('cart.label', 'Cart')} ${count}` : t('cart.label', 'Cart'));

    const itemsEl = document.getElementById('cart-items');
    if (!cart.length) {
      itemsEl.innerHTML = `<p class="cart-empty">${t('cart.empty', 'Your cart is empty.')}</p>`;
    } else {
      itemsEl.innerHTML = cart.map((i) => {
        const p = byId(i.id);
        return `
          <div class="cart-item">
            <div class="cart-item-thumb" style="background-image:url('${ASSET_ROOT}${bottleImage(p)}')"></div>
            <div>
              <div class="cart-item-name">${p.name} ${p.vintage}</div>
              <div class="cart-item-price">${t('cart.each', '{price} each', { price: money(parseFloat(p.price)) })}</div>
            </div>
            <div class="cart-item-right">
              <div class="qty">
                <button data-dec="${p.id}" aria-label="${t('cart.decrease', 'Decrease')}, ${p.name} ${p.vintage}" ${i.qty <= 1 ? 'disabled' : ''}>−</button>
                <span aria-label="${t('cart.qty', 'Quantity {qty}', { qty: i.qty })}">${i.qty}</span>
                <button data-inc="${p.id}" aria-label="${t('cart.increase', 'Increase')}, ${p.name} ${p.vintage}">+</button>
              </div>
              <button class="cart-item-remove" data-remove="${p.id}" aria-label="${t('cart.remove', 'Remove')}, ${p.name} ${p.vintage}">${t('cart.remove', 'Remove')}</button>
            </div>
          </div>`;
      }).join('');
    }

    document.getElementById('cart-subtotal-value').textContent = money(cartSubtotal());
    renderCaseProgress(count);
    const checkoutBtn = document.getElementById('checkout-btn');
    checkoutBtn.disabled = cart.length === 0;
    if (DEMO_MODE) {
      checkoutBtn.textContent = t('checkout.email', 'Email us this order');
      document.getElementById('cart-note').textContent = t('checkout.note', 'Online checkout is coming soon. For now, email us your order and we’ll arrange payment and delivery.');
    }
  }

  // Bottles count toward a case whichever wines they are, so customers can
  // build a mixed case across producers. Shown above the subtotal.
  function renderCaseProgress(count) {
    let el = document.getElementById('case-progress');
    if (!el) {
      el = document.createElement('div');
      el.id = 'case-progress';
      el.className = 'case-progress';
      document.querySelector('.cart-foot').prepend(el);
    }
    if (!count) { el.hidden = true; return; }
    el.hidden = false;
    const target = count <= 6 ? 6 : count <= 12 ? 12 : Math.ceil(count / 12) * 12;
    const full = count === target;
    const cases = target / (target === 6 ? 6 : 12);
    const label = full
      ? (target === 6
        ? t('case.full6', 'A full case of 6')
        : cases === 1 ? t('case.full12', 'A full case of 12') : t('case.fullN', '{cases} full cases of 12', { cases }))
      : t('case.toGo', '{count} of {target} bottles: add {left} more for a full case', { count, target, left: target - count });
    const code = savedDiscount();
    el.innerHTML = `
      <p class="case-progress-label${full ? ' is-full' : ''}">${full ? '✓ ' : ''}${label}</p>
      <div class="case-progress-bar" aria-hidden="true"><span style="width:${Math.round((count / target) * 100)}%"></span></div>
      <p class="case-progress-hint">${t('case.mix', 'Mix any wines to make up a case.')}</p>
      ${code && !DEMO_MODE ? `<p class="case-progress-code">${t('case.code', 'Code {code} applied at checkout', { code })}${typeof TASTING !== 'undefined' && TASTING.discountCode === code && TASTING.discountLabel ? ` (${TASTING.discountLabel})` : ''}</p>` : ''}`;
  }

  function openCart() {
    const drawer = document.getElementById('cart-drawer');
    document.getElementById('cart-overlay').classList.add('open');
    drawer.classList.add('open');
    drawer.inert = false;
    document.getElementById('cart-close').focus();
  }
  function closeCart() {
    const drawer = document.getElementById('cart-drawer');
    if (!drawer.classList.contains('open')) return;
    const hadFocus = drawer.contains(document.activeElement);
    document.getElementById('cart-overlay').classList.remove('open');
    drawer.classList.remove('open');
    drawer.inert = true;
    if (hadFocus) document.getElementById('cart-toggle').focus();
  }

  // Screen-reader announcement that isn't shown on screen
  function announce(msg) {
    let el = document.getElementById('sr-status');
    if (!el) {
      el = document.createElement('p');
      el.id = 'sr-status';
      el.className = 'sr-only';
      el.setAttribute('role', 'status');
      document.body.append(el);
    }
    el.textContent = '';
    setTimeout(() => { el.textContent = msg; }, 50);
  }

  let toastTimer;
  function toast(msg, action) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    if (action) {
      const btn = document.createElement('button');
      btn.className = 'toast-action';
      btn.textContent = action.label;
      btn.addEventListener('click', () => {
        clearTimeout(toastTimer);
        t.classList.remove('show');
        action.onClick();
      });
      t.appendChild(btn);
    }
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), action ? 5000 : 2600);
  }

  /* ── Checkout ────────────────────────────────────────────────────────── */
  function checkout() {
    if (!cart.length) return;
    track('begin_checkout', { currency: 'USD', value: cartSubtotal(), items: cart.map((i) => gaItem(byId(i.id), i.qty)) });
    if (DEMO_MODE) {
      emailOrder();
      return;
    }
    shopifyCheckout();
  }

  // Until a store is connected, checkout hands the cart to the team by email
  function emailOrder() {
    const body = [
      'I’d like to order:',
      ...cart.map((i) => {
        const p = byId(i.id);
        return `${i.qty} × ${p.name} ${p.vintage} (${money(parseFloat(p.price))} each)`;
      }),
      `Subtotal: ${money(cartSubtotal())}`,
      '',
      'Name:',
      'Delivery address:',
      'Phone:',
    ].join('\n');
    window.location.href = `mailto:info@sunnysidevines.com?subject=${encodeURIComponent('Wine order')}&body=${encodeURIComponent(body)}`;
  }

  async function shopifyCheckout() {
    const btn = document.getElementById('checkout-btn');
    const missing = cart.filter((i) => !byId(i.id)?.shopify?.variantId);

    if (missing.length) {
      const names = missing.map((i) => `${byId(i.id).name} ${byId(i.id).vintage}`).join(', ');
      toast(`Add Shopify variant IDs for: ${names}.`);
      return;
    }

    const lines = cart.map((i) => ({
      merchandiseId: byId(i.id).shopify.variantId,
      quantity: i.qty,
    }));

    btn.disabled = true;
    btn.textContent = t('checkout.redirecting', 'Redirecting…');

    const mutation = `
      mutation CartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart { checkoutUrl }
          userErrors { field message }
        }
      }
    `;

    try {
      const response = await fetch(`https://${SHOPIFY.domain}/api/2026-10/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY.storefrontAccessToken,
        },
        body: JSON.stringify({
          query: mutation,
          variables: { input: savedDiscount() ? { lines, discountCodes: [savedDiscount()] } : { lines } },
        }),
      });
      const payload = await response.json();
      const apiErrors = (payload.errors || []).map((error) => error.message);
      if (!response.ok || apiErrors.length) {
        throw new Error(apiErrors.join('; ') || `Shopify returned ${response.status}`);
      }

      const result = payload.data?.cartCreate;
      const userErrors = result?.userErrors || [];
      if (userErrors.length) {
        throw new Error(userErrors.map((error) => error.message).join('; '));
      }
      if (!result?.cart?.checkoutUrl) throw new Error('Shopify did not return a checkout URL.');

      window.location.assign(result.cart.checkoutUrl);
    } catch (error) {
      console.error('Shopify checkout failed:', error);
      toast(t('checkout.error', 'Sorry, checkout could not be reached.'));
      btn.disabled = false;
      btn.textContent = t('cart.checkout', 'Checkout');
    }
  }

  /* ── Wire up ─────────────────────────────────────────────────────────── */
  function init() {
    if (DEMO_MODE) {
      // this script owns the button's label from here on (see updateCartUI)
      const checkoutBtn = document.getElementById('checkout-btn');
      checkoutBtn.removeAttribute('data-i18n');
      const note = document.createElement('p');
      note.className = 'cart-note';
      note.id = 'cart-note';
      checkoutBtn.before(note);
    }
    updateCartUI();

    // Add-to-cart works anywhere the button appears (shop grid, wine pages)
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-add]');
      if (!btn) return;
      const qty = parseInt(btn.dataset.qty, 10) || 1;
      addToCart(btn.dataset.add, qty);
      if (!btn.classList.contains('added')) btn.dataset.label = btn.textContent;
      btn.classList.add('added');
      btn.textContent = t('cart.added', 'Added ✓');
      toast(qty > 1
        ? t('cart.addedCaseToast', '{qty} bottles added to cart', { qty })
        : t('cart.addedToast', 'Added to cart'));
      clearTimeout(btn._reset);
      const pick = btn.closest('.qty-pick');
      btn._reset = setTimeout(() => {
        btn.classList.remove('added');
        btn.textContent = btn.dataset.label;
        // the stepper goes back to 1 bottle
        if (pick) setPick(pick, 1);
      }, 1200);
    });

    // Quantity pickers: − / + stepper
    document.addEventListener('click', (e) => {
      const step = e.target.closest('.qty-pick [data-step]');
      if (!step) return;
      const pick = step.closest('.qty-pick');
      setPick(pick, parseInt(pick.querySelector('.qty-val').textContent, 10) + parseInt(step.dataset.step, 10));
    });

    // Product grid (shop.html only) - cards link through to wines/<id>.html
    const grid = document.getElementById('shop-groups');
    if (grid) {
      renderProducts();
      grid.addEventListener('click', (e) => {
        if (e.target.closest('a') || e.target.closest('[data-add]') || e.target.closest('.qty-pick')) return;
        const card = e.target.closest('[data-details]');
        if (card) window.location.href = `wines/${card.dataset.details}.html`;
      });
    }

    // Tasting page: list the event's wines and remember its discount code
    const tastingRoot = document.getElementById('tasting-groups');
    if (tastingRoot && typeof TASTING !== 'undefined') {
      try {
        if (TASTING.discountCode) localStorage.setItem(DISCOUNT_KEY, TASTING.discountCode);
        else localStorage.removeItem(DISCOUNT_KEY);
      } catch (e) { /* private mode: no code carried, checkout still works */ }
      renderTasting();
      updateCartUI();
    }

    // Wine pages (wines/*.html): a case button under the price
    const detailAdd = document.querySelector('.detail-foot [data-add]');
    const placeCaseBtn = () => {
      if (!detailAdd) return;
      document.querySelector('.detail-foot + .case-btn')?.remove();
      document.querySelector('.detail-foot').insertAdjacentHTML('afterend', caseBtnHTML(byId(detailAdd.dataset.add)));
    };
    placeCaseBtn();

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeCart();
    });

    // Cart item controls (delegation on the drawer list)
    document.getElementById('cart-items').addEventListener('click', (e) => {
      const inc = e.target.closest('[data-inc]');
      const dec = e.target.closest('[data-dec]');
      const rem = e.target.closest('[data-remove]');
      const list = document.getElementById('cart-items');
      if (inc || dec) {
        const id = (inc || dec).dataset.inc || (inc || dec).dataset.dec;
        setQty(id, inc ? 1 : -1);
        const line = cart.find((i) => i.id === id);
        const same = list.querySelector(inc ? `[data-inc="${id}"]` : `[data-dec="${id}"]`);
        (same && !same.disabled ? same : list.querySelector(`[data-inc="${id}"]`)).focus();
        announce(t('cart.qtyOf', '{name}: quantity {qty}', { name: `${byId(id).name} ${byId(id).vintage}`, qty: line.qty }));
      } else if (rem) {
        const rows = [...list.querySelectorAll('[data-remove]')];
        const at = rows.indexOf(rem);
        removeFromCart(rem.dataset.remove);
        const left = list.querySelectorAll('[data-remove]');
        (left[Math.min(at, left.length - 1)] || document.getElementById('cart-close')).focus();
      }
    });

    const drawer = document.getElementById('cart-drawer');
    drawer.inert = true;
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    const toastEl = document.getElementById('toast');
    if (toastEl) toastEl.setAttribute('role', 'status');
    document.getElementById('cart-toggle').addEventListener('click', openCart);
    document.getElementById('cart-close').addEventListener('click', closeCart);
    document.getElementById('cart-overlay').addEventListener('click', closeCart);
    document.getElementById('checkout-btn').addEventListener('click', checkout);

    // Language switch: re-render everything this script drew
    document.addEventListener('sv:lang', () => {
      if (grid) renderProducts();
      if (tastingRoot && typeof TASTING !== 'undefined') renderTasting();
      placeCaseBtn();
      updateCartUI();
    });

    // Mobile menu (shared nav markup with the homepage)
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (toggle && links) {
      toggle.setAttribute('aria-controls', 'navLinks');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('open');
        links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(links.classList.contains('open')));
      });
      links.querySelectorAll('a').forEach((a) =>
        a.addEventListener('click', () => {
          toggle.classList.remove('open');
          links.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        })
      );
    }
  }

  // Script runs at the end of body, after every element it queries has
  // already been parsed - no need to wait for DOMContentLoaded, and doing
  // so would tie the product grid's render to the (possibly slow) Shopify
  // SDK <script defer> up in <head>, which briefly leaves the page short
  // and the footer visible near the top before the grid fills in.
  init();
})();
