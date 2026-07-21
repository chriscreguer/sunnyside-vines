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

/* Words rise out from behind a hard edge - typeset, not floated in. */
const riseWords = (el, delay = 0, step = 45, duration = 800) => {
  const { words } = text.split(el, { words: { wrap: 'clip' }, chars: false });
  utils.set(el, { opacity: 1 });
  animate(words, {
    y: ['110%', '0%'],
    duration,
    delay: stagger(step, { start: delay }),
    ease: 'out(3)',
  });
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

  if (reduced) {
    utils.set('.reveal, .hero-wordmark, .hero-sub, .hero-actions, .fan', { opacity: 1 });
  } else {
    // splitText only finds its lines/words once the webfonts have landed -
    // before that it returns empty arrays and nothing animates
    const ready = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([ready, new Promise((r) => setTimeout(r, 1500))]).then(buildMotion);
  }

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

  /* Wines carousel - render every wine from the shop config, page with arrows */
  const winesRow = document.getElementById('winesRow');
  if (winesRow && typeof PRODUCTS !== 'undefined') {
    const money = (n) => '$' + parseFloat(n).toFixed(2);
    // interleave the estates round-robin so any four in view mix producers
    const byProducer = {};
    PRODUCTS.forEach((p) => (byProducer[p.producer] ||= []).push(p));
    const queues = Object.values(byProducer);
    const mixed = [];
    for (let i = 0; queues.some((q) => i < q.length); i++)
      queues.forEach((q) => { if (q[i]) mixed.push(q[i]); });
    winesRow.innerHTML = mixed.map((p) => `
      <a class="wine-card reveal" href="wines/${p.id}.html">
        <div class="wine-media fit-${p.fit} producer-${p.producer}">
          <img src="${p.image}" alt="${p.name} ${p.vintage}" loading="lazy">
        </div>
        <div class="wine-body">
          <h3 class="wine-name">${p.name} <span class="wine-vintage">${p.vintage}</span></h3>
          <p class="wine-meta">${PRODUCERS[p.producer].name}</p>
          <div class="wine-foot"><span class="wine-price">${money(p.price)}</span></div>
        </div>
      </a>`).join('');

    const prev = document.querySelector('.wines-arrow.prev');
    const next = document.querySelector('.wines-arrow.next');
    if (prev && next) {
      const update = () => {
        const max = winesRow.scrollWidth - winesRow.clientWidth - 4;
        prev.disabled = winesRow.scrollLeft <= 4;
        next.disabled = winesRow.scrollLeft >= max;
      };
      prev.addEventListener('click', () => winesRow.scrollBy({ left: -winesRow.clientWidth, behavior: 'smooth' }));
      next.addEventListener('click', () => winesRow.scrollBy({ left: winesRow.clientWidth, behavior: 'smooth' }));
      winesRow.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update();
    }
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
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button');
      const original = btn.textContent;
      btn.textContent = 'Thanks, we\'ll be in touch';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
        form.reset();
      }, 2600);
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
    onView(missionBlock, () => {
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
        });
      };
      requestAnimationFrame(rise);
    }, 0.35);
  }

  /* ── Section headings ───────────────────────────────────────────────────── */
  claim('.lede.reveal').forEach((el) => onView(el, () => riseWords(el)));
  claim('.eyebrow.reveal').forEach((el) =>
    onView(el, () => animate(el, { opacity: [0, 1], duration: 700, ease: 'out(2)' }))
  );

  /* ── Atlas: the plate draws itself ──────────────────────────────────────── */
  const [atlasFig] = claim('.atlas-figure.reveal');
  if (atlasFig) {
    utils.set('.atlas-detail, .atlas-magnifier, .atlas-cities, .atlas-borders, .atlas-neighbour', { opacity: 0 });
    utils.set('.atlas-map .pin', { opacity: 0 });
    utils.set('.atlas-land', { fillOpacity: 0 });   // the outline inks first, the paper fills after

    onView(atlasFig, () => {
      utils.set(atlasFig, { opacity: 1 });
      const plate = createTimeline({ defaults: { ease: 'out(2)' } });

      // the coastline inks in and the land fills behind it
      plate.add(svg.createDrawable('.atlas-land'), {
        draw: ['0 0', '0 1'],
        duration: 1000,
        ease: 'inOut(2)',
      }, 0);
      plate.add('.atlas-land', { fillOpacity: [0, 1], duration: 600 }, 350);

      // everything that is just context simply arrives
      plate.add('.atlas-neighbour, .atlas-borders, .atlas-cities', {
        opacity: [0, 1],
        duration: 500,
      }, 450);

      // the detail circle opens
      plate.add('.atlas-detail', { opacity: 1, duration: 1 }, 950);
      plate.add('.atlas-detail-disc, .atlas-detail-ring', {
        scale: [0, 1],
        duration: 550,
        ease: 'out(4)',
      }, 950);
      plate.add('.atlas-magnifier', { opacity: [0, 1], duration: 220 }, 980);
      // the dotted magnifier lines keep their own dasharray, so they fade in
      // with the group instead of being stroke-drawn (which would overwrite it)
      plate.add(svg.createDrawable('.atlas-source-ring'), {
        draw: ['0 0', '0 1'],
        duration: 520,
        ease: 'inOut(2)',
      }, 980);
      plate.add('.atlas-vineyards, .atlas-villages', {
        opacity: [0, 1],
        duration: 450,
      }, 1200);

      // pins land (scale the inner <g>; the outer one carries the translate attribute)
      plate.add('.atlas-map .pin', { opacity: [0, 1], duration: 250, delay: stagger(80) }, 1350);
      plate.add('.atlas-map .pin-pop', {
        scale: [0, 1],
        duration: 700,
        delay: stagger(80),
        ease: createSpring({ stiffness: 130, damping: 11 }),
      }, 1350);
    }, 0.2);
  }

  /* ── Legend: the rule wipes, the number lands, the copy follows ─────────── */
  claim('.atlas-entry.reveal').forEach((el) =>
    onView(el, () => {
      const tl = createTimeline({ defaults: { ease: 'out(3)' } });
      tl.add(el, { opacity: [0, 1], duration: 500 }, 0);
      tl.add(el.querySelector('.atlas-entry-num'), {
        scale: [0, 1],
        duration: 800,
        ease: createSpring({ stiffness: 150, damping: 12 }),
      }, 120);
      tl.add(el.querySelector('.atlas-entry-img'), {
        clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'],
        duration: 900,
      }, 60);
    }, 0.4)
  );

  /* ── Wine cards: fade in, staggered ──────────────────────────────────────── */
  /* opacity only - an inline transform would stick around and kill the CSS hover lift */
  const tiles = claim('.wine-card.reveal');
  tiles.forEach((tile, i) =>
    onView(tile, () => {
      animate(tile, {
        opacity: [0, 1],
        duration: 600,
        delay: i * 70,
        ease: 'out(3)',
      });
    }, 0.3)
  );

  /* ── Story: copy fades in, the photo swings into its tilt ────────────────── */
  const [story] = claim('.story.reveal');
  if (story) {
    onView(story, () => {
      utils.set(story, { opacity: 1 });
      animate(story.querySelector('.story-text'), { opacity: [0, 1], duration: 500 });
      animate(story.querySelector('.story-img'), {
        opacity: [0, 1],
        rotate: ['0deg', '2.5deg'],
        scale: [0.96, 1],
        duration: 700,
        ease: 'out(4)',
      });
    }, 0.25);
  }

  /* ── Contact: labels and rows settle, no drifting ────────────────────────── */
  claim('.contact-info h2.reveal').forEach((el) =>
    onView(el, () => animate(el, { opacity: [0, 1], duration: 500, ease: 'out(2)' }))
  );
  claim('.contact-info .row.reveal, .contact-form.reveal').forEach((el, i) =>
    onView(el, () => animate(el, { opacity: [0, 1], duration: 450, delay: i * 50, ease: 'out(2)' }))
  );

  /* anything still marked .reveal that no rule above claimed */
  document.querySelectorAll('.reveal').forEach((el) => {
    if (claimed.has(el)) return;
    onView(el, () => animate(el, { opacity: [0, 1], duration: 700, ease: 'out(2)' }));
  });
}
