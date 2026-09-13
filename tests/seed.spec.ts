import { expect, test } from '@playwright/test';

/* Roda contra o PREVIEW (`npm run build && npm run preview`), nos três perfis
   de iPhone — ou seja, sempre em portrait.

   Contra o `astro dev` NÃO funciona, e falha de um jeito que engana: a
   <astro-dev-toolbar> fica ancorada no rodé da viewport, exatamente sobre a
   faixa que .footer-link ocupa (os últimos ~5% da arte). Ela intercepta o
   clique; o Playwright tenta de novo até o autoplay trocar de slide, e aí a
   mensagem vira "element is not visible", que aponta para o lugar errado.
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

/* Onde começa a barra marrom do rodapé na arte portrait da Hybris, medido por
   pixel: 2196 de 2311 (95.02%). Trocou a arte, meça de novo.

   O Not Even Death tem a sua própria medida: a arte dele é outra (1313x2329),
   e a barra começa em 2198, ou seja 94.38%. Até 2026-09-13 ele não estava
   nesta lista, porque o destino não existia e havia no lugar uma pastilha
   "Coming Soon". */
const SLIDES_COM_LINK = [
  {
    nome: 'Hybris',
    dot: 0,
    slide: 0,
    href: 'https://files.hybris.world/',
    aria: /Hybris Project/,
    footerTopPct: 95.02,
  },
  {
    nome: 'Laya',
    dot: 1,
    slide: 1,
    href: 'https://youtu.be/bXL5xmmQPys',
    aria: /Laya teaser/,
    footerTopPct: 95.02,
  },
  {
    nome: 'Not Even Death',
    dot: 4,
    slide: 4,
    href: 'https://files-ned.metronshowrunners.com/',
    aria: /view the script/,
    footerTopPct: 94.38,
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

test('o dot da Laya troca o slide e esconde o link da Hybris', async ({
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

  // O link da Hybris, agora escondido, não pode ficar clicável.
  await expect(page.locator('[data-slide="0"] .footer-link')).not.toBeVisible();
});

test('clicar na barra da Laya abre o teaser em vez de navegar', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('[data-dot="1"]').click();

  await page.locator('[data-slide="1"] .footer-link').click();

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
