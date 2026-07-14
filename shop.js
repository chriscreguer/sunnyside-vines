/* ============================================================================
   Sunnyside Vines - Shop behavior
   Renders products from shop-config.js, runs a cart, and checks out through
   Shopify when configured (otherwise a friendly demo mode).
   ========================================================================== */
(function () {
  'use strict';

  const DEMO_MODE = !SHOPIFY.domain || !SHOPIFY.storefrontAccessToken;
  const STORAGE_KEY = 'sv_cart';
  // same order and numbering as the map on the homepage
  const PRODUCER_ORDER = ['penafalcon', 'convento', 'losangeles'];

  const byId = (id) => PRODUCTS.find((p) => p.id === id);
  const money = (n) => '$' + n.toFixed(2);

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
        <section class="producer-group reveal-fade">
          <header class="producer-group-header">
            <div>
              <div class="producer-title">
                <span class="producer-name">${meta.name}</span>
                <span class="producer-region">${meta.region}</span>
              </div>
              <p class="producer-blurb">${meta.blurb}</p>
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
      <article class="wine-card producer-${p.producer}" data-details="${p.id}" tabindex="0" role="button" aria-label="View details for ${p.name} ${p.vintage}">
        <div class="wine-media fit-${p.fit} producer-${p.producer}">
          <img src="${p.image}" alt="${p.name} ${p.vintage}" loading="lazy">
        </div>
        <div class="wine-body">
          <h3 class="wine-name">${p.name} <span class="wine-vintage">${p.vintage}</span></h3>
          <p class="wine-meta">${p.meta}</p>
          <p class="wine-note">${p.note}</p>
          <div class="wine-foot">
            <span class="wine-price">${money(parseFloat(p.price))}</span>
            <button class="add-btn" data-add="${p.id}">Add to cart</button>
          </div>
          <span class="details-hint">View details <span class="details-arrow" aria-hidden="true">→</span></span>
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
    toast(`${byId(id).name} removed`, {
      label: 'Undo',
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

    const itemsEl = document.getElementById('cart-items');
    if (!cart.length) {
      itemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    } else {
      itemsEl.innerHTML = cart.map((i) => {
        const p = byId(i.id);
        return `
          <div class="cart-item">
            <div class="cart-item-thumb" style="background-image:url('${p.image}')"></div>
            <div>
              <div class="cart-item-name">${p.name} ${p.vintage}</div>
              <div class="cart-item-price">${money(parseFloat(p.price))} each</div>
            </div>
            <div class="cart-item-right">
              <div class="qty">
                <button data-dec="${p.id}" aria-label="Decrease" ${i.qty <= 1 ? 'disabled' : ''}>−</button>
                <span>${i.qty}</span>
                <button data-inc="${p.id}" aria-label="Increase">+</button>
              </div>
              <button class="cart-item-remove" data-remove="${p.id}">Remove</button>
            </div>
          </div>`;
      }).join('');
    }

    document.getElementById('cart-subtotal-value').textContent = money(cartSubtotal());
    const checkoutBtn = document.getElementById('checkout-btn');
    checkoutBtn.disabled = cart.length === 0;
  }

  function openCart() {
    document.getElementById('cart-overlay').classList.add('open');
    document.getElementById('cart-drawer').classList.add('open');
  }
  function closeCart() {
    document.getElementById('cart-overlay').classList.remove('open');
    document.getElementById('cart-drawer').classList.remove('open');
  }

  /* ── Wine details modal ──────────────────────────────────────────────── */
  function openDetails(id) {
    const p = byId(id);
    if (!p) return;
    const meta = PRODUCERS[p.producer];
    const specs = (p.details || [])
      .map(([k, v]) => `<div class="detail-row"><dt>${k}</dt><dd>${v}</dd></div>`)
      .join('');
    document.getElementById('detail-content').innerHTML = `
      <div class="detail-media fit-${p.fit} producer-${p.producer}">
        <img src="${p.image}" alt="${p.name} ${p.vintage}">
      </div>
      <div class="detail-body">
        <p class="detail-producer">${meta.name} · ${meta.region}</p>
        <h2 class="detail-name">${p.name} <span class="wine-vintage">${p.vintage}</span></h2>
        <p class="wine-meta">${p.meta}${p.badge ? ' · ' + p.badge : ''}</p>
        <p class="detail-note">${p.tasting || p.note}</p>
        ${specs ? `<dl class="detail-specs">${specs}</dl>` : ''}
        <div class="detail-foot">
          <span class="wine-price">${money(parseFloat(p.price))}</span>
          <button class="add-btn" data-add="${p.id}">Add to cart</button>
        </div>
        ${p.ficha ? `<a class="ficha-link detail-pdf" href="${encodeURI(p.ficha)}" target="_blank" rel="noopener">Producer spec sheet (PDF) →</a>` : ''}
      </div>`;
    document.getElementById('detail-overlay').classList.add('open');
    document.getElementById('detail-modal').classList.add('open');
    document.body.classList.add('modal-open');
  }
  function closeDetails() {
    document.getElementById('detail-overlay').classList.remove('open');
    document.getElementById('detail-modal').classList.remove('open');
    document.body.classList.remove('modal-open');
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
    if (DEMO_MODE) {
      toast('Online checkout is coming soon.');
      return;
    }
    shopifyCheckout();
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
    btn.textContent = 'Redirecting…';

    const client = ShopifyBuy.buildClient({
      domain: SHOPIFY.domain,
      storefrontAccessToken: SHOPIFY.storefrontAccessToken,
    });
    client.checkout
      .create()
      .then((c) => client.checkout.addLineItems(c.id, lineItems))
      .then((c) => { window.location.href = c.webUrl; })
      .catch(() => {
        toast('Sorry, checkout could not be reached.');
        btn.disabled = false;
        btn.textContent = 'Checkout';
      });
  }

  /* ── Wire up ─────────────────────────────────────────────────────────── */
  function init() {
    renderProducts();
    updateCartUI();

    // Add-to-cart and details (event delegation on the grid)
    const handleAdd = (btn) => {
      addToCart(btn.dataset.add);
      btn.classList.add('added');
      btn.textContent = 'Added ✓';
      toast('Added to cart');
      setTimeout(() => {
        btn.classList.remove('added');
        btn.textContent = 'Add to cart';
      }, 1200);
    };
    document.getElementById('shop-groups').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-add]');
      if (btn) { handleAdd(btn); return; }
      const card = e.target.closest('[data-details]');
      if (card) openDetails(card.dataset.details);
    });
    document.getElementById('shop-groups').addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('[data-details]');
      if (card && e.target === card) {
        e.preventDefault();
        openDetails(card.dataset.details);
      }
    });

    // Details modal
    document.getElementById('detail-content').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-add]');
      if (btn) handleAdd(btn);
    });
    document.getElementById('detail-close').addEventListener('click', closeDetails);
    document.getElementById('detail-overlay').addEventListener('click', closeDetails);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDetails();
    });

    // Cart item controls (delegation on the drawer list)
    document.getElementById('cart-items').addEventListener('click', (e) => {
      const inc = e.target.closest('[data-inc]');
      const dec = e.target.closest('[data-dec]');
      const rem = e.target.closest('[data-remove]');
      if (inc) setQty(inc.dataset.inc, 1);
      else if (dec) setQty(dec.dataset.dec, -1);
      else if (rem) removeFromCart(rem.dataset.remove);
    });

    document.getElementById('cart-toggle').addEventListener('click', openCart);
    document.getElementById('cart-close').addEventListener('click', closeCart);
    document.getElementById('cart-overlay').addEventListener('click', closeCart);
    document.getElementById('checkout-btn').addEventListener('click', checkout);

    // Scroll reveals - the same quiet fades the homepage uses
    document.documentElement.classList.add('js-shop');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        e.target.classList.add('is-in');
      }),
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    document.querySelectorAll('.reveal-fade').forEach((el) => io.observe(el));

    // Mobile menu (shared nav markup with the homepage)
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('open');
        links.classList.toggle('open');
      });
      links.querySelectorAll('a').forEach((a) =>
        a.addEventListener('click', () => {
          toggle.classList.remove('open');
          links.classList.remove('open');
        })
      );
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
