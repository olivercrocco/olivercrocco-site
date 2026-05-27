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

/**
 * Notes — the ideas-writing channel.
 * Four lanes per the handover brief:
 *   Ideas    — arguments and conversation warm-ups
 *   Region   — Southeast Asia / development field notes
 *   Method   — AI-in-research and how the work happens
 *   Reading  — short book notes (the backbone)
 *
 * Cadence target: 2x/month. Never weekly.
 */
const notes = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/notes" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    lane: z.enum(["Ideas", "Region", "Method", "Reading"]),
    dek: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { books, notes };
