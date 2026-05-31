# olivercrocco.com — project guide

Personal academic site for Oliver S. ("Ozzie") Crocco. Static **Astro 6 + Tailwind**,
deployed to **Netlify** (auto-deploys on push to `main`). No backend, no server-side
rendering at request time. The one dynamic feature is the client-side **Reviewer Finder**
(`/reviewer-finder`), which calls the public OpenAlex API from the browser.

## Running and building

```bash
npm run dev      # local dev server (.claude/launch.json drives the preview tool)
npm run build    # static build into dist/ — exactly what Netlify runs
```

There are no unit tests; verify changes by building (`npm run build`) and, for the live
site, curling the deployed URL after pushing.

## Layout

- `src/pages/` — one file per route (`index`, `about`, `books`, `publications`, `speaking`,
  `notes/`, `tools`, `reviewer-finder`, `contact`).
- `src/layouts/BaseLayout.astro`, `src/components/`, `src/site.config.ts` (single source of
  truth for nav + author/social info), `src/lib/reviewerFinder.js` (the browser tool's logic).
- `netlify.toml` (build config + security headers), `astro.config.mjs`.

## Security: enforced Content-Security-Policy (important)

The site serves an **enforcing** `Content-Security-Policy` (header in `netlify.toml`).
Scripts are emitted as external `/_astro/` files via `astro.config.mjs`
(`vite.build.assetsInlineLimit: 0`), so `script-src 'self'` covers them with no per-script
hashes.

**GOTCHA:** the policy only allows resources from an allowlist (self, Google Fonts,
`api.openalex.org`). If you add anything that loads from another origin — an analytics
snippet, a different font/CDN, an embedded image/video/iframe, a new API the browser calls —
**add its origin to the CSP in `netlify.toml`, or the browser silently blocks it.** Don't add
inline `<script>` blocks (they'd be blocked; let Astro bundle a `<script>` or use an external
file). The Reviewer Finder only renders external links whose scheme is `https:` — keep that
guard.

## Conventions

- Keep prose in the site owner's established voice: plain and specific, no em-dash-heavy AI
  tells, no defining-by-negation.
- `style-src` keeps `'unsafe-inline'` for the many inline `style="..."` attributes — fine to
  keep using those.
