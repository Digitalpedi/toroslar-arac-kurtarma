# Deploy — Cloudflare Pages

## Mevcut kurulum

| Alan | Değer |
|---|---|
| Cloudflare hesabı | `digitalpedi@gmail.com` (`67b9a8f8…`) |
| Pages projesi | `toroslar-arac-kurtarma` |
| Yayın türü | **Direct upload** (wrangler) — diğer Digitalpedi projeleriyle aynı |
| Production dalı | `main` |
| Custom domain | `toroslar.digitalpedi.com` (projeye eklendi) |
| GitHub | `Digitalpedi/toroslar-arac-kurtarma` |

## Yayınlama

```bash
npm run deploy
```

Bu komut `astro check` + derleme yapar, sonra `dist/` klasörünü Pages'e yükler.
Yükleme öncesi doğrulama için:

```bash
npm run build && npm run preview      # ayrı terminalde
npm run qa http://localhost:4322
```

## KRİTİK: `*.pages.dev` Türkiye'den erişilemiyor

Cloudflare'in verdiği `toroslar-arac-kurtarma.pages.dev` adresi Türkiye'den
engelli (bağlantı zaman aşımına uğrar). **Site yalnızca custom domain üzerinden
test edilebilir.** Bu yüzden custom domain, deploy akışının son adımı değil,
ön koşuludur.

## Kalan tek manuel adım: DNS kaydı

Custom domain Pages projesine API ile eklendi ama DNS kaydı oluşturulamadı —
wrangler'ın OAuth token'ında `dns_records:edit` izni yok. Cloudflare panelinden
tek kayıt eklenmeli:

```
Zone:    digitalpedi.com  ->  DNS  ->  Add record
Type:    CNAME
Name:    toroslar
Target:  toroslar-arac-kurtarma.pages.dev
Proxy:   Proxied (turuncu bulut AÇIK)
TTL:     Auto
```

Alternatif: Pages projesi → *Custom domains* → `toroslar.digitalpedi.com`
satırındaki uyarıya tıklayın; panel kaydı kendisi oluşturur.

Kayıt yayıldıktan (birkaç dakika) ve sertifika çıktıktan sonra:

```bash
npm run qa https://toroslar.digitalpedi.com
```

## Demo modu — arama motorlarına kapalı

Şu anda site **noindex** yayımlanıyor. İki katmanlı:

1. `src/data/site.ts` → `indexable: false` → her sayfada `<meta name="robots" content="noindex, nofollow">`
2. `public/_headers` → `/*` altında `X-Robots-Tag: noindex, nofollow`

Bu, müşteri onayı öncesi demo adresinin aranabilir hâle gelmesini ve gerçek
domain açıldığında yinelenen içerik oluşmasını engeller.

**Yayına almak için:**

1. `src/data/site.ts` → `indexable: true`
2. `public/_headers` → `X-Robots-Tag: noindex, nofollow` satırını sil
3. `npm run deploy`

## Müşteri kendi domainine geçtiğinde

Dört yerde değişiklik gerekir — hepsi aynı anda yapılmalı, aksi hâlde canonical
ve OG etiketleri yanlış adrese işaret eder:

1. `astro.config.mjs` → `site: 'https://<yeni-domain>'`
2. `src/data/site.ts` → `url: 'https://<yeni-domain>'`
3. `public/robots.txt` → `Sitemap:` satırı
4. `public/llms.txt` → içindeki mutlak bağlantılar

Ardından:

- Cloudflare Pages → *Custom domains* → yeni domaini ekleyin
- Yeni domain başka bir kayıt firmasındaysa önce Cloudflare'e taşıyın
- `toroslar.digitalpedi.com` için yeni domaine 301 yönlendirme kuralı tanımlayın
  (Cloudflare → Rules → Redirect Rules)
- `indexable: true` yapıp yeniden deploy edin
- Google Search Console'a yeni mülkü ekleyip `sitemap-index.xml` gönderin

## `public/_headers`

Cloudflare Pages bu dosyayı otomatik okur:

| Yol | Ayar |
|---|---|
| `/*` | `X-Robots-Tag` (demo), `nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, HSTS |
| `/_astro/*` | `max-age=31536000, immutable` — dosya adları içerik hash'i taşır |
| `/media/*` | `max-age=31536000, immutable` — dosya adları sabit ve sürümlü |
| `/og/*`, `*.png`, `*.svg` | 30 gün |
| `sitemap-index.xml`, `robots.txt` | 1 saat |

## Görseller neden repoda?

`public/media/` (üretilmiş AVIF/WebP/JPEG) repoya dâhildir çünkü derleme
adımı görsel üretmez. Ham kaynaklar (`media-src/`) repoda **değildir**;
Pexels kimlikleri `scripts/fetch-media.mjs` içinde kayıtlı:

```bash
npm run media:fetch    # kaynakları indir
npm run media          # AVIF + WebP + JPEG üret
```

## Tuzaklar

**PowerShell `Compress-Archive` kullanmayın.** Ters eğik çizgili yollarla zip
üretir; Cloudflare'e yüklendiğinde `_astro/` altındaki dosyalar 404 verir.
Deploy her zaman `wrangler` ile yapılır.

**`trailingSlash: 'always'`** ayarlıdır. İç bağlantılarda sondaki eğik çizgiyi
atlamayın; `/hizmetler` yerine `/hizmetler/` yazın. `npm run qa` bunu denetler.

**Pages Functions** bu projede yok. Sonradan form/lead fonksiyonu eklenirse
direct-upload hâlâ çalışır (`wrangler pages deploy` Functions'ı da yükler),
ancak `functions/` klasörü repo kökünde olmalıdır.

## Yayın öncesi kontrol listesi

- [ ] `npm run build` temiz (astro check dahil)
- [ ] `npm run preview` + `npm run qa http://localhost:4322` → sorun yok
- [ ] `src/data/site.ts` içindeki telefon ve saatler güncel
- [ ] `astro.config.mjs` `site` değeri hedef domainle aynı
- [ ] OG görseli güncel (`npm run assets`)
- [ ] `public/robots.txt` içindeki sitemap adresi doğru
- [ ] Yayına alınıyorsa `indexable: true` ve `X-Robots-Tag` satırı silinmiş
