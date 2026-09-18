# AGENTS.md

Guide for anyone working on this hotsite. Applies to both the **beta** repo
and the **production** one (`metron-hotsite`), which share the same
structure.

## The project

Single-page Astro 4 site (`output: static`), served by Cloudflare Pages. No
backend, no database. The site is a full-screen key art with a clickable
footer bar — there used to be no slides, scroll, or nav dots (those existed
until 2026-07; a scrollable second section was added on 2026-09-19).

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
- `package.json` **does travel**. A new dependency here is a new
  dependency in production.

## Running it

```bash
npm install
npm run dev       # hot reload
npm run build     # before any push
npm run preview   # serves dist/, same as production
```

Tests (WebKit; if you get `Executable doesn't exist`, run
`npx playwright install webkit`):

```bash
npm run preview       # in one terminal
npx playwright test   # in another — 9 tests on iPhone 12/SE/14 Pro Max
```

## Structure

```
src/pages/index.astro    The whole site. Styles scoped here.
src/layouts/Layout.astro <head>: meta tags, title, favicon.
src/styles/global.css    Reset, body margin, cream background. That's it.
public/images/hybris-keyart.png
public/images/books/     Book cover art for the Books section.
public/fonts/            Cinzel (OFL — don't remove the OFL*.txt files). Unused today.
tests/seed.spec.ts       Regression: the art loads, the link points
                         correctly, and the clickable stripe covers the
                         cream bar.
```

## The footer bar

Links to [`files.hybris.world`](https://files.hybris.world), the index of
Hybris materials (another repository, `thluiz/files-hybris-world`).

The `top: 89.9%` came from measuring the PNG: the `rgb(183,168,133)` bar
starts at `y=1070` of 1190. **Changed the key art, measure again** — otherwise
the link ends up outside the drawn bar. The alignment test catches this.

## Rules

- **Performance first.** Keep `output: static`. Compress images before
  committing. Prefer CSS over JS. Local fonts, never from a CDN.
- **Cache busting.** Replaced an asset while keeping the name, bump the
  `?v=` on its references (`hybris-keyart.png?v=2`).
- **Mobile.** Most traffic is mobile; run the tests before any visual push.
- **Accessibility.** The key art *is* the content: its `alt` carries the
  message for screen readers. The footer link is an empty area — it
  depends on the `aria-label`. The `<html>` `lang` has to match the art's
  language (`en-US` today; the site targets a US audience — keep visible
  copy, `alt` and `aria-label` in English even where an image's baked-in
  text is in another language).
- **SEO.** `<title>` and description live in `Layout.astro`.
- **Scope.** It's a hotsite: one message. Resist letting it balloon.

## Known debt

Tailwind isn't used by any class since the 2026-08-11 cleanup, but it
accounts for ~5.7 KB of the 6.2 KB of CSS. Removing it touches
`package.json`, which goes to production — pending a decision.

## Before pushing

1. `npm run build` passed.
2. `npx playwright test` passed.
3. No secrets in the diff.
4. Didn't touch `.github/workflows/` for a content task.
5. Replaced an asset keeping the name? bumped the `?v=`.
