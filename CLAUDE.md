# aspnetpro.com.br

Site institucional da Comunidade ASP .NET PRO. HTML estático, sem build, sem framework.
Deploy automático pelo GitHub Pages a cada push na `main` (`.github/workflows/deploy.yml`, artifact da raiz `.`).
Não existe passo de compilação: o que está no repositório é exatamente o que vai ao ar.
O domínio passa pelo **Cloudflare** na frente do GitHub Pages: imagens e `.ico` ficam em cache até 4h. Ao trocar um asset mantendo o nome, pedir ao Michel o purge da URL no Cloudflare (o HTML não é cacheado).

## Regra obrigatória: toda inclusão de conteúdo replica SEO

Ao criar página nova, mudar preço, abrir/fechar inscrição, adicionar card na home ou alterar
qualquer conteúdo público, atualizar **no mesmo commit**, sem precisar ser lembrado:

1. **`sitemap.xml`** — adicionar a URL se a página existe de fato; atualizar `lastmod` de toda URL cujo HTML mudou. Nunca listar página que não existe.
2. **`llms.txt`** — refletir preço, status de inscrição e ofertas. Produto sem página própria fica na seção `## Em breve`, descrito e **sem link**.
3. **`robots.txt`** — só quando houver nova rota a liberar ou bloquear (ex.: páginas de obrigado ficam em `Disallow`).
4. **Meta da própria página** — `<title>`, `description`, `canonical`, Open Graph, Twitter Card e JSON-LD coerentes com o conteúdo novo.

JSON-LD em uso no site: `Organization`, `WebSite` + `SearchAction`, `Course`, `Event` + `VirtualLocation`, `Offer`, `Person`, `BreadcrumbList`. Preço e disponibilidade dentro de `Offer` precisam bater com o que a página mostra.

## Exceção: a área `/conteudo/`

Conteúdo gratuito, intencionalmente fora do índice do Google:

- Cada página leva `<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">` (e a variante `googlebot`).
- **Nunca** entra em `sitemap.xml` nem em `llms.txt`.
- **Nunca** ganha `Disallow` no `robots.txt` — bloquear o crawl impediria o bot de ler a tag `noindex`, que é justamente o mecanismo que queremos.
- Não é linkada a partir da home.
- Sem Meta Pixel. Links externos levam `rel="noopener nofollow"`.

Não sugerir "melhorias de SEO" para essa área.

## Código nos artigos e exemplos

- Alvo é **.NET 10 / ASP.NET Core 10**. Nunca escrever ASP.NET Core 8 ou 9.
- Confirmar assinatura de API, nome de propriedade e comportamento padrão via **context7** antes de publicar — não confiar em memória de treino.

## Convenções de página

- `lang="pt-BR"`, texto em português do Brasil.
- **`assets/css/base.css`** guarda tokens, header com menu (`.site-header`/`.site-nav`), rodapé (`.site-footer`) e botões (`.ui-btn`). Toda página pública fora de `/conteudo/` carrega o arquivo antes do próprio `<style>`. O CSS específico continua inline.
- Tokens do `base.css` usam prefixo **`--site-`** (`--site-accent`, `--site-border`…): o curso Razor Pages define `--accent`/`--border` em HSL e quebraria o menu. Nunca usar nome de token que apareça dentro de nome de classe (o renomeio de `--whatsapp` já pegou `.ui-btn--whatsapp` uma vez).
- Menu e rodapé são o mesmo HTML em todas as páginas: ao mudar um item, replicar em todas (a fonte é `palestras/index.html`).
- Imagens OG: `assets/images/og-image.png` (home e landing pages de IA 10x) e `assets/images/og-palestras.png`, 1200×630, < 300 KB.
- Favicons apontam para `workshop-dev-net-ia-10x/images/`; logo em `assets/images/logo.png`.
- Home: hero com foto → "Para você, dev" (`#formacao`, cards) → palestras → método público (GitHub) → e-mail → quem conduz (`#sobre`) → WhatsApp. Cards da home: mesmo template para todos. Produto sem página própria usa badge cinza "Em breve" e botão verde de WhatsApp no lugar do CTA de compra.

## Rastreamento

Todo o tracking passa por **`assets/js/track.js`**, carregado de forma síncrona no `<head>`. Nenhuma página carrega `gtag.js` ou `fbq` por conta própria.

- **Consentimento (LGPD):** banner próprio + Google Consent Mode v2. Sem aceite, o GA4 roda em modo restrito e o Pixel não carrega. Página nova precisa do link para `/politica-de-privacidade/`.
- **GA4 `G-8WGFZ1V9EY`** — em todas as páginas, inclusive `/conteudo/` (só `<script src="/assets/js/track.js">`, sem configuração).
- **Meta Pixel `1101401740490109`** — só nas páginas comerciais, via `window.ASPNETPRO_TRACK = { pixel: true, item: {...} }` antes do script. Nunca em `/conteudo/`.
- **Eventos automáticos:** `view_item`/`ViewContent` (quando há `item`), `select_item` (link com `data-select-item`), `generate_lead`/`Contact` (clique em `wa.me`; produto em `data-item`). Formulário de captura chama `aspnetproTrack.lead(method, { list })` → `generate_lead` + `Lead`.
- **Nunca** eventos de checkout/compra no site — nem `begin_checkout`/`purchase` (GA4) nem `InitiateCheckout`/`Purchase` (Pixel): a Kiwify já envia os dois. Não existe CAPI no site (Zaraz foi removido).
- **Atribuição:** UTMs, `fbclid` e `gclid` da entrada ficam no `sessionStorage` e são anexados a todo link da Kiwify, em qualquer página da sessão.
- **CTA de checkout é sempre `<a href>`**, nunca `<button onclick="window.open">`: o tracking e o repasse de UTM dependem do link.

## CTA de WhatsApp

`https://wa.me/5543996136005?text=<mensagem URL-encoded>` com `target="_blank" rel="noopener"`.
A mensagem pré-preenchida identifica o produto (ex.: `Tenho%20interesse%20no%20curso%20ASP%20.NET%20APIs`).

## Git

Não commitar nem dar push sem o Michel pedir.
