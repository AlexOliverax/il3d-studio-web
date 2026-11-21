# Gestão — consultas e simulações de kits (v1)

Base: `https://gestao.il3dstudio.com.br/api`. Header `Authorization: Bearer <token privado>`.
Nunca imprimir o token nem incluí-lo em Git, URLs ou mensagens. Não usar login/MFA humano.
Rotas abaixo exigem `pricing:calculate`; inventário exige `inventory:read`. Nenhuma publica,
registra preço, aprova operação ou baixa estoque. O ambiente tem janela temporária separada da
expiração do token. Falha503 pode significar janela encerrada;401 token inválido/expirado;403 escopo.

## Descoberta

- `GET /production-parameters`: modelo da impressora, kits, lote de ganchos e parâmetros com valor/base/fonte.
- `GET /physical-inventory`: IDs, aquisição, reposição, peso nominal, disponibilidade física e líquido possivelmente nulo.
- Adaptador: `get_production_parameters`, `list_physical_inventory`, `simulate_kit`,
  `lookup_energy`, `simulate_energy_bill`, `manual_energy_rate`.
- `/filaments` e `/calculate` são legados: NÃO usar o filamento de demonstração para precificar estes kits.

## Simulação mínima (retorna custo parcial e pendências)

`POST /pricing/simulate`
```json
{"kit_id":"natal-6","inventory_id":"INV05","channel":"direct"}
```
Para o outro kit: `natal-8`. Para venda ML: `channel:"mercado_livre"`.
Selecionar um registro PETG com reposição cadastrada. O simulador não exige saldo líquido e não
reserva materiais. Não usar custo de aquisição de presente no lugar de reposição. Custos usam
reposição/peso nominal do registro; se reposição faltar, o custo permanece pendente.

`parameters` opcional contém overrides por cenário, NÃO cadastro permanente. Cada valor é
`{"value":123,"basis":"estimated","source":"Referência identificável da estimativa"}`.
Valores desconhecidos podem ser `null`; não preencher zero para obter um preço artificial.
Bases: `measured`, `estimated`, `confirmed`, `bill_import`, `manual`.
Parâmetros:
- `power_w`: potência MÉDIA durante impressão PETG, não potência máxima nominal.
- `energy_cents_kwh`: custo variável efetivo por kWh; aceita fração de centavo.
- `maintenance_cents_hour`, `depreciation_cents_hour`, `labor_cents_hour`.
- `finishing_minutes`: acabamento/montagem por kit.
- `preparation_minutes_per_hook_batch`: trabalho de preparação por lote de ganchos; rateado pela fração consumida.
- `failure_bps`: provisão adicional sobre material + energia + manutenção + depreciação.
  Não adiciona purga, já incluída nos gramas informados. Não modela automaticamente retrabalho, embalagens perdidas ou máquina ligada em preparação.
- `packaging_cents`, `tax_bps`, `sales_fee_bps`, `fixed_fee_cents`, `shipping_cents`.
  100 bps = 1%. Valores monetários fixos em centavos inteiros; 0 só com fonte confirmando ausência.

Os gramas do fatiamento incluem purga/torre: NÃO são peso das peças nem peso para envio.
`shipping_weight_g` permanece nulo até pesagem do conjunto embalado.

Ganchos são rateados por unidades do lote (gramas, impressão e preparação proporcional).
`hook_petg_confirmed:true` exige `hook_evidence` identificando perfil de fatiamento; sem evidência,
resultados de ganchos são provisórios e a sugestão de preço permanece pendente. Sem fio.
A simulação de um kit usa uma tarifa de reposição selecionada; misturas com custos diferentes
exigem rateio por material antes de considerar o cenário completo.

## Objetivo de lucro

Meta explícita desta versão: lucro >=100% de TODO custo, incluindo despesas de venda.
Se C é custo de produção completo, F despesas fixas de venda e r despesas percentuais sobre P:
`P = 2*(C+F)/(1-2*r)`, com r<50%, e verificação dos arredondamentos em centavos.
Exemplo fictício C=100,F=0,r=10% => P=250, custo total125, lucro125, margem50%.
Isso é diferente tanto de margem100% quanto de lucro100% apenas sobre C.

Resposta: `costs`, `known_cost_subtotal_cents`, `production_cost_cents`,
`conditional_suggested_sale_cents`, `analysis` (despesas, lucroR$, margem%, lucro/custo%),
`parameters_used`, `pending`. `sale_cents` opcional analisa preço informado, sem salvar.
`final_price=false` sempre: é simulação, não autorização comercial. Sem todos os parâmetros e
perfil PETG dos ganchos, custo completo/sugestão ficam nulos; subtotal conhecido NÃO é custo final.

## Mercado Livre: taxas reais coletadas pelo Codex

Lucy não tem OAuth da conta vendedora e não substitui Codex na operação ML. Informar o resultado
real da consulta do Codex em `fee_quote`, com:
`category_id`, `listing_type_id`, `seller_reference`, `source`, `checked_at`, `price_cents`,
`sales_fee_bps`, `fixed_fee_cents`, `shipping_cents`, `logistic_type`, `shipping_mode`, `billable_weight_g`.
Os três custos precisam coincidir com `parameters` e `price_cents` com a sugestão calculada.
Reconsultar taxas e frete no novo preço e repetir até coincidir. Divergência gera pendência explícita.
A Gestão mantém `caller_supplied_not_verified`: coincidência não comprova origem/atualidade da cotação.
Não apresentar preço final enquanto faltar confirmação independente da conta vendedora, modalidade,
impostos ou embalagem. Não somar fixed_fee novamente se já incluído em sale_fee_amount.

Fontes oficiais consultadas em2026-10-22:
- [Custos por vender](https://developers.mercadolivre.com.br/pt_br/descricao-de-produtos/comissao-por-vender)
- [Custos de envio](https://developers.mercadolivre.com.br/pt_br/produto-consulta-de-usuarios/custos-de-envio)

## Energia por localização

`POST /energy/lookup` aceita `cep`, `address`, `district`, `city`, `state`, `modality`.
Exemplo: `{"district":"Perus","city":"São Paulo","state":"SP"}`.
Retorna referência oficial revisada, datas, componentes e bandeira com vigência própria. NÃO há
resolução automática CEP->distribuidora/unidade consumidora nesta versão: CEP sozinho retorna
pendência; São Paulo/SP retorna Enel SP como candidata, nunca modalidade confirmada. Não envia
endereço a terceiros. Não aplica tarifa automaticamente. Snapshot fica marcado para atualização
após a data de consulta; fim de vigência desconhecido é nulo, não inventado.

Referências consultadas em2026-10-22:
- [Enel SP tarifas](https://www.enel.com.br/pt-saopaulo/Para_Voce/tarifa-energia-eletrica.html):
  resolução3596/2026, início04/07/2026. B1convencional TE0,31696+TUSD0,47242=R$0,78938/kWh,
  sem tributos; branca tem valores por horário. Não confirma modalidade residencial individual.
- [ANEEL bandeira outubro2026](https://www.gov.br/aneel/pt-br/assuntos/noticias/2026-defeso-eleitoral/outubro-tera-bandeira-verde-contas-de-luz-sem-custo-extra): verde, válida só para outubro.
- [Enel tributos/COSIP](https://www.enel.com.br/pt-saopaulo/Para_Voce/tarifa-taxas-e-impostos.html):
  não aplicar alíquotas genéricas; conferir valores da conta e evitar duplicar tributos destacados.

## Conta de luz: entrada manual ou importação JSON estruturada

`POST /energy/bill` — transcrever/importar os campos abaixo; não há OCR/PDF automático nesta versão.
Exemplo inteiramente fictício:
```json
{
  "consumed_kwh":"100", "total_cents":15000, "reference_month":"2026-10",
  "distributor":"Exemplo", "modality":"convencional", "source":"Conta fictícia",
  "variable_lines_include_taxes":true, "variable_lines_include_flag":true,
  "line_items":[
    {"id":"1","description":"Energia com tributos","amount_cents":12000,"kind":"variable_energy"},
    {"id":"2","description":"Iluminação pública","amount_cents":2000,"kind":"cip"},
    {"id":"3","description":"Cobrança fixa","amount_cents":1000,"kind":"fixed"}
  ]
}
```
Total das linhas deve reconciliar com total da conta. Outras classes: `penalty`, `other`,
`unclassified` (impede resultado final). Tributos já embutidos na linha de energia não são outra
linha a somar. Resultado `effective_cents_kwh = energia_variável_com_tributos/kWh`, excluindo CIP,
fixos e outras cobranças. É média variável do período, não necessariamente custo marginal;
revisar faturamento mínimo, créditos, tarifa social e tarifa branca antes de usar.

Fallback `POST /energy/manual`:
```json
{"effective_cents_kwh":null,"source":"preencher com fonte real","reference_month":"2026-10","includes_taxes":true,"includes_flag":true}
```
Trocar `null` pelo valor real para validar (null é recusado neste endpoint; não inventar número).
Retorna `basis=manual, verified=false`; somente simula. Para usar no cenário, preencher o valor
retornado em `parameters.energy_cents_kwh` com fonte/base correspondentes. Nenhum dado residencial
ou fatura deve entrar no repositório público.
