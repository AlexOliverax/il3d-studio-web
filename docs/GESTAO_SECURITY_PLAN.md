# Plano verificável de segurança e operação

Status: preparação para revisão, **não certificado de prontidão para produção**.
Responsáveis por ativação/aprovação são definidos privadamente. Nenhuma conta real,
configuração do host, firewall, proxy existente ou banco produtivo foi alterado.

| Controle | Estado/evidência atual | Critério antes de produção | Responsável proposto |
|---|---|---|---|
| Autenticação/autorização | Sessões opacas, scrypt, cookie Secure/HttpOnly/Strict, CSRF/origem, senha na aprovação; testes | HTTPS e teste externo negativo sem sessão | Implementador + revisor |
| MFA | **Planejado, não implementado** | WebAuthn/passkeys preferencial; fallback TOTP só se necessário; enrollment exige sessão e reautenticação, segredo protegido; desafio de segundo fator também ao aprovar; replay/expiração testados | Implementador + admins |
| Recuperação | **Planejada** | Códigos únicos hashados; processo humano verificado, sem token no chat; invalidação de sessões/fatores e auditoria; ensaio de perda do dispositivo e bloqueio de atacante | Responsável de acesso + revisor |
| Agentes | Scopes server-side, tokens separados, prazo/revogação, próprios pedidos apenas | Provar 401 após revogar e 403 em aprovar/rejeitar; rotação individual em cofre | Operador de integrações |
| Backup/restore | Utilitário SQLite online backup + integridade/FK; ensaio sintético compara tabelas e login após restore | Backup cifrado fora do host, RPO proposto 24h/RTO 4h, retenção diária 7/semanal 4; aprovar objetivos; restaurar cópia e medir duração | Operador + responsável negócio |
| HTTPS privado | Compose/Caddy preparados, não iniciados | Cadeia confiável no desktop/celular, cookie Secure real, sem bypass de certificado, Origin exato | Operador de homologação |
| Rede | Backend sem porta publicada, rede interna; proxy loopback e perfil opt-in | VPN/ACL somente dispositivos aprovados; varredura de fora da VPN deve falhar; nunca 0.0.0.0 | Operador de rede |
| Logs/auditoria | Before/after, solicitante/aprovador/executor UTC, triggers append-only; sem senha em eventos | Logs estruturados sem Authorization/cookies/senhas/corpos; retenção proposta 90d privada; alertas para 401/403/429/503; exportação imutável e teste de adulteração | Operador + revisor |
| Dependências | Runtime auditado; alertas herdados de dev documentados | Fixar digests de imagens, auditar OS/imagens/Python/npm; revisar Vite/esbuild/source-map-js em mudança controlada | Implementador |
| Revisão independente | **Não realizada** | Revisão de RBAC/IDOR/CSRF/XSS/replay/concorrência/restauração, matriz evidências e correção dos achados | Revisor designado |
| Catálogo | Diagnóstico somente leitura | Reconciliação por arquivo e validação de conteúdo antes de publicar | Responsável catálogo |

## Ensaio de backup/restauração

`management/ops/backup.py` usa API SQLite de backup consistente, abre origem read-only,
cria destino exclusivo com 0600 e verifica `integrity_check`/`foreign_key_check`.
Não copia SQLite ativo com `cp` e não restaura sobre banco existente.

```bash
# Somente caminhos fictícios/copias aprovadas, nunca banco real nesta revisão.
python -m management.ops.backup --source /CAMINHO_PRIVADO/ficticio.sqlite3 --destination /CAMINHO_PRIVADO/backup-novo.sqlite3
python -m management.ops.backup --source /CAMINHO_PRIVADO/backup-novo.sqlite3 --destination /CAMINHO_PRIVADO/restaurado-novo.sqlite3
```

`test_staging.py` faz backup/restauração sintéticos, compara usuários, estoque, produtos,
solicitações, movimentos e auditoria e confirma login dos dois usuários fictícios no
restaurado. Não comprova RTO nem restore de produção; nenhuma rotina recorrente foi instalada.
Criptografia/cópia externa não foram implementadas pelo utilitário; devem ser adicionadas
por solução de backup aprovada antes de dados reais.

## Pontos específicos da v1 a não esconder

- Sem MFA/recuperação implementados: impeditivo de produção até cumprir o plano.
- SQLite é de baixa concorrência/single host; não escalar réplicas sobre o mesmo arquivo.
- Triggers não impedem adulteração por root/administrador do banco.
- Proxy reverso pode agregar rate limit por IP; configurar confiança em headers apenas
  para proxy conhecido, testar spoofing e indisponibilidade de login antes de operar.
- Read scope de produtos inclui custos; não conceder a integrações que só precisam de vitrine.
- Sem registros contábeis/lotes históricos: calculadora é simulação, mesmo com dados medidos.
- TLS/ACL/convite e uso em dispositivos reais permanecem não testados enquanto staging
  estiver desligado por instrução do responsável.

## Gate humano de ativação

Aprovar por escrito: ambiente, hostname privado, ACL/dispositivos, trust de certificado,
contas **fictícias** a utilizar, janela de teste e desligamento. Isso permite apenas
homologação; não autoriza contas reais, merge, deploy produtivo ou publicação.
Aceite de produção é outra decisão, após evidências de todos os controles acima.
