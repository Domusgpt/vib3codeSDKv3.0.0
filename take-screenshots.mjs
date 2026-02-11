import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

const OUT = '/tmp/vib3-screenshots';
const URL = 'http://localhost:5173';
const CHROME_PATH = '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome';

async function run() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
  });

  // ── Desktop screenshots (1920x1080) ──
  console.log('=== Desktop viewport (1920x1080) ===');
  const desktopCtx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await desktopCtx.newPage();

  console.log('Navigating to', URL);
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);

  // 1. Hero section (viewport screenshot at top)
  console.log('1. Hero section screenshot...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: OUT + '/01-hero-desktop-1920x1080.png',
    clip: { x: 0, y: 0, width: 1920, height: 1080 },
  });
  console.log('   Saved 01-hero-desktop-1920x1080.png');

  // 2. Morph section
  console.log('2. Morph section screenshot...');
  const morphEl = await page.$('#morphSection');
  if (morphEl) {
    await morphEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: OUT + '/02-morph-desktop.png' });
    console.log('   Saved 02-morph-desktop.png');
  } else {
    console.log('   WARNING: #morphSection not found');
  }

  // 3. Playground section
  console.log('3. Playground section screenshot...');
  const playgroundEl = await page.$('#playgroundSection');
  if (playgroundEl) {
    await playgroundEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: OUT + '/03-playground-desktop.png' });
    console.log('   Saved 03-playground-desktop.png');
  } else {
    console.log('   WARNING: #playgroundSection not found');
  }

  // 4. Triptych section
  console.log('4. Triptych section screenshot...');
  const triptychEl = await page.$('#triptychSection');
  if (triptychEl) {
    await triptychEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: OUT + '/04-triptych-desktop.png' });
    console.log('   Saved 04-triptych-desktop.png');
  } else {
    console.log('   WARNING: #triptychSection not found');
  }

  // 5. Cascade section
  console.log('5. Cascade section screenshot...');
  const cascadeEl = await page.$('#cascadeSection');
  if (cascadeEl) {
    await cascadeEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: OUT + '/05-cascade-desktop.png' });
    console.log('   Saved 05-cascade-desktop.png');
  } else {
    console.log('   WARNING: #cascadeSection not found');
  }

  await desktopCtx.close();

  // ── Mobile screenshot (375x812) ──
  console.log('\n=== Mobile viewport (375x812) ===');
  const mobileCtx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await mobilePage.waitForTimeout(3000);

  console.log('6. Mobile hero screenshot...');
  await mobilePage.evaluate(() => window.scrollTo(0, 0));
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: OUT + '/06-hero-mobile-375x812.png' });
  console.log('   Saved 06-hero-mobile-375x812.png');
  await mobileCtx.close();

  // ── Full page screenshot ──
  console.log('\n=== Full page screenshot ===');
  const fullCtx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const fullPage = await fullCtx.newPage();
  await fullPage.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await fullPage.waitForTimeout(3000);

  console.log('7. Full page screenshot...');
  await fullPage.screenshot({
    path: OUT + '/07-fullpage-desktop.png',
    fullPage: true,
  });
  console.log('   Saved 07-fullpage-desktop.png');
  await fullCtx.close();

  await browser.close();
  console.log('\nAll screenshots saved to', OUT);
}

run().catch((err) => {
  console.error('Screenshot script failed:', err);
  process.exit(1);
});
