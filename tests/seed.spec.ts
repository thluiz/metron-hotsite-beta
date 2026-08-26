import { expect, test } from '@playwright/test';

/* Roda contra o dev server ou o preview (baseURL em playwright.config.ts),
   nos três perfis de iPhone. */

/* A faixa creme começa em y=1070 de 1190 no PNG da Hybris. */
const FOOTER_TOP_PCT = 89.9;

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

test('a barra do rodapé leva ao índice dos materiais', async ({ page }) => {
  await page.goto('/');
  const link = page.locator('.footer-link');

  await expect(link).toHaveAttribute('href', 'https://files.hybris.world/');
  await expect(link).toHaveAttribute('aria-label', /Hybris Project/);
});

test('o link do rodapé fica alinhado com a faixa creme', async ({ page }) => {
  await page.goto('/');
  const link = await page.locator('.footer-link').boundingBox();
  const img = await page.locator('.slide.is-active .keyart-img').boundingBox();
  expect(link && img).toBeTruthy();

  const topPct = ((link!.y - img!.y) / img!.height) * 100;
  expect(topPct).toBeCloseTo(FOOTER_TOP_PCT, 0);

  // Sem isto sobraria uma tira não clicável no pé.
  const bottomGap = img!.y + img!.height - (link!.y + link!.height);
  expect(Math.abs(bottomGap)).toBeLessThan(2);
});

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

test('os dots refletem qual slide está ativo', async ({ page }) => {
  await page.goto('/');

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
