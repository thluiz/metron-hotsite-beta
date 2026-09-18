# metron-hotsite-beta

**Beta** environment of the Metron Showrunners hotsite, at
[`metron-beta.hybris.world`](https://metron-beta.hybris.world). Full copy
of the production site ([`thluiz/metron-hotsite`](https://github.com/thluiz/metron-hotsite)
→ `metron.hybris.world`): iterate here, promote when it's good.

Technical details and working rules in [`AGENTS.md`](AGENTS.md).

## The site

A single page: the Hybris key art full-screen, with the cream footer bar
linking to [`files.hybris.world`](https://files.hybris.world) — the index
of the series' materials, with access-code gating. That index lives in
another repository
([`thluiz/files-hybris-world`](https://github.com/thluiz/files-hybris-world)).

## Flow

1. Edit `src/` and `public/`, commit and push to `main`.
2. The deploy publishes to `metron-beta.hybris.world`. Check it there.
3. For production, run **Promote**.

## Promoting to production

Doesn't publish directly: opens a **PR** in the production repository. The
merge is what triggers the deploy.

**Actions → Promote to production → Run workflow.** The PR shows up at
[`thluiz/metron-hotsite/pulls`](https://github.com/thluiz/metron-hotsite/pulls).

Copies everything except `.github/` and this `README.md`, which differ
between environments. If there are open Dependabot PRs, merge the promote
one first — both touch `package-lock.json`.

## Stack

Astro 4 (static) · Cloudflare Pages (project `metron-hotsite-beta`)

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Deploy

Push to `main` triggers `.github/workflows/deploy.yml`. Secrets:
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

The promote workflow (`promote.yml`) uses `PROMOTE_TOKEN` — a PAT with
Contents + Pull requests on the production repo.
