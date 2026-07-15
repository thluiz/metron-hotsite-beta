# AGENTS.md — guia para agentes trabalhando neste hotsite

Este arquivo é a referência de trabalho para qualquer agente (Claude Code ou
outro) que for desenvolver este hotsite. Leia antes de editar. Vale tanto para
este repositório **beta** quanto para o de **produção** (`metron-hotsite`), que
compartilham a mesma estrutura.

## O que é este projeto

Hotsite estático de página única da Metron Showrunners, feito em **Astro 4**
(output `static`) + **Tailwind CSS 3**. Sem backend, sem banco, sem
autenticação: o build gera HTML/CSS/JS puros em `dist/` e o Cloudflare Pages
serve isso.

- **beta** → `metron-beta.hybris.world` (este repo, `metron-hotsite-beta`)
- **produção** → `metron.hybris.world` (repo `metron-hotsite`)

Iteração acontece aqui no beta; quando aprovado, um **Promote** leva o conteúdo
para produção via PR (ver `README.md`).

## Regra de ouro: manter beta e produção compatíveis

O promote sobrepõe **todos** os arquivos deste repo em produção, exceto
`.github/` e `README.md`. Consequências práticas:

- **NÃO renomeie nem reorganize pastas** (`src/`, `public/`, etc.) de forma que
  só faça sentido aqui — a mesma estrutura precisa valer na produção.
- **NÃO edite `.github/workflows/`** para tarefas de conteúdo. Esses arquivos
  são específicos de ambiente (project-name do Cloudflare, promote) e não vão
  para a produção.
- **NÃO commite segredos.** Tokens/credenciais vivem só em GitHub Secrets.
- Mudanças de dependência (`package.json`) **vão** para produção no promote —
  então evite adicionar libs pesadas ou desnecessárias (ver abaixo).

## Como rodar e verificar localmente

```bash
npm install     # primeira vez
npm run dev     # dev server com hot reload
npm run build   # gera dist/ — SEMPRE rode antes de dar push
npm run preview # serve o dist/ buildado, igual produção
```

**Antes de afirmar que terminou:** rode `npm run build` e confirme que passou.
Um push que quebra o build derruba o deploy. Não reporte "pronto" sem o build
verde.

## Onde fica o quê

```
src/
  pages/index.astro     Página única: composição de logos, slides, navegação,
                        handlers de teclado/scroll. É o coração do site.
  layouts/Layout.astro  <html> + <head> (meta tags, título, favicon).
  styles/global.css     Fundo, tipografia, slides, nav dots, animações.
  components/            Componentes .astro reutilizáveis (alguns legados).
public/
  images/               Logos (metron, hybris, laya, intersessoes). PNG.
  fonts/                Cinzel / Cinzel Decorative (licença OFL — não remover
                        os arquivos OFL*.txt).
  favicon.svg
tests/
  seed.spec.ts          Seed Playwright para iteração visual (iPhone 12/SE/
                        14 Pro Max via playwright.config.ts).
```

## Boas práticas para hotsites

### Performance (é a prioridade nº 1 de um hotsite)
- Mantenha o output `static`. Não introduza SSR/adapters sem necessidade real.
- **Otimize imagens** antes de commitar: comprima PNG/JPG, prefira dimensões
  próximas do tamanho de exibição. Considere SVG para marcas/ícones.
- Evite dependências pesadas no client. Cada KB de JS conta numa landing page.
  Prefira CSS e HTML a bibliotecas JS.
- Fontes: subconjunto/formato adequado; já usamos `.otf` locais via `public/`.
  Não puxe fontes de CDN externo sem motivo (privacidade + latência).

### Cache busting de assets
- Assets estáticos referenciados no HTML usam sufixo de versão (ex:
  `metron-logo.png?v=1`) para furar cache de CDN/mobile. Ao **trocar** um asset
  mantendo o nome, **incremente o `?v=`** nas referências (`?v=2`, etc.).

### Responsividade / mobile
- O site tem layout mobile dedicado (`@media (max-width: 640px)` em
  `index.astro` e `global.css`). Teste sempre em viewport mobile — a maioria do
  tráfego de hotsite é mobile.
- Use os projetos Playwright já configurados para checar iPhone 12/SE/14 Pro
  Max antes de dar push em mudança visual.

### Acessibilidade
- Toda imagem precisa de `alt` descritivo (as logos já têm).
- Preserve a navegação por teclado (`Space`/setas) e os `aria-label` dos nav
  dots ao mexer na navegação.
- Contraste de texto sobre o fundo escuro precisa continuar legível.

### SEO / metadados
- Título e meta tags ficam em `src/layouts/Layout.astro`. Ao mudar
  posicionamento/produto, atualize `<title>` e descrição.
- Mantenha o favicon consistente.

### Escopo
- É um hotsite: uma mensagem, um objetivo. Resista a inflar com seções e libs.
  Simplicidade = velocidade = conversão.

## Fluxo de deploy (não requer ação manual)

- `git push` na `main` deste repo → GitHub Actions builda e publica no
  Cloudflare Pages beta automaticamente. Confira o resultado em
  `metron-beta.hybris.world`.
- Para produção, use o **Promote** (ver `README.md`). Nunca edite o repo de
  produção na mão para levar conteúdo — o promote é o caminho.

## Checklist antes de dar push

1. `npm run build` passou.
2. Testou em desktop **e** mobile (viewport estreito).
3. Não commitou `node_modules/`, `dist/`, `.astro/` (já no `.gitignore`).
4. Nenhum segredo/credencial no diff.
5. Não mexeu em `.github/workflows/` para tarefa de conteúdo.
6. Se trocou um asset mantendo o nome, incrementou o `?v=` nas referências.
