# Deploy — Cloudflare Pages

## Özet

| Alan | Değer |
|---|---|
| Repo | `Digitalpedi/toroslar-arac-kurtarma` |
| Dal | `main` |
| Build komutu | `npm run build` |
| Çıktı dizini | `dist` |
| Node sürümü | `NODE_VERSION = 20` |
| Custom domain | `toroslar.digitalpedi.com` |
| Framework preset | Astro (veya "None" + yukarıdaki ayarlar) |

## KRİTİK: `*.pages.dev` Türkiye'de erişilemiyor

Cloudflare'in verdiği `<proje>.pages.dev` adresi Türkiye'den engelli.
**Custom domain bağlanmadan site test edilemez.** Bu yüzden deploy akışının
son adımı değil, ilk adımı custom domain bağlamaktır.

## Adımlar

1. **Cloudflare Pages → Create a project → Connect to Git**
   `Digitalpedi/toroslar-arac-kurtarma` reposunu seçin.

2. **Build ayarları**
   ```
   Build command:       npm run build
   Build output:        dist
   Root directory:      /
   Environment variable: NODE_VERSION = 20
   ```

3. **İlk deploy'u bekleyin.** Derleme `astro check` içerdiği için tip hatası
   varsa build burada durur — bu bilinçli bir güvenlik ağıdır.

4. **Custom domain**
   Pages projesi → *Custom domains* → `toroslar.digitalpedi.com` ekleyin.
   `digitalpedi.com` zaten Cloudflare'de olduğu için CNAME kaydı otomatik açılır.
   SSL sertifikası birkaç dakika içinde aktif olur.

5. **Doğrulama**
   ```bash
   npm run qa https://toroslar.digitalpedi.com
   ```

## Müşteri kendi domainine geçtiğinde

Üç yerde değişiklik gerekir — üçü de aynı anda yapılmalı, aksi hâlde
canonical ve OG etiketleri yanlış adrese işaret eder:

1. `astro.config.mjs` → `site: 'https://<yeni-domain>'`
2. `src/data/site.ts` → `url: 'https://<yeni-domain>'`
3. `public/robots.txt` → `Sitemap:` satırı
4. `public/llms.txt` → içindeki mutlak bağlantılar

Ardından Cloudflare Pages'te yeni domaini *Custom domains* altına ekleyin.
Eski adres (`toroslar.digitalpedi.com`) kalabilir; Cloudflare'de yeni domaine
301 yönlendirme kuralı tanımlanması önerilir.

Son olarak Google Search Console'a yeni mülk ekleyip
`https://<yeni-domain>/sitemap-index.xml` adresini gönderin.

## `public/_headers`

Cloudflare Pages bu dosyayı otomatik okur:

- `/_astro/*` ve `/media/*` → `max-age=31536000, immutable`
  (dosya adları içerik hash'i ya da sabit ad taşıdığı için güvenli)
- Güvenlik başlıkları: `nosniff`, `Referrer-Policy`, `X-Frame-Options`,
  `Permissions-Policy`, `Strict-Transport-Security`

## Tuzaklar

**PowerShell `Compress-Archive` kullanmayın.** Ters eğik çizgili yollarla zip
üretir; Cloudflare'e direct-upload edildiğinde `_astro/` altındaki dosyalar 404
verir. Deploy git bağlantılı yapılır; elle yükleme gerekirse:

```bash
npx wrangler pages deploy dist --project-name=toroslar-arac-kurtarma
```

**Pages Functions kullanılırsa** direct-upload edilen zip Functions içermez.
Bu projede Functions yok (form/lead fonksiyonu bulunmuyor); sonradan eklenirse
deploy mutlaka git bağlantılı ya da `wrangler` ile yapılmalı.

**`trailingSlash: 'always'`** ayarlıdır. İç bağlantılarda sondaki eğik çizgiyi
atlamayın; `/hizmetler` yerine `/hizmetler/` yazın. `npm run qa` bunu denetler.

## Yayın öncesi kontrol listesi

- [ ] `npm run build` temiz (astro check dahil)
- [ ] `npm run preview` + `npm run qa http://localhost:4322` → sorun yok
- [ ] `src/data/site.ts` içindeki telefon ve saatler güncel
- [ ] `astro.config.mjs` `site` değeri hedef domainle aynı
- [ ] OG görseli güncel (`npm run assets`)
- [ ] `public/robots.txt` içindeki sitemap adresi doğru
