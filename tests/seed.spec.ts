import { expect, test, type Page } from '@playwright/test';

/* Runs against `npm run build` + the preview server (playwright.config.ts
   starts it), on three iPhone profiles — i.e. always in portrait.

   The home is public/index.html: a 7-slide key-art carousel (Laya,
   Inter/Sessions, Hybris, Mrs. Steele, Not Even Death, Cell Phone, Immune)
   that STARTS ON SLIDE 2 (Inter/Sessions, `let cur = 1` in the script),
   with one call-to-action (.cta) whose label and link change per slide, a
   numbered pager, the Metron Publishing shelf and a footer. */

// Collects every failed request / 4xx-5xx response while the test runs.
const watchFailures = (page: Page) => {
  const failed: string[] = [];
  page.on('response', r => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
  page.on('requestfailed', r => failed.push(`FAILED ${r.url()}`));
  return failed;
};

// Loads lazy images by scrolling the whole page, then lists any that broke.
const brokenImages = async (page: Page) => {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); }
  });
  await page.waitForLoadState('networkidle');
  return page.evaluate(() =>
    [...document.images].filter(i => i.loading !== 'lazy' || i.complete).filter(i => i.naturalWidth === 0).map(i => i.src));
};

const cta = (page: Page) => page.locator('#cta');
const goToSlide = (page: Page, i: number) => page.locator(`.tick[data-dot="${i}"]`).click();

test('the home loads every asset, with no 404 and no broken image', async ({ page }) => {
  const failed = watchFailures(page);
  await page.goto('/');
  await expect(page.locator('.slide.is-active .keyart-img')).toBeVisible();
  expect(await brokenImages(page)).toEqual([]);
  expect(failed).toEqual([]);
});

test('it opens on Inter/Sessions, with a disabled Coming Soon', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.slide.is-active')).toHaveAttribute('data-title', 'Inter/Sessions');
  await expect(page.locator('#now')).toHaveText('02');
  await expect(cta(page)).toHaveText('Coming Soon');
  await expect(cta(page)).not.toHaveAttribute('href', /./);
  await expect(cta(page)).toHaveAttribute('aria-disabled', 'true');
});

for (const s of [
  { i: 2, title: 'Hybris', label: 'View Project', href: 'https://files.hybris.world/' },
  { i: 4, title: 'Not Even Death', label: 'View Script', href: 'https://files-ned.metronshowrunners.com/' },
  { i: 0, title: 'Laya', label: 'Watch Teaser', href: 'https://youtu.be/bXL5xmmQPys' },
]) {
  test(`the ${s.title} tick shows its slide and points the CTA to it`, async ({ page }) => {
    await page.goto('/');
    await goToSlide(page, s.i);
    await expect(page.locator('.slide.is-active')).toHaveAttribute('data-title', s.title);
    await expect(page.locator('#now')).toHaveText(String(s.i + 1).padStart(2, '0'));
    await expect(cta(page)).toHaveText(s.label);
    await expect(cta(page)).toHaveAttribute('href', s.href);
    await expect(page.locator('.tick.is-active')).toHaveAttribute('data-dot', String(s.i));
  });
}

test('the Laya CTA opens the teaser in the lightbox instead of navigating', async ({ page }) => {
  await page.goto('/');
  await goToSlide(page, 0);
  await expect(cta(page)).toHaveText('Watch Teaser');
  await cta(page).click();
  await expect(page.locator('.glightbox-container')).toBeVisible();
  expect(new URL(page.url()).pathname).toBe('/');
});

test('the arrows step through the slides and wrap around', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-nav="next"]').click();
  await expect(page.locator('#now')).toHaveText('03');
  await goToSlide(page, 0);
  await page.locator('[data-nav="prev"]').click();
  await expect(page.locator('#now')).toHaveText('07');
  await expect(page.locator('.slide.is-active')).toHaveAttribute('data-title', 'Immune');
});

test('the Metron Publishing shelf shows all seven covers', async ({ page }) => {
  await page.goto('/');
  const covers = page.locator('.books .cover img');
  await expect(covers).toHaveCount(7);
  await covers.last().scrollIntoViewIfNeeded();
  await expect(covers.last()).toBeVisible();
});

test('the old /hotsite address redirects to the home', async ({ page, request }) => {
  for (const [from, to] of [['/hotsite', '/'], ['/hotsite/', '/'], ['/hotsite/assets/glightbox.min.js', '/assets/glightbox.min.js']]) {
    const r = await request.get(from, { maxRedirects: 0 });
    expect(r.status(), from).toBe(301);
    expect(new URL(r.headers()['location'], 'http://x').pathname, from).toBe(to);
  }
  await page.goto('/hotsite/');
  expect(new URL(page.url()).pathname).toBe('/');
  expect((await request.get('/hotsite.zip')).status()).toBe(200);
});

test('/hybris/ and its series bible load, and the bible anchors stay on the page', async ({ page }) => {
  const failed = watchFailures(page);
  await page.goto('/hybris/');
  expect(await brokenImages(page)).toEqual([]);
  await page.goto('/hybris/series-bible');
  expect(await brokenImages(page)).toEqual([]);
  const anchor = page.locator('a[href^="#p"]').first();
  const href = await anchor.getAttribute('href');
  await anchor.evaluate((a: HTMLElement) => a.click());
  await expect(page).toHaveURL(new RegExp(`/hybris/series-bible${href}$`));
  expect(failed).toEqual([]);
});
