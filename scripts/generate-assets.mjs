/**
 * Marka varlıkları üretici — favicon, apple-touch-icon, PWA ikonları, OG görseli.
 *
 * Tümü tek kaynaktan (ikaz şeridi işareti) türetilir; renkler tokens.css ile aynı.
 * Kullanım: npm run og
 */

import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const INK = '#0d1110';
const AMBER = '#f08a00';
const STONE = '#eff1ec';
const MUTED = '#9aa3a0';

const OUT = 'public';
const OG_DIR = join(OUT, 'og');

await mkdir(OG_DIR, { recursive: true });

/* ------------------------------------------------------------------ */
/* İşaret — ikaz şeridi (site genelindeki --hazard motifinin damıtımı)  */
/* ------------------------------------------------------------------ */
const mark = (size = 64, radius = 0.26) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 34 34">
  <defs><clipPath id="c"><rect width="34" height="34" rx="${(radius * 34).toFixed(1)}"/></clipPath></defs>
  <g clip-path="url(#c)">
    <rect width="34" height="34" fill="${INK}"/>
    <g fill="${AMBER}">
      <path d="M-4 30 L8 4 h6 L2 30 Z"/>
      <path d="M8 30 L20 4 h6 L14 30 Z"/>
      <path d="M20 30 L32 4 h6 L26 30 Z"/>
    </g>
  </g>
</svg>`;

/* favicon.svg — vektör, tema uyumlu */
await writeFile(join(OUT, 'favicon.svg'), mark(34).trim() + '\n', 'utf8');

/* Raster ikonlar */
const rasters = [
  ['apple-touch-icon.png', 180, 0.0], // iOS zaten yuvarlatır
  ['icon-192.png', 192, 0.26],
  ['icon-512.png', 512, 0.26],
  ['logo.png', 512, 0.26],
];

for (const [file, size, radius] of rasters) {
  await sharp(Buffer.from(mark(size, radius)))
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, file));
  console.log(`✓ ${file} (${size}px)`);
}

/* ------------------------------------------------------------------ */
/* OG görseli — 1200×630                                               */
/* ------------------------------------------------------------------ */
const W = 1200;
const H = 630;

const overlay = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="scrim" x1="0" y1="0" x2="1" y2="0.35">
      <stop offset="0%"   stop-color="${INK}" stop-opacity="0.97"/>
      <stop offset="55%"  stop-color="${INK}" stop-opacity="0.88"/>
      <stop offset="100%" stop-color="${INK}" stop-opacity="0.55"/>
    </linearGradient>
    <pattern id="hazard" width="48" height="48" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
      <rect width="24" height="48" fill="${AMBER}"/>
      <rect x="24" width="24" height="48" fill="${INK}"/>
    </pattern>
    <clipPath id="markClip"><rect x="72" y="72" width="72" height="72" rx="18"/></clipPath>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#scrim)"/>

  <!-- üst ikaz şeridi -->
  <rect x="0" y="0" width="${W}" height="10" fill="url(#hazard)"/>

  <!-- marka işareti -->
  <g clip-path="url(#markClip)">
    <rect x="72" y="72" width="72" height="72" fill="${INK}"/>
    <g fill="${AMBER}" transform="translate(72,72) scale(2.1176)">
      <path d="M-4 30 L8 4 h6 L2 30 Z"/>
      <path d="M8 30 L20 4 h6 L14 30 Z"/>
      <path d="M20 30 L32 4 h6 L26 30 Z"/>
    </g>
  </g>

  <text x="164" y="103" font-family="Segoe UI, Arial, sans-serif" font-size="26" font-weight="700" fill="${STONE}">Toroslar</text>
  <text x="164" y="132" font-family="Consolas, Courier New, monospace" font-size="15" letter-spacing="3.4" fill="${MUTED}">ARAÇ KURTARMA</text>

  <text x="72" y="300" font-family="Segoe UI, Arial, sans-serif" font-size="76" font-weight="800" fill="${STONE}">Yolda kaldınız.</text>
  <text x="72" y="382" font-family="Segoe UI, Arial, sans-serif" font-size="76" font-weight="800" fill="${AMBER}">Biz yoldayız.</text>

  <text x="72" y="440" font-family="Segoe UI, Arial, sans-serif" font-size="24" fill="${MUTED}">Mersin şehir içi · 7/24 oto çekici ve araç kurtarma</text>

  <!-- telefon rozeti -->
  <rect x="72" y="486" width="342" height="66" rx="33" fill="${AMBER}"/>
  <text x="243" y="530" text-anchor="middle" font-family="Consolas, Courier New, monospace" font-size="30" font-weight="700" fill="${INK}">0534 603 02 33</text>

  <text x="440" y="530" font-family="Segoe UI, Arial, sans-serif" font-size="19" fill="${MUTED}">Toroslar · Yenişehir · Mezitli · Akdeniz</text>

  <!-- alt ikaz şeridi -->
  <rect x="0" y="${H - 10}" width="${W}" height="10" fill="url(#hazard)"/>
</svg>`;

const bg = await sharp('media-src/hero-cekici.jpg')
  .extract({ left: 0, top: 190, width: 3312, height: 2304 })
  .resize(W, H, { fit: 'cover', position: 'right top' })
  .modulate({ saturation: 0.85 })
  .toBuffer();

await sharp(bg)
  .composite([{ input: Buffer.from(overlay), top: 0, left: 0 }])
  .png({ compressionLevel: 9 })
  .toFile(join(OG_DIR, 'toroslar-arac-kurtarma.png'));

console.log('✓ og/toroslar-arac-kurtarma.png (1200×630)');
