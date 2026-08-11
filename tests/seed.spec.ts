import { expect, test } from '@playwright/test';

/**
 * Guarda de regressão do hotsite. Roda contra o dev server ou o preview
 * (`baseURL` em playwright.config.ts) nos projetos iPhone 12 / SE / 14 Pro Max.
 *
 * Cobre as duas coisas que quebram sem fazer barulho: a key art não carregar
 * (a página fica creme e ninguém percebe no HTML) e a barra do rodapé sair de
 * cima da faixa creme desenhada na arte, deixando o link inalcançável.
 */

/* A faixa creme começa em y=1070 de 1190 no PNG original. */
const FOOTER_TOP_PCT = 89.9;

test('a key art carrega de fato', async ({ page }) => {
  await page.goto('/');
  const img = page.locator('.keyart-img');
  await expect(img).toBeVisible();

  // naturalWidth = 0 quando o browser não conseguiu decodificar a imagem —
  // o <img> continua no DOM e a página parece só um retângulo creme.
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
  const img = await page.locator('.keyart-img').boundingBox();
  expect(link && img).toBeTruthy();

  const topPct = ((link!.y - img!.y) / img!.height) * 100;
  expect(topPct).toBeCloseTo(FOOTER_TOP_PCT, 0);

  // Precisa ir até a base da imagem, senão sobra uma tira não clicável.
  const bottomGap = img!.y + img!.height - (link!.y + link!.height);
  expect(Math.abs(bottomGap)).toBeLessThan(2);
});
