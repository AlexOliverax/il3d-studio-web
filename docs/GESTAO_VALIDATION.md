# Validação — Gestão v1

Data: 2026-10-18. Base: `02b604a`. Branch: `feat/gestao-v1`.
Todos os bancos usados foram temporários e sintéticos; nenhum dado real foi importado.

## Resultados locais

- 32 testes de backend (pytest): aprovados.
- 1 teste end-to-end em Chromium real: aprovado.
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
  teste de HTTPS/reverse proxy ou restore de backup. Não declarar pronto para produção.
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
