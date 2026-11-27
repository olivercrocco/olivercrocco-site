/**
 * The site search index, built at deploy time from the same data the pages use.
 * The search box (src/components/interactive/SiteSearch.tsx) fetches it on first open.
 */
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { selected, venueName } from "../data/selectedPublications";
import { tools, toolAnchor } from "../data/tools";
import poetryOfWork from "../data/poetry-of-work.json";

export interface SearchItem {
  section: "Pages" | "Publications" | "Books" | "Notes" | "Tools" | "Poems";
  title: string;
  detail: string;
  url: string;
  /** Extra words to match on that are not shown. */
  terms?: string;
  external?: boolean;
}

const PAGES: SearchItem[] = [
  { section: "Pages", title: "About", detail: "Background, roles, and work in the region", url: "/about/", terms: "bio cv lsu chulalongkorn editor" },
  { section: "Pages", title: "Short bio", detail: "Three bio lengths for programs and introductions", url: "/bio/", terms: "biography headshot" },
  { section: "Pages", title: "Books", detail: "Authored and edited books", url: "/books/" },
  { section: "Pages", title: "Publications", detail: "Selected articles and chapters by research stream", url: "/publications/", terms: "articles papers journal research" },
  { section: "Pages", title: "Notes", detail: "Ideas, notes from Southeast Asia, and short takes on books", url: "/notes/", terms: "blog essays" },
  { section: "Pages", title: "Poetry", detail: "My own poems", url: "/poetry/" },
  { section: "Pages", title: "The Poetry of Work", detail: "A weekly public-domain poem on work, craft, and vocation", url: "/poetry-of-work/" },
  { section: "Pages", title: "Research tools", detail: "Free tools for the day-to-day work of research", url: "/tools/" },
  { section: "Pages", title: "Reentry Toolkit", detail: "Six tools for getting back to work after prison", url: "/reentry/", terms: "resume interview job search first paycheck letters of explanation" },
  { section: "Pages", title: "Contact", detail: "Collaboration, talks, workshops, and press", url: "/contact/", terms: "email speaking media" },
];

// Title is the text between "(YYYY). " and the venue; authors are what comes before.
function splitCitation(citation: string) {
  const m = citation.match(/^(.*?)\s*\((\d{4})\)\.\s*(.*)$/);
  if (!m) return { authors: "", year: "", title: citation };
  return { authors: m[1].replace(/[,\s]+$/, ""), year: m[2], title: m[3].replace(/\.$/, "") };
}

export const GET: APIRoute = async () => {
  const items: SearchItem[] = [...PAGES];

  for (const [stream, pubs] of Object.entries(selected)) {
    for (const p of pubs) {
      const { authors, year, title } = splitCitation(p.citation);
      items.push({
        section: "Publications",
        title,
        detail: `${authors} (${year}), ${venueName(p.venue)}`,
        url: p.url,
        terms: `${stream} ${p.note ?? ""} ${p.award ?? ""}`,
        external: true,
      });
    }
  }

  const books = (await getCollection("books")).sort((a, b) => a.data.order - b.data.order);
  for (const b of books) {
    items.push({
      section: "Books",
      title: b.data.subtitle ? `${b.data.title}: ${b.data.subtitle}` : b.data.title,
      detail: `${b.data.publisher}, ${b.data.year}`,
      url: `/books/#${b.id}`,
      terms: `${b.data.authors.join(" ")} ${b.data.description}`,
    });
  }

  const notes = (await getCollection("notes", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );
  for (const n of notes) {
    items.push({
      section: "Notes",
      title: n.data.title,
      detail: n.data.date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }),
      url: `/notes/${n.id}/`,
      terms: `${n.data.lane} ${n.data.dek ?? ""}`,
    });
  }

  for (const t of tools) {
    items.push({
      section: "Tools",
      title: t.name,
      detail: t.tagline,
      url: `/tools/#${toolAnchor(t.name)}`,
      terms: t.audience,
    });
  }

  const poems = (await getCollection("poems", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );
  for (const p of poems) {
    items.push({ section: "Poems", title: p.data.title, detail: "A poem", url: `/poetry/${p.id}/`, terms: p.data.place ?? "" });
  }
  const now = Date.now();
  for (const w of poetryOfWork.weeks.filter((w) => Date.parse(w.goLive) <= now)) {
    items.push({
      section: "Poems",
      title: `${w.poet}, “${w.title}”`,
      detail: `The Poetry of Work, week ${w.week}`,
      url: "/poetry-of-work/",
    });
  }

  return new Response(JSON.stringify(items), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
