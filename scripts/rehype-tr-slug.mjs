/**
 * Türkçe başlıklar için ASCII çıpa (anchor) üretici.
 *
 * SORUN: Astro'nun varsayılan `github-slugger`'ı Türkçe harfleri id içinde
 * olduğu gibi bırakıyor; tarayıcı adres çubuğunda bunları yüzde-kodluyor:
 *   "Mersin'in sürüş karakteri" -> #mersinin-s%C3%BCr%C3%BC%C5%9F-karakteri
 * Ayrıca JS `"İ".toLowerCase()` sonucu `i` + U+0307 (birleşen üst nokta) —
 * görünmez çift noktalı `i`, `#i%CC%87lk-...` gibi bozuk çıpalar üretiyor.
 *
 * ÇÖZÜM: Başlık id'lerini markdown boru hattında ASCII'ye çeviririz.
 * Bu eklenti Astro'nun `rehypeHeadingIds`'inden ÖNCE çalışır; o eklenti
 * hazır bir `id` varsa dokunmaz ve aynı slug'ı `headings` dizisine yazar —
 * yani içindekiler listesi (`entry.render().headings`) kendiliğinden uyar.
 */

/** Türkçe harfler + sık kullanılan düzeltme işaretli harfler. Küçültmeden ÖNCE uygulanır. */
const TR_MAP = {
  İ: 'i', I: 'i', ı: 'i',
  Ş: 's', ş: 's',
  Ğ: 'g', ğ: 'g',
  Ü: 'u', ü: 'u',
  Ö: 'o', ö: 'o',
  Ç: 'c', ç: 'c',
  Â: 'a', â: 'a',
  Î: 'i', î: 'i',
  Û: 'u', û: 'u',
};

/** Tırnak/kesme türevleri atılır ("Mersin'in" -> "mersinin"). */
const DROP = /[’‘'`´”“"]/g;
/** Tire/eğik çizgi türevleri boşluğa çevrilir ("Mezitli–Yenişehir" -> "mezitli-yenisehir"). */
const TO_SPACE = /[–—―‒/\_]/g;

export function trSlug(text) {
  return text
    .replace(DROP, '')
    .replace(TO_SPACE, ' ')
    .replace(/[İIıŞşĞğÜüÖöÇçÂâÎîÛû]/g, (c) => TR_MAP[c])
    .toLowerCase()
    // Kalan aksanları ayrıştırıp birleşen işaretleri at (é -> e).
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Başlık metnini toplar (kod/inline etiketler dahil, ham HTML hariç). */
function headingText(node) {
  let text = '';
  const walk = (n) => {
    if (n.type === 'text') text += n.value;
    else if (n.children) n.children.forEach(walk);
  };
  walk(node);
  return text;
}

export function rehypeTrSlug() {
  return (tree) => {
    const used = new Map();

    const visit = (node) => {
      if (node.type === 'element' && /^h[1-6]$/.test(node.tagName)) {
        node.properties = node.properties || {};
        if (typeof node.properties.id !== 'string') {
          let slug = trSlug(headingText(node)) || 'bolum';
          // Aynı dosyada tekrar eden başlık: -1, -2 ... (github-slugger davranışı)
          const seen = used.get(slug);
          if (seen === undefined) {
            used.set(slug, 0);
          } else {
            const next = seen + 1;
            used.set(slug, next);
            slug = `${slug}-${next}`;
          }
          node.properties.id = slug;
        }
      }
      if (node.children) node.children.forEach(visit);
    };

    visit(tree);
  };
}

export default rehypeTrSlug;
