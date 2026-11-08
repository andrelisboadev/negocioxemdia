import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { WP_CACHE_TAG } from "@/lib/posts-wp";

/**
 * Chamado pelo WordPress quando você publica/atualiza um artigo, para o site atualizar na hora
 * (sem isso, o site atualiza sozinho a cada 5 minutos).
 *
 * POST /api/revalidate  com o cabeçalho  x-revalidate-secret: <REVALIDATE_SECRET>
 * (ou ?secret=<REVALIDATE_SECRET> na URL, para plugins que só aceitam URL)
 */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export async function POST(request: Request) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    return NextResponse.json({ ok: false, error: "REVALIDATE_SECRET não configurada." }, { status: 503 });
  }

  const url = new URL(request.url);
  const provided = request.headers.get("x-revalidate-secret") ?? url.searchParams.get("secret") ?? "";
  if (!safeEqual(provided, expected)) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }

  revalidateTag(WP_CACHE_TAG);
  revalidatePath("/sitemap.xml");
  return NextResponse.json({ ok: true, revalidatedAt: new Date().toISOString() });
}
