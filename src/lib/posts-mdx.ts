import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { CategorySlug } from "@data/site.config";
import { siteConfig } from "@data/site.config";
import {
  extractHeadings,
  readingTimeFromWords,
  type Post,
  type PostCta,
  type PostMeta,
  type PostSource,
} from "./post-model";

/** Fonte de conteúdo local (reserva): arquivos .mdx em content/posts. */
const POSTS_DIR = path.join(process.cwd(), "content", "posts");

function toIsoDate(value: unknown, fallback: string): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string" && value.length >= 10) return value.slice(0, 10);
  return fallback;
}

function parsePostFile(file: string): Post {
  const slug = file.replace(/\.mdx?$/, "");
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const date = toIsoDate(data.date, "2026-01-01");
  const words = content.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;

  const meta: PostMeta = {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    category: (data.category ?? "financas") as CategorySlug,
    date,
    updated: toIsoDate(data.updated, date),
    author: String(data.author ?? siteConfig.author.name),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingTime: readingTimeFromWords(words),
    sources: Array.isArray(data.sources) ? (data.sources as PostSource[]) : [],
    cta: data.cta as PostCta | undefined,
    hasAffiliate: Boolean(data.hasAffiliate),
    kind: (data.kind ?? "educativo") as PostMeta["kind"],
  };

  return { meta, format: "mdx", content, headings: extractHeadings(content) };
}

export function getAllMdxPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => parsePostFile(f).meta)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getMdxPost(slug: string): Post | null {
  for (const ext of ["mdx", "md"]) {
    const file = `${slug}.${ext}`;
    if (fs.existsSync(path.join(POSTS_DIR, file))) return parsePostFile(file);
  }
  return null;
}
