# Guia: montar o painel WordPress do Negócios em Dia

Tempo estimado: 40 a 60 minutos. Siga na ordem e marque cada passo.

**Resumo do que você vai fazer:** instalar um WordPress em um endereço à parte (o "painel"), ajustar algumas configurações, criar categorias e etiquetas, e ligar o painel ao site pela Vercel.

> O painel é só para escrever. O site que as pessoas visitam continua sendo o Next.js na Vercel.

---

## Parte 1: Hospedagem e endereço

- [ ] **1.1** Contrate uma hospedagem com **WordPress.org de instalação em 1 clique** (a maioria das hospedagens brasileiras tem). Pode ser o plano mais simples.
  - Importante: precisa ser WordPress **instalado na sua hospedagem**, não o plano gratuito do WordPress.com (ele não libera a API que o site usa).
- [ ] **1.2** Escolha o endereço do painel: um subdomínio do seu domínio, por exemplo `painel.seudominio.com.br`.
  - Se o domínio estiver na hospedagem: crie o subdomínio no painel dela ("Domínios" → "Subdomínios").
  - Se o domínio estiver em outro lugar (ex.: Registro.br): crie um registro DNS apontando `painel` para a hospedagem (a hospedagem informa o IP ou o nome para usar). Pode levar de minutos a algumas horas para valer.
- [ ] **1.3** Ative o **HTTPS (SSL gratuito)** nesse subdomínio, no painel da hospedagem. O endereço final precisa começar com `https://`.

## Parte 2: Instalar o WordPress

- [ ] **2.1** No painel da hospedagem, escolha "Instalar WordPress" e selecione o subdomínio do painel.
- [ ] **2.2** Idioma: **Português do Brasil**.
- [ ] **2.3** Usuário administrador: **não use "admin"**. Escolha um nome só seu (ex.: `andre.negocios`) e uma **senha longa e única**. Guarde em um gerenciador de senhas.
- [ ] **2.4** Acesse `https://painel.seudominio.com.br/wp-admin` e entre com o usuário criado.

## Parte 3: Configurações iniciais

Tudo em **Configurações** (menu lateral):

- [ ] **3.1 Geral:** em **Fuso horário**, escolha uma cidade do Pará (ex.: `Belém`) e salve. Isso garante a data certa nos artigos.
- [ ] **3.2 Links permanentes:** marque **Nome do post** e salve. (O site depende disso.)
- [ ] **3.3 Leitura:** marque **Pedir aos mecanismos de busca para não indexarem este site** e salve. Assim o Google não enxerga o painel como cópia do seu blog.
- [ ] **3.4 Discussão:** desmarque **Permitir comentários em novos posts** (o site não exibe comentários) e salve.

## Parte 4: Categorias (obrigatório)

Em **Posts → Categorias**:

- [ ] **4.1** Crie as 5 categorias abaixo. O campo **Slug** precisa ser **exatamente** igual (sem acento, minúsculo):

| Nome | Slug |
|---|---|
| Finanças | `financas` |
| Tributos | `tributos` |
| Vendas | `vendas` |
| Marketing | `marketing` |
| Automação | `automacao` |

- [ ] **4.2** Renomeie (ou apague) a categoria "Sem categoria".
- [ ] **4.3** Em **Configurações → Escrita**, escolha uma **Categoria padrão** (ex.: Finanças). Se um artigo ficar sem categoria, o site usa Finanças e registra um aviso.

> Cada artigo deve ter **uma** categoria só.

## Parte 5: Etiquetas de controle

Em **Posts → Etiquetas**, crie estas (campo **Slug** igual ao nome abaixo):

| Slug | Para que serve |
|---|---|
| `afiliado` | Força o aviso de afiliados no artigo (o site também detecta sozinho pelos links) |
| `cta-estoque` | CTA do fim do artigo: sistema de estoque e vendas |
| `cta-orcamentos` | CTA: orçamentos em PDF e WhatsApp |
| `cta-agendamento` | CTA: agendamento com lembrete |
| `cta-catalogo` | CTA: catálogo digital |
| `cta-atendimento-ia` | CTA: atendimento automático com IA |
| `tipo-solucao` | Marca artigos que ligam uma dor a um sistema (só organização) |
| `tipo-indicacao` | Marca artigos de indicação de produtos (só organização) |

- [ ] **5.1** Criar as 8 etiquetas.

Etiquetas comuns (ex.: "mei", "fluxo de caixa") você cria na hora de escrever; elas viram palavras-chave e ajudam nos artigos relacionados.

## Parte 6: Plugins (poucos e essenciais)

Em **Plugins → Adicionar novo**:

- [ ] **6.1 Code Snippets** (para o aviso automático de publicação, Parte 9).
- [ ] **6.2 UpdraftPlus** (backup automático): depois de ativar, em **Configurações → Backups UpdraftPlus**, programe backup semanal dos arquivos e do banco.
- [ ] **6.3 Limit Login Attempts Reloaded** (barra tentativas de invasão no login).
- [ ] **6.4** Em **Painel → Atualizações**, ative as **atualizações automáticas** do WordPress e dos plugins.

**Atenção:** não instale plugins do tipo "Disable REST API" ou "desativar API". O site precisa da API pública de posts. Alguns plugins de segurança têm uma opção parecida: deixe desligada.

## Parte 7: Testar se a API está aberta

- [ ] **7.1** No navegador, abra:

```
https://painel.seudominio.com.br/wp-json/wp/v2/posts
```

- Deve aparecer um texto longo cheio de `{` e `}` (isso é a lista de posts em formato JSON). Mesmo vazio (`[]`), está certo.
- Se aparecer erro, página 404 ou pedido de login: volte à Parte 3.2 (links permanentes) e à Parte 6 (algum plugin bloqueando a API).

## Parte 8: Escrever o primeiro artigo (teste)

Em **Posts → Adicionar novo**:

- [ ] **8.1 Título:** o título do artigo.
- [ ] **8.2 Texto:** escreva normalmente. Para as seções, use o bloco **Título** nos níveis **H2** e **H3** (eles geram o índice do artigo). Não use H1.
- [ ] **8.3 Resumo:** na coluna da direita, aba **Post**, procure **Resumo** e escreva 1 ou 2 frases (até ~160 caracteres). Ele vira a descrição do Google e dos cards. Se o painel não mostrar o campo, clique nos três pontinhos (canto superior direito) → **Preferências** → **Painéis** e ative **Resumo**.
- [ ] **8.4 Categoria:** marque **uma**.
- [ ] **8.5 Etiquetas:** adicione palavras-chave e, se quiser, uma `cta-...` (CTA do fim do artigo) e `afiliado`, se o artigo tiver links de afiliado.
- [ ] **8.6 Fontes oficiais** (obrigatório em artigos de **Tributos**): no fim do texto, adicione um **Título H2** escrito exatamente `Fontes oficiais` e, logo abaixo, uma **Lista** com os links (Receita Federal, Sebrae, gov.br). O site tira essa parte do texto e mostra em uma caixa própria.
- [ ] **8.7 Links:** selecione o texto → botão de link → cole o endereço. Links de loja/operadora (Mercado Livre, Shopee, Amazon, maquininhas) são reconhecidos como afiliado sozinhos.
- [ ] **8.8 Imagens:** reduza antes de enviar (largura até 1600 px e, de preferência, abaixo de 200 KB) e preencha o **Texto alternativo**. As imagens carregam do endereço do painel.
- [ ] **8.9** Clique em **Publicar**.

Deixe este artigo como teste (pode apagar depois).

## Parte 9: Aviso automático de publicação (opcional, recomendado)

Sem isso, os artigos aparecem no site em até **5 minutos**. Com isso, aparecem **na hora**.

- [ ] **9.1** Invente um segredo: um texto de uns 40 caracteres, só com letras e números (ex.: gerado por um gerador de senhas). **Guarde**, você vai usar nos dois lados (Parte 9.2 e Parte 10).
- [ ] **9.2** No WordPress, vá em **Snippets → Adicionar novo**, dê o nome "Avisar o site ao publicar", cole o código abaixo, troque as duas partes marcadas e clique em **Salvar e ativar**:

```php
add_action('transition_post_status', function ($new, $old, $post) {
  if ($post->post_type !== 'post') return;
  if ($new !== 'publish' && $old !== 'publish') return;
  wp_remote_post('https://www.SEUDOMINIO.com.br/api/revalidate', [
    'headers'  => ['x-revalidate-secret' => 'COLE_AQUI_O_SEGREDO'],
    'timeout'  => 5,
    'blocking' => false,
  ]);
}, 10, 3);
```

  - Troque `www.SEUDOMINIO.com.br` pelo endereço do **site** (não do painel).
  - Troque `COLE_AQUI_O_SEGREDO` pelo segredo do passo 9.1.
  - Em "Executar snippet em", deixe **Executar em todo lugar**.

## Parte 10: Ligar o painel ao site (Vercel)

- [ ] **10.1** Em vercel.com, abra o projeto → **Settings → Environment Variables** e crie:

| Nome | Valor |
|---|---|
| `WORDPRESS_URL` | `https://painel.seudominio.com.br` (sem barra no final) |
| `REVALIDATE_SECRET` | o segredo do passo 9.1 |
| `NEXT_PUBLIC_SITE_URL` | `https://www.seudominio.com.br` (sem barra no final) |

- [ ] **10.2** Vá em **Deployments** → abra o último deploy → menu `...` → **Redeploy**. Aguarde terminar (1 a 2 minutos).
- [ ] **10.3** Abra `https://www.seudominio.com.br/blog`. O artigo de teste deve aparecer e os 3 exemplos antigos devem sumir.

## Parte 11: Checklist de conferência final

- [ ] O artigo de teste aparece em `/blog` e abre normalmente.
- [ ] O título, a categoria e o resumo estão certos.
- [ ] O índice ("Neste artigo") aparece com os seus H2/H3.
- [ ] Links de afiliado abrem em nova aba e o aviso de afiliados aparece no artigo.
- [ ] Em um artigo de Tributos: aparecem "Atualizado em" e a caixa "Fontes oficiais".
- [ ] O CTA de WhatsApp do fim do artigo é o da etiqueta `cta-...` escolhida.
- [ ] Publicar um segundo artigo aparece no site em poucos segundos (se fez a Parte 9) ou em até 5 minutos.

## Problemas comuns

| Sintoma | O que fazer |
|---|---|
| `/blog` mostra os 3 artigos de exemplo | `WORDPRESS_URL` não foi salva ou faltou o **Redeploy** (Parte 10) |
| `/blog` fica vazio | Nenhum post **publicado** (rascunho não aparece) ou a API está fechada (refaça a Parte 7) |
| O deploy na Vercel falha | Confira o endereço em `WORDPRESS_URL` (com `https://`, sem barra no fim) e se a Parte 7 abre no navegador |
| Artigo aparece em "Finanças" sem eu escolher | Faltou categoria válida (Parte 4) ou o slug da categoria está diferente do esperado |
| Não aparece a caixa de fontes | O título precisa ser **H2** e escrito `Fontes oficiais` (ou `Fontes`), com a lista de links logo abaixo |
| Link de afiliado sem o aviso | O domínio não está na lista `affiliateDomains` em `data/site.config.ts`; adicione-o ou use a etiqueta `afiliado` |
| Publiquei e não atualizou na hora | Confira o snippet (Parte 9): endereço do **site**, segredo igual nos dois lados. Sem ele, espere até 5 minutos |
| Vídeo do YouTube ou HTML personalizado sumiu | É de propósito (segurança). Coloque o link do vídeo no texto |
| Editei um erro de digitação e mudou o "Atualizado em" | Normal: a data muda a cada atualização do post |

## Rotina para cada artigo novo

1. Título, texto com H2/H3, resumo.
2. Uma categoria; etiquetas; `cta-...` e `afiliado`, se for o caso.
3. Se for de Tributos: seção **Fontes oficiais** no fim.
4. Imagens reduzidas, com texto alternativo.
5. **Publicar** e conferir no site.

## Segurança do painel (manutenção)

- Mantenha WordPress e plugins atualizados (Parte 6.4) e o backup semanal funcionando (UpdraftPlus).
- Use senha longa e única no admin e, se possível, ative verificação em duas etapas (plugin à sua escolha).
- Não compartilhe o `REVALIDATE_SECRET`. Se vazar, troque na Vercel e no snippet.
