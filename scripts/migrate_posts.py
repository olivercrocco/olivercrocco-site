"""Migrate archived WP posts to Astro content collection format.

Reads from:  /Users/oz/Developer/Claude Code/olivercrocco-archive/posts-markdown/
             /Users/oz/Developer/Claude Code/olivercrocco-archive/media/

Writes to:   src/content/posts/{slug}.md
             public/post-images/{filename}

Operations:
  - Reparses YAML frontmatter into Astro-compatible schema
  - Rewrites all image URLs in body + frontmatter to local /post-images/ paths
  - Copies referenced images from archive/media/ into public/post-images/
  - Generates a redirect manifest (legacyUrl → /blog/{slug}) for future use
"""

import re
import json
import shutil
import hashlib
import urllib.parse
from pathlib import Path

ARCHIVE = Path("/Users/oz/Developer/Claude Code/olivercrocco-archive")
SITE = Path("/Users/oz/Developer/Claude Code/olivercrocco-site")

POSTS_IN = ARCHIVE / "posts-markdown"
MEDIA_IN = ARCHIVE / "media"
POSTS_OUT = SITE / "src" / "content" / "posts"
IMAGES_OUT = SITE / "public" / "post-images"

POSTS_OUT.mkdir(parents=True, exist_ok=True)
IMAGES_OUT.mkdir(parents=True, exist_ok=True)


def parse_frontmatter(text):
    """Crude YAML frontmatter parser tuned for what process_archive.py wrote."""
    if not text.startswith("---"):
        return {}, text
    end = text.find("\n---", 3)
    if end == -1:
        return {}, text
    fm_block = text[3:end].strip()
    body = text[end + 4 :].lstrip("\n")

    fm = {}
    for line in fm_block.splitlines():
        if ":" not in line:
            continue
        k, _, v = line.partition(":")
        k = k.strip()
        v = v.strip()
        # quoted strings
        if v.startswith('"') and v.endswith('"'):
            v = v[1:-1]
        # YAML lists like ['a', 'b']
        elif v.startswith("[") and v.endswith("]"):
            inner = v[1:-1].strip()
            if not inner:
                v = []
            else:
                items = []
                for it in re.split(r",(?=(?:[^']*'[^']*')*[^']*$)", inner):
                    it = it.strip().strip("'\"")
                    if it:
                        items.append(it)
                v = items
        fm[k] = v
    return fm, body


def safe_filename(url):
    """Produces same filename as olivercrocco-archive/download_media.py — must match!"""
    parsed = urllib.parse.urlparse(url)
    name = Path(parsed.path).name
    if not name or "." not in name:
        h = hashlib.sha256(url.encode()).hexdigest()[:12]
        name = f"image_{h}.bin"
    h = hashlib.sha256(url.encode()).hexdigest()[:8]
    return f"{h}_{name}"


def rewrite_image_urls(text, url_map):
    """Rewrite remote image URLs in markdown body to local /post-images/ paths.
    url_map gets populated with old→new mappings."""

    def repl_md_img(m):
        alt, url = m.group(1), m.group(2)
        if url.startswith("http"):
            fname = safe_filename(url)
            url_map[url] = f"/post-images/{fname}"
            return f"![{alt}](/post-images/{fname})"
        return m.group(0)

    def repl_html_img(m):
        url = m.group(1)
        if url.startswith("http"):
            fname = safe_filename(url)
            url_map[url] = f"/post-images/{fname}"
            return m.group(0).replace(url, f"/post-images/{fname}")
        return m.group(0)

    text = re.sub(r"!\[([^\]]*)\]\((https?://[^)]+)\)", repl_md_img, text)
    text = re.sub(r'<img[^>]*src="(https?://[^"]+)"', repl_html_img, text)
    return text


def slugify(s):
    s = s.lower()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_-]+", "-", s)
    return s.strip("-")


def yaml_quote(s):
    """Escape a string for YAML double-quoted scalar."""
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def yaml_list(items):
    if not items:
        return "[]"
    quoted = ", ".join(yaml_quote(x) for x in items)
    return f"[{quoted}]"


# ---- Run migration ----
url_map = {}
redirect_map = {}
processed = 0
skipped = 0
copied_images = 0

for md_file in sorted(POSTS_IN.glob("*.md")):
    with open(md_file) as f:
        text = f.read()

    fm, body = parse_frontmatter(text)
    if not fm:
        skipped += 1
        continue

    title = fm.get("title", "Untitled").strip()
    date = fm.get("date", "")
    slug = fm.get("slug", "").strip() or slugify(title)
    legacy_url = fm.get("url", "")
    legacy_id = fm.get("post_id", "")
    cats = [c.lower() for c in fm.get("categories", []) if c]
    tags = [t.lower() for t in fm.get("tags", []) if t]
    hero = fm.get("featured_image", "").strip()

    # Drop original first H1 + "Published date" italic line — they're redundant with frontmatter
    body = re.sub(rf"^# {re.escape(title)}\s*\n+", "", body, count=1)
    body = re.sub(r"^\*Published \d{4}-\d{2}-\d{2}\*\s*\n+", "", body, count=1)

    # Rewrite hero image URL
    hero_local = ""
    if hero.startswith("http"):
        fname = safe_filename(hero)
        hero_local = f"/post-images/{fname}"
        url_map[hero] = hero_local

    # Rewrite inline image URLs in body
    body = rewrite_image_urls(body, url_map)

    # Generate first-paragraph excerpt (~250 chars)
    plain = re.sub(r"^#+ .*$", "", body, flags=re.MULTILINE)
    plain = re.sub(r"!\[[^\]]*\]\([^)]+\)", "", plain)
    plain = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", plain)
    plain = re.sub(r"[*_`>]", "", plain)
    plain = re.sub(r"\s+", " ", plain).strip()
    excerpt = (plain[:240].rsplit(" ", 1)[0] + "…") if len(plain) > 240 else plain

    # Build clean frontmatter
    fm_lines = ["---"]
    fm_lines.append(f"title: {yaml_quote(title)}")
    fm_lines.append(f"date: {date}")
    if excerpt:
        fm_lines.append(f"excerpt: {yaml_quote(excerpt)}")
    fm_lines.append(f"categories: {yaml_list(cats)}")
    fm_lines.append(f"tags: {yaml_list(tags)}")
    if hero_local:
        fm_lines.append(f"heroImage: {yaml_quote(hero_local)}")
    if legacy_url:
        fm_lines.append(f"legacyUrl: {yaml_quote(legacy_url)}")
    if legacy_id:
        try:
            fm_lines.append(f"legacyId: {int(legacy_id)}")
        except (TypeError, ValueError):
            pass
    fm_lines.append("---")
    fm_lines.append("")

    new_text = "\n".join(fm_lines) + body.lstrip("\n")

    # Filename: just the slug (URL-friendly)
    out_path = POSTS_OUT / f"{slug}.md"
    if out_path.exists():
        # Slug collision — disambiguate with date prefix
        out_path = POSTS_OUT / f"{date}-{slug}.md"
    with open(out_path, "w") as f:
        f.write(new_text)

    # Track redirect
    if legacy_url:
        redirect_map[legacy_url] = f"/blog/{slug}/"

    processed += 1

# ---- Copy referenced images ----
for url, local_path in url_map.items():
    src_filename = local_path.replace("/post-images/", "")
    src = MEDIA_IN / src_filename
    dst = IMAGES_OUT / src_filename
    if src.exists():
        if not dst.exists() or dst.stat().st_size != src.stat().st_size:
            shutil.copy2(src, dst)
            copied_images += 1
    else:
        print(f"  WARN: missing source image {src} (referenced from {url})")

# ---- Save redirect map ----
with open(SITE / "src" / "data" / "legacy-redirects.json", "w") as f:
    json.dump(redirect_map, f, indent=2)

print(f"✓ Migrated: {processed} posts, skipped {skipped}")
print(f"✓ Copied {copied_images} images (out of {len(url_map)} unique URLs referenced)")
print(f"✓ Wrote redirect map for {len(redirect_map)} legacy URLs")
