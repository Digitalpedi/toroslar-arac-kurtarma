/**
 * Görsel boru hattı — sharp.
 *
 * `media-src/*.jpg` kaynaklarını `public/media/` altına
 * `<ad>-<genişlik>.{avif,webp,jpg}` olarak üretir.
 *
 * Genişlikler `Figure.astro` içindeki WIDTHS dizisiyle BİREBİR aynı olmalı;
 * aksi hâlde srcset var olmayan dosyaya işaret eder.
 *
 * CROP: bazı kaynaklarda çerçevenin dışında tutmak istediğimiz bir bölge var
 * (örneğin başka bir firmanın araç üstü yazısı). Oranlarla tanımlanır, böylece
 * kaynak çözünürlüğü değişse de kırpma bozulmaz.
 *
 * Kullanım: npm run media
 */

import sharp from 'sharp';
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { join, parse } from 'node:path';

const SRC = 'media-src';
const OUT = 'public/media';
const WIDTHS = [640, 1024, 1600, 2200];

/** Oransal kırpma: { left, top, width, height } — hepsi 0–1 arası */
const CROP = {
  // Kaynakta sağ altta çalışan operatörün üzerinde başka bir firmanın
  // telefon numarası yazıyor. Kadraj sola alınarak tamamen dışarıda bırakılıyor.
  'hero-cekici': { left: 0, top: 0.06, width: 0.69, height: 0.72 },
};

/**
 * ÇERÇEVE ORANI — kaynak dosyalar dikey/yatay karışık geliyor; arayüzdeki
 * çerçeveler ise sabit orana sahip. Kırpmayı burada, kaynakta yaparız:
 * böylece hem `object-fit: cover` rastgele kadraj kesmez hem de gereksiz
 * piksel indirilmez.
 *
 * ratio   : hedef en/boy (genişlik ÷ yükseklik)
 * gravity : dikey odak noktası (0 üst · 0.5 orta · 1 alt)
 */
const DEFAULT_FRAME = { ratio: 3 / 2, gravity: 0.42 };

const FRAME = {
  // Dikey çerçevede kullanılanlar
  'kurumsal-cekici': { ratio: 6 / 7, gravity: 0.45 },
  'kayar-kasa': { ratio: 4 / 5, gravity: 0.5 },
  // Hero zaten CROP ile kadrajlandı; oranı korunur
  'hero-cekici': { ratio: 3312 / 2304, gravity: 0.5 },
  // Ana özneleri üstte olan dikey kaynaklar
  'hizmet-oto-cekici': { ratio: 3 / 2, gravity: 0.3 },
  'hizmet-sehir-ici-nakli': { ratio: 3 / 2, gravity: 0.46 },
  'rehber-uyari-lambasi': { ratio: 3 / 2, gravity: 0.5 },
};

const JPEG = { quality: 82, mozjpeg: true, chromaSubsampling: '4:4:4' };
const WEBP = { quality: 78, effort: 5 };
const AVIF = { quality: 58, effort: 5, chromaSubsampling: '4:2:0' };

await mkdir(OUT, { recursive: true });

const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png)$/i.test(f));
if (!files.length) {
  console.error(`${SRC} boş. Önce: node scripts/fetch-media.mjs`);
  process.exit(1);
}

const manifest = {};
let written = 0;

for (const file of files) {
  const name = parse(file).name;
  const input = join(SRC, file);

  // 1) Ham kaynak — EXIF yönünü uygula
  let buf = await sharp(input).rotate().toBuffer();

  // 2) İsteğe bağlı el kırpması (istenmeyen bölgeyi kadraj dışında bırakmak için)
  const crop = CROP[name];
  if (crop) {
    const m = await sharp(buf).metadata();
    buf = await sharp(buf)
      .extract({
        left: Math.round(crop.left * m.width),
        top: Math.round(crop.top * m.height),
        width: Math.round(crop.width * m.width),
        height: Math.round(crop.height * m.height),
      })
      .toBuffer();
  }

  // 3) Hedef çerçeve oranına kadrajla — dikey kaynaklar yatay çerçevede
  //    rastgele kesilmesin diye kırpma burada, kaynakta yapılır.
  const frame = FRAME[name] ?? DEFAULT_FRAME;
  {
    const m = await sharp(buf).metadata();
    if (Math.abs(m.width / m.height - frame.ratio) > 0.02) {
      let w = m.width;
      let h = Math.round(w / frame.ratio);
      if (h > m.height) {
        h = m.height;
        w = Math.round(h * frame.ratio);
      }
      const left = Math.round((m.width - w) / 2);
      const top = Math.min(
        Math.max(0, Math.round(m.height * frame.gravity - h / 2)),
        m.height - h,
      );
      buf = await sharp(buf).extract({ left, top, width: w, height: h }).toBuffer();
    }
  }

  const baseMeta = await sharp(buf).metadata();
  manifest[name] = { width: baseMeta.width, height: baseMeta.height };

  for (const w of WIDTHS) {
    const resized = () =>
      sharp(buf).resize({ width: w, withoutEnlargement: false, fit: 'inside' });

    await Promise.all([
      resized().avif(AVIF).toFile(join(OUT, `${name}-${w}.avif`)),
      resized().webp(WEBP).toFile(join(OUT, `${name}-${w}.webp`)),
      resized().jpeg(JPEG).toFile(join(OUT, `${name}-${w}.jpg`)),
    ]);
    written += 3;
  }

  console.log(`✓ ${name}  ${baseMeta.width}×${baseMeta.height}${crop ? ' · el kırpması' : ''}`);
}

// Kaynak ölçüleri — Figure bileşenine doğru width/height vermek için referans
await writeFile(
  join('src', 'data', 'media-manifest.json'),
  JSON.stringify(manifest, null, 2) + '\n',
  'utf8',
);

console.log(`\n${files.length} kaynak · ${written} dosya üretildi · ${OUT}`);
