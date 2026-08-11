# AGENTS.md

Guia para quem for mexer neste hotsite. Vale para o repo **beta** e para o de
**produção** (`metron-hotsite`), que têm a mesma estrutura.

## O projeto

Página única em Astro 4 (`output: static`), servida pelo Cloudflare Pages. Sem
backend, sem banco. O site é uma key art em tela cheia com a barra do rodapé
clicável — não há slides, scroll nem nav dots (existiram até 2026-07).

- beta → `metron-beta.hybris.world` (este repo)
- produção → `metron.hybris.world` (`metron-hotsite`)

Itera-se no beta. O **Promote** leva para produção via PR (ver `README.md`).

## Beta e produção precisam continuar compatíveis

O promote sobrepõe tudo em produção, exceto `.github/` e `README.md`. Portanto:

- Não reorganize pastas de um jeito que só faça sentido aqui.
- Não edite `.github/workflows/` para tarefa de conteúdo — é específico de
  ambiente e não viaja no promote.
- `package.json` **viaja**. Dependência nova aqui é dependência nova em produção.

## Rodar

```bash
npm install
npm run dev       # hot reload
npm run build     # antes de qualquer push
npm run preview   # serve o dist/, igual produção
```

Testes (WebKit; se der `Executable doesn't exist`, rode `npx playwright install webkit`):

```bash
npm run preview       # num terminal
npx playwright test   # noutro — 9 testes em iPhone 12/SE/14 Pro Max
```

## Estrutura

```
src/pages/index.astro    O site inteiro. Estilos escopados aqui.
src/layouts/Layout.astro <head>: meta tags, título, favicon.
src/styles/global.css    Reset, margem do body, fundo creme. Só isso.
public/images/hybris-keyart.png
public/fonts/            Cinzel (OFL — não remova os OFL*.txt). Sem uso hoje.
tests/seed.spec.ts       Regressão: a arte carrega, o link aponta certo e a
                         faixa clicável cobre a barra creme.
```

## A barra do rodapé

Leva para [`files.hybris.world`](https://files.hybris.world), o índice dos
materiais do Hybris (outro repositório, `thluiz/files-hybris-world`).

O `top: 89.9%` veio de medir o PNG: a barra `rgb(183,168,133)` começa em
`y=1070` de 1190. **Trocou a key art, meça de novo** — senão o link fica fora da
barra desenhada. O teste de alinhamento pega isso.

## Regras

- **Performance primeiro.** Mantenha `output: static`. Comprima imagens antes de
  commitar. Prefira CSS a JS. Fontes locais, nunca de CDN.
- **Cache busting.** Trocou um asset mantendo o nome, incremente o `?v=` nas
  referências (`hybris-keyart.png?v=2`).
- **Mobile.** A maioria do tráfego é mobile; rode os testes antes de push visual.
- **Acessibilidade.** A key art *é* o conteúdo: o `alt` dela carrega a mensagem
  para leitor de tela. O link do rodapé é área vazia — depende do `aria-label`.
  O `lang` do `<html>` tem que bater com o idioma da arte (hoje `en`).
- **SEO.** `<title>` e description ficam no `Layout.astro`.
- **Escopo.** É um hotsite: uma mensagem. Resista a inflar.

## Dívida conhecida

Tailwind não é usado por classe nenhuma desde a limpeza de 2026-08-11, mas
responde por ~5,7 KB dos 6,2 KB de CSS. Remover mexe no `package.json`, que vai
para produção — pendente de decisão.

## Antes de dar push

1. `npm run build` passou.
2. `npx playwright test` passou.
3. Sem segredo no diff.
4. Não mexeu em `.github/workflows/` para tarefa de conteúdo.
5. Trocou asset mantendo o nome? incrementou o `?v=`.
