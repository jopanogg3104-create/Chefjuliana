# Chef Juliana Nogueira

Site em Next.js com páginas pré-renderizadas, portfólio responsivo, apresentação da chef, formulário em uma única tela e mensagem estruturada para WhatsApp.

## Executar

Node.js 24. `npm ci`, seguido de `npm run dev` para desenvolvimento. Para produção: `npm run build` e `npm start`. Execute `npm test` após o build; os testes incluem servidor Next.js real, rotas, validação e comportamento sem banco.

## Organização

- `app/`: páginas App Router, metadados e estilos da nova apresentação.
- `components/landing/`: página interativa e formulário de orçamento em uma única tela.
- `components/ui/`: componentes shadcn/ui personalizados e acessíveis.
- `pages/`: APIs existentes e sitemap.
- `public/`: fotos, vídeos e fontes locais fornecidos anteriormente.
- `content/site.html`, `components/Site.js` e scripts antigos: referência da apresentação anterior, sem uso nas novas páginas.
- `docs/DESIGN.md`: direção visual e adaptação da skill fornecida, sem depoimentos inventados.
- `lib/`: validação, configuração e persistência PostgreSQL.

## Publicação sem credenciais

Importe `jopanogg3104-create/soup` na Vercel com o tipo de projeto **Next.js**, diretório raiz padrão. `vercel.json` define a configuração correta; a pasta de saída é gerenciada pelo Next.js. Não usar `public` como diretório de saída nas configurações antigas da Vercel.

Sem banco configurado, o site funciona sem chaves, senhas ou variáveis. O formulário monta a mensagem para o WhatsApp confirmado +55 (14) 99756-3799 e não declara que o pedido foi armazenado. O usuário precisa enviar a mensagem no WhatsApp.

## Armazenamento opcional

`DATABASE_URL` ou `POSTGRES_URL` conecta PostgreSQL pelo servidor, com verificação TLS. A conexão deve ser configurada na hospedagem, nunca em código, GitHub ou conversa. Sem conexão, o site continua com WhatsApp. Não há consulta pública de leads. As tabelas são criadas pela função; detalhes em `docs/VERCEL.md`.

Variáveis opcionais: `WHATSAPP_NUMBER` para trocar o contato e `SITE_URL` para URL pública/metadados. A Vercel também fornece `VERCEL_PROJECT_PRODUCTION_URL`.

## Pendências comerciais

Confirmar região atendida, autorizações de imagem e política final de privacidade/retenção. Serviços publicados: chef em domicílio, gastronomia para eventos, tábuas gastronômicas e encontros à mesa. A foto de Juliana foi enviada e identificada pelo usuário. Páginas individuais de eventos e painel administrativo permanecem como evoluções.

Use o checkout existente; não crie worktree durante setup. Na nuvem, instale com lockfile, faça o build e reinicie o servidor em novas tarefas. Processos não sobrevivem ao snapshot.
