// Sunnyside Vines - footer newsletter signup
// Signups are posted to NEWSLETTER_ENDPOINT. That's meant to be the Google
// Sheet web app in tools/newsletter-sheet.gs (setup steps are at the top of
// that file), but any endpoint that accepts a POST with an `email` field works.
// Until one is set, signups fall back to an email to the inbox.
const NEWSLETTER_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwMl0nuhr0j2snoszt-IK1758DVlniJ1MOWxH_u3cOQtI6N4oa2hlfqdC08UJ9UoiY/exec';
const NEWSLETTER_FALLBACK_EMAIL = 'info@sunnysidevines.com';

const tr = (key, en) => (window.SVI18N ? SVI18N.t(key, en) : en);

document.querySelectorAll('[data-newsletter]').forEach((form) => {
  // hidden spam trap: people never see it, bots fill it in (the sheet script skips those)
  const trap = document.createElement('input');
  Object.assign(trap, { type: 'text', name: 'website', tabIndex: -1, autocomplete: 'off' });
  trap.setAttribute('aria-hidden', 'true');
  trap.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0';
  form.appendChild(trap);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    const input = form.querySelector('input[type="email"]');
    const email = input.value.trim();
    const done = (label) => {
      btn.textContent = label;
      btn.disabled = true;
      setTimeout(() => { btn.textContent = tr('footer.subscribe', 'Subscribe'); btn.disabled = false; }, 3000);
    };

    if (!NEWSLETTER_ENDPOINT) {
      const body = `Please add ${email} to the Sunnyside Vines newsletter.`;
      window.location.href = `mailto:${NEWSLETTER_FALLBACK_EMAIL}?subject=${encodeURIComponent('Newsletter signup')}&body=${encodeURIComponent(body)}`;
      form.reset();
      return done(tr('newsletter.thanks', 'Thank you'));
    }

    const data = new FormData(form);
    data.set('lang', window.SVI18N ? SVI18N.lang : 'en');
    data.set('page', location.pathname);
    // Google's web apps don't send CORS headers, so the response can't be read;
    // a request that goes through counts as a signup
    const google = NEWSLETTER_ENDPOINT.includes('script.google.com');

    btn.disabled = true;
    try {
      const res = await fetch(NEWSLETTER_ENDPOINT, {
        method: 'POST',
        body: google ? new URLSearchParams(data) : data,
        ...(google ? { mode: 'no-cors' } : { headers: { Accept: 'application/json' } }),
      });
      if (!google && !res.ok) throw new Error(res.status);
      form.reset();
      if (typeof gtag === 'function') gtag('event', 'sign_up', { method: 'newsletter' });
      done(tr('newsletter.subscribed', 'You’re subscribed'));
    } catch {
      done(tr('newsletter.retry', 'Try again'));
    }
  });
});
