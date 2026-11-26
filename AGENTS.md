# AGENTS.md

Guide for anyone working on this hotsite. Applies to both the **beta** repo
and the **production** one (`metron-hotsite`), which share the same
structure.

## The project

A plain static site, no framework, served by Cloudflare Pages. No backend,
no database. Until 2026-11-26 the home was an Astro 4 page; it was replaced
by a hand-written `index.html` (first published at `/hotsite/`) and Astro was
removed.

- beta → `metron-beta.hybris.world` (this repo)
- production → `metron.hybris.world` (`metron-hotsite`)

Iterate on beta. **Promote** takes it to production via PR (see
`README.md`).

## Beta and production must stay compatible

Promote overwrites everything in production except `.github/` and
`README.md`. Therefore:

- Don't reorganize folders in a way that only makes sense here.
- Don't edit `.github/workflows/` for a content task — it's
  environment-specific and doesn't travel on promote.
- The deploy workflow runs `npm ci` + `npm run build` and publishes `dist/`.
  Keep that contract: `build` must still produce `dist/`.
- `package.json` **does travel**. A new dependency here is a new
  dependency in production.

## Running it

```bash
npm install
npm run build     # copies public/ to dist/
npm run preview   # serves dist/ on :4321 like Cloudflare does
```

No dev server and no hot reload: edit `public/`, run `build`, reload. You
can also open `public/index.html` straight from disk.

Tests (WebKit; if you get `Executable doesn't exist`, run
`npx playwright install webkit`):

```bash
npm test          # build + Playwright; starts the preview by itself
```

## Structure

```
public/                  The site. Copied as-is to dist/.
  index.html             The home: HTML, CSS and JS all inline.
  assets/                Local fonts (woff2), glightbox, OFL license.
  images/                Key art (landscape + -portrait) and books/ covers.
  hybris/                Standalone Hybris page + series-bible.html.
  hotsite.zip            Download packages of the pages above.
  hybris.zip
  _redirects             Cloudflare rules (/hotsite/* → /). Not served.
scripts/build.mjs        public/ → dist/.
scripts/preview.mjs      Local server that mimics Cloudflare Pages
                         (trailing slash, .html-less URLs, _redirects),
                         except that unknown paths are a 404.
tests/seed.spec.ts       Regression on iPhone SE/12/14 Pro Max.
```

## The home

A 7-slide carousel that starts on slide 2 (Inter/Sessions). Each slide's
`data-*` attributes drive the single call-to-action (`#cta`): label, link,
and whether it opens the teaser in the lightbox. Slides without
`data-href` show a disabled "Coming Soon". To add or change a project, edit
its `.slide` and the matching `.tick` in the pager.

The METRON signature (`.sig`) is positioned in units measured on the
3840-wide artwork. **Changed a key art, check the signature still sits
where the art expects it.**

## Rules

- **Performance first.** Static files only. Compress images before
  committing. Prefer CSS over JS. Local fonts, never from a CDN.
  (Exception today: glightbox pulls the Plyr player from `cdn.plyr.io` when
  a video opens.)
- **Cache busting.** Replaced an asset while keeping the name, bump the
  `?v=` on its references (`laya-keyart.jpg?v=8`).
- **Mobile.** Most traffic is mobile; run the tests before any visual push.
- **Accessibility.** The key art carries the message: keep each `alt`
  complete. The `<html>` `lang` is `en-US`; the site targets a US audience,
  so keep visible copy, `alt` and `aria-label` in English.
- **SEO.** `<title>` and description are in the `<head>` of `index.html`.
- **Scope.** It's a hotsite: one message. Resist letting it balloon.

## Before pushing

1. `npm test` passed.
2. No secrets in the diff.
3. Didn't touch `.github/workflows/` for a content task.
4. Replaced an asset keeping the name? bumped the `?v=`.
