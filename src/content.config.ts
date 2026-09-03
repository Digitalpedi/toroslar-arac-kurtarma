import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/** Şemaya ve arayüze giren metnin doğrulama durumu */
const dataStatus = z.enum(['confirmed', 'needs-review', 'placeholder']).default('confirmed');

const faqItem = z.object({
  q: z.string(),
  a: z.string(),
});

const iconName = z.enum([
  'phone',
  'whatsapp',
  'arrow-up-right',
  'arrow-right',
  'arrow-down',
  'clock',
  'shield',
  'map-pin',
  'check',
  'truck',
  'chevron-down',
  'chevron-right',
  'menu',
  'close',
  'alert',
  'car',
  'van',
  'route',
  'wrench',
  'parking',
  'headset',
  'bolt',
  'file',
]);

const hizmetler = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/hizmetler' }),
  schema: z.object({
    title: z.string(),
    /** <title> etiketi — 60 karakteri aşmamalı */
    metaTitle: z.string(),
    description: z.string(),
    kicker: z.string(),
    /** Kart özeti */
    summary: z.string(),
    lead: z.string(),
    icon: iconName,
    order: z.number(),
    /** public/media altındaki görsel kökü */
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    /** Hizmetin kapsadığı somut durumlar */
    covers: z.array(z.string()).min(3),
    /** Kapsam DIŞI olan, karıştırılmaması gereken durumlar */
    notCovered: z.array(z.string()).default([]),
    faq: z.array(faqItem).default([]),
    related: z.array(z.string()).default([]),
    dataStatus,
  }),
});

const bolgeler = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/bolgeler' }),
  schema: z.object({
    district: z.string(),
    title: z.string(),
    metaTitle: z.string(),
    description: z.string(),
    kicker: z.string(),
    lead: z.string(),
    order: z.number(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    /** Doğrulanabilir mahalle / semt adları */
    neighborhoods: z.array(z.string()).min(4),
    /** Bilinen bulvar, kavşak, arter */
    routes: z.array(z.string()).default([]),
    /** Bu bölgede en sık karşılaşılan çağrı türleri */
    cases: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
    faq: z.array(faqItem).default([]),
    dataStatus,
  }),
});

const rehber = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/rehber' }),
  schema: z.object({
    title: z.string(),
    metaTitle: z.string(),
    description: z.string(),
    /** Liste kartında görünen kısa özet */
    summary: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.enum(['Acil durum', 'Teknik', 'Süreç', 'Güvenlik']),
    readingTime: z.number(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    faq: z.array(faqItem).default([]),
    related: z.array(z.string()).default([]),
    dataStatus,
  }),
});

export const collections = { hizmetler, bolgeler, rehber };
