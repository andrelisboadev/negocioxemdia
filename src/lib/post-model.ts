import type { CategorySlug } from "@data/site.config";
import { slugify } from "./utils";

export interface PostSource {
  label: string;
  url: string;
}

export interface PostCta {
  title?: string;
  text?: string;
  /** id da solução em data/solucoes.ts (ex.: "estoque"). Define a mensagem do WhatsApp. */
  solution?: string;
  buttonLabel?: string;
}

export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  category: CategorySlug;
  date: string;
  updated: string;
  author: string;
  tags: string[];
  readingTime: number;
  sources: PostSource[];
  cta?: PostCta;
  hasAffiliate: boolean;
  /** Tipo editorial, usado só para organizar o mix 80/15/5. */
  kind: "educativo" | "solucao" | "indicacao";
}

export interface Post {
  meta: PostMeta;
  /** "mdx" = Markdown/MDX local; "html" = HTML já sanitizado vindo do WordPress. */
  format: "mdx" | "html";
  content: string;
  headings: Heading[];
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "")
    .trim();
}

export function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;
    const text = stripMarkdown(match[2]);
    headings.push({ id: slugify(text), text, level: match[1].length as 2 | 3 });
  }
  return headings;
}

export function readingTimeFromWords(words: number): number {
  return Math.max(1, Math.ceil(words / 200));
}
