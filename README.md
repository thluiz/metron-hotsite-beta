# metron-hotsite-beta

Ambiente **beta** do hotsite da Metron Showrunners, em
[`metron-beta.hybris.world`](https://metron-beta.hybris.world). Cópia completa
do site de produção ([`thluiz/metron-hotsite`](https://github.com/thluiz/metron-hotsite)
→ `metron.hybris.world`): itera-se aqui e promove-se quando estiver bom.

Detalhes técnicos e regras de trabalho no [`AGENTS.md`](AGENTS.md).

## O site

Uma página: a key art do Hybris em tela cheia, com a barra creme do rodapé
linkando [`files.hybris.world`](https://files.hybris.world) — o índice dos
materiais da série, com acesso por código. Esse índice vive noutro repositório
([`thluiz/files-hybris-world`](https://github.com/thluiz/files-hybris-world)).

## Fluxo

1. Edite `src/` e `public/`, commit e push na `main`.
2. O deploy publica em `metron-beta.hybris.world`. Confira lá.
3. Para produção, rode o **Promote**.

## Promover para produção

Não publica direto: abre um **PR** no repositório de produção. O merge é que
dispara o deploy.

**Actions → Promote to production → Run workflow.** O PR aparece em
[`thluiz/metron-hotsite/pulls`](https://github.com/thluiz/metron-hotsite/pulls).

Copia tudo exceto `.github/` e este `README.md`, que diferem entre os ambientes.
Havendo PRs do Dependabot abertos, mergeie o de promote primeiro — os dois tocam
o `package-lock.json`.

## Stack

Astro 4 (estático) · Cloudflare Pages (projeto `metron-hotsite-beta`)

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Deploy

Push na `main` dispara `.github/workflows/deploy.yml`. Secrets:
`CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`.

O promote (`promote.yml`) usa `PROMOTE_TOKEN` — PAT com Contents + Pull requests
no repo de produção.
