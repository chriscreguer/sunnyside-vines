(() => {
  'use strict';

  const storageKey = 'sunnyside-vines-age-confirmed-v2';
  // Minimum retail purchase ages for wine. Unknown locations stay at 21.
  const ages = {
    US: 21, CA: 19, GB: 18, AU: 18, NZ: 18,
    FR: 18, ES: 18, IT: 18, DE: 16, JP: 20, SE: 20,
  };
  const canadianAge18 = new Set(['AB', 'MB', 'QC']);
  let saved;
  try {
    saved = JSON.parse(sessionStorage.getItem(storageKey));
  } catch (_) {
    // Storage can be disabled; those visitors confirm on each page.
  }

  if (saved?.status === 'confirmed') {
    document.documentElement.setAttribute('data-age-verified', '');
    return;
  }

  function ageFor(country, region) {
    return country === 'CA'
      ? (canadianAge18.has(region) ? 18 : 19)
      : ages[country] || 21;
  }

  const gate = document.createElement('dialog');
  gate.id = 'age-gate';
  gate.setAttribute('aria-labelledby', 'age-gate-title');
  gate.innerHTML = `
    <p class="age-gate-brand">Sunnyside Vines</p>
    <h2 id="age-gate-title">Are you 21 or older?</h2>
    <div class="age-gate-actions">
      <button type="button" class="btn primary age-gate-confirm">Yes</button>
      <button type="button" class="btn ghost age-gate-decline">No</button>
    </div>`;
  gate.addEventListener('cancel', event => event.preventDefault());
  document.body.append(gate);

  const title = gate.querySelector('#age-gate-title');
  const confirm = gate.querySelector('.age-gate-confirm');
  const decline = gate.querySelector('.age-gate-decline');
  let age = typeof saved?.age === 'number'
    ? saved.age
    : ageFor(saved?.country, saved?.region);

  function remember(status) {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ status, age }));
    } catch (_) {
      // The visitor can still use this page if storage is unavailable.
    }
  }

  function denyEntry() {
    title.textContent = `You must be ${age} or older.`;
    gate.querySelector('.age-gate-actions').innerHTML =
      '<a class="age-gate-exit" href="about:blank">Leave site</a>';
    gate.querySelector('.age-gate-exit').focus();
  }

  confirm.addEventListener('click', () => {
    remember('confirmed');
    document.documentElement.setAttribute('data-age-verified', '');
    gate.close();
    gate.remove();
    document.dispatchEvent(new Event('age:verified'));
    document.querySelector('nav a, main a, a[href], button')?.focus({ preventScroll: true });
  });
  decline.addEventListener('click', () => {
    remember('denied');
    denyEntry();
  });

  gate.showModal();
  confirm.focus({ preventScroll: true });
  if (saved?.status === 'denied') {
    denyEntry();
    return;
  }

  // Vercel reads the visitor's public IP; no precise location permission is needed.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  fetch('/api/visitor-region', { cache: 'no-store', signal: controller.signal })
    .then(response => response.ok ? response.json() : null)
    .then(location => {
      age = ageFor(location?.country, location?.region);
    })
    .catch(() => {
      age = 21;
    })
    .finally(() => {
      clearTimeout(timeout);
      if (!gate.isConnected || !confirm.isConnected) return;
      title.textContent = `Are you ${age} or older?`;
    });
})();
