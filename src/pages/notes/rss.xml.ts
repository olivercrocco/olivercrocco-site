import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { SITE, AUTHOR } from "../../site.config";

export async function GET(context: APIContext) {
  const notes = await getCollection("notes", ({ data }) => !data.draft);
  return rss({
    title: `Notes — ${SITE.name}`,
    description:
      "Ideas, field notes from Southeast Asia, method, and reading — by Oliver S. Crocco. A couple of times a month.",
    site: context.site!,
    items: notes
      .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
      .map((note) => ({
        title: note.data.title,
        pubDate: note.data.date,
        description: note.data.dek || "",
        link: `/notes/${note.id}/`,
        author: AUTHOR.email,
        categories: [note.data.lane],
      })),
    customData: `<language>en-us</language>`,
  });
}
