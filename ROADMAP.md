# Toroslar Araç Kurtarma — Yol Haritası

Mersin şehir içi oto çekici / araç kurtarma sitesi.
Astro (static) + Tailwind CSS v4 + GSAP/ScrollTrigger + Lenis.

---

## ONAYLANMIŞ KARARLAR

Bu blok müşteri/kullanıcı onayıyla kilitlendi. Değişiklik ancak açık talep ile yapılır.

### İşletme gerçekleri (doğrulanmış — uydurma yok)

| Alan | Değer | Kaynak |
|---|---|---|
| Marka adı | Toroslar Araç Kurtarma | Kullanıcı |
| Telefon | 0534 603 02 33 (`+905346030233`) | Kullanıcı |
| WhatsApp | Aynı numara, ön dolu Türkçe mesaj | Kullanıcı |
| Hizmet bölgesi | **Yalnızca Mersin şehir içi** — Toroslar, Yenişehir, Mezitli, Akdeniz | Kullanıcı (2026-09-03) |
| Hizmet kapsamı | **Yalnızca binek + hafif ticari araç çekici/kurtarma** | Kullanıcı (2026-09-03) |
| Yol yardımı | **YOK** — akü takviye / lastik / yakıt içeriği siteye YAZILMAZ | Kullanıcı (2026-09-03) |
| Ağır vasıta, iş makinesi, motosiklet | **YOK** — bu hizmetler siteye YAZILMAZ | Kullanıcı (2026-09-03) |
| Çalışma saatleri | 7/24 kesintisiz | Kullanıcı (2026-09-03) |
| Fiziksel adres | **YOK** — mobil hizmet işletmesi. Şemada `areaServed` kullanılır, sahte `PostalAddress` YAZILMAZ | Kullanıcı (2026-09-03) |
| Google Business Profile | Yok | Kullanıcı |
| Tecrübe yılı | **Yazılmaz** — doğrulanmamış sayı kullanılmaz | Kullanıcı (2026-09-03) |
| E-posta | Yok (teyit bekliyor) | — |
| Filo detayı (araç sayısı/plaka) | Bilinmiyor — sayı verilmez, "kayar kasa çekici" gibi tür ifadeleri kullanılır | — |

### Teknik kararlar

| Alan | Karar |
|---|---|
| Stack | Astro 5 static output, Tailwind v4 CSS-first `@theme`, TypeScript strict |
| Hareket | GSAP + ScrollTrigger, `src/lib/motion.ts` data-attribute API. Reveal'lar IntersectionObserver ile; **Lenis kullanılmıyor** (programatik scroll'u ele geçiriyordu) |
| İçerik | Astro Content Collections (zod şemalı md) — `hizmetler`, `bolgeler`, `rehber` |
| Tek kaynak | `src/data/site.ts` — NAP, nav, tel, whatsappUrl, hizmet bölgeleri |
| Fontlar | `@fontsource-variable/bricolage-grotesque` (display) · `@fontsource-variable/ibm-plex-sans` (gövde) · `@fontsource/ibm-plex-mono` (teknik etiket) — self-host, CDN yok |
| Görseller | Pexels (ücretsiz lisans) → `scripts/process-media.mjs` → AVIF + WebP `<picture>`, width/height ile CLS önleme |
| Canonical | `https://toroslar.digitalpedi.com` — gerçek domain gelince `astro.config.mjs` + `src/data/site.ts` içinde tek satır değişir |
| Deploy | Cloudflare Pages **direct upload** (`npm run deploy`) — diğer Digitalpedi projeleriyle aynı. `*.pages.dev` Türkiye'de engelli → custom domain zorunlu |
| Repo | GitHub `Digitalpedi/toroslar-arac-kurtarma` (public) |
| Form | Yok — lead kanalı yalnız telefon + WhatsApp. (Sonradan Formspree eklenebilir.) |

### Tasarım yönü — "Asfalt & Amber"

| Katman | Karar |
|---|---|
| Zemin | Soğuk kireçtaşı beyazı (Toros taşı) `#F3F4F1` ailesi — açık tema |
| Mürekkep | Asfalt siyahı `#0E1113` ailesi |
| Sinyal | İkaz lambası amberi `#F08A00` ailesi + koyu varyantları metin kontrastı için |
| İmza motif | Reflektif **hazard şeridi** (45° repeating-linear-gradient) — bölüm ayracı, hover altı çizgisi, ilerleme çubuğu |
| Ritim | Açık kâğıt bölümler arasında 2–3 koyu sinematik bant ("gece asfaltı") |
| Yasak | Emoji ikon, stok "AI slop" mavi gradyan, uydurma istatistik/yorum, sahte adres/koordinat |

---

## Fazlar

### Faz 0 — Keşif ve planlama ✅
- [x] Referans mimari incelemesi (İdil Sürücü Kursu Web — motion.ts, schema.ts, tokens.css deseni)
- [x] Kullanıcı Q&A (menzil, hizmet kapsamı, saatler, adres, görsel kaynağı)
- [x] ONAYLANMIŞ KARARLAR bloğu
- [x] `docs/` içerik ve tasarım planları
- [x] ROADMAP

### Faz 1 — İskelet ve tasarım sistemi ✅
- [x] Astro + Tailwind v4 + TS strict kurulumu
- [x] `src/styles/tokens.css` — renk, tipografi ölçeği, boşluk, gölge, easing, z-katman
- [x] `src/styles/global.css` — taban, buton/kart/prose desenleri, hazard şerit yardımcıları
- [x] `src/data/site.ts` — tek kaynak
- [x] `src/lib/motion.ts` — hareket motoru (reveal, depth, word-light, marquee, counter, magnetic, sticky sekans)
- [x] `src/lib/schema.ts` — JSON-LD üreticileri (yalnız doğrulanmış veri)
- [x] `src/layouts/Base.astro` — canonical, OG, Twitter, JSON-LD graf, skip link

### Faz 2 — Çekirdek bileşenler ✅
- [x] `Header.astro` (yapışkan, koyu/açık varyant, mobil menü, focus trap)
- [x] `Footer.astro` (NAP, sütunlar, Digitalpedi imzası)
- [x] `MobileContactBar.astro` (≤980px sticky Ara + WhatsApp, safe-area)
- [x] `Hero.astro`, `PageHero.astro`, `SectionHead.astro`, `CtaBand.astro`
- [x] `Figure.astro` (AVIF/WebP `<picture>`, CLS güvenli)
- [x] `Faq.astro`, `Marquee.astro`, `Sequence.astro`, `ServiceCard.astro`, `AreaCard.astro`, `Icon.astro`, `Brand.astro`, `Breadcrumbs.astro`

### Faz 3 — İçerik altyapısı ve sayfalar ✅
- [x] Content Collections şeması (`hizmetler`, `bolgeler`, `rehber`)
- [x] 6 hizmet sayfası + hub
- [x] 4 bölge sayfası + hub
- [x] Anasayfa, Kurumsal, Süreç, S.S.S., İletişim
- [x] Rehber hub + 8 makale
- [x] 404, KVKK, Gizlilik

### Faz 4 — Görsel pipeline ✅
- [x] Pexels'ten lisanslı görsel toplama (`media-src/`)
- [x] `scripts/process-media.mjs` — sharp ile AVIF + WebP + boyut varyantları
- [x] OG görseli üretimi
- [x] favicon / apple-touch-icon / webmanifest

### Faz 5 — SEO paketi ✅
- [x] JSON-LD graf: `AutomotiveBusiness` + `WebSite` + `BreadcrumbList` + `FAQPage` + `Service`
- [x] `@astrojs/sitemap` (404 filtreli) + `robots.txt` + `llms.txt`
- [x] Sayfa başına benzersiz title/description, H1 hiyerarşisi
- [x] İç bağlantı ağı: hizmet ↔ bölge ↔ rehber çapraz bağları
- [x] `public/_headers` — cache + güvenlik başlıkları

### Faz 6 — Doğrulama ✅
- [x] `npm run build` temiz (astro check dahil)
- [x] Tarayıcı testi: konsol hatası yok, 375 / 768 / 1024 / 1440 responsive
- [x] Erişilebilirlik: kontrast, focus, klavye, `prefers-reduced-motion`
- [x] Bağlantı denetimi (kırık iç link yok)

### Faz 7 — Yayın
- [x] GitHub repo + push
- [x] Cloudflare Pages projesi + direct-upload deploy (`npm run deploy`)
- [x] `toroslar.digitalpedi.com` custom domain Pages projesine eklendi
- [ ] **DNS CNAME kaydı** — `toroslar` → `toroslar-arac-kurtarma.pages.dev` (wrangler token'ında `dns_records:edit` yok, panelden eklenecek)
- [ ] Gerçek domain bağlanınca canonical güncelle — **müşteri domaini beklemede**

---

## Devir notları

### 2026-09-03 — Faz 0-7 (tek session)

**Yapıldı**
Proje sıfırdan kuruldu. 30 sayfa: 6 hizmet, 4 bölge, 8 rehber makalesi,
kurumsal, süreç, S.S.S., iletişim, KVKK, gizlilik, 404.
Tasarım sistemi "Asfalt & Amber" (tokens.css), ikaz şeridi imza motifi,
GSAP hareket motoru, 22 Pexels görseli AVIF/WebP/JPEG boru hattından geçti,
JSON-LD grafı + sitemap + robots + llms.txt + _headers.
GitHub reposu açıldı ve pushlandı. Cloudflare Pages projesi kuruldu, ilk
deploy yapıldı, custom domain projeye eklendi.

**Yol boyunca değişen üç teknik karar (gerekçeleriyle)**
1. **Lenis kaldırıldı.** Her karede `scrollTop`'u kendi hedefine geri yazıyor;
   `scrollIntoView`, geri/ileri konum geri yükleme ve programatik scroll
   bozuluyordu. Sinematik his reveal + parallax katmanından geliyor.
2. **Reveal'lar ScrollTrigger yerine IntersectionObserver.** Sticky bölümler
   varken ScrollTrigger'ın başlangıç noktaları bayatlayıp içeriği görünmez
   bırakıyordu. Parallax ve scrub efektleri ScrollTrigger'da kaldı.
3. **Pin yerine sticky.** `ScrollTrigger.pin` pin-spacer üretip düzeni
   kaydırıyordu; `position: sticky` aynı etkiyi bedelsiz veriyor.

**Doğrulama**
`npm run build` temiz (astro check dahil).
`npm run qa` üretim derlemesine karşı 4 kırılma noktasında (375/768/1024/1440)
sorunsuz: konsol hatası yok, yatay taşma yok, görünmez kalan reveal yok,
kırık iç link yok, title/description benzersiz, tek h1, başlık hiyerarşisi
düzgün, tüm görsellerde alt, tüm sayfalarda canonical, JSON-LD ayrıştırılabilir.
`*.pages.dev` Türkiye'den engelli olduğu için canlı doğrulama custom domain
aktifleşince tekrarlanmalı.

**Yarım kalan / kilitli**
- **DNS kaydı** — wrangler OAuth token'ında `dns_records:edit` izni yok.
  Cloudflare panelinden `digitalpedi.com` → DNS → CNAME `toroslar` →
  `toroslar-arac-kurtarma.pages.dev` (Proxied) eklenmeli.
- **Gerçek müşteri domaini** belli değil; canonical `toroslar.digitalpedi.com`.
- **Site şu anda noindex** (demo modu). `site.ts` → `indexable: true` ve
  `_headers` → `X-Robots-Tag` satırının silinmesiyle açılır.
- **E-posta adresi yok**; iletişim yalnız telefon + WhatsApp.
- **Google Business Profile yok.** Harita paketinde görünmek için şart —
  müşteriye bildirilmeli. Açılınca `schema.ts` içine `sameAs` ve `hasMap`
  eklenebilir.

**Sıradaki session'ın ilk işi**
1. DNS kaydını ekle, `npm run qa https://toroslar.digitalpedi.com` çalıştır.
2. Müşteri onayı gelirse `indexable: true` yap, `X-Robots-Tag` satırını sil,
   `npm run deploy`.
3. Gerçek domain gelirse `docs/DEPLOY.md` içindeki 4 adımlık listeyi uygula.
