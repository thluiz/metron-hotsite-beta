# Changelog

Mudanças notáveis por data, da mais recente para a mais antiga.

## 2026-08-11

### Adicionado
- Barra do rodapé inteira clicável, levando ao índice dos materiais em
  `files.hybris.world` (acesso por código, repositório
  `thluiz/files-hybris-world`). Posição medida no PNG: a faixa creme começa
  em `y=1070` de 1190 → `top: 89.9%`.
- Testes de regressão no `tests/seed.spec.ts`, que antes só navegava: a key
  art carrega de fato (`naturalWidth > 0`), o link aponta para o destino
  certo, e a faixa clicável fica alinhada com a barra desenhada. Rodam nos
  três perfis de iPhone, em WebKit.

### Removido
- Todo o código do site de slides, que já não fazia nada desde a troca pela
  key art: o script de `IntersectionObserver`/crossfade/nav dots no
  `Layout.astro`, ~250 linhas do `global.css` (fundo azul, grain com
  `feTurbulence`, `.slide`, `#nav-dots`, animações), os componentes
  `Lightning`, `Polaroid` e `SlideHeader`, e as logos `metron`, `hybris`,
  `laya` e `intersessoes`.
- O hotspot que cobria apenas a pílula "Project" desenhada na arte, e o
  `href="#"` com TODO que ele carregava.

### Alterado
- `lang` do `<html>` de `pt-BR` para `en`, que é o idioma da arte e da
  mensagem.
- `<meta description>` deixou de ser "Metron" e passou a descrever a série;
  `theme-color` alinhado ao creme do letterbox.

## 2026-07-15

### Alterado
- Site substituído pela key art do Hybris em tela cheia (interino,
  pré-fatiamento), com `contain` para mostrar o poster inteiro em qualquer
  viewport.

## 2026-06-10

### Adicionado
- Navegação por scroll lateral (`wheel.deltaX`): trackpad/mouse horizontal
  avança ou retrocede slides.
- Atalhos de teclado: `Space`, `→` e `↓` avançam; `←` e `↑` retrocedem.
- Loop de navegação: do último slide volta ao primeiro e vice-versa.
- Layout mobile dedicado (`max-width: 640px`) com Metron e IP lado-a-lado em
  torno do centro do viewport, espelhando o desktop em vez de empilhar.
- Scaffold Playwright (`playwright.config.ts`, `tests/seed.spec.ts`) com
  projetos iPhone 12 / iPhone SE / iPhone 14 Pro Max para iteração visual
  via MCP.
- `CHANGELOG.md` (este arquivo).
- Nav dots fixos no rodapé com link direto para cada slide.

### Alterado
- Composição Metron+IP centrada no viewport — removida a barra vertical
  divisória; gap controlado por `gap` no flex desktop e por offsets ao
  redor do centro no mobile.
- Hybris recebe `transform: scale(1.35)` com origem à esquerda para
  compensar o whitespace direito do asset.
- Logos das IPs atualizadas e Hybris dimensionada para harmonizar com a
  composição.
- README atualizado para refletir interações, hospedagem (Cloudflare
  Pages) e estrutura atual.

### Removido
- `deploy.ps1` — publicação acontece via GitHub Actions
  (`.github/workflows/deploy.yml`).

## 2026-06-09

### Adicionado
- Slides de Hybris, Laya e Intersessões com crossfade das logos à direita
  conforme o usuário rola.
- Logo Metron como imagem (substituindo a marca em texto).
- Barra vertical decorativa entre Metron e IPs, posteriormente removida
  em 2026-06-10.

### Alterado
- Gradient + grain do fundo movidos para `body::before` / `body::after`
  com `position: fixed`, corrigindo o scroll do fundo no iOS Safari
  (que ignora `background-attachment: fixed`).
- IP logos movidas para um stage no rodapé da página com a barra Metron
  estática; fontes pesadas customizadas removidas.
- Barra vertical e logo Metron ancoradas ao centro do viewport.

## 2026-06-08

### Adicionado
- Scaffold inicial do projeto: Astro 4 + Tailwind 3, tipografia Cinzel
  self-hosted.
- Workflow de deploy via GitHub Actions publicando em Cloudflare Pages
  (`metron.hybris.world`).

### Alterado
- Job AWS (S3 + CloudFront) desativado com `if: false` no workflow;
  Cloudflare Pages passa a ser a única publisher.
