/**
 * JSON-LD graf üreticisi.
 *
 * KURAL: Yalnızca doğrulanmış veri şemaya girer.
 * Bu işletmenin fiziksel adresi, koordinatı, Google Business Profile kaydı,
 * puanı ve yorum sayısı YOKTUR — bu alanlar BİLİNÇLİ olarak dışarıda bırakıldı.
 * Yanlış yapılandırılmış veri, hiç veri olmamasından daha zararlıdır.
 */

import { site, districts } from '~/data/site';

const ORG_ID = `${site.url}/#kurum`;
const SITE_ID = `${site.url}/#website`;

type Json = Record<string, unknown>;

/** Mersin ve hizmet verilen merkez ilçeler */
function areaServed(): Json[] {
  return [
    { '@type': 'City', name: 'Mersin', address: { '@type': 'PostalAddress', addressRegion: 'Mersin', addressCountry: 'TR' } },
    ...districts.map((d) => ({
      '@type': 'AdministrativeArea',
      name: `${d.district}, Mersin`,
    })),
  ];
}

export function organizationNode(): Json {
  const node: Json = {
    '@type': ['AutomotiveBusiness', 'LocalBusiness'],
    '@id': ORG_ID,
    name: site.name,
    legalName: site.legalName,
    alternateName: site.shortName,
    url: `${site.url}/`,
    description:
      'Mersin şehir içinde 7/24 oto çekici ve araç kurtarma hizmeti. Binek ve hafif ticari araçlar için kayar kasa çekici ile kaza, arıza ve dar alan kurtarma.',
    telephone: site.phone.e164,
    /* Fiziksel adres yok — mobil hizmet işletmesi. `address` düğümü yazılmaz. */
    areaServed: areaServed(),
    serviceArea: {
      '@type': 'GeoShape',
      addressCountry: 'TR',
      description: 'Mersin il merkezi — Toroslar, Yenişehir, Mezitli, Akdeniz',
    },
    image: `${site.url}/og/toroslar-arac-kurtarma.png`,
    logo: `${site.url}/logo.png`,
    knowsLanguage: ['tr'],
    priceRange: '₺₺',
    slogan: site.tagline,
    availableLanguage: { '@type': 'Language', name: 'Türkçe', alternateName: 'tr' },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Acil çekici talebi',
      telephone: site.phone.e164,
      areaServed: 'TR-33',
      availableLanguage: 'tr',
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59',
      },
    },
  };

  // 7/24 müşteri tarafından doğrulandı
  if (site.hoursConfirmed) {
    node.openingHoursSpecification = [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59',
      },
    ];
  }

  const confirmedSocial = site.social.filter((s) => s.status === 'confirmed').map((s) => s.url);
  if (confirmedSocial.length) node.sameAs = confirmedSocial;

  return node;
}

export function websiteNode(): Json {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: `${site.url}/`,
    name: site.name,
    inLanguage: 'tr-TR',
    publisher: { '@id': ORG_ID },
  };
}

export function breadcrumbNode(trail: { name: string; href: string }[]): Json | null {
  if (trail.length < 2) return null;
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${site.url}${c.href}`,
    })),
  };
}

export function faqNode(faq: { q: string; a: string }[]): Json | null {
  if (!faq.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

/** Hizmet sayfaları için Service düğümü */
export function serviceNode(input: {
  name: string;
  description: string;
  path: string;
  serviceType?: string;
  areaName?: string;
}): Json {
  const url = `${site.url}${input.path}`;
  return {
    '@type': 'Service',
    '@id': `${url}#hizmet`,
    name: input.name,
    description: input.description,
    url,
    serviceType: input.serviceType ?? 'Araç kurtarma ve çekici hizmeti',
    provider: { '@id': ORG_ID },
    areaServed: input.areaName
      ? { '@type': 'AdministrativeArea', name: `${input.areaName}, Mersin` }
      : areaServed(),
    availableChannel: {
      '@type': 'ServiceChannel',
      servicePhone: { '@type': 'ContactPoint', telephone: site.phone.e164 },
      serviceUrl: `${site.url}/iletisim/`,
    },
    hoursAvailable: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
  };
}

/** Rehber makaleleri */
export function articleNode(input: {
  title: string;
  description: string;
  path: string;
  date: Date;
  updated?: Date;
  image?: string;
}): Json {
  const url = `${site.url}${input.path}`;
  const node: Json = {
    '@type': 'Article',
    '@id': `${url}#yazi`,
    headline: input.title,
    description: input.description,
    url,
    inLanguage: 'tr-TR',
    datePublished: input.date.toISOString(),
    dateModified: (input.updated ?? input.date).toISOString(),
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    mainEntityOfPage: url,
  };
  if (input.image) node.image = `${site.url}${input.image}`;
  return node;
}

/** "Nasıl çalışır" adımları için HowTo düğümü */
export function howToNode(input: {
  name: string;
  description: string;
  path: string;
  steps: { name: string; text: string }[];
}): Json {
  const url = `${site.url}${input.path}`;
  return {
    '@type': 'HowTo',
    '@id': `${url}#nasil`,
    name: input.name,
    description: input.description,
    inLanguage: 'tr-TR',
    step: input.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

/** Liste sayfaları için ItemList — hub sayfalarında iç bağlantı sinyali */
export function itemListNode(input: {
  path: string;
  items: { name: string; href: string }[];
}): Json {
  return {
    '@type': 'ItemList',
    '@id': `${site.url}${input.path}#liste`,
    itemListElement: input.items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: `${site.url}${it.href}`,
    })),
  };
}

/** Graf paketleyici — null düğümler elenir */
export function buildGraph(...nodes: (Json | null)[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes.filter(Boolean),
  };
}
