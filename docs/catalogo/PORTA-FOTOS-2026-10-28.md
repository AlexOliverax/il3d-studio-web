# Porta-fotos de Natal — 28/10/2026

Cinco produtos AVAILABLE na coleção Natal: bola com laço, estrela de seis pontas, presente com laço, árvore e sino. Cadastro em src/data/natalPortaFotos.ts, importado por src/data/products.ts. Guirlanda não incluída: não aparece no lote impresso.

Cada produto tem uma imagem individual com uma família fictícia no centro, criada pelo imagegen integrado usando a fotografia das peças como referência. São montagens ilustrativas, com tipo DIGITAL_RENDER; a foto original do lote permanece na galeria como REAL_PRODUCT. Frente, tampa, medidas nominais e cores preservadas na ficha. Fotografia e fita não incluídas no produto. Preço sob consulta; nenhum preço fixo foi inventado.

## Consumo e preço

Consumo fornecido pelo proprietário: vermelho 22,09 g, verde 6,75 g, amarelo 5,72 g; total 34,56 g, aproximadamente 1h30 de impressão. Registro único: producao-porta-fotos-natal-v05-20261028. Não descontar novamente caso uma operação com essa referência já exista.

A pedido do proprietário, foram enviadas à Mariko (https://t.me/hermes_szlvswke3kyjymg5_bot) solicitações de precificação e tentativa de baixa. Mariko confirmou que não realizou movimentações: API retornou 401. Não há IDs de operações ou saldos antes/depois. Carretéis usados ainda precisam ser identificados. Gestão voltou a exibir login administrativo; não usar pesos brutos do inventário como saldos líquidos.

## Publicação

O proprietário solicitou atualização via GitHub e pedido de publicação à Lucy. A branch codex/catalogo-natal-comercial já contém a recuperação do catálogo publicado e os kits de Natal no PR #3. Não substituir a versão atual do servidor por um dist antigo: integrar os novos produtos à fonte vigente, preservando os Anjos do Brasil e demais coleções publicadas. Preservar .env e WhatsApp; conferir build antes de trocar a release.

Build de produção e suíte de regressão aprovados. No Windows, a suíte rodou com diretório temporário no checkout para evitar o EPERM do symlink, sem alterar o runner versionado. As cinco imagens foram inspecionadas visualmente.
