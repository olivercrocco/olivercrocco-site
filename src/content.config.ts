import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const books = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/books" }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    authors: z.array(z.string()),
    role: z.enum(["author", "co-author", "editor", "co-editor"]).default("author"),
    publisher: z.string(),
    year: z.union([z.number(), z.string()]),
    status: z.enum([
      "published",
      "in-press",
      "in-production",
      "under-contract",
      "in-progress",
    ]),
    description: z.string(),
    cover: z.string().optional(),
    coverColor: z.string().optional(),
    buyLinks: z
      .array(
        z.object({
          label: z.string(),
          url: z.string().url(),
        })
      )
      .default([]),
    awards: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

export const collections = { books };
