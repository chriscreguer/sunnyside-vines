(() => {
  'use strict';

  const storageKey = 'sunnyside-vines-age-confirmed-v2';
  // Minimum retail purchase ages for wine. Unknown locations stay at 21.
  const ages = {
    US: 21,
    CA: 19,
    GB: 18,
    AU: 18,
    NZ: 18,
    FR: 18,
    ES: 18,
    IT: 18,
    DE: 16,
    JP: 20,
    SE: 20,
    OTHER: 21,
  };
  const canadianAge18 = new Set(['AB', 'MB', 'QC']);
  let saved;
  try {
    saved = JSON.parse(sessionStorage.getItem(storageKey));
  } catch (_) {
    // Visitors with storage disabled can still confirm on each page.
  }

  if (saved?.status === 'confirmed') {
    document.documentElement.setAttribute('data-age-verified', '');
    return;
  }

  const gate = document.createElement('dialog');
  gate.id = 'age-gate';
  gate.setAttribute('aria-labelledby', 'age-gate-title');
  gate.setAttribute('aria-describedby', 'age-gate-description');
  gate.innerHTML = `
    <p class="age-gate-brand">Sunnyside Vines</p>
    <h2 id="age-gate-title">Welcome to Sunnyside Vines</h2>
    <p id="age-gate-description">Please confirm you are old enough to purchase wine where you are.</p>
    <div class="age-gate-location">
      <label for="age-gate-country">Your current location</label>
      <select id="age-gate-country">
        <option value="US">United States</option>
        <option value="CA">Canada</option>
        <option value="GB">United Kingdom</option>
        <option value="AU">Australia</option>
        <option value="NZ">New Zealand</option>
        <option value="FR">France</option>
        <option value="ES">Spain</option>
        <option value="IT">Italy</option>
        <option value="DE">Germany (wine)</option>
        <option value="JP">Japan</option>
        <option value="SE">Sweden (retail wine)</option>
        <option value="OTHER">Other location (21+)</option>
      </select>
      <div class="age-gate-province" hidden>
        <label for="age-gate-region">Province or territory</label>
        <select id="age-gate-region">
          <option value="">Select your province or territory</option>
          <option value="AB">Alberta</option>
          <option value="BC">British Columbia</option>
          <option value="MB">Manitoba</option>
          <option value="NB">New Brunswick</option>
          <option value="NL">Newfoundland and Labrador</option>
          <option value="NT">Northwest Territories</option>
          <option value="NS">Nova Scotia</option>
          <option value="NU">Nunavut</option>
          <option value="ON">Ontario</option>
          <option value="PE">Prince Edward Island</option>
          <option value="QC">Quebec</option>
          <option value="SK">Saskatchewan</option>
          <option value="YT">Yukon</option>
        </select>
      </div>
    </div>
    <div class="age-gate-actions">
      <button type="button" class="age-gate-confirm" autofocus>Yes, I am 21 or older</button>
      <button type="button" class="age-gate-decline">No, I am under 21</button>
    </div>
    <p class="age-gate-note">Please enjoy responsibly.</p>`;

  // A modal dialog makes the rest of the page inert, including keyboard focus.
  // Escape and backdrop clicks must not bypass the confirmation.
  gate.addEventListener('cancel', (event) => event.preventDefault());
  document.body.append(gate);

  const country = gate.querySelector('#age-gate-country');
  const region = gate.querySelector('#age-gate-region');
  const province = gate.querySelector('.age-gate-province');
  const confirm = gate.querySelector('.age-gate-confirm');
  const decline = gate.querySelector('.age-gate-decline');
  if (saved?.status === 'denied' && Object.hasOwn(ages, saved.country)) {
    country.value = saved.country;
    region.value = saved.region || '';
  }

  function selectedAge() {
    return country.value === 'CA'
      ? (canadianAge18.has(region.value) ? 18 : 19)
      : ages[country.value];
  }

  function updateAge() {
    const isCanada = country.value === 'CA';
    province.hidden = !isCanada;
    const age = selectedAge();
    confirm.textContent = `Yes, I am ${age} or older`;
    decline.textContent = `No, I am under ${age}`;
    confirm.disabled = isCanada && !region.value;
    decline.disabled = isCanada && !region.value;
  }

  country.addEventListener('change', updateAge);
  region.addEventListener('change', updateAge);
  updateAge();

  function remember(value) {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({
        status: value,
        country: country.value,
        region: region.value,
      }));
    } catch (_) {
      // The current page remains usable even when session storage is blocked.
    }
  }

  function denyEntry() {
    const age = selectedAge();
    gate.querySelector('#age-gate-title').textContent = `For guests ${age} and older`;
    gate.querySelector('#age-gate-description').textContent =
      `You must be at least ${age} years old to visit Sunnyside Vines from this location. Thank you for understanding.`;
    gate.querySelector('.age-gate-location').remove();
    gate.querySelector('.age-gate-actions').innerHTML =
      '<a class="age-gate-exit" href="about:blank">Leave site</a>';
    gate.querySelector('.age-gate-exit').focus();
  }

  confirm.addEventListener('click', () => {
    remember('confirmed');
    document.documentElement.setAttribute('data-age-verified', '');
    gate.close();
    gate.remove();
    document.querySelector('nav a, main a, a[href], button')?.focus({ preventScroll: true });
  });

  decline.addEventListener('click', () => {
    remember('denied');
    denyEntry();
  });

  gate.showModal();
  if (saved?.status === 'denied') denyEntry();
})();
