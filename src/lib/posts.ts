import { getAllMdxPosts, getMdxPost } from "./posts-mdx";
import { loadWpPosts, wordpressEnabled } from "./posts-wp";
import type { Post, PostMeta } from "./post-model";

export type { Heading, Post, PostCta, PostMeta, PostSource } from "./post-model";

/**
 * Camada única de conteúdo.
 * - Com WORDPRESS_URL definida: lê os artigos do WordPress (painel).
 * - Sem ela: lê os arquivos .mdx de content/posts (reserva/exemplos).
 */
export async function getAllPosts(): Promise<PostMeta[]> {
  if (wordpressEnabled) return (await loadWpPosts()).map((p) => p.meta);
  return getAllMdxPosts();
}

export async function getPost(slug: string): Promise<Post | null> {
  if (wordpressEnabled) {
    const posts = await loadWpPosts();
    return posts.find((p) => p.meta.slug === slug) ?? null;
  }
  return getMdxPost(slug);
}

export async function getRelatedPosts(current: PostMeta, limit = 3): Promise<PostMeta[]> {
  const others = (await getAllPosts()).filter((p) => p.slug !== current.slug);
  const scored = others.map((p) => {
    let score = p.category === current.category ? 3 : 0;
    score += p.tags.filter((t) => current.tags.includes(t)).length;
    return { p, score };
  });
  return scored
    .sort((a, b) => b.score - a.score || (a.p.date < b.p.date ? 1 : -1))
    .slice(0, limit)
    .map((s) => s.p);
}
