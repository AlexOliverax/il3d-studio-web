# Inventário físico (intake para revisão)

`GET /api/physical-inventory` exige administrador autenticado ou agente com `inventory:read`.
O adaptador oferece `list_physical_inventory`. Não existe endpoint público de escrita deste cadastro.

O operador autorizado importa itens normalizados via `management.physical_inventory.register_batch`:
- tabela aditiva `physical_inventory`, chave primária `inventory_id`;
- transação única e comparação do hash do conteúdo: reenvio idêntico é no-op, conflito aborta todo lote;
- `review_status=pending_review`, sem criar/aprovar operações, sem modificar filamentos ou saldo disponível;
- cada registro tem evento de auditoria, origem e referência à autorização explícita do proprietário;
- campos desconhecidos permanecem `null`, não zero; peso bruto não é saldo líquido;
- `pending_tare` e `pending_package_tare` exigem líquido nulo;
- aquisição e reposição são valores separados, em centavos inteiros;
- as meadas medidas são registros físicos informados, não movimentações de estoque aprovadas.

## Migração e rollback

1. Conferir duplicatas e validar o lote privado. Nunca colocar dados reais/payload no Git.
2. Fazer snapshot consistente com SQLite backup e verificar `PRAGMA integrity_check`.
3. Preservar imagem anterior. Testar importação e reimportação em cópia descartável.
4. Importar sob transação; conferir todos os campos, IDs e ausência de mudanças em operações/estoque.
5. Atualizar apenas homologação autorizada e validar API/UI, autenticação e permissões.
6. Rollback de aplicação: usar a imagem anterior preservada; ela ignora a tabela nova. Não apagar auditoria.
7. Restaurar snapshot completo somente com janela de manutenção e análise de escritas posteriores:
   restauração cega pode perder operações criadas após backup. Registro permanece revisável e sem efeito
   contábil até implementação e aprovação explícita de um fluxo de estoque.

Esta migração não promove a homologação a produção e não altera timers de encerramento.
