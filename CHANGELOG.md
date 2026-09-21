# Changelog

Notable changes by date, most recent first.

The 2026-08-12 → 2026-09-20 entries were reconstructed from git history on
2026-09-21, after the file had gone unmaintained for six weeks. They are
grouped by commit date; anything not evident from the commits themselves was
left out rather than guessed at.

## 2026-09-21

### Changed
- The hero art fills the viewport at every aspect ratio. The slide box is
  no longer the largest 16:9 that *fits* inside the viewport (with a 1.45
  aspect floor) but the smallest that *covers* it — `max()` instead of
  `min()` — so it overflows and `.keyart-wrap`'s `overflow: hidden` does
  the cropping. Asked for explicitly, with the cost accepted: wider than
  16:9 crops the bottom of the art, squarer crops the sides (213px per side
  at 4:3, which clips the start of the logo and the tagline). Documented in
  the `.slide` comment so the fitted box doesn't come back by accident.
- The clickable button's percentages are now relative to the drawn art
  rather than to a box that drifted as the crop changed.
- Not Even Death's right-edge anchoring moved from `object-position` up to
  the box itself (`.is-ned-slide`), keeping the title that sits flush
  against the right edge.
- The books carousel now turns instead of jumping at the ends. The covers
  about to be revealed are moved to the other end of the DOM, the scroll
  position is corrected instantly by exactly the width they added (so that
  frame looks unchanged), and only then does the smooth scroll run — so
  they slide in from the side the arrow points at, one screenful per click,
  without travelling across the whole row. Destination is the same as
  before; only the instant `scrollTo` is gone. DOM order stays in sync with
  visual order, so tab order still matches the screen, and no covers are
  cloned. `prefers-reduced-motion` skips the animation.

  Known rough edge: because a rotation only happens at an end while the
  middle still page-scrolls (a mid-track rotation would push the instant
  correction past the scroll limit and become visible), *prev* then *next*
  does not land back on the exact starting window — it takes two clicks.
  Every cover stays reachable and no step is abrupt.

### Removed
- `--art-h`, which no rule consumed.

## 2026-09-20

### Fixed
- The books carousel wraps around in both directions: past the last cover
  it returns to the first, and back from the first to the last.

## 2026-09-19

### Added
- `Metron Publishing` section below the hero: a horizontal carousel of book
  covers, dark-themed across the whole page, with release-date captions,
  drop shadows and a hover highlight.
- Closing footer with the brand, the Laya trailer and links to the project
  pages.

### Changed
- New key art for all six IPs, with the call-to-action button drawn at the
  top of the art, replacing the cream footer stripe at the bottom. Portrait
  art re-exported to match, and the button's hotspot remeasured for both
  orientations.
- Visible copy, the docs, the tests and the CI workflow all translated to
  English.
- Carousel autoplay pauses while the Laya trailer is open.

## 2026-09-13

### Added
- The Laya teaser plays in a lightbox (glightbox) from the art's button,
  instead of navigating away from the site.
- Not Even Death's button leads to `files-ned.metronshowrunners.com`.

### Changed
- New Laya art, with the button position measured again against it.
- `npm test` builds, starts the preview in the background and runs the
  suite without hanging the shell.
- The suite says within a second when it is pointed at `astro dev` instead
  of the preview, where the dev toolbar makes click tests fail for the
  wrong reason.

### Fixed
- The Laya video's centering in landscape on iOS.

## 2026-09-08

### Added
- The *Promote to production* PR body now lists the commits being promoted.

## 2026-09-07

### Added
- Cell Phone as the sixth carousel slide.

## 2026-08-31

### Changed
- Not Even Death moved to the end of the carousel, announced as
  "Coming Soon".

## 2026-08-29

### Added
- Carousel expanded to four IPs.

### Changed
- Key art converted from PNG to JPEG.

## 2026-08-28

### Changed
- Portrait art replaced by a high-resolution re-export.

### Fixed
- The footer bar being cropped in portrait on tall devices (S25 Ultra and
  similar).

## 2026-08-27

### Added
- Portrait art, with the carousel adjusted for mobile.

### Changed
- The portrait key art anchored to the bottom so the footer bar survives
  the crop.

## 2026-08-26

### Added
- The site became a carousel, starting with the Laya key art.
- Navigation arrows alongside the dots.

### Removed
- Tailwind, incompatible with Astro 7 — which closes the debt recorded on
  2026-08-11. `tailwind.config.mjs` is still in the tree, now orphaned.

## 2026-08-21

### Changed
- The page declares its language as `en-US`.

## 2026-08-12

### Security
- Dependabot bumps: `nanoid` 3.3.12 → 3.3.18, `postcss` 8.5.15 → 8.5.26.

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
