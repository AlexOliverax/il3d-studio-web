# Reconciliação do catálogo — diagnóstico somente leitura

Inspeção em 2026-10-18. **Não houve cópia sobre a produção nem mudança no catálogo.**
A branch Gestão continua baseada em `02b604a`; `src/` e `public/` permanecem intactos.

## Evidências observadas

- Vitrine ativa identificada pela release `20261013T1116Z-anjos-do-brasil-v2`.
- GitHub: 1 imagem em `public/images`; release ativa: 29.
- 28 imagens adicionais na release: cinco painéis Anjos do Brasil, sete Bolas do Mundo,
  dezesseis imagens de catálogo (incluem galeria HueForge e ajustes Advento/medalha).
- A imagem comum `hueforge-cristao.jpg` tem o mesmo SHA-256 em ambas as bases.
- As 29 imagens da cópia-fonte preservada dessa release coincidem por caminho relativo
  e SHA-256 com as imagens servidas. Isso valida assets, **não prova sozinho** que todo
  fonte recompila para o mesmo bundle; reconstrução reprodutível ainda é gate pendente.
- SHA-256 do HTML da release observado:
  `2b28fa1b635f995617f6355ef3b0e47572ebce3d839b6777db4eaf8b8af5da61`.
- Diff de fonte normalizado (ignorando CRLF/LF): 16 arquivos diferentes/adicionais.
  `src/data/products.ts`, `bolasDoMundo.ts`, `projetosCatalogo.ts`; seção Anjos e CSS;
  `App.tsx`, `index.css`, tipos; CollectionSection/estilos; CustomSection.css;
  HeroSection.css; ProductCard, OptimizedImage, ProductModal e seu CSS.
- Na base GitHub, products contém somente a coleção HueForge. Na fonte preservada,
  importa também as coleções adicionais; Anjos é seção conceitual própria.

## Matriz de preservação para aprovação

| Área | Decisão proposta |
|---|---|
| HueForge/galeria | Preservar coleção confirmada e imagens de referência; não inventar disponibilidade |
| Bolas do Mundo | Preservar textos, status e imagens da vitrine ativa |
| Advento/medalha | Preservar versões ajustadas e distinção de imagem conceitual/produto |
| Dose Dupla | Preservar restrições existentes de orçamento/opções |
| Anjos do Brasil | Preservar classificação conceito/em desenvolvimento, sem preços inventados |
| WhatsApp | Comparar configuração sem alterar contato; não importar contato em config administrativa |
| Mobile/orçamento | Preservar correções de overflow, carrinho e fluxo de orçamento |
| Gestão | Manter serviço privado separado; nunca gerar catálogo público a partir de custos/rascunhos |

## Sequência executável somente após autorizações aplicáveis

1. Registrar hashes da release ativa e guardar cópia read-only/rollback; repetir inventário
   se o servidor mudar. Não tratar esta observação como snapshot eternamente atual.
2. Trabalhar sobre cópia isolada da fonte preservada; normalizar quebras apenas na comparação.
3. Construir essa cópia offline e comparar HTML, JS, CSS, assets e comportamento com a release.
4. Preparar diff de reconciliação **na branch autorizada**, com revisão por arquivo;
   resolver conflitos sem substituir o diretório todo. Manter regras privadas fora da vitrine.
5. Testar coleções, status, imagens, WhatsApp, carrinho, Dose Dupla e 360/390/430px.
6. Obter aprovação humana do conteúdo reconciliado e do plano de rollback.
7. Somente com autorização distinta: merge/deploy em janela aprovada. Checar hashes e
   fluxos pós-publicação; rollback troca release, não apaga histórico ou banco da Gestão.

**Pendência explícita:** o diagnóstico e plano estão entregues; reconciliação efetiva
não foi aplicada, porque o pedido atual solicita documentação e não alteração da vitrine.
Não é seguro publicar o `dist/` desta branch sobre a release ativa enquanto esse gate estiver aberto.
