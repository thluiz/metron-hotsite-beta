import { expect, test } from '@playwright/test';

/* Roda contra o PREVIEW (`npm run build && npm run preview`), nos três perfis
   de iPhone — ou seja, sempre em portrait.

   Contra o `astro dev` pode falhar de um jeito que engana: a
   <astro-dev-toolbar> se ancora no rodapé da viewport. Até 2026-09-19 isso
   sempre colidia com a .footer-link (uma faixa nos últimos ~5% da arte); com
   o botão desenhado no topo da arte (ver comentário mais abaixo) a colisão
   deixou de ser garantida, mas o teste continua valendo como checagem geral
   de que a suíte não está rodando contra o dev por engano.
   O primeiro teste abaixo existe para dizer isso em um segundo. */

test('a suíte está rodando contra o preview, não contra o dev', async ({
  page,
}) => {
  await page.goto('/');

  // A própria <astro-dev-toolbar> não serve de sinal aqui: ela é injetada por
  // JS depois do load, e logo após o goto ainda não existe. O cliente do Vite
  // vem no HTML desde o primeiro byte e só existe em dev.
  const dev = await page
    .locator('script[src*="@vite/client"], astro-dev-toolbar')
    .count();

  expect(
    dev,
    'Isto é o `astro dev`. A <astro-dev-toolbar> cobre a barra do rodapé e faz ' +
      'os testes de clique falharem por motivo errado. Rode ' +
      '`npm run build && npm run preview` antes da suíte.'
  ).toBe(0);
});

/* A suíte roda em perfis de iPhone (portrait — ver comentário no topo do
   arquivo). Em 2026-09-19 a arte portrait passou a ter o mesmo botão
   desenhado no topo que a landscape (16:9, ver index.astro), substituindo a
   faixa marrom que ficava no rodapé — por isso não há mais % por slide: é a
   mesma caixa .footer-link para os três, perto do topo da arte (ver o teste
   "fica alinhado" abaixo). Índices (dot/slide) refletem a ordem do
   carrossel — Laya, Inter/Sessions, Hybris, Mrs. Steele, Not Even Death,
   Cell Phone. */
const SLIDES_COM_LINK = [
  {
    nome: 'Hybris',
    dot: 2,
    slide: 2,
    href: 'https://files.hybris.world/',
    aria: /Hybris Project/,
  },
  {
    nome: 'Laya',
    dot: 0,
    slide: 0,
    href: 'https://youtu.be/bXL5xmmQPys',
    aria: /Laya teaser/,
  },
  {
    nome: 'Not Even Death',
    dot: 4,
    slide: 4,
    href: 'https://files-ned.metronshowrunners.com/',
    aria: /view the script/,
  },
];

test('a key art da Laya (slide inicial) carrega de fato', async ({ page }) => {
  await page.goto('/');
  const img = page.locator('.slide.is-active .keyart-img');
  await expect(img).toBeVisible();

  // naturalWidth = 0 quando o browser não decodificou a imagem: o <img>
  // continua no DOM e a página vira um retângulo creme.
  const naturalWidth = await img.evaluate(
    (el) => (el as HTMLImageElement).naturalWidth
  );
  expect(naturalWidth).toBeGreaterThan(0);
});

for (const ip of SLIDES_COM_LINK) {
  test(`a barra do rodapé de ${ip.nome} leva ao destino certo`, async ({
    page,
  }) => {
    await page.goto('/');
    const link = page.locator(`[data-slide="${ip.slide}"] .footer-link`);

    await expect(link).toHaveAttribute('href', ip.href);
    await expect(link).toHaveAttribute('aria-label', ip.aria);
  });

  test(`o botão de ${ip.nome} fica no topo, centralizado com a pílula`, async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator(`[data-dot="${ip.dot}"]`).click();

    const slide = `[data-slide="${ip.slide}"]`;
    const link = await page.locator(`${slide} .footer-link`).boundingBox();
    const img = await page.locator(`${slide} .keyart-img`).boundingBox();
    expect(link && img).toBeTruthy();

    // .footer-link em portrait é left:25%/right:25%/top:0/bottom:94% do
    // .slide (ver index.astro) — encosta no topo e tem 6% da altura da
    // arte, centralizado na largura. Números fixos porque a caixa é a
    // mesma pros três slides, não medida por pixel de cada arte.
    const topPct = ((link!.y - img!.y) / img!.height) * 100;
    expect(topPct).toBeCloseTo(0, 0);

    const heightPct = (link!.height / img!.height) * 100;
    expect(heightPct).toBeCloseTo(6, 0);

    const linkCenterX = link!.x + link!.width / 2;
    const imgCenterX = img!.x + img!.width / 2;
    expect(Math.abs(linkCenterX - imgCenterX)).toBeLessThan(2);
  });
}

test('o dot da Hybris troca o slide e esconde o link da Laya', async ({
  page,
}) => {
  await page.goto('/');

  await page.locator('[data-dot="2"]').click();

  const hybrisSlide = page.locator('[data-slide="2"]');
  await expect(hybrisSlide).toHaveClass(/is-active/);
  await expect(hybrisSlide.locator('.keyart-img')).toHaveAttribute(
    'alt',
    /Hybris/
  );

  // O link da Laya, agora escondido, não pode ficar clicável.
  await expect(page.locator('[data-slide="0"] .footer-link')).not.toBeVisible();
});

test('clicar na barra da Laya abre o teaser em vez de navegar', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('[data-dot="0"]').click();

  await page.locator('[data-slide="0"] .footer-link').click();

  await expect(page.locator('.glightbox-container')).toBeVisible();
  await expect(page).toHaveURL('/');
});

test('o dot do Not Even Death abre o slide e o link vai para o files-ned', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('[data-dot="4"]').click();

  const nedSlide = page.locator('[data-slide="4"]');
  await expect(nedSlide).toHaveClass(/is-active/);
  await expect(nedSlide.locator('.keyart-img')).toHaveAttribute(
    'alt',
    /Not Even Death/
  );

  // O alt dizia "Script coming soon" enquanto o destino não existia. Dizer
  // isso agora seria mentira para quem usa leitor de tela.
  await expect(nedSlide.locator('.keyart-img')).not.toHaveAttribute(
    'alt',
    /coming soon/i
  );

  // Exatamente um link no slide, e é o do files-ned.
  await expect(nedSlide.locator('a')).toHaveCount(1);
  await expect(nedSlide.locator('a')).toHaveAttribute(
    'href',
    'https://files-ned.metronshowrunners.com/'
  );
});

test('as setas de navegação trocam de slide', async ({ page }) => {
  await page.goto('/');

  await page.locator('[data-nav="next"]').click();
  await expect(page.locator('[data-slide="1"]')).toHaveClass(/is-active/);

  await page.locator('[data-nav="prev"]').click();
  await expect(page.locator('[data-slide="0"]')).toHaveClass(/is-active/);

  // Volta pro início: a seta "prev" no primeiro slide deve ir pro último.
  const ultimo = (await page.locator('.slide').count()) - 1;
  await page.locator('[data-nav="prev"]').click();
  await expect(page.locator(`[data-slide="${ultimo}"]`)).toHaveClass(
    /is-active/
  );
});

test('os dots refletem qual slide está ativo', async ({ page }) => {
  await page.goto('/');

  // Um dot por slide, na mesma ordem.
  expect(await page.locator('.dot').count()).toBe(
    await page.locator('.slide').count()
  );

  await expect(page.locator('[data-dot="0"]')).toHaveAttribute(
    'aria-selected',
    'true'
  );

  await page.locator('[data-dot="1"]').click();

  await expect(page.locator('[data-dot="1"]')).toHaveAttribute(
    'aria-selected',
    'true'
  );
  await expect(page.locator('[data-dot="0"]')).toHaveAttribute(
    'aria-selected',
    'false'
  );
});
