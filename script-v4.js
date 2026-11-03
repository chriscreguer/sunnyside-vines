// Sunnyside Vines - v4 interactions
// anime.js v4 is loaded as a global (IIFE build) so the page still works from file://
const { animate, stagger, text, svg, utils, createTimeline, createSpring } = anime;

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Run fn once, when el first scrolls into view. */
const onView = (el, fn, threshold = 0.25) => {
  if (!el) return;
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      fn(e.target);
    }),
    { threshold, rootMargin: '0px 0px -60px 0px' }
  );
  io.observe(el);
};

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('js');

  /* Mobile menu */
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

  // Prepare the fonts while the gate is open, then start the normal entrance
  // sequence when the visitor can actually see the page.
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  let motionStarted = false;
  const startMotion = () => {
    if (motionStarted) return;
    motionStarted = true;
    if (reduced) {
      utils.set('.reveal, .hero-wordmark, .hero-sub, .hero-actions, .fan', { opacity: 1 });
    } else {
      Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1500))]).then(buildMotion);
    }
  };
  if (document.documentElement.hasAttribute('data-age-verified')) startMotion();
  else document.addEventListener('age:verified', startMotion, { once: true });

  /* Atlas - link each legend entry to its pin on the map */
  const atlas = document.getElementById('atlas');
  if (atlas) {
    const targets = [...atlas.querySelectorAll('[data-estate]')];
    const setActive = (key) => {
      if (key) atlas.dataset.active = key;
      else delete atlas.dataset.active;
      targets.forEach((el) => el.classList.toggle('is-active', !!key && el.dataset.estate === key));
    };
    targets.forEach((el) => {
      el.addEventListener('mouseenter', () => setActive(el.dataset.estate));
      el.addEventListener('mouseleave', () => setActive(null));
      el.addEventListener('focusin', () => setActive(el.dataset.estate));
      el.addEventListener('focusout', () => setActive(null));
    });
  }

  /* Wine lineup - every bottle from the shop config in one row, in the
     same producer order as the map; they overlap more as the screen narrows */
  const shelf = document.getElementById('shelf');
  if (shelf && typeof PRODUCTS !== 'undefined') {
    shelf.innerHTML = ['penafalcon', 'convento', 'losangeles']
      .flatMap((key) => PRODUCTS.filter((p) => p.producer === key))
      .map((p) => `
        <a class="lineup-bottle" href="wines/${p.id}.html">
          <img src="${bottleImage(p)}" alt="${p.name} ${p.vintage}, ${PRODUCERS[p.producer].name}" loading="lazy">
          <span class="lineup-tag" aria-hidden="true">${p.name} <i>${p.vintage}</i><small>${PRODUCERS[p.producer].name}</small></span>
        </a>`).join('');
  }

  /* Copy email */
  const copyBtn = document.getElementById('copyEmail');
  if (copyBtn) {
    const original = copyBtn.innerHTML;
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('info@sunnysidevines.com').then(() => {
        copyBtn.classList.add('copied');
        copyBtn.innerHTML =
          '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.innerHTML = original;
        }, 2000);
      });
    });
  }

  /* Contact form (no backend yet) */
  const form = document.getElementById('contactForm');
  if (form) {
    // Posts to Formspree, which emails the message on
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const t = (key, en) => (window.SVI18N ? SVI18N.t(key, en) : en);
      const btn = form.querySelector('button');
      const original = btn.innerHTML;
      btn.disabled = true;
      let wait = 2600;
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form),
        });
        if (!res.ok) throw new Error(res.status);
        // conversion for GA4 / Google Ads
        if (typeof gtag === 'function') gtag('event', 'generate_lead', { form_name: 'contact' });
        btn.textContent = t('contact.thanks', 'Thanks, we\'ll be in touch');
        form.reset();
      } catch {
        btn.textContent = t('contact.failed', 'Couldn\'t send. Email info@sunnysidevines.com');
        wait = 6000;
      }
      setTimeout(() => {
        btn.innerHTML = original;
        btn.disabled = false;
      }, wait);
    });
  }
});

function buildMotion() {
  // mark what a specific rule below animates, so the catch-all doesn't double up
  const claimed = new Set();
  const claim = (sel) => [...document.querySelectorAll(sel)].map((el) => (claimed.add(el), el));

  /* ── Hero: the mark develops, the line typesets, the photos are dealt ───── */
  const hero = createTimeline({ defaults: { ease: 'out(3)' } });

  hero.add('.hero-wordmark', {
    opacity: [0, 1],
    scale: [1.06, 1],
    filter: ['blur(10px)', 'blur(0px)'],
    duration: 1100,
  }, 100);

  hero.add('.hero-sub', {
    opacity: [0, 1],
    filter: ['blur(5px)', 'blur(0px)'],
    duration: 800,
  }, 480);

  hero.add('.hero-actions', { opacity: [0, 1], duration: 600 }, 900);
  hero.add('.hero-actions .btn', {
    scale: [0.92, 1],
    duration: 800,
    delay: stagger(70),
    ease: createSpring({ stiffness: 140, damping: 12 }),
  }, 900);

  /* Dealt onto the table. The fan fades as one group: fading the cards
     individually makes the outer two show through the middle one. */
  hero.add('.fan', { opacity: [0, 1], duration: 450 }, 620);
  hero.add('.fan-card', {
    '--deal-y': ['54px', '0px'],
    '--deal-rot': [(el, i) => `${[7, -4, -8][i] || 0}deg`, '0deg'],
    '--deal-scale': [0.94, 1],
    duration: 1100,
    ease: 'out(4)',
  }, 620);

  /* ── Mission: the statement rises a line at a time ───────────────────────── */
  const [missionBlock] = claim('.mission-statement.reveal');
  const missionCopy = missionBlock && missionBlock.querySelector('p');
  if (missionCopy) {
    onView(missionBlock, async () => {
      // Split only once the web font is in, so the lines match what's shown
      try { await document.fonts.ready; } catch (_) { /* older browsers */ }
      // Lines are assembled from word spans, so words must be split too - and
      // unlike words, lines need a layout pass before they exist. Reading
      // splitter.lines synchronously hands anime an empty target list.
      const splitter = text.split(missionCopy, { lines: { wrap: 'clip' }, words: true, chars: false });
      let tries = 0;
      const rise = () => {
        const lines = splitter.lines;
        if (!lines || !lines.length) {
          if (tries++ < 10) return requestAnimationFrame(rise);
          return utils.set(missionBlock, { opacity: 1 });   // never leave the copy hidden
        }
        utils.set(missionBlock, { opacity: 1 });
        animate(lines, {
          y: ['110%', '0%'],
          duration: 700,
          delay: stagger(70),
          ease: 'out(3)',
          // back to plain text afterwards: frozen line wrappers break apart if
          // the layout changes later (text-size settings, zoom, rotation)
          onComplete: () => splitter.revert(),
        });
      };
      requestAnimationFrame(rise);
    }, 0.35);
  }

  /* ── Atlas: the map is already there; the detail, vineyards and pins arrive ─ */
  const [atlasFig] = claim('.atlas-figure.reveal');
  if (atlasFig) {
    utils.set(atlasFig, { opacity: 1 });
    utils.set('.atlas-detail, .atlas-magnifier', { opacity: 0 });
    utils.set('.atlas-map .pin', { opacity: 0 });

    onView(atlasFig, () => {
      const plate = createTimeline({ defaults: { ease: 'out(2)' } });

      // the detail circle opens
      plate.add('.atlas-detail', { opacity: 1, duration: 1 }, 0);
      plate.add('.atlas-detail-disc, .atlas-detail-ring', {
        scale: [0, 1],
        duration: 500,
        ease: 'out(4)',
      }, 0);
      plate.add('.atlas-magnifier', { opacity: [0, 1], duration: 220 }, 30);
      // the dotted magnifier lines keep their own dasharray, so they fade in
      // with the group instead of being stroke-drawn (which would overwrite it)
      plate.add(svg.createDrawable('.atlas-source-ring'), {
        draw: ['0 0', '0 1'],
        duration: 450,
        ease: 'inOut(2)',
      }, 30);
      plate.add('.atlas-vineyards, .atlas-villages', {
        opacity: [0, 1],
        duration: 400,
      }, 220);

      // pins land (scale the inner <g>; the outer one carries the translate attribute)
      plate.add('.atlas-map .pin', { opacity: [0, 1], duration: 250, delay: stagger(80) }, 320);
      plate.add('.atlas-map .pin-pop', {
        scale: [0, 1],
        duration: 700,
        delay: stagger(80),
        ease: createSpring({ stiffness: 130, damping: 11 }),
      }, 320);
    }, 0.2);
  }

  /* Below the hero only the mission line and the atlas move; everything
     else (headings, legend, wine cards, story, trade, contact) just appears. */
  document.querySelectorAll('.reveal').forEach((el) => {
    if (!claimed.has(el)) utils.set(el, { opacity: 1 });
  });
}
