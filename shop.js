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
  // GA4 ecommerce events (also importable into Google Ads as conversions)
  const track = (name, params) => { if (typeof gtag === 'function') gtag('event', name, params); };
  const gaItem = (p, quantity) => ({ item_id: p.id, item_name: `${p.name} ${p.vintage}`, item_brand: PRODUCERS[p.producer].name, price: parseFloat(p.price), quantity });
  const money = (n) => '$' + n.toFixed(2);
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
            <button class="add-btn" data-add="${p.id}" aria-describedby="name-${p.id}">${t('cart.add', 'Add to cart')}</button>
          </div>
          <a class="details-hint" href="wines/${p.id}.html" aria-label="${t('shop.detailsFor', 'View details for {name}', { name: `${p.name} ${p.vintage}` })}">${t('shop.details', 'View details')} <span class="details-arrow" aria-hidden="true">→</span></a>
        </div>
      </article>`;
  }

  /* ── Cart mutations ──────────────────────────────────────────────────── */
  function addToCart(id) {
    const line = cart.find((i) => i.id === id);
    if (line) line.qty += 1;
    else cart.push({ id, qty: 1 });
    saveCart();
    updateCartUI();
    const p = byId(id);
    track('add_to_cart', { currency: 'USD', value: parseFloat(p.price), items: [gaItem(p, 1)] });
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
    const checkoutBtn = document.getElementById('checkout-btn');
    checkoutBtn.disabled = cart.length === 0;
    if (DEMO_MODE) {
      checkoutBtn.textContent = t('checkout.email', 'Email us this order');
      document.getElementById('cart-note').textContent = t('checkout.note', 'Online checkout is coming soon. For now, email us your order and we’ll arrange payment and delivery.');
    }
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

  function shopifyCheckout() {
    const btn = document.getElementById('checkout-btn');
    const lineItems = cart
      .map((i) => ({ variantId: byId(i.id).shopify.variantId, quantity: i.qty }))
      .filter((li) => li.variantId);

    if (!lineItems.length) {
      toast('No Shopify variant IDs configured yet.');
      return;
    }
    btn.disabled = true;
    btn.textContent = t('checkout.redirecting', 'Redirecting…');

    const client = ShopifyBuy.buildClient({
      domain: SHOPIFY.domain,
      storefrontAccessToken: SHOPIFY.storefrontAccessToken,
    });
    client.checkout
      .create()
      .then((c) => client.checkout.addLineItems(c.id, lineItems))
      .then((c) => { window.location.href = c.webUrl; })
      .catch(() => {
        toast(t('checkout.error', 'Sorry, checkout could not be reached.'));
        btn.disabled = false;
        btn.textContent = t('cart.checkout', 'Checkout');
      });
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
      addToCart(btn.dataset.add);
      btn.classList.add('added');
      btn.textContent = t('cart.added', 'Added ✓');
      toast(t('cart.addedToast', 'Added to cart'));
      setTimeout(() => {
        btn.classList.remove('added');
        btn.textContent = t('cart.add', 'Add to cart');
      }, 1200);
    });

    // Product grid (shop.html only) - cards link through to wines/<id>.html
    const grid = document.getElementById('shop-groups');
    if (grid) {
      renderProducts();
      grid.addEventListener('click', (e) => {
        if (e.target.closest('a') || e.target.closest('[data-add]')) return;
        const card = e.target.closest('[data-details]');
        if (card) window.location.href = `wines/${card.dataset.details}.html`;
      });
    }

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
