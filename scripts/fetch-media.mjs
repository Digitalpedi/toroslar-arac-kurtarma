/**
 * Pexels görsel indirici.
 *
 * Kaynak: Pexels (pexels.com) — ücretsiz lisans, atıf zorunlu değil.
 * Her görselin kimliği MEDIA listesinde tutulur; kaynak dosyalar
 * `media-src/` altına iner ve `npm run media` ile AVIF/WebP/JPEG'e dönüşür.
 *
 * Kullanım:  node scripts/fetch-media.mjs
 * Yeniden indirmek için:  node scripts/fetch-media.mjs --force
 */

import { mkdir, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';

const OUT = 'media-src';
const FORCE = process.argv.includes('--force');

/** [dosya adı, Pexels fotoğraf kimliği, kısa açıklama] */
export const MEDIA = [
  ['hero-cekici', 17429097, 'Rampası inmiş kayar kasa çekiciye yüklenen araç'],
  ['hizmet-oto-cekici', 10061763, 'Kayar kasa çekiciye yüklenmiş otomobil, şehir caddesi'],
  ['hizmet-hafif-ticari', 17976203, 'Şehir sokağında park hâlinde beyaz panelvan'],
  ['hizmet-kaza-kurtarma', 38339706, 'Aydınlatma direğine çarpmış hasarlı araç, alacakaranlık'],
  ['hizmet-arizali-arac', 5835356, 'Yol kenarında kaputu açık araca bakan sürücü'],
  ['hizmet-otopark-kurtarma', 21374999, 'Loş kapalı otopark, ıslak zemin'],
  ['hizmet-sehir-ici-nakli', 8931963, 'Türkiye’de şehir içi yolda klasik araç taşıyan kayar kasa çekici'],
  ['kayar-kasa', 17429095, 'Platforma bağlanan aracın zincirle sabitlenmesi'],
  ['kurumsal-cekici', 11383127, 'Şehir merkezinde ilerleyen çekici'],
  ['bolge-toroslar', 38549001, 'Yamaca kurulmuş konut dokusu, panoramik şehir görünümü'],
  ['bolge-yenisehir', 28730822, 'Sahil bulvarında gündüz trafiği, arkada dağlar'],
  ['bolge-mezitli', 37194194, 'Palmiyeli sahil yolu ve yamaç'],
  ['bolge-akdeniz', 35209808, 'Liman vinci ve şehir silueti'],
  ['rehber-yolda-kalma', 6140995, 'Yol kenarında arızayı inceleyen sürücü'],
  ['rehber-otomatik-vites', 27413500, 'Otomatik şanzıman vites kolu yakın çekim'],
  ['rehber-cekici-kurtarma', 13151224, 'Vinçle kaldırılarak kurtarılan otomobil'],
  ['rehber-kaza-tutanak', 35784044, 'Gece sokakta kaza yapmış araç'],
  ['rehber-yol-guvenligi', 5403208, 'Aracın arkasına üçgen reflektör yerleştiren el'],
  ['rehber-elektrikli-arac', 9799743, 'Şarj istasyonuna bağlı elektrikli otomobil'],
  ['rehber-ucret', 13151295, 'Şehir sokağında arızalanan aracın yanında telefonla konuşan sürücü'],
  ['rehber-otopark', 8609786, 'Yönlendirme okları olan loş kapalı otopark'],
  ['rehber-uyari-lambasi', 16341407, 'Gösterge panelinde yanan uyarı lambaları'],
];

const url = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=2400`;

const exists = async (p) => {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
};

await mkdir(OUT, { recursive: true });

let downloaded = 0;
let skipped = 0;
const failed = [];

for (const [name, id] of MEDIA) {
  const dest = join(OUT, `${name}.jpg`);

  if (!FORCE && (await exists(dest))) {
    skipped++;
    continue;
  }

  try {
    const res = await fetch(url(id), {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; site-build-script)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 20_000) throw new Error(`şüpheli boyut: ${buf.length} bayt`);
    await writeFile(dest, buf);
    console.log(`✓ ${name}  (pexels ${id}, ${(buf.length / 1024).toFixed(0)} KB)`);
    downloaded++;
  } catch (err) {
    console.error(`✗ ${name}  (pexels ${id}): ${err.message}`);
    failed.push(name);
  }
}

console.log(`\nİndirilen: ${downloaded} · Atlanan: ${skipped} · Hata: ${failed.length}`);
if (failed.length) {
  console.error('Başarısız:', failed.join(', '));
  process.exitCode = 1;
}
