# The Fish — Restaurante e Petiscaria

Aplicação Next.js para Botucatu, com cardápio digital, carrinho, pedidos registrados em PostgreSQL na Vercel (ou SQLite local), acompanhamento por link privado e painel autenticado. Interface em português, responsiva, sem fotografias ou depoimentos inventados.

## Executar

Requer **Node.js 24**, sistema com disco persistente e acesso ao registro npm. Use o checkout existente; não crie worktree salvo pedido explícito.

```sh
cd /workspace/soup
npm ci --cache /tmp/thefish-npm-cache
npm run admin:setup
npm run dev
```

O servidor usa a porta 3000. A página inicial fica em `/`; o painel em `/atendimento`. `admin:setup` cria uma senha aleatória, armazenada com hash scrypt no banco. A credencial inicial fica em `data/admin-credentials.txt`, com permissão 0600. Guarde-a em gerenciador de senhas e remova esse arquivo depois de ler. **Não publique a credencial, o banco ou a pasta data.** O script não troca administradores existentes. Para recuperar o acesso: `npm run admin:setup -- --reset`; isso encerra as sessões atuais.

Para produção:

```sh
npm run build
npm start
```

## Publicação na Vercel

O projeto já suporta Vercel com banco PostgreSQL remoto. No painel da Vercel:

1. Abra o projeto conectado a `jopanogg3104-create/soup`, branch de produção `main`, framework **Next.js**, diretório raiz padrão. O build é `npm run build`; a saída é gerenciada pelo framework.
2. Em **Storage / Marketplace**, conecte um PostgreSQL, por exemplo Neon ou Supabase, ao projeto. A aplicação lê `DATABASE_URL` ou `POSTGRES_URL` exclusivamente no servidor. Não copie a conexão para o código ou para mensagens.
3. Em **Settings → Environment Variables**, cadastre `FISH_ADMIN_PASSWORD` com uma senha forte de pelo menos 16 caracteres. Não use prefixo NEXT_PUBLIC_. Habilite as variáveis em Production; use banco separado para Preview, evitando que testes de branches alterem os pedidos reais.
4. Faça **Redeploy**. O banco cria as tabelas no schema próprio `fish` na primeira chamada e preserva os dados existentes. O login inicial cadastra somente o hash scrypt da senha; os logins seguintes reutilizam o administrador do banco. Trocar a variável depois não substitui a senha existente automaticamente.
5. Abra o domínio exibido em **Domains**, consulte o cardápio e entre em `/atendimento` com a senha que você configurou. Habilite as condições comerciais descritas abaixo e valide um pedido de teste identificado, o recebimento no painel e o acompanhamento.

Sem banco configurado na Vercel, a página e o cardápio continuam disponíveis para consulta; o envio de pedidos e o painel operacional permanecem bloqueados. **Não há confirmação simulada nem armazenamento em `/tmp`.** Sem acesso à conta Vercel, enviar o commit ao GitHub permite acionar o deploy automático já conectado, mas não configura o banco, as variáveis ou comprova a conclusão desse deploy.

A conexão remota usa TLS com validação do certificado, conexão curta e transações com bloqueio de linha para idempotência e atualização de status entre instâncias. Configure backups e a retenção dos dados no provedor. O PostgreSQL de produção não foi fornecido a este ambiente; os testes usam banco real descartável separado.

## Desenvolvimento local e alternativa de hospedagem

Sem DATABASE_URL/POSTGRES_URL, o desenvolvimento usa SQLite privado em `data/thefish.sqlite`. Também é possível executar em um servidor Node.js 24 com volume gravável persistente e HTTPS.

- `FISH_DB_PATH`: caminho absoluto do SQLite local, fora de qualquer pasta pública.
- `SITE_URL`: origem pública HTTPS para sitemap; na Vercel a aplicação também reconhece `VERCEL_PROJECT_PRODUCTION_URL`.
- Cookies de produção exigem HTTPS. `FISH_SECURE_COOKIE=false` existe somente para testes internos em HTTP; não usar na publicação pública.
- Faça backups consistentes, teste restauração e defina procedimentos de exclusão dos dados pessoais.
- O SQLite local não é enviado ou migrado automaticamente para o PostgreSQL. Cada banco preserva seus próprios produtos, configurações, administradores e pedidos.
- Pagamento online ainda exige provedor real e confirmação por webhook. As formas do painel são pagas no atendimento.

## Ativação no painel

Antes de receber pedidos, entre em `/atendimento` e confirme as configurações comerciais:

1. Habilite as formas de pagamento **no atendimento** que o restaurante aceita. Inicialmente nenhuma está habilitada, para não inventar condições comerciais. Escolher pagamento não marca o pedido como pago; o restaurante registra o recebimento separadamente.
2. Retirada está habilitada no endereço informado. Entrega está desabilitada até configurar bairros atendidos e taxas conhecidas. Taxa desconhecida não significa entrega gratuita.
3. Confirme as opções elegíveis e a possibilidade de repetição dos combinados. Eles estão bloqueados inicialmente. O servidor exige exatamente três opções e respeita as restrições do pescador, VIP e cliente.
4. Revise horários, feriados e limite de recebimento. Quinta a sábado: 11h–14h e 18h–23h, sempre America/Sao_Paulo. Segunda a quarta e domingo fechados. Confirme a segunda-feira habitual; a referência original veio de uma semana de feriado.
5. Agendamento é opcional e inicialmente desabilitado. Quando habilitado, exige um horário de funcionamento nos próximos 14 dias. Pausa temporária bloqueia todos os novos pedidos, inclusive agendados.

O cardápio completo permanece consultável fora do horário. Produtos sem preço abrem consulta no WhatsApp e não podem ser adicionados como gratuitos. Os horários são atualizados no cliente a cada minuto e validados novamente no servidor.

## Fluxo e segurança

O pedido passa por Pedido → Entrega ou retirada → Dados e pagamento → Revisão. Não exige conta. O carrinho fica no armazenamento local; dados do checkout ficam na sessão do navegador até o envio bem-sucedido.

O servidor revalida preços, disponibilidade, variantes, preparos, opções, horário, modalidade, pagamento e taxa. Calcula o total e preserva a fotografia dos dados comerciais no momento da compra. Uma chave de idempotência única evita duplicação por cliques e novas tentativas com o mesmo conteúdo. Só confirma o recebimento após commit no banco.

O acompanhamento usa token não previsível; não há listagem pública de pedidos. O painel usa sessão com cookie HttpOnly/SameSite, expiração de oito horas, checagem de origem e limite de tentativas de login. Há atualização real por consulta a cada cinco segundos; o alerta sonoro exige ativação do atendente e o painel aberto. O histórico possui filtros e carregamento de pedidos anteriores em lotes de 500.

Status: Recebido → Confirmado → Em preparo → Pronto para retirada / Saiu para entrega → Concluído. Recusa exige motivo. Status do pagamento é separado. As escolhas, observações, dados necessários ao atendimento e pagamento estão no painel protegido.

WhatsApp é um canal complementar; o site não envia mensagens automaticamente. Para pagamento online, ainda é necessário contratar um provedor real, implementar checkout seguro e confirmação por webhook no servidor.

## Validação

```sh
npm run build
npm test
```

A suíte usa servidor de produção e banco isolado temporário: criação e recuperação de pedidos, idempotência, preços, indisponibilidade, variantes obrigatórias, combinados, horários fechados, taxas, autorização, origem, recusa, pagamentos, transições e persistência após reiniciar. A suíte também verifica o modo Vercel sem banco. Com FISH_TEST_POSTGRES_URL apontando para o PostgreSQL local descartável fish_test, executa teste real de PostgreSQL, seis envios concorrentes do mesmo pedido e atualizações simultâneas de status. Testes de unidade verificam horário de Brasília, intervalo de fechamento, feriados, limite e agendamento.

Também foi executado teste no Chromium em desktop e celular: escolha de variantes, montagem com três opções, carrinho após atualização, falha de rede preservando carrinho, novo envio, recebimento no painel e atualização real no acompanhamento. As ferramentas do teste visual ficam fora das dependências da aplicação.

## Pendências reais

- Logo do restaurante e logo do Júlio; fotos autorizadas (dispensadas no momento).
- Preços do picadinho, Mineiro e torresmo caipira.
- Restante do cardápio Boteco.
- Esclarecer os 32 g dos camarões: a informação foi preservada sem inferência.
- Confirmar o horário habitual de segunda-feira.
- Confirmar opções elegíveis e repetição dos combinados.
- Área e taxas de entrega; formas de pagamento.
- Conectar PostgreSQL ao projeto Vercel, configurar FISH_ADMIN_PASSWORD, conferir domínio/HTTPS, backups, retenção e eventuais integrações.

Os arquivos e ativos do site anterior foram preservados quando não precisaram mudar; suas imagens não são utilizadas pelo The Fish. APIs antigas de orçamento foram descontinuadas para evitar encaminhamento ao negócio anterior.
