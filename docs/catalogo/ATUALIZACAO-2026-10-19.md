# Catálogo — atualização de 19/10/2026

Destino: GitHub AlexOliverax/il3d-studio-web. Publicação do domínio www.il3dstudio.com.br a cargo da Lucy; nenhum deploy executado pelo Codex.

## Mudanças

- Coleções visuais Natal, Personalizados e Arte em HueForge, busca sem distinção de acentos e seis produtos por página.
- Selos de conceito/render removidos dos cards. Informação discreta de imagem ilustrativa permanece nos detalhes, sem chamar renders de fotos reais.
- Notas de laboratório/testes saem da apresentação pública. Itens antigos mantêm consulta de disponibilidade; não foram convertidos automaticamente em estoque disponível.
- Seis enfeites autorais no estilo biscoito natalino: casinha, floco, Papai Noel, biscoitinha, meia e árvore. Impressão e autoria confirmadas pelo proprietário em 19/10/2026. Imagens e GIFs fornecidos por ele.
- Produtos e mídias do catálogo publicado foram preservados a partir do bundle público do próprio domínio. A versão publicada continha 13 itens ausentes da main. Snapshot anterior em catalogo-publicado-2026-10-19.json, para consulta interna; não é importado pela aplicação.
- Coleção HueForge existente em main mantida. Alterações locais de outras iniciativas ficaram no checkout original, sem sobrescrita.

## Referências de navegação consultadas

- https://shark3dlab.com.br/ — categorias visuais e coleções.
- https://carterprintingco.com/ — busca, categorias e coleções sazonais; a loja declara mais de 57 mil pedidos, mas isso não é uma medição independente de tráfego.
- https://ob3dprints.com/ — navegação por coleção.

Não foi possível verificar ranking de tráfego. A inspiração é de organização e navegação, sem copiar identidade, imagens ou textos.

## Publicação pela Lucy

Conferir o diff e integrar a branch codex/catalogo-natal-comercial à main. Seguir docs/LUCY_DEPLOYMENT_HANDOFF.md para build/publicação. Preservar .env, configuração de WhatsApp e mudanças próprias existentes no servidor. As diferenças entre o catálogo publicado e main foram recuperadas; outras mudanças do servidor fora do catálogo precisam ser conferidas antes de substituir o dist.

No celular: abrir cada coleção, buscar “árvore”, limpar busca sem resultados, trocar páginas, abrir detalhes/GIF, adicionar enfeite ao orçamento e conferir mensagem WhatsApp. Em desktop, conferir grade e modal. Não há preço ou estoque inventado no cadastro.

## Validação executada

Build de produção concluído. Suíte de regressão passou, incluindo coleções, busca sem acentos, limite de seis itens, imagens/GIFs, apresentação comercial e fluxo de orçamento. O runner padrão tentou criar symlink e falhou com EPERM no Windows; a mesma suíte foi executada com saída temporária dentro do checkout, para resolver as dependências sem symlink. Não foi alterado o runner versionado.

Prévia em Chrome: busca, estado vazio, categorias, paginação e inclusão no orçamento conferidos. Largura de 390 px conferida sem overflow horizontal de conteúdo. Corrigido também o mínimo da grade do formulário existente e a quebra dos botões em telas estreitas.
