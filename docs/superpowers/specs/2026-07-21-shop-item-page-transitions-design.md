# Shop & item page entrance transitions

## Problem
The hero on `index.html` has a choreographed entrance (anime.js): wordmark blurs/scales in, subhead follows, buttons spring in. The shop page (`shop.html`) only has a plain opacity fade on scroll (`.reveal-fade`), and the wine item pages (`wines/*.html`) have no entrance motion at all.

## Scope
Add a light-touch, CSS-only entrance treatment matching the hero's motion language (blur + fade + slight rise) to:
- **Shop page**: `.shop-header` (title, then subhead ~150ms later) on page load.
- **Item pages**: `.detail-media` (bottle image), then `.detail-body` (producer line, name, note, specs, price/button) on page load, image leading.

Out of scope: the existing scroll-triggered `.reveal-fade` on producer groups and wine cards stays untouched (deliberately opacity-only, per existing code comment about not breaking the CSS hover lift). No anime.js added to these pages — CSS transitions only, triggered from `shop.js`.

## Mechanics
- New `.enter` class in `shop.css`, alongside `.reveal-fade`:
  - `.js-shop .enter { opacity: 0; filter: blur(6px); transform: translateY(10px); transition: opacity/filter/transform ~0.8s var(--ease); }`
  - `.js-shop .enter.is-in` clears all three.
  - Staggered via a small `transition-delay` per element (title/image lead, subhead/body follow ~150ms behind).
  - `prefers-reduced-motion: reduce` → instantly visible, no transition (matches existing pattern in `styles-v4.css`/`shop.css`).
- `shop.js`'s `init()` adds `.is-in` to `.enter` elements shortly after `js-shop` class is applied (double-rAF to force the initial state to paint before transitioning, same trick the homepage relies on implicitly via anime.js).
- No-JS fallback: elements are only hidden via `.js-shop .enter`, so without JS everything renders visible immediately (matches the site's existing progressive-enhancement pattern).
