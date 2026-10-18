# Gestão — primeira versão para validação

Aplicação privada separada da vitrine. Sem deploy, sem dados reais e sem contas padrão.
Requer Python 3.10+; execução abaixo somente em banco novo de desenvolvimento.

```bash
python3 -m venv .venv-gestao
.venv-gestao/bin/pip install -r management/requirements-dev.txt
.venv-gestao/bin/python -m management.cli init --database management/instance/dev.sqlite3
.venv-gestao/bin/python -m management.cli admin --database management/instance/dev.sqlite3 --name AdministradorA
.venv-gestao/bin/python -m management.cli admin --database management/instance/dev.sqlite3 --name AdministradorB
.venv-gestao/bin/python -m management.cli serve --database management/instance/dev.sqlite3
```

Os nomes acima são exemplos fictícios: provisionar somente os dois administradores
autorizados, com os nomes combinados privadamente. A identidade real não fica no Git.
Senhas são pedidas com entrada oculta; mínimo 12 caracteres. Abrir
`http://127.0.0.1:8787`. O servidor de desenvolvimento fica SOMENTE em loopback,
sem debug. Use túnel SSH para acesso remoto a uma instância de validação; não exponha
esta porta. O modo local desativa Secure apenas nesse cookie para HTTP loopback.
O factory normal exige cookie Secure e Origin HTTPS configurado por `GESTAO_ORIGIN`;
`GESTAO_DATABASE` aponta o banco privado fora de `dist/` e de diretórios públicos.
Não publicar pasta do repositório, banco, backups ou variáveis de ambiente via servidor estático.
Nenhum comando acima configura Caddy, systemd, gateway ou produção.

## Provisionamento manual de administradores — fora do Git

Este procedimento é documentação para uma etapa **posterior e autorizada**. Não é
executado por testes, build, CI ou deploy; nenhuma conta real foi criada nesta entrega.
O operador responsável deve provisionar somente os dois administradores previamente
autorizados, em terminal privado, com nomes reais definidos fora do repositório.

1. Escolher um banco privado **fora do checkout e fora da raiz pública**; não reutilizar
   banco real para testes. Em máquina autorizada, preparar o diretório com acesso restrito:

   ```bash
   umask 077
   mkdir -p "$HOME/.local/share/il3d-gestao"
   chmod 700 "$HOME/.local/share/il3d-gestao"
   .venv-gestao/bin/python -m management.cli init --database "$HOME/.local/share/il3d-gestao/gestao.sqlite3"
   ```

   Executar `init` somente uma vez para banco novo. Ele recusa sobrescrever arquivo.
   O banco é criado com permissão 0600. Não copiar dados de produção para o repositório.

2. Sem gravação/transcrição de terminal ou `set -x`, ler o nome interativamente, sem
   escrever o valor real no comando ou em arquivo versionado:

   ```bash
   read -r -p 'Nome do administrador autorizado: ' gestao_admin_name
   .venv-gestao/bin/python -m management.cli admin --database "$HOME/.local/share/il3d-gestao/gestao.sqlite3" --name "$gestao_admin_name"
   unset gestao_admin_name
   ```

   A CLI pede a senha duas vezes via entrada oculta (mínimo 12 caracteres); nunca
   passar senha por argumento, variável de ambiente, chat, issue ou PR. Usar senha
   individual distinta para cada pessoa. O banco guarda somente o hash da senha.

3. Repetir o passo 2 para o segundo administrador autorizado. Não executar exemplos
   fictícios contra banco destinado a uso real; não criar conta compartilhada.
4. Guardar credenciais em cofre privado e entregá-las individualmente fora do Git.
   Nomes de conta, tokens, banco, backups e configurações reais não vão para commits,
   fixtures, screenshots, logs do CI ou anexos do PR. O `.gitignore` é prevenção
   adicional, não autorização para armazenar dados reais dentro do checkout.
5. Configurar `GESTAO_DATABASE` com esse caminho **somente na configuração privada
   do serviço aprovado**, e validar acesso de cada administrador em ambiente privado.
   Conferir identidade na auditoria e saída/logout. Não habilitar serviço, rede pública
   ou produção sem autorização separada. A CLI não configura nem inicia deploy.

Para revogar acesso, o operador usa `disable-admin` com o mesmo banco e o nome lido
interativamente. Isso desativa a conta e remove suas sessões. Recuperação/rotação de
senha deve ter procedimento aprovado antes de uso real; não editar hashes manualmente.

## Ausência de deploy automático

A branch `feat/gestao-v1` tem apenas o workflow
[Gestão and storefront checks](../.github/workflows/gestao.yml), que instala dependências,
executa testes e gera um build no runner efêmero. Ele tem `contents: read`, não usa
segredos de deploy, não tem ambiente de deployment, publicação de artefatos, SSH,
transferência de arquivos, merge automático nem comando de publicação.

Na checagem de 2026-10-18, a API do GitHub retornou **zero webhooks de repositório**
e **zero deployments para esta branch**. Push/PR não acionam deploy pelo workflow
versionado. Esta verificação cobre a configuração acessível do repositório; não prova
inexistência de automações externas independentes que façam polling do GitHub.
Qualquer ativação de deploy exige nova autorização explícita.

## Roteiro de validação

1. Entrar como AdministradorA; solicitar filamento com peso/preço. Confirmar que não foi
   cadastrado ainda. Em Aprovações, revisar e aprovar com senha.
2. Solicitar entrada de 1000 g. Aprovar com AdministradorB; conferir saldo e auditoria.
3. Calcular produção com materiais, energia, manutenção, embalagem e venda. Conferir
   custo, lucro e margem; estoque não deve mudar.
4. Solicitar produto com descrição, imagens HTTPS, materiais, custo e preço.
   Aprovar e verificar status `draft`.
5. Solicitar preparo de catálogo; aprovar e conferir `ready`. Nada aparece na vitrine.
6. Solicitar consumo maior que o saldo e tentar aprovar: deve falhar sem movimento.
7. Repetir uma aprovação executada: API retorna 409, sem duplicar estoque.
8. Conferir histórico, solicitante, aprovador, executor e alterações antes/depois.

## Verificações

```bash
.venv-gestao/bin/python -m pytest management/tests -q
node --check management/static/app.js
npm ci
npm test
npm run lint
npm run build
```

Teste de navegador opcional (banco temporário e servidor loopback descartável):

```bash
.venv-gestao/bin/pip install -r management/requirements-browser.txt
.venv-gestao/bin/python -m playwright install chromium
.venv-gestao/bin/python -m pytest management/tests/browser_flow.py -q
```

`BROWSER_EXECUTABLE` permite usar Chromium já instalado. Testes não acessam banco real.
Dependências do backend estão fixadas; `requirements-dev.txt` inclui testes.

## Administração local (apenas com autorização do operador)

```bash
.venv-gestao/bin/python -m management.cli agent --database management/instance/dev.sqlite3 --name Hermes
.venv-gestao/bin/python -m management.cli revoke-agent --database management/instance/dev.sqlite3 --name Hermes
.venv-gestao/bin/python -m management.cli disable-admin --database management/instance/dev.sqlite3 --name AdministradorB
```

O token de agente é mostrado uma vez no terminal: guardar no cofre, nunca em mensagens,
Git, frontend ou query string. CLI opera como administrador do sistema e registra auditoria.
Banco criado com modo 0600. Não há recuperação de senha via HTTP; procedimento seguro
precisa ser definido antes de operação real. Não há migração automática de dados existentes:
`init` recusa sobrescrever arquivo. Versão do schema: `PRAGMA user_version=1`.

Ver [arquitetura](../docs/GESTAO_ARCHITECTURE.md), [integração Hermes](../docs/GESTAO_HERMES_API.md)
e [relatório de validação](../docs/GESTAO_VALIDATION.md).
