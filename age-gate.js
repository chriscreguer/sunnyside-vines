(() => {
  'use strict';

  const storageKey = 'sunnyside-vines-age-21';
  let status;
  try {
    status = sessionStorage.getItem(storageKey);
  } catch (_) {
    // Visitors with storage disabled can still confirm on each page.
  }

  if (status === 'confirmed') {
    document.documentElement.setAttribute('data-age-verified', '');
    return;
  }

  const gate = document.createElement('dialog');
  gate.id = 'age-gate';
  gate.setAttribute('aria-labelledby', 'age-gate-title');
  gate.setAttribute('aria-describedby', 'age-gate-description');
  gate.innerHTML = `
    <p class="age-gate-brand">Sunnyside Vines</p>
    <h2 id="age-gate-title">Are you 21 or older?</h2>
    <p id="age-gate-description">You must be at least 21 years old to enter this site.</p>
    <div class="age-gate-actions">
      <button type="button" class="age-gate-confirm" autofocus>Yes, I am 21 or older</button>
      <button type="button" class="age-gate-decline">No, I am under 21</button>
    </div>
    <p class="age-gate-note">Please enjoy responsibly.</p>`;

  // A modal dialog makes the rest of the page inert, including keyboard focus.
  // Escape and backdrop clicks must not bypass the confirmation.
  gate.addEventListener('cancel', (event) => event.preventDefault());
  document.body.append(gate);

  function remember(value) {
    try {
      sessionStorage.setItem(storageKey, value);
    } catch (_) {
      // The current page remains usable even when session storage is blocked.
    }
  }

  function denyEntry() {
    gate.querySelector('#age-gate-title').textContent = 'For guests 21 and older';
    gate.querySelector('#age-gate-description').textContent =
      'You must be at least 21 years old to visit Sunnyside Vines. Thank you for understanding.';
    gate.querySelector('.age-gate-actions').innerHTML =
      '<a class="age-gate-exit" href="about:blank">Leave site</a>';
    gate.querySelector('.age-gate-exit').focus();
  }

  gate.querySelector('.age-gate-confirm').addEventListener('click', () => {
    remember('confirmed');
    document.documentElement.setAttribute('data-age-verified', '');
    gate.close();
    gate.remove();
    document.querySelector('nav a, main a, a[href], button')?.focus({ preventScroll: true });
  });

  gate.querySelector('.age-gate-decline').addEventListener('click', () => {
    remember('denied');
    denyEntry();
  });

  gate.showModal();
  if (status === 'denied') denyEntry();
})();
