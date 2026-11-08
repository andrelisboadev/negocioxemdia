import sanitizeHtml from "sanitize-html";
import { siteConfig } from "@data/site.config";
import { slugify } from "./utils";
import type { Heading, PostSource } from "./post-model";

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
};

export function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-z]+);/gi, (m, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? m);
}

/** Remove todas as tags e devolve texto puro. */
export function stripTags(html: string): string {
  return decodeEntities(sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })).replace(/\s+/g, " ").trim();
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

export function isAffiliateUrl(url: string): boolean {
  const host = hostOf(url);
  if (!host) return false;
  return siteConfig.affiliateDomains.some((d) => host === d || host.endsWith(`.${d}`));
}

export interface ProcessedHtml {
  html: string;
  headings: Heading[];
  sources: PostSource[];
  /** true se o texto contém algum link para domínios de afiliado */
  hasAffiliateLinks: boolean;
}

const ALLOWED_TAGS = [
  "h2", "h3", "h4", "p", "br", "hr", "strong", "b", "em", "i", "u", "mark", "sup", "sub",
  "a", "ul", "ol", "li", "blockquote", "code", "pre",
  "img", "figure", "figcaption",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td",
];

/**
 * Recebe o HTML do WordPress (content.rendered) e devolve HTML seguro para o site:
 * - remove scripts, estilos inline, classes e tags não permitidas
 * - links externos abrem em nova aba; links de afiliado ganham rel="sponsored nofollow noopener"
 * - links para o próprio site viram caminhos relativos
 * - cria ids nos títulos (h2/h3) para o índice do artigo
 * - tira a seção "Fontes" (h2 "Fontes" ou "Fontes oficiais") do texto e a devolve em `sources`
 */
export function processWpHtml(raw: string): ProcessedHtml {
  let hasAffiliateLinks = false;
  const ownHost = hostOf(siteConfig.url);

  let html = sanitizeHtml(raw, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "srcset", "sizes", "alt", "width", "height", "loading", "decoding"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      h1: "h2",
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const out: Record<string, string> = { href };
        if (attribs.title) out.title = attribs.title;

        if (/^https?:\/\//i.test(href)) {
          if (ownHost && hostOf(href) === ownHost) {
            out.href = href.replace(/^https?:\/\/[^/]+/i, "") || "/";
          } else if (isAffiliateUrl(href)) {
            hasAffiliateLinks = true;
            out.target = "_blank";
            out.rel = "sponsored nofollow noopener";
          } else {
            out.target = "_blank";
            out.rel = "noopener noreferrer";
          }
        }
        return { tagName, attribs: out };
      },
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy", decoding: "async" } }),
    },
  });

  // Seção de fontes oficiais (usada em artigos de tributos)
  const sources: PostSource[] = [];
  const sourcesRe = /<h2>\s*fontes?(?:\s+oficiais?)?\s*:?\s*<\/h2>([\s\S]*?)(?=<h2>|$)/i;
  const sourcesMatch = sourcesRe.exec(html);
  if (sourcesMatch) {
    const linkRe = /<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let m: RegExpExecArray | null;
    while ((m = linkRe.exec(sourcesMatch[1])) !== null) {
      sources.push({ url: decodeEntities(m[1]), label: stripTags(m[2]) || decodeEntities(m[1]) });
    }
    html = html.replace(sourcesRe, "");
  }

  // ids nos títulos + índice
  const headings: Heading[] = [];
  const used = new Map<string, number>();
  html = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_full, level: string, inner: string) => {
    const text = stripTags(inner);
    let id = slugify(text) || `secao-${headings.length + 1}`;
    const count = used.get(id) ?? 0;
    used.set(id, count + 1);
    if (count > 0) id = `${id}-${count + 1}`;
    headings.push({ id, text, level: Number(level) as 2 | 3 });
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });

  return { html, headings, sources, hasAffiliateLinks };
}
