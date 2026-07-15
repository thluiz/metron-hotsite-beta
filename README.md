# metron-hotsite-beta

Ambiente **beta** do hotsite da Metron Showrunners, publicado em
[`metron-beta.hybris.world`](https://metron-beta.hybris.world) via Cloudflare
Pages (projeto `metron-hotsite-beta`).

Este repositório é uma cópia completa do site de produção
([`thluiz/metron-hotsite`](https://github.com/thluiz/metron-hotsite) →
`metron.hybris.world`). A ideia é iterar livremente aqui, ver o resultado no
site beta, e quando estiver bom **promover** o conteúdo por cima do site de
produção com um clique — sem mexer em git.

## Fluxo de trabalho

1. Edite o site normalmente (conteúdo em `src/` e `public/`).
2. Faça commit e push para `main` → o deploy automático publica em
   `metron-beta.hybris.world`. Confira o resultado no site beta.
3. Quando quiser publicar em produção, rode o **Promote** (ver abaixo).

## Promover para produção

O promote **não** publica direto no ar: ele abre um **Pull Request** no
repositório de produção com o conteúdo deste repo por cima. Uma pessoa técnica
revisa e faz o merge — e o merge é que dispara o deploy de produção.

Como rodar (não precisa de terminal nem git):

1. Vá na aba **Actions** deste repositório no GitHub.
2. Escolha o workflow **Promote to production** na lista à esquerda.
3. Clique **Run workflow** → **Run workflow**.
4. Quando terminar, um PR aparece em
   [`thluiz/metron-hotsite`](https://github.com/thluiz/metron-hotsite/pulls)
   para revisão e merge.

O promote copia tudo (`src/`, `public/`, configs, `CHANGELOG.md`) **exceto** os
arquivos específicos de ambiente (`.github/` e este `README.md`), que são
diferentes entre beta e produção. Por isso as estruturas dos dois repositórios
precisam permanecer compatíveis — evite renomear/reorganizar pastas de forma
que só exista aqui.

## Stack

- [Astro](https://astro.build/) 4 (output estático)
- Tailwind CSS 3 (`@astrojs/tailwind`)
- Hospedagem: Cloudflare Pages (projeto `metron-hotsite-beta`)

## Comandos

```bash
npm install     # primeira vez
npm run dev     # dev server (Astro)
npm run build   # gera dist/
npm run preview # serve dist/ localmente
```

## Deploy

Push em `main` dispara `.github/workflows/deploy.yml`, que faz build do Astro e
publica em Cloudflare Pages (projeto `metron-hotsite-beta`). Secrets
necessários no repo: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

O promote (`.github/workflows/promote.yml`) usa `PROMOTE_TOKEN` (PAT com
permissão de Contents + Pull requests no repo `metron-hotsite`) para abrir o PR
de produção.
