# IL 3D Studio — Gestão v1: análise e arquitetura

## Base inspecionada (2026-10-18)

Repositório público `AlexOliverax/il3d-studio-web`, `main` em `02b604a`.
Nomes de contas, credenciais e informações de negócio não são versionados; testes usam identidades fictícias.
React 18 + TypeScript + Vite 5; catálogo em `src/data/products.ts`, orçamento
local e encaminhamento ao WhatsApp. Não há backend, banco, login ou API.
Build público gera somente `dist/`. Não há workflow de deploy no repositório.

**Divergência importante:** os registros operacionais indicam alterações de catálogo
posteriores no servidor que não estão nesta base GitHub. Este desenvolvimento não
importa releases, não reconcilia essa divergência e não deve substituir o site ativo.
Antes de qualquer deploy futuro, reconciliar a origem do catálogo com o responsável.
O documento antigo de deployment não deve ser interpretado como autorização atual.

## Escolhas

- Preservar integralmente o app público; serviço privado em `management/`.
- Flask + Werkzeug para HTTP e hashing de senha scrypt; nenhuma criptografia própria.
- SQLite para v1 de dois administradores e baixo volume; transações `BEGIN IMMEDIATE`,
  restrições SQL, versão otimista e idempotência. Migrar para PostgreSQL antes de
  múltiplas réplicas ou maior concorrência; não usar SQLite em volume de rede.
- UI própria pequena, servida pelo backend, sem dados em bundle público. Não há
  tokens em Vite, localStorage ou URL. Login é o único conteúdo público da aplicação
  privada; todos os dados exigem autenticação. Imagens são referências HTTPS privadas
  armazenadas como metadados, sem download/preview remoto nesta versão.
- Foram aproveitados Flask/Werkzeug e SQLite em vez de criar servidor HTTP ou crypto.
  Um ERP genérico não substitui o requisito específico de solicitações imutáveis e
  aprovação por administradores no módulo solicitado; evitar um segundo ERP agora.

Referências técnicas: [segurança Flask](https://flask.palletsprojects.com/en/stable/web-security/)
e [transações SQLite](https://www.sqlite.org/lang_transaction.html).

## Autorização e fluxo

1. Os dois administradores autorizados têm contas individuais provisionadas localmente, sem senha
   padrão. Não existe cadastro público, alteração de papel via API ou senha em código.
2. Sessões opacas aleatórias; só o hash vai para SQLite, expiração em 8h, revogação
   no logout/desativação. Cookie HttpOnly, SameSite Strict, Secure por padrão.
3. Browser: origem exata e CSRF para escritas; login também verifica Origin.
   Rate limit persistente para falhas de senha por conta e IP (10/15 minutos).
4. Agentes recebem tokens próprios, armazenados por hash, válidos por 90 dias e
   revogáveis. Permissões são individuais: leitura por recurso e solicitação opcional; nenhum endpoint de aprovação
   aceita Bearer. Tokens de agentes jamais devem conter senhas de administradores.
5. TODA alteração de cadastro, financeira, estoque ou status é uma solicitação
   imutável com hash, identidade derivada da autenticação, chave idempotente e prazo
   de 24h. O request não altera entidades.
6. Administrador revisa o conteúdo, marca confirmação e digita a própria senha.
   Backend exige senha válida, sessão ativa, CSRF, Origin, ID e hash da solicitação.
   A API não confia em `approved=true`, papel, aprovador ou executor enviados pelo cliente.
7. Verificação de versão, saldo, mutação, movimento, auditoria e encerramento acontecem
   na mesma transação. Conflito ou erro reverte tudo; aprovação repetida retorna 409.
8. Administrador pode aprovar solicitação própria, mas precisa realizar a confirmação
   separada com senha. Dupla aprovação por duas pessoas não é exigida nesta v1.
9. Arquivamento substitui exclusão física de produtos. Sem endpoints de exclusão de
   movimentos, auditoria ou filamentos. Correção de saldo gera movimento compensatório.
10. `catalog.prepare` deixa produto `ready` internamente, **não publica**. Editar um
    produto pronto volta a `draft`. Não existe endpoint de publicação/exportação pública.

## Modelo

- `users`, `sessions`, `agents`, `attempts`: identidades e autenticação.
- `filaments`: material, cor, peso nominal do rolo, preço em centavos, saldo em gramas,
  versão. Saldo inicial é zero, entrada aprovada separada. Quantidade de rolos equivalentes
  pode ser obtida por saldo / peso nominal; lotes e rolos físicos não são rastreados na v1.
- `products`: descrição, URLs de imagem, lista de materiais/gramas, custo e venda em
  centavos, status e versão. Gravar produto não consome estoque; consumo é solicitação própria.
- `operations`: pedido imutável, solicitante, hash, prazo, estado, aprovador/executor.
- `movements`: delta e saldo resultante, motivo, operação única e data UTC.
- `audit`: solicitante, aprovador, executor, data e before/after; append-only por triggers.
  Triggers não protegem contra um administrador do sistema que controla o arquivo.
  Armazenamento externo imutável de auditoria fica para fase posterior.

## Cálculo

Entradas monetárias em centavos inteiros; peso em gramas inteiras. Uso de Decimal:
filamento = soma(preço do rolo × gramas / peso do rolo);
energia = horas × W / 1000 × tarifa;
manutenção = horas × custo/hora; embalagem é fixa por simulação.
Cada componente arredondado para centavos (half-up); total soma componentes.
Lucro = venda − total; margem = lucro / venda × 100, nula se venda zero.
Custos são estimativas, não movimentações financeiras. A revisão funcional implementa mão de obra, impostos, taxas, perdas e margem alvo configuráveis; ver `GESTAO_PRICING.md` para fórmulas e limites.

## Plano e limites de entrega

1. Análise e branch isolada — concluído.
2. Modelo transacional, autenticação, API e aprovação — implementado.
3. Painel privado, cadastros, calculadora, estoque, rascunhos e auditoria — implementado.
4. Testes de autorização, replay, corrida, rollback, cálculo e fluxo de navegador — ver relatório.
5. Validação do responsável: UX, conceitos de custo, unidades, contas e operações.
6. Somente após aprovação: staging HTTPS privado, provisionamento de credenciais,
   backup/restore, MFA/recuperação de conta, política de rede, monitoramento, revisão de
   segurança e reconciliação do catálogo. Deploy/publicação/dados reais permanecem fora do escopo autorizado.

Adaptadores server-side preparados estão em `management/integrations`, com scopes por token e testes. Não há MFA, upload de imagem, lotes de filamento, ordens de produção ou conector vivo
para Hermes/ChatGPT nesta v1. A API documentada está preparada para integração, não
há agentes configurados, contas reais criadas ou chamadas externas de negócio.
