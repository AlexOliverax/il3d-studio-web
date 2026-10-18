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
