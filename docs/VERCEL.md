# Publicar The Fish na Vercel

A aplicação suporta o framework Next.js, Node.js 24 e um banco PostgreSQL remoto. O banco local SQLite não é usado na Vercel.

1. Abra o projeto conectado ao GitHub `jopanogg3104-create/soup`, branch `main`.
2. Conecte PostgreSQL em Storage / Marketplace (Neon ou Supabase). O provedor deve disponibilizar `DATABASE_URL` ou `POSTGRES_URL` ao servidor.
3. Cadastre `FISH_ADMIN_PASSWORD` em Settings → Environment Variables, com pelo menos 16 caracteres, somente no servidor. Não envie a senha ou a conexão em conversas.
4. Faça Redeploy e abra o endereço de Domains. O painel é `/atendimento`.
5. Confirme pagamentos presenciais, área e taxas de entrega e combinados antes de ativar pedidos.

Use PostgreSQL de teste separado em Preview. A criação de tabelas é idempotente no schema `fish`, sem alterar tabelas de outros aplicativos. Sessões e pedidos são duráveis no banco remoto. O total é calculado no servidor; seis envios concorrentes da mesma chave foram verificados em PostgreSQL real com apenas um pedido salvo.

Se o banco estiver ausente, o cardápio continua consultável e novos pedidos não podem ser enviados. Falha de banco não confirma recebimento. Pagamento online não está integrado. Confira a operação depois do deploy: o build local não comprova a configuração da conta Vercel.

Ao trocar a senha depois do primeiro cadastro, configure FISH_ADMIN_PASSWORD no ambiente seguro que acessa esse mesmo banco e execute `npm run admin:setup -- --reset`. Isso substitui o hash e encerra sessões. Não exponha conexão nem senha em logs.
