// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://olivercrocco.com',
  vite: {
    plugins: [tailwindcss()],
    // Emit every script as an external file (never inline a <script>), so a strict
    // Content-Security-Policy with `script-src 'self'` covers them all without
    // per-script hashes — and stays correct as the site grows.
    build: { assetsInlineLimit: 0 },
  },
  integrations: [sitemap(), mdx()],
});