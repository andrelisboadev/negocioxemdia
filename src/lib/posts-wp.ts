import { cache } from "react";
import { siteConfig, type CategorySlug } from "@data/site.config";
import { slugify } from "./utils";
import { readingTimeFromWords, type Post, type PostMeta } from "./post-model";
import { decodeEntities, processWpHtml, stripTags } from "./wp-html";

/**
 * Fonte de conteúdo: API REST do WordPress (somente leitura, endpoint público de posts).
 * Ativada quando a variável WORDPRESS_URL existe (ex.: https://painel.seudominio.com.br).
 *
 * Convenções do painel (ver README):
 *  - Categoria do WordPress = categoria do site (slug: financas, tributos, vendas, marketing, automacao)
 *  - Tag "afiliado" = mostra o aviso de afiliados (também é detectado sozinho pelos links)
 *  - Tag "cta-estoque" (ou cta-orcamentos, cta-catalogo...) = define o CTA do fim do artigo
 *  - Tag "tipo-solucao" / "tipo-indicacao" = só organiza o mix 80/15/5
 *  - Título H2 "Fontes oficiais" no fim do texto = vira a caixa de fontes
 *  - "Atualizado em" = data de modificação do post no WordPress
 */

const WP_URL = process.env.WORDPRESS_URL?.replace(/\/$/, "");
export const wordpressEnabled = Boolean(WP_URL);

/** Tag usada para invalidar o cache quando você publica (ver /api/revalidate). */
export const WP_CACHE_TAG = "wp";
const REVALIDATE_SECONDS = 300;

interface WpTerm {
  id: number;
  name: string;
  slug: string;
  taxonomy: string;
}

interface WpPost {
  slug: string;
  date: string;
  modified: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  _embedded?: {
    author?: Array<{ name?: string }>;
    "wp:term"?: WpTerm[][];
  };
}

async function fetchAllRaw(): Promise<WpPost[]> {
  const all: WpPost[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const url = `${WP_URL}/wp-json/wp/v2/posts?_embed&per_page=100&page=${page}&orderby=date&order=desc`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS, tags: [WP_CACHE_TAG] },
    });
    if (!res.ok) {
      throw new Error(`WordPress respondeu ${res.status} ao buscar os posts (${url})`);
    }
    totalPages = Number(res.headers.get("X-WP-TotalPages") ?? "1") || 1;
    all.push(...((await res.json()) as WpPost[]));
    page += 1;
  } while (page <= totalPages);

  return all;
}

function pickCategory(categories: WpTerm[], slug: string): CategorySlug {
  const valid = siteConfig.categories.map((c) => c.slug) as string[];
  for (const c of categories) {
    if (valid.includes(c.slug)) return c.slug as CategorySlug;
    const bySlugifiedName = slugify(c.name);
    if (valid.includes(bySlugifiedName)) return bySlugifiedName as CategorySlug;
  }
  console.warn(
    `[wordpress] O post "${slug}" não tem categoria válida (${valid.join(", ")}). Usando "financas".`,
  );
  return "financas";
}

function toDescription(excerptHtml: string): string {
  const text = stripTags(excerptHtml)
    .replace(/\s*\[(?:…|\.\.\.)\]\s*$/, "")
    .replace(/\s*Read more.*$/i, "")
    .trim();
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}...` : text;
}

function toPost(p: WpPost): Post {
  const terms = (p._embedded?.["wp:term"] ?? []).flat();
  const categories = terms.filter((t) => t.taxonomy === "category");
  const tags = terms.filter((t) => t.taxonomy === "post_tag");
  const tagSlugs = tags.map((t) => t.slug);

  const ctaTag = tagSlugs.find((s) => s.startsWith("cta-"));
  const processed = processWpHtml(p.content.rendered);
  const words = stripTags(processed.html).split(/\s+/).filter(Boolean).length;

  const meta: PostMeta = {
    slug: p.slug,
    title: decodeEntities(stripTags(p.title.rendered)),
    description: toDescription(p.excerpt.rendered),
    category: pickCategory(categories, p.slug),
    date: p.date.slice(0, 10),
    updated: p.modified.slice(0, 10),
    author: p._embedded?.author?.[0]?.name || siteConfig.author.name,
    tags: tags
      .filter((t) => t.slug !== "afiliado" && !t.slug.startsWith("cta-") && !t.slug.startsWith("tipo-"))
      .map((t) => decodeEntities(t.name)),
    readingTime: readingTimeFromWords(words),
    sources: processed.sources,
    cta: ctaTag ? { solution: ctaTag.slice(4) } : undefined,
    hasAffiliate: tagSlugs.includes("afiliado") || processed.hasAffiliateLinks,
    kind: tagSlugs.includes("tipo-solucao")
      ? "solucao"
      : tagSlugs.includes("tipo-indicacao")
        ? "indicacao"
        : "educativo",
  };

  return { meta, format: "html", content: processed.html, headings: processed.headings };
}

/** Busca e converte todos os posts (1 vez por requisição/renderização). */
export const loadWpPosts = cache(async (): Promise<Post[]> => {
  const raw = await fetchAllRaw();
  return raw.map(toPost).sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1));
});
