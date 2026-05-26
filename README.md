# olivercrocco.com

Personal/professional site for [Oliver S. ("Ozzie") Crocco](https://www.lsu.edu/chse/slhrd/about/bios/crocco.php), Associate Professor of Leadership and Human Resource Development at Louisiana State University and Visiting Professor at Chulalongkorn University in Bangkok.

Built with [Astro](https://astro.build) + [Tailwind CSS v4](https://tailwindcss.com). Static site, deployed to Netlify, served from `https://olivercrocco.com`.

## Local development

```bash
npm install        # one-time, after cloning
npm run dev        # http://localhost:4321
npm run build      # production build into ./dist
npm run preview    # preview the production build locally
```

Node 22+ required.

## Project shape

```
src/
  components/      Reusable Astro components (Header, Footer, Fleuron)
  content/
    books/         One markdown file per book (frontmatter-driven cards)
  content.config.ts   Astro content-collections schema
  data/            Typed data files (publications, speaking, redirects)
  layouts/
    BaseLayout.astro  Site-wide HTML shell + scroll-animation script
  pages/           One file per route (about, books, publications, etc.)
  site.config.ts   Single source of truth for author info, nav, themes
  styles/
    global.css     Design tokens + global typography + utility classes

public/            Static assets served at root (images, redirects, robots)
scripts/           One-off data extraction & image processing scripts
```

## Content updates

Most updates flow through Claude Code — describe the change in natural language, the assistant edits the right files, commits, and pushes. Netlify auto-deploys within ~60 seconds of any push to `main`.

For small ad-hoc edits, the GitHub web UI works too (open the repo on github.com → click any file → pencil icon → commit).

## Architecture decisions

- **No blog** on this site. Personal blog content lives at the original WordPress.com site (`oliverscrocco.wordpress.com`).
- **Selected, not full** lists. Publications and Speaking pages curate signature pieces rather than dumping the full record. Google Scholar, ORCID, and the CV serve as the canonical complete sources.
- **No CMS layer** (TinaCMS, Decap, etc.). The content updates infrequently and is mostly page-level rather than entry-level — a CMS would be overhead with no payoff.
- **Single source of truth** for author info in `src/site.config.ts`. Update there, propagates everywhere.

## Deploy

Netlify build config is in `netlify.toml`. Site builds with `npm run build`, publishes from `./dist`. Headers are set for security (X-Frame-Options, Content-Type-Options) and aggressive caching of fingerprinted assets.

Custom domain `olivercrocco.com` is registered at WordPress.com; DNS records point at Netlify.

## Source archive

The full archive of the prior WordPress.com site (86 posts, 195 images, 10 pages — pulled from the WP REST API in April 2026) lives at `../olivercrocco-archive/` outside this repo. That archive is the canonical backup of pre-relaunch content.
