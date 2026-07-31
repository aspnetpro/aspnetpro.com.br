# aspnetpro.com.br

Site institucional da Comunidade ASP .NET PRO. HTML estático, sem build, sem framework.
Deploy automático pelo GitHub Pages a cada push na `main` (`.github/workflows/deploy.yml`, artifact da raiz `.`).
Não existe passo de compilação: o que está no repositório é exatamente o que vai ao ar.

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
- Cada página é autocontida: CSS inline em `<style>`, design tokens repetidos em `:root`. Não existe folha de estilo compartilhada — ao mudar um token, replicar nas páginas afetadas.
- Favicons apontam para `workshop-dev-net-ia-10x/images/`; logo em `assets/images/logo.png`.
- Cards da home: mesmo template para todos. Produto sem página própria usa badge cinza "Em breve" e botão verde de WhatsApp no lugar do CTA de compra.

## Rastreamento

- **GA4 `G-8WGFZ1V9EY`** — em todas as páginas, inclusive `/conteudo/`.
- **Meta Pixel `1101401740490109`** — só nas páginas comerciais (home, curso, workshop, mentoria). Nunca em `/conteudo/`.

## CTA de WhatsApp

`https://wa.me/5543996136005?text=<mensagem URL-encoded>` com `target="_blank" rel="noopener"`.
A mensagem pré-preenchida identifica o produto (ex.: `Tenho%20interesse%20no%20curso%20ASP%20.NET%20APIs`).

## Git

Não commitar nem dar push sem o Michel pedir.
