/**
 * Tam sayfa ekran görüntüsü üretici — tasarım gözden geçirmesi için.
 *
 * Kullanım:
 *   npm run shots                     # http://localhost:4322 (astro preview)
 *   node scripts/screenshots.mjs URL
 *
 * Çıktı: .qa/ altında `<cihaz>-<sayfa>.png`
 */

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = (process.argv.find((a) => a.startsWith('http')) ?? 'http://localhost:4322').replace(
  /\/$/,
  '',
);

const PAGES = [
  ['/', 'anasayfa'],
  ['/hizmetler/', 'hizmetler'],
  ['/hizmetler/oto-cekici/', 'hizmet-detay'],
  ['/bolgeler/', 'bolgeler'],
  ['/bolgeler/toroslar-cekici/', 'bolge-detay'],
  ['/surec/', 'surec'],
  ['/kurumsal/', 'kurumsal'],
  ['/sss/', 'sss'],
  ['/iletisim/', 'iletisim'],
  ['/rehber/', 'rehber'],
  ['/rehber/otomatik-vitesli-arac-nasil-cekilir/', 'rehber-detay'],
  ['/404/', '404'],
];

const DEVICES = [
  { name: 'masaustu', viewport: { width: 1440, height: 900 } },
  { name: 'mobil', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
];

await mkdir('.qa', { recursive: true });
const browser = await chromium.launch();

for (const device of DEVICES) {
  for (const [path, name] of PAGES) {
    const ctx = await browser.newContext({ ...device, locale: 'tr-TR', deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(BASE + path, { waitUntil: 'networkidle' });

    // Bütün sayfayı gez — tembel yüklenen görseller ve reveal'lar tetiklensin
    await page.evaluate(async () => {
      const step = Math.round(window.innerHeight * 0.7);
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 110));
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 400));
    });

    await page.screenshot({ path: `.qa/${device.name}-${name}.png`, fullPage: true });
    await ctx.close();
    console.log(`✓ ${device.name} · ${name}`);
  }
}

await browser.close();
