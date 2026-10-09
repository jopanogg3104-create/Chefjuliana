# Reformulação da Chef Juliana

Guia aplicado: landing-page-guide-v2, fornecido pelo usuário. Direção editorial acolhedora, com Cormorant Garamond e DM Sans, creme, terracota e oliva. Fotografias e vídeo preservados do acervo já existente; nenhum depoimento, avaliação, estatística comercial ou urgência foi inventado.

A prova do trabalho vem do portfólio e da apresentação da chef. Depoimentos autênticos ficam pendentes de material autorizado, conforme confirmado pelo usuário. Não há seção com avaliações fictícias.

A interface usa App Router, TypeScript, Tailwind CSS e componentes shadcn/ui com Radix UI, personalizados para a marca. A consulta do registro ui.shadcn.com pela CLI falhou. Os componentes foram obtidos do repositório oficial shadcn-ui/ui, com licença MIT preservada nesta pasta, e seus imports foram adaptados ao projeto.

As APIs de orçamento existentes e seus contratos foram preservados. Sem banco, o visitante prepara o resumo e precisa enviá-lo no WhatsApp; a interface não confirma armazenamento ou envio automático. Valores, menus, região e disponibilidade permanecem sob consulta.
Fonte dos componentes: commit `2d3f1cd436b18ea12f24130de4df781355925b08` do repositório oficial.

## Validação desta reformulação

Build de produção e quatro testes Node passaram. O fluxo foi exercitado em Chromium: larguras de 320, 390, 768, 1024 e 1440 px sem overflow horizontal; navegação das experiências por teclado; perguntas frequentes; sete etapas do orçamento; respostas preservadas ao voltar; link WhatsApp com resumo; foco restaurado ao fechar; acesso direto a orçamento e privacidade. Também foram verificados falha de conexão, tentativa com a mesma chave de idempotência e alternativa para WhatsApp sem confirmação falsa de recebimento. As cinco imagens inicialmente presentes na página carregaram pela otimização Next/Image. Análise axe-core WCAG A/AA da página e do diálogo não apontou violações nos estados testados; isso não substitui uma auditoria completa.

O domínio público não pôde ser consultado a partir deste ambiente: o proxy bloqueou a conexão com HTTP 403. O build local validado não comprova a conclusão do deploy da Vercel.
