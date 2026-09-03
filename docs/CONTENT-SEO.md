# İçerik ve SEO planı

## Arama niyeti haritası

Bu iş kolunda arama yapan kişi üç farklı durumdan birinde:

| Durum | Niyet | Hedef sayfa |
|---|---|---|
| **Acil** — araç şu an yolda | "mersin çekici", "yakınımdaki çekici" | Anasayfa, bölge sayfaları |
| **Karar** — hangi hizmet gerekli | "otomatik vitesli araç çekilir mi", "kaza sonrası çekici" | Hizmet sayfaları |
| **Bilgi** — sonra lazım olacak | "yolda kalınca ne yapmalı", "çekici ücreti" | Rehber yazıları |

Acil durumdaki kişi metin okumaz — **telefon numarası her ekranda görünür**
olmalı. Bu yüzden: header'da amber telefon butonu, ≤980px'de sabit alt bar,
her sayfa sonunda CTA bandı, her hizmet/bölge sayfasında yapışkan yan kutu.

## Sayfa mimarisi

```
/                                   Anasayfa — acil + genel
/hizmetler/                         Hub
  /oto-cekici/                      Binek araç
  /hafif-ticari-arac-kurtarma/      Panelvan, kamyonet, minibüs
  /kaza-sonrasi-arac-kurtarma/      Kaza
  /arizali-arac-tasima/             Arıza
  /kapali-otopark-kurtarma/         Dar alan
  /sehir-ici-arac-nakli/            Planlı nakil
/bolgeler/                          Hub
  /toroslar-cekici/                 4 merkez ilçe
  /yenisehir-cekici/
  /mezitli-cekici/
  /akdeniz-cekici/
/surec/                             Nasıl çalışır (HowTo)
/kurumsal/                          Hakkımızda + künye
/sss/                               4 gruplu S.S.S. (FAQPage)
/iletisim/                          Kanallar + hazırlık listesi
/rehber/                            Hub
  8 makale                          Bilgi niyeti, uzun kuyruk
/kvkk-aydinlatma-metni/
/gizlilik-politikasi/
/404/                               noindex
```

**30 sayfa.** Her hizmet ↔ her bölge ↔ ilgili rehber yazıları çapraz bağlı.

## İç bağlantı ağı

- Hizmet detayı → 4 bölge sayfası (chip listesi) + 3 ilgili hizmet
- Bölge detayı → 6 hizmet sayfası + 3 diğer bölge
- Rehber detayı → 2 ilgili rehber + hizmet sayfalarına gövde içi bağlantılar
- Anasayfa → 6 hizmet + 4 bölge + 3 rehber
- Footer → 4 sütun, tüm sayfalar erişilebilir

Sonuç: hiçbir sayfa 2 tıktan uzakta değil.

## Yapılandırılmış veri (JSON-LD)

Üretici: `src/lib/schema.ts`. Her sayfada `@graph` içinde:

| Düğüm | Nerede | Not |
|---|---|---|
| `AutomotiveBusiness` + `LocalBusiness` | Tüm sayfalar | `address` **yok** — `areaServed` var |
| `WebSite` | Tüm sayfalar | |
| `BreadcrumbList` | Anasayfa hariç | |
| `Service` | Hizmet + bölge + hub | Bölgede `areaServed` ilçeye daralır |
| `FAQPage` | FAQ olan her sayfa | |
| `HowTo` | `/surec/`, anasayfa | |
| `Article` | Rehber yazıları | |
| `ItemList` | Hub sayfaları | |
| `OpeningHoursSpecification` | 7/24 — Pzt–Paz 00:00–23:59 | Müşteri onayladı |

**Bilinçli olarak YAZILMAYANLAR:** `PostalAddress`, `geo`, `aggregateRating`,
`review`, `sameAs`, `priceSpecification`, `foundingDate`, `numberOfEmployees`.
Hiçbiri doğrulanmadı. Yanlış yapılandırılmış veri, hiç veri olmamasından
daha zararlıdır.

## Başlık ve açıklama kuralları

- `<title>` ≤ 70 karakter, sayfa başına benzersiz, marka sonda
- `<meta description>` ≤ 175 karakter, benzersiz, eylem içerir
- Her sayfada tek `h1`, başlık hiyerarşisinde seviye atlaması yok
- Anahtar kelime `h1` içinde doğal biçimde geçer, zorlanmaz

`npm run qa` bu dördünü de otomatik denetler.

## Yerel SEO

Google Business Profile **yok** — bu ciddi bir eksik ve müşteriye bildirilmeli.
GBP olmadan harita paketinde (local pack) görünmek mümkün değil. Site tarafında
yapılabilecek her şey yapıldı:

- `geo.region: TR-33`, `geo.placename: Mersin` meta etiketleri
- `areaServed` şemada 4 merkez ilçe olarak tanımlı
- Bölge sayfalarında doğrulanabilir mahalle ve bulvar adları
- Anasayfa ve bölge hub'ında mahalle/bulvar marquee'si (`localSpots`)
- NAP tek kaynaktan (`site.ts`) türer; telefon her yerde `tel:` bağlantılı

**Sonraki adım (müşteri işi):** Google Business Profile açılması. Açıldığında
`sameAs` ve `hasMap` alanları `schema.ts` içine eklenebilir.

## AI arama görünürlüğü

`public/llms.txt` — işletme gerçekleri, yapılan/yapılmayan işler, sayfa
haritası ve sık soruların kısa cevapları. Dil modelleri bu dosyadan doğrudan
alıntılanabilir cümleler bulur. Domain değişince içindeki mutlak bağlantılar
güncellenmeli.

## Rehber yazıları

| Yazı | Kategori | Hedef |
|---|---|---|
| Aracınız yolda kaldığında ilk 5 dakika | Acil durum | Geniş bilgi araması |
| Otomatik vitesli araç nasıl çekilir | Teknik | Yüksek niyetli teknik soru |
| Çekici mi, kurtarma mı | Teknik | Terim karışıklığı |
| Kaza sonrası tutanak ve çekici süreci | Süreç | Kaza sonrası arama |
| Yol kenarında güvenlik | Güvenlik | Bilgi + güven |
| Elektrikli araç çekilirken dikkat | Teknik | Büyüyen segment |
| Çekici ücretini ne belirler | Süreç | Fiyat araması |
| Kapalı otoparkta kalan araç | Teknik | Şehir içine özgü uzun kuyruk |
| Sürmeyi bırakmanız gereken 7 uyarı | Güvenlik | Geniş bilgi araması |

Her yazıda: özet, içindekiler (h2'lerden otomatik), FAQ bloğu (`FAQPage`),
ilgili yazılar, yapışkan çağrı kutusu.

## İçerik yazım ilkeleri

1. **Somut ol.** "Kaliteli hizmet" yerine "dört tekerlek de yerden kesilir".
2. **Sınırı söyle.** Yapılmayan işler açıkça listelenir; bu güven üretir.
3. **Sayı uydurma.** Doğrulanmamış hiçbir rakam yazılmaz.
4. **Sıra ver.** Acil durumda okuyan kişi liste okur, paragraf okumaz.
5. **Teknik nedeni açıkla.** "Kayar kasa kullanıyoruz" değil, "şanzımanın yağ
   pompası motora bağlı olduğu için".
6. **Türkçe tipografi.** Tırnak `“ ”`, kesme `’`, uzun tire `—`, üç nokta `…`.
