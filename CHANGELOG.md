# Changelog

Notable changes by date, most recent first.

## 2026-08-11

### Added
- Clickable footer bar, linking to the materials index at
  `files.hybris.world`. Position measured on the PNG: the cream stripe
  starts at `y=1070` of 1190 → `top: 89.9%`.
- Regression tests in `tests/seed.spec.ts`, which previously only
  navigated: the art loads, the link points correctly, the stripe is
  aligned.

### Removed
- The old slideshow site code, dead since the switch to the key art: the
  crossfade/nav dots script in `Layout.astro`, ~250 lines of
  `global.css`, the `Lightning`/`Polaroid`/`SlideHeader` components, and
  the `metron`, `hybris`, `laya` and `intersessoes` logos.
- The hotspot that only covered the "Project" pill, with its `href="#"`.

### Changed
- `<html>`'s `lang` from `pt-BR` to `en`.
- `<meta description>` now describes the series; `theme-color` aligned
  with the letterbox cream.

## 2026-07-15

### Changed
- Site replaced by the full-screen Hybris key art (interim, pre-slicing),
  with `contain` to show the full poster at any viewport.

## 2026-06-10

### Added
- Horizontal scroll navigation (`wheel.deltaX`): trackpad/mouse
  horizontal advances or goes back through slides.
- Keyboard shortcuts: `Space`, `→` and `↓` advance; `←` and `↑` go back.
- Navigation loop: past the last slide wraps to the first and vice versa.
- Dedicated mobile layout (`max-width: 640px`) with Metron and IP side by
  side around the viewport center, mirroring desktop instead of stacking.
- Playwright scaffold (`playwright.config.ts`, `tests/seed.spec.ts`) with
  iPhone 12 / iPhone SE / iPhone 14 Pro Max projects for visual iteration
  via MCP.
- `CHANGELOG.md` (this file).
- Fixed nav dots in the footer with a direct link to each slide.

### Changed
- Metron+IP composition centered on the viewport — removed the vertical
  divider bar; gap controlled by `gap` in the desktop flex and by offsets
  around the center on mobile.
- Hybris gets `transform: scale(1.35)` with left-side origin to
  compensate for the asset's right-side whitespace.
- IP logos updated and Hybris resized to harmonize with the composition.
- README updated to reflect current interactions, hosting (Cloudflare
  Pages) and structure.

### Removed
- `deploy.ps1` — publishing now happens via GitHub Actions
  (`.github/workflows/deploy.yml`).

## 2026-06-09

### Added
- Hybris, Laya and Inter/Sessions slides with crossfading logos on the
  right as the user scrolls.
- Metron logo as an image (replacing the text wordmark).
- Decorative vertical bar between Metron and the IPs, later removed on
  2026-06-10.

### Changed
- Background gradient + grain moved to `body::before` / `body::after`
  with `position: fixed`, fixing background scroll on iOS Safari (which
  ignores `background-attachment: fixed`).
- IP logos moved to a stage in the page footer with the Metron bar
  static; heavy custom fonts removed.
- Vertical bar and Metron logo anchored to the viewport center.

## 2026-06-08

### Added
- Initial project scaffold: Astro 4 + Tailwind 3, self-hosted Cinzel
  typography.
- Deploy workflow via GitHub Actions publishing to Cloudflare Pages
  (`metron.hybris.world`).

### Changed
- AWS job (S3 + CloudFront) disabled with `if: false` in the workflow;
  Cloudflare Pages becomes the sole publisher.
