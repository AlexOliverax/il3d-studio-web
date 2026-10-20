# Codex — precificador e prévia de anúncio do Mercado Livre

## Estado

Primeira versão **implementada na branch, testável localmente**, não conectada a
uma conta Mercado Livre nem ao runtime Codex. Não é uma integração de publicação.
Não houve provisionamento de token real, alteração de dados reais ou deploy nesta
entrega. A homologação temporária pode estar desligada; não assumir URL disponível.

## API privada

`POST /api/marketplaces/ml/preview` com `Authorization: Bearer <token privado>`.
Permissão mínima: `pricing:calculate`. Para descobrir materiais, também
`inventory:read`; para consultar produtos existentes, `products:read`.
O token não pode aprovar operações, autenticar como humano ou publicar no ML.

Corpo (valores exclusivamente fictícios, NÃO representam tarifas atuais):

```json
{
  "title": "Produto fictício",
  "description": "Rascunho para revisão humana",
  "category_id": "MLB_TEST",
  "listing_type_id": "TEST",
  "fee_source_note": "Simulação fictícia; validar cotação oficial antes do anúncio",
  "costs": {
    "materials": [],
    "hours": "2",
    "power_w": 150,
    "energy_cents_kwh": 100,
    "maintenance_cents_hour": 100,
    "packaging_cents": 200,
    "sale_cents": 5000,
    "labor_hours": "0.5",
    "labor_cents_hour": 2000,
    "tax_bps": 600,
    "sales_fee_bps": 1400,
    "fixed_fee_cents": 0,
    "shipping_cents": 800,
    "target_margin_bps": 2000
  }
}
```

Dinheiro em centavos BRL; percentuais em pontos-base (100 = 1%). `shipping_cents`
é o custo de envio efetivamente suportado pelo vendedor, por unidade; não é o
frete cobrado do comprador. Para produto real, informar materiais/gramas e todos
os demais custos aplicáveis. Sem eles, a prévia está incompleta.

Resposta: custos, lucro, margem ao preço consultado, preço sugerido pela margem
alvo e rascunho (título, descrição, categoria e modalidade informados). Sempre
`status=draft_preview`, `persisted=false`, `published=false`,
`requires_admin_approval=true`, `fee_verification=unverified_user_inputs`.
Taxas, frete, impostos e margem são obrigatórios, mesmo quando zero; ausência
retorna400. A fonte declarada é contexto, **não comprovação** de uma cotação oficial.
O rascunho é retornado ao solicitante, não salvo no banco e não é payload completo
validado pelo Mercado Livre. Nenhuma quantidade de estoque é reservada.

## Adaptador do Codex

O perfil `codex` é do processo host, não selecionado pelo modelo:

- `GESTAO_CODEX_API_URL`: base HTTPS terminada em `/api`.
- `GESTAO_CODEX_TOKEN_FILE`: arquivo privado0600 fora do Git com token dedicado.
- O host chama `dispatch('codex', 'preview_ml_listing', argumentos)` ou expõe a
  ferramenta `preview_ml_listing` do manifesto existente.
- A instalação de ferramentas/MCP no runtime específico do Codex ainda não foi
  realizada. O adaptador Python é a ponte preparada, não uma ferramenta já instalada.
- Token da Gestão e OAuth do Mercado Livre são identidades separadas; nunca usar
  senha/MFA humana ou colocar tokens em prompts/PRs.

O host pode guardar a resposta como rascunho local para revisão. Não conceder
`operations:request` a um precificador que só precisa simular.

## Próxima etapa: cotação oficial, depois publicação aprovada

A documentação oficial informa que custos variam com preço, categoria, modalidade
entre outros parâmetros. Frete também depende de contexto logístico e vendedor:

- [Custos por vender](https://developers.mercadolivre.com.br/pt_br/descricao-de-produtos/comissao-por-vender)
- [Custos de envio](https://developers.mercadolivre.com.br/pt_br/produto-consulta-de-usuarios/custos-de-envio)

Não fixar uma comissão universal. Uma futura integração de consulta deve usar OAuth
no servidor, coletar cotação oficial no **preço final sugerido** e recalcular quando
houver faixa de tarifa/frete diferente. A fórmula atual é condicional às taxas e ao
frete informados, não garante margem sob outra faixa. Quotas, prazo de validade e
metadados da cotação precisarão ser armazenados e validados antes de publicar.

Publicação futura exige: conta vendedora autorizada, categoria/atributos/imagens/
condições obrigatórios validados, rascunho persistente imutável, aprovação explícita
no backend vinculada ao conteúdo/preço, execução idempotente, reconciliação de
resultado desconhecido e auditoria solicitante/aprovador/executor. **Nenhum endpoint
ou ferramenta de publicação está implementado nesta entrega.** Sem aprovação,
nenhuma alteração financeira, exclusão, baixa ou anúncio externo.

## Testes

Prévia não modifica o dump do banco; frete aumenta custo/preço sugerido; ausência
de taxas e frete negativo são rejeitados; autenticação/scopes aplicados; adaptador
não permite `publish`. Somente dados fictícios e transporte de teste local.
