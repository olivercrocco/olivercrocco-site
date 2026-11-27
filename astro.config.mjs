// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';

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
  integrations: [
    // /claude-assistant is reachable by link but not listed or indexed.
    sitemap({ filter: (page) => !page.includes('/claude-assistant') }),
    mdx(),
    // React renders a few interactive pieces (search, publication tabs, card deck).
    // They are hydrated by bundled scripts, never by Astro's inline island loader,
    // so the strict script-src 'self' CSP still holds. See src/components/interactive/.
    react(),
  ],
});