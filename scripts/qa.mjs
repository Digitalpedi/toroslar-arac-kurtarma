/**
 * Yayın öncesi doğrulama — Playwright.
 *
 * Ne kontrol eder:
 *   1. Her sayfa 200 döner, konsolda hata yok
 *   2. 375 / 768 / 1024 / 1440 kırılma noktalarında yatay taşma yok
 *   3. Ekrandaki hiçbir [data-reveal] öğesi görünmez kalmıyor
 *   4. Tüm iç bağlantılar geçerli (kırık link yok)
 *   5. Sayfa başına benzersiz title/description, tek h1
 *   6. Görsellerde alt metni var
 *   7. Ekran görüntüleri `.qa/` altına yazılır
 *
 * Kullanım:
 *   node scripts/qa.mjs                # http://localhost:4321
 *   node scripts/qa.mjs http://host    # başka adres
 *   node scripts/qa.mjs --shots        # ekran görüntüsü de al
 */

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = (process.argv.find((a) => a.startsWith('http')) ?? 'http://localhost:4321').replace(
  /\/$/,
  '',
);
const SHOTS = process.argv.includes('--shots');
const SHOT_DIR = '.qa';

const PATHS = [
  '/',
  '/hizmetler/',
  '/hizmetler/oto-cekici/',
  '/hizmetler/hafif-ticari-arac-kurtarma/',
  '/hizmetler/kaza-sonrasi-arac-kurtarma/',
  '/hizmetler/arizali-arac-tasima/',
  '/hizmetler/kapali-otopark-kurtarma/',
  '/hizmetler/sehir-ici-arac-nakli/',
  '/bolgeler/',
  '/bolgeler/toroslar-cekici/',
  '/bolgeler/yenisehir-cekici/',
  '/bolgeler/mezitli-cekici/',
  '/bolgeler/akdeniz-cekici/',
  '/surec/',
  '/kurumsal/',
  '/sss/',
  '/iletisim/',
  '/rehber/',
  '/rehber/arac-yolda-kalinca-ne-yapmali/',
  '/rehber/otomatik-vitesli-arac-nasil-cekilir/',
  '/rehber/cekici-mi-kurtarma-mi-fark-nedir/',
  '/rehber/kaza-sonrasi-tutanak-ve-cekici-sureci/',
  '/rehber/yol-kenarinda-guvenlik-yelek-ucgen-reflektor/',
  '/rehber/elektrikli-arac-cekilirken-dikkat/',
  '/rehber/cekici-ucretini-belirleyen-faktorler/',
  '/rehber/kapali-otoparkta-kalan-arac-nasil-cikarilir/',
  '/rehber/aracinizi-surmeyi-birakmaniz-gereken-7-uyari/',
  '/kvkk-aydinlatma-metni/',
  '/gizlilik-politikasi/',
  '/404/',
];

const VIEWPORTS = [
  { name: 'mobil', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1024, height: 768 },
  { name: 'masaustu', width: 1440, height: 900 },
];

const problems = [];
const seenTitles = new Map();
const seenDescs = new Map();
const allLinks = new Set();

const fail = (page, msg) => problems.push(`${page}  ${msg}`);

if (SHOTS) await mkdir(SHOT_DIR, { recursive: true });

const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    locale: 'tr-TR',
  });

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));

  for (const path of PATHS) {
    consoleErrors.length = 0;
    const res = await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45_000 });

    if (path !== '/404/' && res && res.status() >= 400) {
      fail(`[${vp.name}] ${path}`, `HTTP ${res.status()}`);
    }

    // Sayfayı baştan sona gez — tembel yüklenen her şey tetiklensin
    await page.evaluate(async () => {
      const step = Math.round(window.innerHeight * 0.8);
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 90));
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 250));
    });

    /* --- yatay taşma --- */
    const overflow = await page.evaluate(() => {
      const de = document.documentElement;
      if (de.scrollWidth <= de.clientWidth + 1) return null;
      const wide = [...document.querySelectorAll('body *')]
        .filter((e) => e.getBoundingClientRect().right > de.clientWidth + 2)
        .slice(0, 3)
        .map((e) => `${e.tagName}.${String(e.className).slice(0, 40)}`);
      return { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, wide };
    });
    if (overflow) {
      fail(`[${vp.name}] ${path}`, `yatay taşma ${overflow.scrollWidth}>${overflow.clientWidth} — ${overflow.wide.join(' | ')}`);
    }

    /* --- görünmez kalan reveal öğeleri --- */
    const stuck = await page.evaluate(() => {
      const els = [
        ...document.querySelectorAll('[data-reveal], [data-reveal-group] > *, [data-clip-reveal]'),
      ];
      return els.filter((e) => {
        const r = e.getBoundingClientRect();
        const inView = r.top < window.innerHeight && r.bottom > 0;
        return inView && parseFloat(getComputedStyle(e).opacity) < 0.9;
      }).length;
    });
    if (stuck > 0) fail(`[${vp.name}] ${path}`, `${stuck} öğe görünmez kaldı (reveal)`);

    /* --- sayfa başına yapılan tekil kontroller (yalnız bir kez) --- */
    if (vp.name === 'masaustu') {
      const info = await page.evaluate(() => ({
        title: document.title,
        desc: document.querySelector('meta[name="description"]')?.content ?? '',
        canonical: document.querySelector('link[rel="canonical"]')?.href ?? '',
        h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
        imgsNoAlt: [...document.querySelectorAll('img')].filter((i) => i.alt === null).length,
        jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map(
          (s) => s.textContent,
        ),
        links: [...document.querySelectorAll('a[href]')]
          .map((a) => a.getAttribute('href'))
          .filter((h) => h && h.startsWith('/')),
        headingOrder: [...document.querySelectorAll('h1,h2,h3,h4')].map((h) =>
          Number(h.tagName[1]),
        ),
      }));

      if (!info.title) fail(path, 'title yok');
      if (info.title.length > 70) fail(path, `title uzun (${info.title.length})`);
      if (!info.desc) fail(path, 'description yok');
      if (info.desc.length > 175) fail(path, `description uzun (${info.desc.length})`);
      if (info.h1.length !== 1) fail(path, `h1 sayısı ${info.h1.length}`);
      if (info.imgsNoAlt) fail(path, `${info.imgsNoAlt} görselde alt yok`);
      if (!info.canonical) fail(path, 'canonical yok');

      if (path !== '/404/') {
        if (seenTitles.has(info.title)) fail(path, `title tekrar: ${seenTitles.get(info.title)}`);
        seenTitles.set(info.title, path);
        if (seenDescs.has(info.desc)) fail(path, `description tekrar: ${seenDescs.get(info.desc)}`);
        seenDescs.set(info.desc, path);
      }

      for (const raw of info.jsonLd) {
        try {
          JSON.parse(raw);
        } catch {
          fail(path, 'JSON-LD ayrıştırılamadı');
        }
      }

      // Başlık hiyerarşisi: bir seviyeden fazla atlama olmasın
      for (let i = 1; i < info.headingOrder.length; i++) {
        if (info.headingOrder[i] - info.headingOrder[i - 1] > 1) {
          fail(path, `başlık atlaması h${info.headingOrder[i - 1]} → h${info.headingOrder[i]}`);
          break;
        }
      }

      info.links.forEach((l) => allLinks.add(l.split('#')[0]));
    }

    // /404/ dev sunucusunda kasıtlı olarak 404 döner; bu bir hata değil
    if (path === '/404/') consoleErrors.length = 0;

    if (consoleErrors.length) {
      fail(`[${vp.name}] ${path}`, `konsol hatası: ${consoleErrors.slice(0, 2).join(' / ')}`);
    }

    if (SHOTS && (vp.name === 'mobil' || vp.name === 'masaustu')) {
      const slug = path.replace(/\//g, '_') || '_home';
      await page.screenshot({
        path: `${SHOT_DIR}/${vp.name}${slug}.png`,
        fullPage: false,
      });
    }
  }

  await context.close();
  console.log(`✓ ${vp.name} (${vp.width}px) tarandı`);
}

/* --- iç bağlantı denetimi --- */
const known = new Set(PATHS);
for (const link of allLinks) {
  if (!link.startsWith('/')) continue;
  const normalized = link.endsWith('/') ? link : `${link}/`;
  if (!known.has(normalized) && !link.match(/\.(xml|txt|png|svg|webmanifest)$/)) {
    problems.push(`kırık iç bağlantı: ${link}`);
  }
}

await browser.close();

console.log('\n──────── SONUÇ ────────');
if (!problems.length) {
  console.log('Sorun bulunamadı.');
} else {
  console.log(`${problems.length} sorun:`);
  problems.forEach((p) => console.log(' •', p));
}
await writeFile('.qa/rapor.txt', problems.join('\n') || 'temiz', 'utf8').catch(() => {});
process.exitCode = problems.length ? 1 : 0;
