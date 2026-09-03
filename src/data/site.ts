/**
 * TEK KAYNAK (single source of truth)
 * NAP, iletişim, navigasyon, hizmet bölgeleri, CTA metinleri.
 *
 * dataStatus: 'confirmed'    → müşteriden/resmî kaynaktan doğrulandı, şemaya girer
 *             'needs-review' → makul varsayım, teyit bekliyor, ŞEMAYA GİRMEZ
 *             'placeholder'  → içerik hazırlanıyor, arayüzde gösterilmez
 *
 * KİLİT KURAL: Bu işletmenin fiziksel adresi ve Google Business Profile kaydı
 * YOKTUR. Şemaya sahte `PostalAddress` veya koordinat YAZILMAZ — yanlış
 * yapılandırılmış veri, hiç veri olmamasından daha zararlıdır.
 */

export type DataStatus = 'confirmed' | 'needs-review' | 'placeholder';

const RAW_PHONE = '+905346030233';
const WA_NUMBER = '905346030233';

export const site = {
  /** Marka */
  name: 'Toroslar Araç Kurtarma',
  shortName: 'Toroslar Kurtarma',
  legalName: 'Toroslar Araç Kurtarma',
  tagline: 'Mersin’de yolda kalma, tek çağrı yeter.',
  /** Mersin plaka kodu — marka imzası olarak kullanılıyor */
  plateCode: '33',

  /** Canonical domain — müşteri domainine geçişte astro.config.mjs ile birlikte güncellenir */
  url: 'https://toroslar.digitalpedi.com',

  /**
   * Fiziksel adres YOK — mobil hizmet işletmesi.
   * Şemada `areaServed` kullanılır, `address` düğümü hiç üretilmez.
   */
  hasPhysicalAddress: false,

  phone: {
    display: '0534 603 02 33',
    href: `tel:${RAW_PHONE}`,
    e164: RAW_PHONE,
    status: 'confirmed' as DataStatus,
  },

  /** WhatsApp — ön dolu Türkçe mesaj */
  whatsapp: {
    number: WA_NUMBER,
    url:
      `https://wa.me/${WA_NUMBER}?text=` +
      encodeURIComponent(
        'Merhaba, aracım yolda kaldı. Toroslar Araç Kurtarma’dan çekici talep etmek istiyorum. Konumum: ',
      ),
    display: 'WhatsApp’tan yaz',
    status: 'confirmed' as DataStatus,
  },

  /** 7/24 — müşteri tarafından doğrulandı, şemaya yazılır */
  hoursConfirmed: true,
  hoursLabel: '7/24 kesintisiz',
  hoursNote: 'Gece, hafta sonu ve resmî tatiller dâhil — telefon her saat açık.',

  /** E-posta henüz yok — arayüzde gösterilmez, şemaya yazılmaz */
  email: {
    display: '',
    href: '',
    status: 'placeholder' as DataStatus,
  },

  /** Sosyal hesap doğrulanmadı — `sameAs` üretilmez */
  social: [] as { label: string; url: string; status: DataStatus }[],

  primaryCta: {
    label: 'Hemen Ara',
  },

  /** Site geneli tek satırlık konum ifadesi */
  areaLabel: 'Mersin şehir içi',
} as const;

/** Ana navigasyon */
export const nav = [
  { label: 'Hizmetler', href: '/hizmetler/' },
  { label: 'Bölgeler', href: '/bolgeler/' },
  { label: 'Nasıl Çalışır', href: '/surec/' },
  { label: 'Kurumsal', href: '/kurumsal/' },
  { label: 'Rehber', href: '/rehber/' },
  { label: 'İletişim', href: '/iletisim/' },
] as const;

/** Hizmet bölgeleri — Mersin merkez ilçeleri. Bölge sayfalarının tek kaynağı. */
export const districts = [
  {
    slug: 'toroslar-cekici',
    district: 'Toroslar',
    title: 'Toroslar Çekici',
    short: 'Halkkent’ten Gözne yoluna kadar Toroslar’ın tamamı.',
  },
  {
    slug: 'yenisehir-cekici',
    district: 'Yenişehir',
    title: 'Yenişehir Çekici',
    short: 'Palmiye’den Çiftlikköy’e, sahil şeridi ve bulvarlar.',
  },
  {
    slug: 'mezitli-cekici',
    district: 'Mezitli',
    title: 'Mezitli Çekici',
    short: 'Viranşehir, Davultepe ve Tece hattı.',
  },
  {
    slug: 'akdeniz-cekici',
    district: 'Akdeniz',
    title: 'Akdeniz Çekici',
    short: 'Liman, Çamlıbel ve doğu sanayi bölgesi.',
  },
] as const;

/** Footer sütunları */
export const footerNav = [
  {
    title: 'Hizmetler',
    links: [
      { label: 'Oto Çekici', href: '/hizmetler/oto-cekici/' },
      { label: 'Hafif Ticari Araç Kurtarma', href: '/hizmetler/hafif-ticari-arac-kurtarma/' },
      { label: 'Kaza Sonrası Araç Kurtarma', href: '/hizmetler/kaza-sonrasi-arac-kurtarma/' },
      { label: 'Arızalı Araç Taşıma', href: '/hizmetler/arizali-arac-tasima/' },
      { label: 'Kapalı Otopark Kurtarma', href: '/hizmetler/kapali-otopark-kurtarma/' },
      { label: 'Şehir İçi Araç Nakli', href: '/hizmetler/sehir-ici-arac-nakli/' },
    ],
  },
  {
    title: 'Bölgeler',
    links: [
      { label: 'Toroslar Çekici', href: '/bolgeler/toroslar-cekici/' },
      { label: 'Yenişehir Çekici', href: '/bolgeler/yenisehir-cekici/' },
      { label: 'Mezitli Çekici', href: '/bolgeler/mezitli-cekici/' },
      { label: 'Akdeniz Çekici', href: '/bolgeler/akdeniz-cekici/' },
    ],
  },
  {
    title: 'Kurumsal',
    links: [
      { label: 'Hakkımızda', href: '/kurumsal/' },
      { label: 'Nasıl Çalışır', href: '/surec/' },
      { label: 'Rehber', href: '/rehber/' },
      { label: 'Sıkça Sorulan Sorular', href: '/sss/' },
      { label: 'İletişim', href: '/iletisim/' },
    ],
  },
  {
    title: 'Yasal',
    links: [
      { label: 'KVKK Aydınlatma Metni', href: '/kvkk-aydinlatma-metni/' },
      { label: 'Gizlilik Politikası', href: '/gizlilik-politikasi/' },
    ],
  },
] as const;

/**
 * Yerel SEO iç bağlantı sinyali — Mersin merkezinde sık geçen mahalle,
 * bulvar ve kavşak adları. Marquee ve bölge sayfalarında kullanılır.
 */
export const localSpots = [
  'Halkkent',
  'Yalınayak',
  'Osmaniye',
  'Güneş',
  'Çukurova',
  'Gözne yolu',
  'Palmiye',
  'Barbaros',
  'Menteş',
  'Çiftlikköy',
  'Limonluk',
  'Güvenevler',
  'Viranşehir',
  'Davultepe',
  'Tece',
  'Soli',
  'Çamlıbel',
  'Kiremithane',
  'Mesudiye',
  'Karaduvar',
  'GMK Bulvarı',
  'İsmet İnönü Bulvarı',
  'Adnan Menderes Bulvarı',
  'D-400 karayolu',
  'Mersin Çevre Yolu',
] as const;

/** Telefon numarasını okunur biçimde parçalayan yardımcı — Header’da kullanılır */
export const phoneParts = site.phone.display.split(' ');
