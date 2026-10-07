# Publicar na Vercel

## Visualizar o site com WhatsApp

1. Na Vercel, abra **Add New → Project**.
2. Importe o repositório GitHub **jopanogg3104-create/soup**, branch **main**.
3. Use **Framework Preset: Next.js**, diretório raiz padrão. O `vercel.json` define Next.js e build `npm run build`; a pasta de saída está explicitamente definida como `.next`. Remova qualquer substituição antiga de saída `public` nas configurações do projeto.
4. Clique em **Deploy**. A Vercel fornecerá o endereço público `*.vercel.app`.

O WhatsApp +55 (14) 99756-3799 já é o padrão. Nenhuma chave é necessária para visualizar o site e montar a mensagem. Sem banco, o formulário não declara que recebeu o pedido: pede que o visitante envie o resumo no WhatsApp. Abrir o WhatsApp não envia a mensagem automaticamente.

## Armazenar os orçamentos

Na Vercel, conecte um banco PostgreSQL (por exemplo, Neon pelo Marketplace) ao projeto. Vincule a variável **DATABASE_URL** ou **POSTGRES_URL** disponibilizada pela integração e faça um novo deploy. Não coloque senhas em código, GitHub ou chat. Use conexão com TLS e usuário dedicado.

As funções criam `chef_leads` e `chef_lead_limits` no banco da integração. A conta precisa de permissão para criar essas tabelas no esquema conectado. Os dados de pedido ficam em `chef_leads.payload`. Não há listagem pública. Consulte pelo console autenticado do provedor. A chave de edição é armazenada como hash; o cliente mantém a chave durante a sessão.

Confirmar um envio só depois de gravar no banco. Falha de conexão preserva as respostas e oferece WhatsApp, sem confirmação falsa. A integração PostgreSQL foi implementada, mas o teste com banco real depende da configuração na Vercel; os testes locais verificam validação, ausência de banco e falhas de acesso.

## Variáveis opcionais

- `WHATSAPP_NUMBER`: `5514997563799` (já é o padrão).
- `SITE_URL`: endereço público HTTPS sem caminho para sitemap e Open Graph; o build também usa `VERCEL_PROJECT_PRODUCTION_URL` quando disponível.

## Antes de uso comercial

Ainda confirmar região/serviços, autorizações das fotos, texto da chef e política final de privacidade/retenção. Não associar este deploy a disponibilidade de data, orçamento em reais ou contratação automática.

### Correção de routes-manifest.json

Se a Vercel buscar `public/routes-manifest.json`, existe uma configuração antiga de saída `public`. O `vercel.json` define `outputDirectory: .next` para substituir essa configuração. A compilação deve gerar `.next/routes-manifest.json`; não copie esse arquivo para public.
