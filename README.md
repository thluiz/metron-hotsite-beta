# metron-hotsite-beta

**Beta** environment of the Metron Showrunners hotsite, at
[`metron-beta.hybris.world`](https://metron-beta.hybris.world). Full copy
of the production site ([`thluiz/metron-hotsite`](https://github.com/thluiz/metron-hotsite)
→ `metron.hybris.world`): iterate here, promote when it's good.

Technical details and working rules in [`AGENTS.md`](AGENTS.md).

## The site

Plain static files in `public/`, no framework. The home is a key-art
carousel of the Metron Showrunners projects plus the Metron Publishing
shelf; `/hybris/` is a standalone Hybris page with its series bible. The
Hybris project link goes to [`files.hybris.world`](https://files.hybris.world),
which lives in another repository
([`thluiz/files-hybris-world`](https://github.com/thluiz/files-hybris-world)).

## Flow

1. Edit `public/`, run `npm test`, commit and push to `main`.
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

Static HTML · Cloudflare Pages (project `metron-hotsite-beta`)

```bash
npm install
npm run build     # public/ → dist/
npm run preview   # serves dist/ on :4321
npm test          # build + Playwright
```

## Deploy

Push to `main` triggers `.github/workflows/deploy.yml`. Secrets:
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

The promote workflow (`promote.yml`) uses `PROMOTE_TOKEN` — a PAT with
Contents + Pull requests on the production repo.
