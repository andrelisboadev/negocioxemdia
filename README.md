# Negócios em Dia

Site/blog em Next.js (App Router) + TypeScript + Tailwind, publicado na Vercel. Os artigos são arquivos `.mdx` na pasta `content/posts`. Sem banco de dados e sem painel para manter.

## Rodar localmente

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # teste antes de publicar
```

## Antes de publicar (TODO)

- `data/site.config.ts`: troque **nome completo do autor, e-mail, @ do Instagram e links de afiliado**.
- `data/maquininhas.ts` e `data/indicacoes.ts`: os valores e produtos são **exemplos**. Confira as taxas no site de cada operadora, troque os produtos pelos seus e preencha `ultimaConferencia`.
- Troque os 3 artigos de exemplo pelos seus (ou apague-os) em `content/posts`.

## Publicar um artigo novo

1. Abra `content/_modelo-artigo.mdx`: é um modelo com o cabeçalho comentado.
2. Copie o conteúdo para um arquivo novo `content/posts/nome-do-artigo.mdx` (o nome vira o endereço `/blog/nome-do-artigo`; só letras minúsculas, números e hífens).
3. Preencha o cabeçalho e escreva o texto.
4. Envie para o GitHub. A Vercel publica sozinha em cerca de 1 minuto.

**Pelo navegador ou celular, sem instalar nada:** no repositório do GitHub, entre em `content/posts` → **Add file → Create new file** → digite o nome (`nome-do-artigo.mdx`) → cole o texto → **Commit changes**.

**Pelo computador:** `git add . && git commit -m "novo artigo" && git push`. Rode `npm run build` antes para pegar erros de digitação no cabeçalho.

Se um artigo tiver erro no cabeçalho, a Vercel recusa o deploy e **mantém o site anterior no ar**. O motivo aparece em Deployments → o deploy com erro → Build Logs.

**Segurança:** ative a verificação em duas etapas na sua conta do GitHub, pois ela passa a ser a chave do site.

### Regras do cabeçalho

| Campo | O que faz |
|---|---|
| `category` | `financas`, `tributos`, `vendas`, `marketing` ou `automacao` |
| `date` / `updated` | `"AAAA-MM-DD"` entre aspas. `updated` aparece como "Atualizado em" |
| `sources` | **Obrigatório em tributos** (Receita Federal, Sebrae, gov.br): vira a caixa "Fontes oficiais" |
| `hasAffiliate` | `true` = mostra o Aviso de Afiliados no topo do artigo |
| `cta.solution` | `estoque`, `orcamentos`, `agendamento`, `catalogo` ou `atendimento-ia`: define o CTA do fim |

Componentes dentro do artigo:

- `<Callout title="Dica">texto</Callout>`: caixa de destaque
- `<CtaBox solution="catalogo" />`: CTA no meio do texto
- `<AffiliateLink href="https://...">texto</AffiliateLink>`: link de afiliado (com `rel="sponsored nofollow noopener"` e `target="_blank"` automáticos). Se usar, ponha `hasAffiliate: true`.

Evite as chaves `{ }` e o sinal `<` soltos no texto: o MDX entende como código.

## Onde editar o resto

| O que | Arquivo |
|---|---|
| Nome do site, WhatsApp, redes, categorias, links de afiliado | `data/site.config.ts` |
| Soluções (cards de sistemas) | `data/solucoes.ts` |
| Maquininhas (tabela) | `data/maquininhas.ts` |
| Produtos de indicação | `data/indicacoes.ts` |

### Adicionar uma maquininha

1. Em `data/maquininhas.ts`, copie um item (mude o `id`, taxas, prazo, "para quem serve").
2. Em `data/site.config.ts`, em `affiliateLinks.maquininhas`, adicione `"seu-id": "https://seu-link-de-afiliado"`.

### Adicionar um produto (Indicações)

Em `data/indicacoes.ts`, copie um item da lista `produtos`:

```ts
{
  id: "meu-produto",
  titulo: "Nome do produto",
  categoria: "fotos",            // organizacao | fotos | envio | loja
  loja: "mercado-livre",         // mercado-livre | shopee | amazon
  motivo: "Por que você indica.",
  url: "https://seu-link-de-afiliado",
  image: "/images/produtos/meu-produto.jpg", // opcional (arquivo em /public)
}
```

Imagem de outro domínio: libere o domínio em `next.config.mjs` (`images.remotePatterns`).

## Publicar na Vercel

1. Suba o projeto para um repositório no GitHub.
2. Em vercel.com → **Add New → Project** → importe o repositório (a Vercel detecta o Next.js sozinha).
3. Em **Settings → Environment Variables**, crie `NEXT_PUBLIC_SITE_URL` com o endereço do site, sem barra no final (sem domínio próprio, use o `https://nome-do-projeto.vercel.app`). Faça o **Deploy** (ou **Redeploy** se já tinha publicado).
4. Quando tiver domínio próprio: **Settings → Domains** para conectar e troque o valor de `NEXT_PUBLIC_SITE_URL`.
5. No Google Search Console, envie `https://seusite/sitemap.xml`.

## Ativar o Supabase depois (newsletter/leads)

O formulário já envia para `/api/lead`, que hoje só registra no log (Vercel → Logs). O passo a passo para gravar no Supabase está comentado em `src/lib/supabase.ts`.

## Opcional, no futuro: WordPress como painel de escrita

O site também sabe ler artigos de um WordPress (somente leitura). **Fica desligado** enquanto a variável `WORDPRESS_URL` não existir. Só vale a pena se você for postar com frequência ou outra pessoa for escrever. O passo a passo completo está em `docs/GUIA-WORDPRESS.md`.

Resumo: instalar o WordPress em um subdomínio, criar as categorias, e na Vercel preencher `WORDPRESS_URL` e `REVALIDATE_SECRET` e fazer um redeploy. Quando ligar, os artigos de `content/posts` deixam de aparecer no site.
