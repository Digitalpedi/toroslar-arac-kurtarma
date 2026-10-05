# Toroslar Araç Kurtarma

Mersin şehir içi oto çekici ve araç kurtarma sitesi.
Astro (static) · Tailwind CSS v4 · TypeScript strict · GSAP/ScrollTrigger.

**Canlı:** https://toroslararackurtarma.com

---

## Hızlı başlangıç

```bash
npm install
npm run dev          # http://localhost:4321
```

## Komutlar

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | `astro check` + üretim derlemesi (`dist/`) |
| `npm run preview` | `dist/` klasörünü yerelde sunar |
| `npm run media:fetch` | Pexels kaynak görsellerini `media-src/` içine indirir |
| `npm run media` | Kaynakları AVIF + WebP + JPEG'e dönüştürür (`public/media/`) |
| `npm run assets` | favicon, PWA ikonları ve OG görselini üretir |
| `npm run qa` | Playwright doğrulama paketi (4 kırılma noktası) |
| `npm run shots` | Tam sayfa ekran görüntüleri (`.qa/`) |

## Yapı

```
src/
  components/     Arayüz bileşenleri (Astro)
  content/        İçerik koleksiyonları — hizmetler / bolgeler / rehber (md)
  data/site.ts    TEK KAYNAK: NAP, nav, ilçeler, CTA
  layouts/        Base.astro — canonical, OG, JSON-LD
  lib/
    motion.ts     Hareket motoru (data-attribute API)
    schema.ts     JSON-LD üreticileri
    icons.ts      SVG ikon seti
  pages/          Rotalar
  styles/
    tokens.css    Tasarım token'ları — tek kaynak
    global.css    Taban, buton, kart, prose
scripts/          Görsel boru hattı, varlık üretimi, doğrulama
media-src/        Ham kaynak görseller (Pexels)
public/media/     Üretilmiş AVIF/WebP/JPEG varyantları
```

## Değiştirmesi en sık gerekenler

| Ne | Nerede |
|---|---|
| Telefon, WhatsApp, çalışma saatleri | `src/data/site.ts` |
| Domain (canonical/OG/sitemap) | `astro.config.mjs` → `site` **ve** `src/data/site.ts` → `url` |
| Menü ve footer bağlantıları | `src/data/site.ts` |
| Hizmet metinleri | `src/content/hizmetler/*.md` |
| Bölge metinleri | `src/content/bolgeler/*.md` |
| Rehber yazıları | `src/content/rehber/*.md` |
| Renk / tipografi / boşluk | `src/styles/tokens.css` |

## İçerik kuralları

Bu sitede **doğrulanmamış veri yayımlanmaz**:

- Fiziksel adres ve koordinat **yoktur** — şemada `areaServed` kullanılır, sahte `PostalAddress` yazılmaz.
- Tecrübe yılı, araç sayısı, müşteri sayısı, puan ve yorum **yazılmaz**.
- Verilmeyen hizmetler (yol yardımı, ağır vasıta, iş makinesi, şehirlerarası) **tanıtılmaz**;
  aksine `hizmetler` sayfasında açıkça kapsam dışı olarak listelenir.
- Süre taahhüdü verilmez; "trafiğe göre değişir" ifadesi kullanılır.

Yeni içerik eklerken `src/content.config.ts` içindeki `dataStatus` alanını kullanın:
`confirmed` (yayımlanır) · `needs-review` (şemaya girmez) · `placeholder` (gösterilmez).

## Doğrulama

`npm run qa` şunları kontrol eder ve sorun bulursa çıkış kodu 1 döner:

- Her sayfa 200 döner, konsolda hata yok
- 375 / 768 / 1024 / 1440 genişliklerde yatay taşma yok
- Ekrandaki hiçbir `[data-reveal]` öğesi görünmez kalmıyor
- Kırık iç bağlantı yok
- Sayfa başına benzersiz `title`/`description`, tek `h1`, başlık hiyerarşisi düzgün
- Tüm görsellerde `alt`, tüm sayfalarda `canonical`, JSON-LD ayrıştırılabilir

Yayın öncesi: `npm run build && npm run preview` sonra `npm run qa http://localhost:4322`.

## Deploy

Cloudflare Pages, git bağlantılı. Ayrıntı: [`docs/DEPLOY.md`](docs/DEPLOY.md).

---

Yazılım: [Digitalpedi](https://digitalpedi.com)
