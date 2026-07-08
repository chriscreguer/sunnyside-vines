# Peñafalcón "Aged Document" Aesthetic — Design Spec

**Date:** 2026-07-08
**Status:** Approved (proof-of-concept scope)
**Scope of this pass:** Rework the **Featured Producer (Bodega Peñafalcón)** section only, as a
standalone parallel build, to prove a handcrafted / older-school wine-label aesthetic before
rolling it across the full page.

## Goal

Make the site feel like *interacting with a printed estate document* — a wine label / ficha de
cata — rather than a modern editorial site. Anchor style: the **gold parchment + red wax seal**
Peñafalcón register. Full-immersion fidelity (texture, foil, wax, engraving, script type), kept
authentic by mirroring the producer's real technical sheets.

## Deliverable / isolation

- **Parallel files** — the live `index.html` / `styles.css` stay untouched.
- New files: `penafalcon-v2.html` + `penafalcon-v2.css` (+ any new SVG motifs under `img/motifs/`).
- Easy to compare side-by-side and promote later.

## Composition — Approach B + wax-seal entrance

A two-column **ficha de cata spread** (mirrors the real Peñafalcón PDFs):

- **Left column:** real vineyard photo (`img/penafalcon_new_1.png`) in a distressed double-rule
  mat, slightly rotated; gold **award medallion** beneath.
- **Right column:** red calligraphic-script "Peñafalcón" title; tracked small-caps DO line
  ("RIBERA DEL DUERO · DENOMINACIÓN DE ORIGEN"); the **ficha-técnica spec block**; tasting-note
  prose with an engraved drop-cap.
- **Entrance moment:** the section arrives with a **red wax seal**; on scroll-in the seal
  "breaks" and the parchment double-rule frame draws itself in.

Kept modular so the base can later swap to the parchment-scroll, keyhole/crenellated, or a combo.

## Visual system

- **Page ground:** kraft / laid-paper texture — faint fiber grain + soft vignette (scoped to the
  section now, extendable page-wide later).
- **Card:** parchment panel, gilded rolled-edge **double-rule frame** with distressed/broken
  edges, soft drop shadow, ~0.4° rotation (pasted-on-paper feel).
- **New SVG motifs to draw:**
  - Red **wax seal** stamped with the falcon-on-ruins emblem (focal / entrance).
  - Engraved grey **falcon-on-ruins vignette** (stipple/hatch), also a faint watermark.
  - Gold **award medallion** ("GOLD · International Wine Awards · Spain 2024").
- **Map:** `img/spain_dark.svg` recolored to engraving grey, as a small wax-stamped Peñafiel locator.

## Typography

- **Red script** (web font) for the "Peñafalcón" wordmark.
- **Fraunces** small-caps (already loaded) for headings / DO lines / spec labels.
- **Geist Mono** (already loaded) for fine/legal spec values — the label's poetry-vs-technical contrast.

## Palette

| Role | Value (approx) |
|------|----------------|
| Paper / kraft ground | warm cream → kraft tan |
| Primary accent | oxblood red (deeper than current terracotta) |
| Hardware | muted gold / foil |
| Illustration | engraving grey |
| Text | ink near-black |

## Ficha-técnica content (real data from the fichas de cata)

- **Bodega:** Bodegas Peñafalcón — Peñafiel (Valladolid), Castilla y León, Spain
- **D.O.:** Ribera del Duero
- **Uva / Grape:** Tempranillo 100% (Tinta Fina / Tinto del País)
- **Viñedos:** estate pagos — Santa Cruz, Carraovejas, La Blanquera
- **Vinificación:** natural fermentation, native yeasts; American + French oak
- **Wines referenced:**
  - *Peñafalcón 2021 — 10 meses en barrica* · 14% ABV · Gold, International Wine Awards Spain 2024
  - *Peñafalcón Gran Reserva 2007 — 60 meses (5 años) en barrica* · 15% ABV · two Grand Golds, 90 pts

## Out of scope (this pass)

- The other page sections (nav, hero, mission, story, contact, footer).
- Promoting the new look to the live `index.html`.
- Alternate label bases (parchment-scroll / keyhole / combo) — noted as future iterations.
