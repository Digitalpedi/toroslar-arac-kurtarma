# Marka ve tasarım sistemi — "Asfalt & Amber"

## Kısa özet

Toroslar Araç Kurtarma bir acil hizmet markası. Site açık temalı ama sinematik:
gündüz kireçtaşı zemini ile gece asfaltı bantları arasında ritim kurar, tek bir
yüksek enerjili sinyal rengi kullanır — ikaz lambası amberi.

| Katman | Karar | Neden |
|---|---|---|
| Zemin | Soğuk kireçtaşı beyazı (`stone`) | Toros kireçtaşı; ferah, okunaklı, "ucuz beyaz" değil |
| Mürekkep | Asfalt siyahı (`ink`) | Gece yolu; koyu bantlar sinematik ritmi taşır |
| Sinyal | İkaz lambası amberi (`amber`) | Sektörün doğal kodu: sarı-turuncu ikaz, reflektif şerit |
| İmza motif | 45° **ikaz şeridi** (hazard) | Ayraç, hover altı çizgisi, ilerleme çubuğu, logo |

## Renk

Tanım yeri: `src/styles/tokens.css`. **Başka hiçbir yerde renk sabiti yazılmaz.**

| Token | Hex | Kullanım | Kontrast |
|---|---|---|---|
| `--color-stone-0` | `#fafbf9` | Kart yüzeyi | — |
| `--color-stone-1` | `#eff1ec` | Sayfa zemini | — |
| `--color-stone-2` | `#e4e7e0` | Alternatif bant | — |
| `--color-stone-3` | `#d3d7cd` | Kenarlık, ayraç | — |
| `--color-ink-900` | `#0d1110` | Başlık, koyu bant | 16.7:1 |
| `--color-ink-700` | `#2f3634` | Gövde metni | 10.9:1 |
| `--color-ink-600` | `#4e5754` | İkincil metin | 6.6:1 |
| `--color-ink-500` | `#666f6b` | Susturulmuş etiket | 4.6:1 (AA sınırı) |
| `--color-ink-fg` | `#eff1ec` | Koyu bant üzeri metin | 16.7:1 |
| `--color-ink-fg-muted` | `#9aa3a0` | Koyu bant ikincil | 7.4:1 |
| `--color-amber-400` | `#ffa724` | Koyu zeminde link/vurgu | 9.8:1 |
| `--color-amber-500` | `#f08a00` | **Marka** — buton zemini | ink-900 metinle 7.6:1 |
| `--color-amber-600` | `#c46a00` | Hover dolgusu, ikon | 3.4:1 (yalnız grafik) |
| `--color-amber-700` | `#955000` | Açık zeminde link/küçük metin | 5.4:1 |

**Kural:** Amber asla açık zeminde küçük metin rengi olarak `500` tonuyla
kullanılmaz — `700` kullanılır. Amber dolgu üzerine daima `ink-900` metin gelir
(trafik tabelası mantığı).

## Tipografi

| Rol | Aile | Ayar |
|---|---|---|
| Display | Bricolage Grotesque Variable | wght 200–800, wdth 75–100 |
| Gövde | IBM Plex Sans Variable | wght 100–700 |
| Üstveri | IBM Plex Mono 500 | Saat, telefon, adım numarası, plaka |

Genişlik ekseni hiyerarşinin taşıyıcısı:

- **Kicker** → `font-stretch: 78%` — kondens, versal, teknik telsiz etiketi
- **Gövde/buton** → `92%`
- **Başlık** → `100%` — tam genişlik, monümental

Ölçek `tokens.css` içinde `clamp()` ile akışkan. Satır yükseklikleri Türkçe
**İ, Ş, Ğ** işaretlerine yer bırakacak şekilde belirlendi; daha sıkı değerler
İ noktasını kırpar.

## İkaz şeridi (imza motif)

```css
--hazard:      repeating-linear-gradient(-45deg, amber 0 12px, ink 12px 24px);
--hazard-fine: repeating-linear-gradient(-45deg, amber 0 6px,  ink 6px 12px);
```

Kullanıldığı yerler — hepsi aynı açı ve adımda:

- `.hazard-bar` — bölüm ayracı (hero altı, footer üstü, 404)
- `.kicker::before` — her kicker'ın önündeki kısa şerit
- `.card--hazard::before` — hover'da soldan sağa dolan üst çizgi
- `.seq__progress-fill` — adım sekansı ilerleme çubuğu
- `.contact-bar::before` — mobil alt barın üst kenarı
- Logo işareti — motifin damıtılmış hâli (3 eğik çubuk)

**Kural:** Motif seyrek kullanılır. Aynı ekranda ikiden fazla büyük hazard
yüzeyi görünmemeli; imza olmaktan çıkıp gürültüye dönüşür.

## Hareket

Motor: `src/lib/motion.ts`, data-attribute API. Kod tarafında JS yazılmaz.

| Öznitelik | Etki |
|---|---|
| `data-reveal="up\|left\|right\|scale"` | Tekil giriş |
| `data-reveal-group` | Çocuklarını sırayla açar |
| `data-clip-reveal` | Aşağıdan yukarı clip-path doğuşu |
| `data-line-reveal` | Satır satır maskeli açılış |
| `data-word-light` | Scroll ile kelime kelime aydınlanan metin |
| `data-parallax` / `data-depth` | Derinlik katmanları |
| `data-hero-zoom` | Hero görselinin yavaş uzaklaşması |
| `data-marquee` | Sonsuz şerit |
| `data-sequence` | Sticky başlıklı adım sekansı |
| `data-magnetic` / `data-tilt` | İmleç etkileşimi (yalnız ince işaretçi) |

**Kararlar ve gerekçeleri:**

- **Reveal'lar IntersectionObserver ile** çalışır, ScrollTrigger ile değil.
  Sticky bölümler ve programatik scroll varken ScrollTrigger'ın başlangıç
  noktaları bayatlayıp içeriği görünmez bırakabiliyordu.
- **Yumuşak scroll kütüphanesi (Lenis) kullanılmıyor.** Her karede `scrollTop`'u
  kendi hedefine geri yazdığı için `scrollIntoView`, geri/ileri konum geri
  yükleme ve sayfa içi arama bozuluyor. Sinematik his reveal + parallax
  katmanından geliyor.
- **Pin yok, sticky var.** `position: sticky` düzen kaydırmaz, pin-spacer
  üretmez, mobilde bedavaya kapanır.
- `prefers-reduced-motion` tam destekli; JS çalışmazsa içerik **asla** gizli
  kalmaz (`motion-ready` sınıfı güvenlik ağı + gecikmeli sweep).

## Yasaklar

- Emoji ikon — SVG ikon seti kullanılır (`src/lib/icons.ts`)
- Mavi/mor gradyan, generic "AI slop" estetiği
- Uydurma istatistik, sahte yorum, doğrulanmamış rozet
- Sahte adres, koordinat veya çalışma saati
- Hover'da düzen kaydıran `scale` dönüşümleri
- 44×44 px altında dokunma hedefi
