# Chef Juliana Nogueira

Site editorial responsivo baseado em `docs/SPEC.md`, com fotografias reais, vídeo sob demanda, formulário em sete passos, confirmação e mensagem para WhatsApp.

## Executar

Node.js 22 ou superior. `npm ci --cache /tmp/soup-npm-cache`, seguido de `npm start`. Porta padrão: 3000. `npm test` verifica validação, idempotência, edição, acesso e persistência após reinício. Os arquivos públicos de fonte já estão incluídos com suas licenças.

Configuração opcional: `SITE_URL` (URL pública para sitemap), `PORT`, `DATA_DIR` (diretório privado durável) e `WHATSAPP_NUMBER` (somente dígitos, com DDI e DDD). O WhatsApp comercial confirmado é +55 (14) 99756-3799, usado por padrão. A variável permite alterar esse contato.

## Persistência

Esta implementação inicial usa Node HTTP e arquivo JSON privado, com escrita atômica, fila de gravação e chave aleatória de sessão para editar o mesmo pedido. Não requer serviço externo para desenvolvimento. Não há endpoint público de listagem. Dados ficam em `data/leads.json`, ignorado pelo Git. Consulte somente em ambiente autorizado. A aplicação deve rodar em **um único processo**, com volume persistente e backups. Na Vercel, as funções em `api/` usam PostgreSQL com DATABASE_URL ou POSTGRES_URL. Sem banco, o formulário monta o resumo para WhatsApp sem afirmar armazenamento. Consulte [Publicar na Vercel](docs/VERCEL.md).

A chave de edição permanece apenas na sessão do navegador. Recarregar a página inicia novo briefing. Nenhuma sessão ou dado de lead é enviado a analytics.

## Antes de publicar

Confirmar serviços, região, telefone, autorizações de imagem, textos comerciais, identidade do retrato e política de retenção/contato de privacidade. A seção “Esta é a Juliana” utiliza o retrato enviado e identificado pelo usuário como a Chef Juliana Nogueira. As experiências são descrições visuais do material, sem prometer categorias comerciais ainda não confirmadas. O aviso de privacidade é preliminar e precisa de finalização para uso comercial.

A home usa foto horizontal para evitar ampliar vídeos verticais de baixa resolução. Há vídeo real, curto e sem áudio no portfólio. A arquitetura foi simplificada para HTML/CSS/JavaScript e servidor Node, em vez de Next.js: sem build, com poucas dependências e fontes locais. Páginas individuais de eventos e painel administrativo continuam como evoluções da spec. A adaptação Vercel inclui funções serverless e persistência PostgreSQL; a validação contra banco real depende da integração na Vercel.

Não há publicação automática. Para a nuvem, preserve o checkout existente, instale com lockfile e reinicie o servidor com as variáveis configuradas; não crie worktree.
