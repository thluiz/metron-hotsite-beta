import { expect, test } from '@playwright/test';

/* Runs against the PREVIEW (`npm run build && npm run preview`), on all
   three iPhone profiles — i.e. always in portrait.

   Against `astro dev` it can fail in a misleading way: the
   <astro-dev-toolbar> anchors itself to the viewport's bottom edge. Until
   2026-09-19 that always collided with .footer-link (a strip in the art's
   last ~5%); with the button now drawn at the top of the art (see the
   comment further below) the collision is no longer guaranteed, but the
   test still stands as a general check that the suite isn't accidentally
   running against dev.
   The first test below exists to say that in one second. */

test('the suite is running against preview, not dev', async ({ page }) => {
  await page.goto('/');

  // The <astro-dev-toolbar> itself isn't a reliable signal here: it's
  // injected by JS after load, and right after goto it doesn't exist yet.
  // The Vite client comes in the HTML from the first byte and only exists
  // in dev.
  const dev = await page
    .locator('script[src*="@vite/client"], astro-dev-toolbar')
    .count();

  expect(
    dev,
    'This is `astro dev`. The <astro-dev-toolbar> covers the footer bar and ' +
      'makes the click tests fail for the wrong reason. Run ' +
      '`npm run build && npm run preview` before the suite.'
  ).toBe(0);
});

/* The suite runs on iPhone profiles (portrait — see the comment at the top
   of this file). On 2026-09-19 the portrait art got the same button drawn
   at the top as landscape (16:9, see index.astro), replacing the brown
   strip that used to sit at the bottom — hence no more per-slide
   percentages: it's the same .footer-link box for all three, near the top
   of the art (see the "stays aligned" test below). Indices (dot/slide)
   reflect the carousel order — Laya, Inter/Sessions, Hybris, Mrs. Steele,
   Not Even Death, Cell Phone. */
const SLIDES_WITH_LINK = [
  {
    name: 'Hybris',
    dot: 2,
    slide: 2,
    href: 'https://files.hybris.world/',
    aria: /Hybris Project/,
  },
  {
    name: 'Laya',
    dot: 0,
    slide: 0,
    href: 'https://youtu.be/bXL5xmmQPys',
    aria: /Laya teaser/,
  },
  {
    name: 'Not Even Death',
    dot: 4,
    slide: 4,
    href: 'https://files-ned.metronshowrunners.com/',
    aria: /view the script/,
  },
];

test('the Laya key art (initial slide) actually loads', async ({ page }) => {
  await page.goto('/');
  const img = page.locator('.slide.is-active .keyart-img');
  await expect(img).toBeVisible();

  // naturalWidth = 0 when the browser hasn't decoded the image: the <img>
  // stays in the DOM and the page turns into a cream rectangle.
  const naturalWidth = await img.evaluate(
    (el) => (el as HTMLImageElement).naturalWidth
  );
  expect(naturalWidth).toBeGreaterThan(0);
});

for (const ip of SLIDES_WITH_LINK) {
  test(`the ${ip.name} footer bar leads to the right destination`, async ({
    page,
  }) => {
    await page.goto('/');
    const link = page.locator(`[data-slide="${ip.slide}"] .footer-link`);

    await expect(link).toHaveAttribute('href', ip.href);
    await expect(link).toHaveAttribute('aria-label', ip.aria);
  });

  test(`the ${ip.name} button sits at the top, centered on the pill`, async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator(`[data-dot="${ip.dot}"]`).click();

    const slide = `[data-slide="${ip.slide}"]`;
    const link = await page.locator(`${slide} .footer-link`).boundingBox();
    const img = await page.locator(`${slide} .keyart-img`).boundingBox();
    expect(link && img).toBeTruthy();

    // .footer-link in portrait is left:25%/right:25%/top:0/bottom:94% of
    // .slide (see index.astro) — flush against the top and 6% of the
    // art's height, centered horizontally. Fixed numbers because the box
    // is the same for all three slides, not measured pixel-by-pixel per
    // art.
    const topPct = ((link!.y - img!.y) / img!.height) * 100;
    expect(topPct).toBeCloseTo(0, 0);

    const heightPct = (link!.height / img!.height) * 100;
    expect(heightPct).toBeCloseTo(6, 0);

    const linkCenterX = link!.x + link!.width / 2;
    const imgCenterX = img!.x + img!.width / 2;
    expect(Math.abs(linkCenterX - imgCenterX)).toBeLessThan(2);
  });
}

test('the Hybris dot switches the slide and hides the Laya link', async ({
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

  // The Laya link, now hidden, must not be clickable.
  await expect(page.locator('[data-slide="0"] .footer-link')).not.toBeVisible();
});

test('clicking the Laya bar opens the teaser instead of navigating', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('[data-dot="0"]').click();

  await page.locator('[data-slide="0"] .footer-link').click();

  await expect(page.locator('.glightbox-container')).toBeVisible();
  await expect(page).toHaveURL('/');
});

test('the Not Even Death dot opens the slide and the link goes to files-ned', async ({
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

  // The alt used to say "Script coming soon" while the destination didn't
  // exist yet. Saying that now would be a lie to screen reader users.
  await expect(nedSlide.locator('.keyart-img')).not.toHaveAttribute(
    'alt',
    /coming soon/i
  );

  // Exactly one link in the slide, and it's the files-ned one.
  await expect(nedSlide.locator('a')).toHaveCount(1);
  await expect(nedSlide.locator('a')).toHaveAttribute(
    'href',
    'https://files-ned.metronshowrunners.com/'
  );
});

test('the nav arrows switch slides', async ({ page }) => {
  await page.goto('/');

  await page.locator('[data-nav="next"]').click();
  await expect(page.locator('[data-slide="1"]')).toHaveClass(/is-active/);

  await page.locator('[data-nav="prev"]').click();
  await expect(page.locator('[data-slide="0"]')).toHaveClass(/is-active/);

  // Back to the start: the "prev" arrow on the first slide should wrap to
  // the last one.
  const last = (await page.locator('.slide').count()) - 1;
  await page.locator('[data-nav="prev"]').click();
  await expect(page.locator(`[data-slide="${last}"]`)).toHaveClass(
    /is-active/
  );
});

test('the dots reflect which slide is active', async ({ page }) => {
  await page.goto('/');

  // One dot per slide, in the same order.
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
