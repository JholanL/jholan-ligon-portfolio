// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Set SITE_URL when deploying (e.g. https://your-domain.dev) to enable canonical URLs and the sitemap.
const site = process.env.SITE_URL || undefined;

export default defineConfig({
  site,
  integrations: site ? [sitemap()] : [],
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'auto' },
  image: {
    // Quality tuned for UI screenshots: text stays crisp, files stay small.
    service: { entrypoint: 'astro/assets/services/sharp', config: { limitInputPixels: false } },
  },
  vite: {
    build: { assetsInlineLimit: 0 },
  },
});
