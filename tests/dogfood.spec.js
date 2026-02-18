
import { test, expect } from '@playwright/test';

test('Verify Dogfood Demos', async ({ page }) => {
  // 1. Weapon Skins
  await page.goto('http://localhost:3457/examples/dogfood/weapon-skins/index.html');
  await expect(page).toHaveTitle(/Weapon Skin Forge/);
  await page.waitForTimeout(2000); // Wait for WebGL init
  await page.screenshot({ path: 'weapon-skins.png' });

  // 2. Scroll Site
  await page.goto('http://localhost:3457/examples/dogfood/scroll-site/index.html');
  await expect(page).toHaveTitle(/The Fourth Dimension/);
  await page.evaluate(() => window.scrollTo(0, 500)); // Scroll a bit
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scroll-site.png' });

  // 3. Samsung TV
  await page.goto('http://localhost:3457/examples/dogfood/samsung-tv/index.html');
  await expect(page).toHaveTitle(/VIB3\+ TV/);
  await page.keyboard.press('Enter'); // Dismiss startup overlay
  await page.waitForTimeout(1000);
  // Toggle HUD (Blue key = 406)
  await page.evaluate(() => {
    const e = new KeyboardEvent('keydown', { keyCode: 406 });
    window.dispatchEvent(e);
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'samsung-tv.png' });
});
