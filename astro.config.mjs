// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { rehypeTrSlug } from './scripts/rehype-tr-slug.mjs';

// NOT: `site` canonical/OG/sitemap mutlak URL'lerinin tek kaynağıdır.
// Müşteri kendi domainine geçtiğinde SADECE burası ve src/data/site.ts güncellenir.
export default defineConfig({
  site: 'https://toroslar.digitalpedi.com',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  markdown: {
    // Türkçe başlıklara ASCII çıpa. Astro'nun rehypeHeadingIds eklentisinden
    // ÖNCE çalışır; o da hazır id'yi korur ve aynı slug'ı headings dizisine
    // yazar — içindekiler listesi otomatik uyar. Detay: scripts/rehype-tr-slug.mjs
    rehypePlugins: [rehypeTrSlug],
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      changefreq: 'monthly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  vite: {
    // Cast: @tailwindcss/vite kendi vite tip sürümünü getiriyor, Astro'nunkiyle
    // yapısal olarak uyumlu ama nominal olarak farklı. Çalışma zamanında sorun yok.
    plugins: [/** @type {any} */ (tailwindcss())],
    build: {
      cssMinify: 'lightningcss',
    },
  },
});
