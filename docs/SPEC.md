# Spec — Chef Juliana Nogueira

Versão 1.0 · 7 de outubro de 2026 · Especificação para implementação

## 1. Produto e objetivo

Criar o site da marca gastronômica Chef Juliana Nogueira: uma experiência editorial, acolhedora e focada em gerar pedidos de orçamento qualificados. A comida protagoniza o visual; Juliana representa o cuidado e a personalidade por trás do trabalho.

A principal jornada é Instagram → conhecer o trabalho → visualizar eventos → conhecer Juliana → entender o processo → preencher briefing → pedido salvo → continuar pelo WhatsApp.

O sucesso será medido por início e conclusão do briefing, pedidos efetivamente armazenados e cliques para continuar no WhatsApp. Clique não significa mensagem enviada nem contratação. Metas numéricas comerciais serão definidas após obter uma base real.

## 2. Base da especificação e estado atual

- Um briefing principal e três cópias idênticas do briefing de refinamento foram consolidados. O refinamento orienta o acabamento da primeira implementação.
- O repositório contém apenas `TheFish`, com comandos de inicialização Git. Não existe uma primeira versão do site para auditar ou preservar.
- Foram inventariadas quatro fotografias e dez vídeos acessíveis, incluindo os arquivos dos três ZIPs. A análise visual dos vídeos foi feita por quadros representativos; a seleção final exige revisar os trechos completos.
- As imagens exibidas na conversa também orientam a direção: detalhes da comida, mesas completas e o retrato apresentado como referência para a seção da chef. Confirmar a identificação do retrato antes de publicar.
- `WhatsApp Video 2026-10-07 at 14.36.39.mp4` não foi transferido por exceder 32 MiB. Não está incluído na curadoria verificada.
- O perfil `https://www.instagram.com/chef.juliananogueira/` foi informado no briefing; seu conteúdo não foi consultado nesta etapa.
- Exemplos de casamentos, cidades, datas e quantidades nos textos não constituem fatos sobre serviços ou eventos realizados.

## 3. Escopo

### Primeira entrega

Home editorial, navegação responsiva, experiências confirmadas, portfólio real, apresentação da chef, processo em quatro etapas, orçamento em sete passos, armazenamento de leads, confirmação com resumo, encaminhamento pelo WhatsApp, página de privacidade e SEO básico.

O conteúdo deve ficar separado da apresentação para permitir alterações sem refazer o layout. O modelo de eventos e a estrutura de URLs devem suportar páginas individuais futuras.

### Evoluções

Páginas detalhadas de eventos, painel autenticado para consultar leads, filtros, exportação e mudança de status. Integração automática com Instagram e notificações podem ser adicionadas depois de avaliar manutenção e credenciais.

Não entram inicialmente: pagamento, orçamento automático em reais, reserva de data, CRM completo, login de clientes e promessa de disponibilidade. Um pedido de orçamento não confirma contratação.

## 4. Direção de arte

**Conceito:** “Sua celebração começa à mesa.” Gastronomia feita para reunir, com proximidade e apresentação cuidadosa.

**Paleta:** creme `#F5F1E8`, carvão `#1C1C1A`, verde profundo proposto `#293D32` e terracota proposta `#925642`. Validar contraste antes de aplicar os tons secundários a textos e controles.

**Tipografia proposta:** Cormorant Garamond para títulos e Inter para texto/interface, hospedadas localmente com licenças preservadas. Duas famílias, poucos pesos, títulos amplos e parágrafos curtos.

**Composição:** fotografias grandes, cantos predominantemente retos, espaço negativo, proporções variadas e alternância de intensidade visual. Evitar grades repetidas de cards, sombras fortes, gradientes, dourado artificial, estatísticas decorativas e excesso de CTAs.

**Movimento:** transições discretas de opacidade e links; sem rolagem artificial. Com `prefers-reduced-motion`, remover movimentos não essenciais e usar poster estático no hero.

**Voz:** português brasileiro, natural e preciso. Não inventar formação, anos de experiência, citações, depoimentos, avaliações, clientes ou localidades. Textos institucionais propostos precisam de aprovação editorial da chef antes de publicação.

## 5. Arquitetura e home

| Área | Conteúdo e comportamento |
| --- | --- |
| Header | Nome da marca; Experiências, Eventos, Sobre e Orçamento. Transparente somente quando legível sobre a abertura; fundo creme após rolagem. Menu mobile simples e acessível. |
| Hero | Foto horizontal real ou vídeo aprovado, título principal e subtítulo curto que explique gastronomia para eventos. Um CTA para conhecer; orçamento acessível no header e barra mobile. |
| Introdução | “Cada evento começa com uma história. A gastronomia faz parte dela.” Texto curto sobre ocasião, espaço e preferências, sujeito à aprovação editorial. |
| Experiências | Lista editorial com imagem relacionada. Desktop responde a hover, foco e clique; mobile usa expansão por toque. Publicar somente serviços confirmados. |
| Destaque e portfólio | Mesa completa ampla, fotos verticais, detalhes e vídeo sob demanda. Composição assimétrica equilibrada. Legendas só com fatos confirmados. |
| Sobre | Retrato grande, “Por trás de cada evento”, nome e texto pessoal curto aprovado pela chef. |
| Como funciona | 01 Conte sobre seu evento; 02 Criamos uma proposta; 03 Planejamos cada detalhe; 04 Chegou a hora de celebrar. Sem cards decorativos. |
| Depoimentos | Exibir apenas quando houver relato verdadeiro e autorização; omitir a seção na ausência desses dados. |
| Convite ao orçamento | “Conte sobre seu evento.” Acesso direto ao briefing. |
| Instagram | “Continue acompanhando nossa cozinha.” Composição com imagens autorizadas e link para o perfil. Não apresentar seleção manual como feed atualizado automaticamente. |
| Footer | Marca, navegação, Instagram, WhatsApp configurado, privacidade e região somente quando confirmada. |

Rotas propostas: `/`, `/orcamento`, `/privacidade`; evolução `/eventos/[slug]`. Não criar links para páginas inexistentes. A página individual futura terá abertura visual, fatos confirmados, narrativa curta, galeria e CTA contextual.

Barra mobile: “Solicitar orçamento” e “WhatsApp”, discreta, respeitando safe-area e sem cobrir conteúdo ou controles do briefing. Evitar duplicação durante o formulário.

## 6. Curadoria dos materiais

| Material | Papel proposto | Cuidados |
| --- | --- | --- |
| Imagem 14.27.40 (1), 1280×853 | Candidata à abertura desktop: mesa ao ar livre | Validar nitidez na largura final; não presumir local ou tipo de evento. |
| Imagem 14.27.40, 1024×683 | Mesa completa no portfólio | Evitar ampliação excessiva; preservar crédito/marca visível e confirmar direitos. |
| Imagens 14.27.40 (2) e 14.30.18 | Composição vertical e detalhes | Reenquadrar sem cortar o assunto principal. |
| Fotos exibidas na conversa | Detalhes, mesa completa e seção humana | Obter arquivos utilizáveis para produção e confirmar identificação/autorização. |
| Vídeos 14.35.52, 14.36.39 (1), 14.30.18 e 14.30.14 | Candidatos a cortes de mesas e detalhes | Validar estabilidade, foco, enquadramento e permissões em cada trecho. |
| Vídeos 14.36.38, 14.36.40 e 14.29.15 | Serviço/preparo e bastidores | Conferir autorização de pessoas reconhecíveis. |
| Demais vídeos acessíveis | Conteúdo complementar do portfólio | Selecionar somente trechos úteis; não reproduzir todos automaticamente. |
| Vídeo 14.36.39 sem sufixo | Material pendente de análise | Necessita versão abaixo do limite de transferência para inspeção. |

Todos os vídeos acessíveis são verticais, de 464–720 px de largura, com duração aproximada de 3,7–126,3 segundos. Evitar esticá-los como fundo horizontal. Hero em vídeo terá corte curto proposto de 8–15 segundos, sem áudio automático, `muted`, `playsinline`, poster e fallback estático. Não carregar vídeo em economia de dados; disponibilizar pausa quando houver reprodução automática.

Gerar derivados WebP/AVIF, dimensões responsivas e poster, preservando originais. Remover metadados de localização dos derivados públicos. Não usar imagens de banco nem imagens geradas para substituir o trabalho real.

## 7. Briefing de orçamento

Uma decisão principal por passo, progresso discreto `01 / 07`, avançar/voltar, valores preservados durante a sessão e erros próximos ao campo. Agrupar cidade/local e dados de contato porque pertencem à mesma decisão. Não avançar automaticamente ao selecionar uma resposta.

| Passo | Pergunta | Dados e validação |
| --- | --- | --- |
| 1 | Que ocasião vamos celebrar? | Tipo obrigatório, a partir das categorias aprovadas; “Outro” permite descrição. Não usar opções como promessa de serviço. |
| 2 | Quantas pessoas estarão com você? | Faixa obrigatória: até 30, 31–50, 51–100, 101–150, 151–200, mais de 200. Faixas sem sobreposição; quantidade exata opcional. |
| 3 | Quando será? | Data futura/hoje ou “Ainda não defini”. Não implica disponibilidade. Datas passadas devem gerar orientação. |
| 4 | Onde vamos servir? | Cidade e UF obrigatórias; local opcional ou ainda não definido. Região fora de atendimento não recebe promessa automática. |
| 5 | Que experiência você imagina? | Seleção múltipla de serviços confirmados ou “Quero orientação”; pequenas imagens reais quando disponíveis. |
| 6 | Conte um pouco do que você imaginou. | Observações opcionais, até 2.000 caracteres; orientar a não incluir informações sensíveis. |
| 7 | Como podemos falar com você? | Nome e WhatsApp obrigatórios; e-mail opcional com validação se preenchido. Resumo editável antes de enviar e aviso de privacidade. |

Telefone normalizado com código do país e validação coerente com números brasileiros; aceitar formatação usual no campo. Validar também no servidor, limitar tamanhos, rejeitar opções inexistentes e evitar truncamento silencioso.

Não coletar detalhes de saúde de convidados no formulário público. Preferências e restrições que exigirem dados sensíveis devem ser tratadas em contato apropriado posteriormente.

Consentimento para marketing, se houver, separado, opcional e desmarcado. A base legal do atendimento e eventual consentimento obrigatório precisam de definição no aviso de privacidade; não tratar um checkbox genérico como conformidade completa à LGPD.

## 8. Envio, armazenamento e WhatsApp

1. Revisar as respostas e confirmar o envio.
2. Enviar para `POST /api/leads` por HTTPS, validando no servidor.
3. Salvar o pedido de forma durável e retornar identificador opaco.
4. Só após sucesso mostrar “Recebemos as primeiras informações sobre seu evento”, resumo e botão “Continuar pelo WhatsApp”.
5. Gerar link `https://wa.me/<numero-configurado>?text=<mensagem-codificada>` sem exigir redigitação. Abrir apenas por ação do visitante.

Mensagem: saudação à Juliana; nome, ocasião, data ou indefinida, cidade/UF, convidados, experiências e observações. O usuário pode revisar no WhatsApp antes de enviar. Informar que a mensagem será transferida ao WhatsApp, serviço externo.

Se o armazenamento falhar, manter as respostas, apresentar erro e permitir nova tentativa; oferecer mensagem para contato como alternativa, explicitando que o pedido não foi salvo. Nunca mostrar recebimento nessa situação. Se WhatsApp falhar ou não estiver instalado, oferecer copiar mensagem e preservar a confirmação do pedido já salvo.

Após envio, edição de um pedido deve usar autorização de sessão ou token opaco restrito, nunca apenas ID público. Atualizar o mesmo pedido antes de regenerar a mensagem. Usar chave de idempotência por envio para evitar duplicatas em cliques repetidos e novas tentativas.

## 9. Modelo de dados e acesso

**Lead:** `id`, `created_at`, `updated_at`, `name`, `phone`, `email?`, `event_type`, `event_type_other?`, `event_date?`, `date_undefined`, `city`, `state`, `venue?`, `guest_range`, `guest_count?`, `experience_ids[]`, `needs_guidance`, `notes?`, `source`, `utm_source?`, `utm_medium?`, `utm_campaign?`, `status`, `privacy_notice_version`, `marketing_consent?`.

Estados preparados: novo, contato realizado, orçamento enviado, negociação, fechado e não fechado. Novo é o estado inicial. Guardar versão do aviso e escolhas efetivas, sem presumir consentimento não solicitado.

**Experiência:** `id`, nome, descrição curta, imagem, posição e confirmação para publicação.

**Evento:** `slug`, título aprovado, tipo?, cidade?, data?, convidados?, experiências, texto?, mídias e permissões. Campos desconhecidos ficam ausentes na interface.

**Mídia:** arquivo original, derivados, dimensões, poster?, texto alternativo, crédito?, ponto focal e status de autorização.

Dados de leads não terão endpoint de listagem público. Consulta inicial por console autenticado do banco, com acesso restrito à pessoa responsável. Não construir painel administrativo aberto. Credenciais ficam no servidor. Definir retenção, exclusão, backups e responsável pelo atendimento antes de publicar.

## 10. Proposta técnica

Como não existe stack a preservar, propor Next.js com TypeScript, conteúdo estruturado local e CSS com tokens de design. Usar versão estável suportada no início da implementação e registrar versões no lockfile.

Páginas públicas pré-renderizadas quando possível; interatividade concentrada no briefing e nas experiências. API de leads no servidor e PostgreSQL gerenciado com migrações. A escolha do provedor e hospedagem deve garantir persistência e acesso autorizado. Banco local temporário serve somente para desenvolvimento; armazenamento em memória, arquivo efêmero ou `localStorage` não satisfaz recebimento de leads em produção.

Configurações previstas: URL pública, número comercial do WhatsApp e conexão do banco. Nunca colocar senha do banco no navegador ou repositório. Número comercial deve ser definido antes de habilitar CTAs reais; ausência deve ser claramente tratada no ambiente de desenvolvimento, sem links fictícios.

Aplicar limites de requisição, validação, proteção contra submissões externas conforme arquitetura, prevenção de spam acessível e logs sem conteúdo pessoal. Tratamento de URLs e observações deve evitar injeção e XSS. Dependências extras de animação só entram se necessárias.

## 11. Performance, SEO e acessibilidade

- Mobile first: verificar 360, 390, 768 e 1440 px, sem rolagem horizontal e com zoom de texto a 200%.
- Imagem principal carregada prioritariamente; demais imagens em lazy loading, com dimensões reservadas e `sizes` coerentes. Vídeos do portfólio carregados sob demanda.
- Metas de produção: LCP ≤ 2,5 s, INP ≤ 200 ms e CLS ≤ 0,1 no percentil 75 quando houver dados reais suficientes. Testes de laboratório orientam otimização e não substituem dados de campo.
- Meta inicial de laboratório: Lighthouse mobile ≥ 90 em performance e acessibilidade na home, com condições registradas. Não alegar aprovação sem medir.
- HTML semântico, um H1 por página, labels, erros anunciados, foco visível, contraste WCAG AA e alvos de toque de pelo menos 44×44 px.
- Menu, expansões e briefing operáveis por teclado. Hover nunca é o único acesso ao conteúdo. Ao mudar de passo, mover foco para o título; preservar foco ao fechar menu/modal.
- Titles, descrições, canonical, sitemap, robots, Open Graph e imagens de compartilhamento. Não indexar endpoints de leads ou conteúdo administrativo.
- Dados estruturados somente com fatos confirmados; não criar endereço, área de atendimento, avaliações ou categoria comercial falsa.
- Link externo para Instagram inicialmente; sem dependência de API ou scraping para a home funcionar.
- Medição opcional de `quote_started`, `quote_step_completed`, `quote_submitted` após gravação e `whatsapp_clicked`, sem nome, telefone, e-mail ou observações nos eventos. Avaliar consentimento antes de ativar ferramentas não essenciais.

## 12. Critérios de aceitação

1. A primeira tela informa que Juliana cria experiências gastronômicas para eventos; visitantes conseguem localizar o início do orçamento rapidamente.
2. Home utiliza materiais reais autorizados, com composições variadas e apresentação humana da chef; nenhum fato comercial é inventado.
3. Navegação, imagens, menu e briefing funcionam nas larguras previstas, por toque e teclado, sem conteúdo encoberto pela barra fixa.
4. As sete etapas podem ser percorridas nos dois sentidos sem perder respostas. Obrigatoriedade, data indefinida, e-mail opcional e faixas sem sobreposição funcionam.
5. Um envio válido cria registro durável verificável. Repetição do mesmo envio não cria duplicata. Reiniciar a aplicação não apaga o registro.
6. Falha simulada do banco não mostra recebimento; respostas permanecem disponíveis e a nova tentativa funciona.
7. Confirmação apresenta resumo fiel. Edição autorizada atualiza o pedido correspondente e a mensagem; terceiros não conseguem alterar pedidos pelo ID.
8. WhatsApp usa o número confirmado e mensagem codificada com acentos e quebras de linha corretos; clicar não é registrado como mensagem enviada.
9. Nenhuma credencial ou listagem de leads aparece no cliente, HTML, API pública ou logs. Dados pessoais não entram na ferramenta de analytics.
10. Poster aparece quando vídeo está indisponível, movimento reduzido ou economia de dados. Vídeos não iniciam áudio automaticamente e oferecem pausa.
11. Executar build, checagem de tipos, testes de validação/API e testes ponta a ponta do briefing, incluindo erro, repetição e edição; revisar acessibilidade manual e automaticamente.
12. Registrar métricas de performance e corrigir problemas materiais antes da publicação. Sitemap e metadados só apontam para páginas existentes.

## 13. Pendências factuais para publicação

| Informação | Impacto |
| --- | --- |
| WhatsApp comercial com DDI/DDD | Habilitar contato e encaminhamento real. |
| Cidade-base e região atendida | Textos comerciais, footer, SEO regional e orientação no briefing. |
| Serviços e tipos de evento efetivamente oferecidos | Publicar experiências e opções do briefing. |
| Texto pessoal e identificação/autorização do retrato | Publicar seção da chef sem inventar biografia. |
| Direitos de imagens, vídeos, créditos e pessoas visíveis | Selecionar materiais publicáveis, inclusive os com marcas de fotógrafos. |
| Dados e agrupamento dos eventos | Criar títulos, legendas e páginas individuais sem deduções factuais. |
| Responsável pelo tratamento, contato de privacidade e retenção | Finalizar aviso de privacidade e operação dos leads. |
| Hospedagem, banco e acesso da responsável | Validar persistência e consulta real dos pedidos em produção. |

Essas pendências não impedem estrutura, design e desenvolvimento local. Impedem publicar funcionalidades ou afirmações que dependam delas. O vídeo não transferido é material complementar; não bloqueia o site.

## 14. Sequência de entrega

1. Estruturar projeto e conteúdo; confirmar serviços e curadoria autorizada.
2. Construir home e versão mobile com fotos, antes de adicionar movimentos.
3. Implementar briefing, persistência, confirmação e WhatsApp.
4. Refinar direção de arte com auditoria real da implementação: hierarquia, legibilidade, ritmo, excesso de interface e personalidade.
5. Executar critérios de aceitação e fechar pendências factuais.
6. Preparar entrega para publicação com configuração documentada. Publicação não é presumida por um build bem-sucedido.

Esta entrega é a especificação consolidada. O site e seus testes ainda não foram implementados ou executados.

## Atualização de serviços confirmados

O usuário confirmou que Juliana também é chef domiciliar, atende em domicílios e oferece tábuas de comidas e cestas de café da manhã, além de eventos. Outras opções são tratadas sob consulta, sem promessa de atendimento irrestrito. Home, apresentação e orçamento incluem essas modalidades; quantidade de pessoas aceita 1–10 e 11–30. O serviço selecionado aparece no resumo, WhatsApp e registro do lead. Região e disponibilidade continuam pendentes de confirmação.

## Atualização de apresentação dos serviços

A pedido do usuário, “Cestas de café da manhã” foi substituído por “Encontros à mesa”, com foco em almoços e jantares em casa. A descrição aprovada é: “Uma refeição especial em casa, pensada com Juliana para receber e compartilhar.” A atualização vale para a home e para novos pedidos do formulário; registros antigos permanecem preservados.
