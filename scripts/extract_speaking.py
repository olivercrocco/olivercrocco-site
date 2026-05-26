"""Parse archived Conferences + Media Appearances pages into structured TS data."""

import re
import json
from pathlib import Path

ARCHIVE = Path("/Users/oz/Desktop/Claude Code/olivercrocco-archive")
SITE = Path("/Users/oz/Desktop/Claude Code/olivercrocco-site")


def parse_md_links(line):
    """Extract first URL from a [text](url) span. Returns (cleaned_line, url)."""
    m = re.search(r"\[([^\]]+)\]\(([^)]+)\)", line)
    if m:
        url = m.group(2)
        cleaned = re.sub(r"\[[^\]]+\]\([^)]+\)", "", line)
        cleaned = re.sub(r"\s+", " ", cleaned).strip(" .,")
        return cleaned + ".", url
    return line.strip(), ""


# ==================== Conferences ====================
conf_md = (ARCHIVE / "pages-markdown" / "conferences_214.md").read_text()
conferences = []
current_year = None
for raw in conf_md.splitlines():
    raw = raw.rstrip()
    if not raw or raw.startswith("---"):
        continue
    h = re.match(r"^#+\s+(.+)$", raw)
    if h:
        head = h.group(1).strip()
        if head.lower() == "conferences":
            continue
        if re.match(r"^\d{4}$", head):
            current_year = int(head)
        continue
    if len(raw) < 30:
        continue
    citation, url = parse_md_links(raw)
    conferences.append({"year": current_year, "citation": citation, "url": url})

# ==================== Media Appearances ====================
media_md = (ARCHIVE / "pages-markdown" / "media-appearances_1870.md").read_text()
media = []
for raw in media_md.splitlines():
    raw = raw.rstrip()
    if not raw or raw.startswith("---") or raw.lower().startswith("# media"):
        continue
    if len(raw) < 30:
        continue
    citation, url = parse_md_links(raw)
    # Pull year from "(YYYY," pattern
    year_m = re.search(r"\((\d{4})", citation)
    year = int(year_m.group(1)) if year_m else None
    # Identify outlet from italic span: *Outlet name*
    outlet_m = re.search(r"\*([^*]+)\*", citation)
    outlet = outlet_m.group(1).strip().rstrip(",") if outlet_m else ""
    media.append({"year": year, "citation": citation, "url": url, "outlet": outlet})

# ==================== Write TS files ====================
out = ["/**", " * Auto-generated from archived Conferences + Media Appearances pages.", " */", ""]
out.append("export interface ConferenceTalk {")
out.append("  year: number | null;")
out.append("  citation: string;")
out.append("  url: string;")
out.append("}")
out.append("")
out.append("export const CONFERENCE_TALKS: ConferenceTalk[] = [")
for c in conferences:
    out.append(
        f"  {{year: {c['year'] if c['year'] is not None else 'null'}, "
        f"citation: {json.dumps(c['citation'])}, "
        f"url: {json.dumps(c['url'])}}},"
    )
out.append("];")
out.append("")
out.append("export interface MediaAppearance {")
out.append("  year: number | null;")
out.append("  citation: string;")
out.append("  url: string;")
out.append("  outlet: string;")
out.append("}")
out.append("")
out.append("export const MEDIA_APPEARANCES: MediaAppearance[] = [")
for m in media:
    out.append(
        f"  {{year: {m['year'] if m['year'] is not None else 'null'}, "
        f"citation: {json.dumps(m['citation'])}, "
        f"url: {json.dumps(m['url'])}, "
        f"outlet: {json.dumps(m['outlet'])}}},"
    )
out.append("];")
out.append("")

(SITE / "src" / "data" / "speaking.ts").write_text("\n".join(out))
print(f"✓ Wrote {len(conferences)} conference talks and {len(media)} media appearances")
