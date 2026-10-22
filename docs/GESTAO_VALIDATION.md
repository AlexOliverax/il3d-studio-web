# Validação — Gestão v1

Data: 2026-10-18. Base: `02b604a`. Branch: `feat/gestao-v1`.
Todos os dados usados são sintéticos; nenhum dado real foi importado. Bancos de teste são temporários; o kit fictício de homologação está preservado em diretório privado fora do Git, sem serviço iniciado.

## Resultados locais

- 64 testes de backend, precificação, adaptadores e backup/restore (pytest): aprovados.
- 2 cenários end-to-end em Chromium real (desktop e celular): aprovado.
- Fluxo E2E: login, solicitação de filamento, aprovação, entrada, aprovação, calculadora,
  produto em rascunho, preparo interno do catálogo, auditoria e logout.
- Layout móvel 390 × 844: sem overflow horizontal; captura inspecionada.
- Nenhum erro JavaScript no fluxo de navegador testado.
- `node --check management/static/app.js`: aprovado.
- `npm test`: regressões existentes da vitrine aprovadas.
- `npm run lint`: aprovado.
- `npm run build`: aprovado. Nenhum arquivo de Gestão incluído no build público.
- `git diff --check`: aprovado.
- `pip-audit -r management/requirements.txt`: nenhuma vulnerabilidade conhecida encontrada.
- `npm audit --omit=dev`: nenhuma vulnerabilidade encontrada.

## Segurança/consistência exercitadas

Acesso anônimo bloqueado; origem e CSRF; cookie seguro; logout e sessão expirada;
usuário desativado; token de agente revogado/expirado; bloqueio de aprovação/rejeição por
agente; confirmação/hash/senha inválidos; parâmetros extras; senha com rate limit;
idempotência de solicitação; chave com payload diferente; aprovação repetida; corrida
entre dois administradores; versão obsoleta; saldo insuficiente com rollback total;
rejeição/expiração; preço sem aprovação não muda; produto sem filamento não é criado;
rascunho não publica; edição volta a rascunho; arquivamento; auditoria e movimentos
imutáveis; banco não sobrescrito por init; nenhum usuário padrão criado.

## Limitações e pendências reais

- `npm audit` completo reporta 3 vulnerabilidades herdadas do lockfile original:
  esbuild (moderada), Vite (alta) e source-map-js (alta), na cadeia de desenvolvimento.
  Nenhuma dependência da vitrine foi alterada. Atualização major de Vite deve ser tratada
  em mudança separada com regressões; não expor servidor Vite de desenvolvimento.
- Não houve pentest independente, teste de carga, verificação em Safari/Firefox,
  teste operacional do stack HTTPS/reverse proxy ou restore de produção. O restore sintético foi testado. Não declarar pronto para produção.
- CI de backend, navegador e vitrine aprovado no commit inicial `bd3d8d6`: [execução GitHub Actions](https://github.com/AlexOliverax/il3d-studio-web/actions/runs/39113843891).
  Conferir também os checks do HEAD atual no PR após revisões de documentação.
- UI de imagens aceita referências HTTPS e lista URLs; upload/preview fica para próxima fase.
- Sem MFA, recuperação de senha, lotes, ordens de produção, publicação pública ou
  integração real de agentes nesta primeira versão.
- Auditoria é append-only no banco, mas não é inviolável contra administrador do host.
- Antes de produção: validar regras e UX, revisar segurança, preparar HTTPS privado,
  backup/restore e contas individuais, reconciliar catálogo e obter aprovação explícita.

## Escopo preservado

Sem deploy, alterações de dados reais, publicação de produtos, atualização do catálogo
ativo, criação de contas reais, reinício de serviços ou mudança de configuração do host.
Apenas ambiente virtual local e checkout/branch isolados para desenvolvimento/testes.

## Revisão funcional: evidências adicionais

- Precificação ampliada, arredondamento e garantia de margem exercitados em `test_pricing.py`, incluindo 120 combinações de custos/margens em um dos testes.
- Scopes individuais de agentes, pedidos próprios apenas, negação de auditoria/identidades, revogação, proibição de aprovação, redirects bloqueados e chave idempotente controlada pelo host: `test_adapters.py`.
- Kit sintético: preparação em destino novo fora do checkout; backup consistente, integridade/FK, comparação de tabelas e login após restauração: `test_staging.py`.
- Compose validado sem iniciar containers; backend sem porta publicada, proxy loopback, rede interna e profile opt-in. Caddyfile convertido com `caddy adapt`, sem ativação.
- Auditoria Python incluindo dependências propostas do staging: nenhuma vulnerabilidade conhecida encontrada. Imagens de containers não foram executadas/auditadas; fixação de digests e auditoria OS seguem pendentes.
- Capturas de desktop/celular com dados fictícios: `management/evidence/`; roteiro em `GESTAO_HUMAN_VALIDATION.md`.
- Catálogo inspecionado somente leitura; 28 imagens extras na release ativa. Diagnóstico em `GESTAO_CATALOG_RECONCILIATION.md`; nenhuma reconciliação aplicada ou publicação.
- Lint inicialmente incluiu dependências de Playwright dentro do virtualenv local; corrigido o ignore de `.venv-gestao` no ESLint. Não houve alteração em `src/`, `public/` ou lockfile da vitrine.

### Gates ainda abertos

Ativação do staging privado depende de confirmação; uso humano em dispositivos reais
ainda não ocorreu. Adaptadores não foram conectados aos runtimes reais dos agentes.
MFA, recuperação, backup externo cifrado, ACL/HTTPS operacional, auditoria externa
imutável, revisão independente e reconciliação efetiva são pendências explicitadas
nos planos — não alegadas como concluídas. O PR deve continuar em rascunho.
