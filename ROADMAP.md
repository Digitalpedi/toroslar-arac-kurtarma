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
| Hareket | GSAP + ScrollTrigger + Lenis, `src/lib/motion.ts` data-attribute API |
| İçerik | Astro Content Collections (zod şemalı md) — `hizmetler`, `bolgeler`, `rehber` |
| Tek kaynak | `src/data/site.ts` — NAP, nav, tel, whatsappUrl, hizmet bölgeleri |
| Fontlar | `@fontsource-variable/bricolage-grotesque` (display) · `@fontsource-variable/ibm-plex-sans` (gövde) · `@fontsource/ibm-plex-mono` (teknik etiket) — self-host, CDN yok |
| Görseller | Pexels (ücretsiz lisans) → `scripts/process-media.mjs` → AVIF + WebP `<picture>`, width/height ile CLS önleme |
| Canonical | `https://toroslar.digitalpedi.com` — gerçek domain gelince `astro.config.mjs` + `src/data/site.ts` içinde tek satır değişir |
| Deploy | Cloudflare Pages, git-bağlı. `*.pages.dev` Türkiye'de engelli → custom domain zorunlu |
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

### Faz 1 — İskelet ve tasarım sistemi
- [ ] Astro + Tailwind v4 + TS strict kurulumu
- [ ] `src/styles/tokens.css` — renk, tipografi ölçeği, boşluk, gölge, easing, z-katman
- [ ] `src/styles/global.css` — taban, buton/kart/prose desenleri, hazard şerit yardımcıları
- [ ] `src/data/site.ts` — tek kaynak
- [ ] `src/lib/motion.ts` — hareket motoru (reveal, depth, word-light, marquee, counter, magnetic, pinned sekans)
- [ ] `src/lib/schema.ts` — JSON-LD üreticileri (yalnız doğrulanmış veri)
- [ ] `src/layouts/Base.astro` — canonical, OG, Twitter, JSON-LD graf, skip link

### Faz 2 — Çekirdek bileşenler
- [ ] `Header.astro` (yapışkan, koyu/açık varyant, mobil menü, focus trap)
- [ ] `Footer.astro` (NAP, sütunlar, Digitalpedi imzası)
- [ ] `MobileContactBar.astro` (≤980px sticky Ara + WhatsApp, safe-area)
- [ ] `Hero.astro`, `PageHero.astro`, `SectionHead.astro`, `CtaBand.astro`
- [ ] `Figure.astro` (AVIF/WebP `<picture>`, CLS güvenli)
- [ ] `Faq.astro`, `Marquee.astro`, `StepFlow.astro`, `ServiceCard.astro`, `AreaCard.astro`

### Faz 3 — İçerik altyapısı ve sayfalar
- [ ] Content Collections şeması (`hizmetler`, `bolgeler`, `rehber`)
- [ ] 6 hizmet sayfası + hub
- [ ] 4 bölge sayfası + hub
- [ ] Anasayfa, Kurumsal, Süreç, S.S.S., İletişim
- [ ] Rehber hub + 8 makale
- [ ] 404, KVKK, Gizlilik

### Faz 4 — Görsel pipeline
- [ ] Pexels'ten lisanslı görsel toplama (`media-src/`)
- [ ] `scripts/process-media.mjs` — sharp ile AVIF + WebP + boyut varyantları
- [ ] OG görseli üretimi
- [ ] favicon / apple-touch-icon / webmanifest

### Faz 5 — SEO paketi
- [ ] JSON-LD graf: `AutomotiveBusiness` + `WebSite` + `BreadcrumbList` + `FAQPage` + `Service`
- [ ] `@astrojs/sitemap` (404 filtreli) + `robots.txt` + `llms.txt`
- [ ] Sayfa başına benzersiz title/description, H1 hiyerarşisi
- [ ] İç bağlantı ağı: hizmet ↔ bölge ↔ rehber çapraz bağları
- [ ] `public/_headers` — cache + güvenlik başlıkları

### Faz 6 — Doğrulama
- [ ] `npm run build` temiz (astro check dahil)
- [ ] Tarayıcı testi: konsol hatası yok, 375 / 768 / 1024 / 1440 responsive
- [ ] Erişilebilirlik: kontrast, focus, klavye, `prefers-reduced-motion`
- [ ] Bağlantı denetimi (kırık iç link yok)

### Faz 7 — Yayın
- [ ] GitHub repo + push
- [ ] Cloudflare Pages git-bağlı deploy
- [ ] `toroslar.digitalpedi.com` custom domain
- [ ] Gerçek domain bağlanınca canonical güncelle — **müşteri domaini beklemede**

---

## Devir notları

### 2026-09-03 — Faz 0-7 (tek session)
**Yapıldı:** Proje sıfırdan kuruldu ve yayına alındı. 27 sayfa, 6 hizmet + 4 bölge + 8 rehber makalesi.
Tasarım sistemi "Asfalt & Amber" tokenları, hazard şerit imza motifi, GSAP hareket motoru.
**Doğrulama:** `npm run build` temiz; tarayıcıda 4 kırılma noktası ve konsol kontrol edildi.
**Yarım kalan:** Gerçek müşteri domaini henüz belli değil — canonical `toroslar.digitalpedi.com`.
E-posta adresi yok; iletişim yalnız tel + WhatsApp.
**Sıradaki session'ın ilk işi:** Müşteri domaini gelirse `astro.config.mjs` + `src/data/site.ts`
içindeki `url` değerini değiştir, CF Pages'te custom domain ekle, sitemap'i Search Console'a gönder.
