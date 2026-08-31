import { expect, test } from '@playwright/test';

/* Roda contra o dev server ou o preview (baseURL em playwright.config.ts),
   nos três perfis de iPhone — ou seja, sempre em portrait. */

/* Onde começa a barra marrom do rodapé na arte portrait da Hybris, medido por
   pixel: 2196 de 2311 (95.02%). Trocou a arte, meça de novo.

   O Not Even Death desenha um botão "View Script", mas o destino ainda não
   existe: em vez de link, ele leva a pastilha "Coming Soon" (ver mais abaixo).
   Quando o destino subir, ele volta para esta lista. */
const SLIDES_COM_LINK = [
  {
    nome: 'Hybris',
    dot: 0,
    slide: 0,
    href: 'https://files.hybris.world/',
    aria: /Hybris Project/,
    footerTopPct: 95.02,
  },
];

test('a key art da Hybris (slide inicial) carrega de fato', async ({ page }) => {
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

  test(`o link do rodapé de ${ip.nome} fica alinhado com a barra`, async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator(`[data-dot="${ip.dot}"]`).click();

    const slide = `[data-slide="${ip.slide}"]`;
    const link = await page.locator(`${slide} .footer-link`).boundingBox();
    const img = await page.locator(`${slide} .keyart-img`).boundingBox();
    expect(link && img).toBeTruthy();

    const topPct = ((link!.y - img!.y) / img!.height) * 100;
    expect(topPct).toBeCloseTo(ip.footerTopPct, 0);

    // Sem isto sobraria uma tira não clicável no pé.
    const bottomGap = img!.y + img!.height - (link!.y + link!.height);
    expect(Math.abs(bottomGap)).toBeLessThan(2);
  });
}

test('o dot da Laya troca o slide e some com o link do rodapé', async ({
  page,
}) => {
  await page.goto('/');

  await page.locator('[data-dot="1"]').click();

  const layaSlide = page.locator('[data-slide="1"]');
  await expect(layaSlide).toHaveClass(/is-active/);
  await expect(layaSlide.locator('.keyart-img')).toHaveAttribute(
    'alt',
    /Laya/
  );

  // A Laya não tem botão pro projeto: sem .footer-link nesse slide.
  await expect(layaSlide.locator('.footer-link')).toHaveCount(0);

  // E o link da Hybris, agora escondido, não pode ficar clicável.
  await expect(page.locator('[data-slide="0"] .footer-link')).not.toBeVisible();
});

test('o Not Even Death avisa "Coming Soon" em vez de linkar para o vazio', async ({
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

  // Sem destino ainda: nenhum link nesse slide, em nenhum lugar da página.
  await expect(nedSlide.locator('a')).toHaveCount(0);
  await expect(page.locator('a[href*="files-ned"]')).toHaveCount(0);

  const badge = nedSlide.locator('.soon-badge');
  await expect(badge).toBeVisible();
  await expect(badge).toHaveText(/coming soon/i);

  // A pastilha cobre o botão desenhado, que fica na barra do rodapé: se ela
  // subir para o meio da arte, é porque a medida saiu do lugar.
  const box = await badge.boundingBox();
  const art = await nedSlide.locator('.keyart-img').boundingBox();
  expect(box && art).toBeTruthy();
  const topPct = ((box!.y - art!.y) / art!.height) * 100;
  expect(topPct).toBeGreaterThan(90);
  expect(box!.y + box!.height).toBeLessThanOrEqual(art!.y + art!.height + 1);
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
