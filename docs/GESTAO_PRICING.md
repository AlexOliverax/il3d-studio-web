# Precificação ampliada — contrato e validação

A calculadora é privada, mas **não é escrituração financeira**: nunca grava custo,
preço, consumo ou lançamento. Gravar preço/custo de produto continua exigindo solicitação
e confirmação humana. Valores opcionais ausentes equivalem a zero; parâmetros são
configuráveis por simulação, não uma tabela fiscal global aprovada.

## Unidades e bases

- Dinheiro: centavos inteiros; horas: decimal (preferir string); material: gramas inteiras.
- Percentuais de API: basis points (`bps`), 100 bps = 1%; UI aceita duas casas de %.
- `basis=estimate`: valores previstos.
- `basis=actual_inputs`: valores medidos informados; exige `basis_note` e `loss_bps=0`.
  Gramas medidos devem incluir refugo. Isso **não comprova custo real contábil**:
  preço de material usa cadastro atual, não nota fiscal/lote histórico. Horas × potência
  ainda estimam consumo; validação por medidor/kWh e custo histórico de lotes ficam pendentes.
- Referência da medição é texto privado; não colocar dados pessoais nela.

## Componentes

| Campo | Regra |
|---|---|
| `materials` | Soma(preço do rolo × gramas / peso nominal do rolo) |
| `loss_bps` | Acréscimo de material sobre a base, até 100%; não é divisão por rendimento |
| `hours`, `power_w`, `energy_cents_kwh` | Horas × W ÷ 1000 × tarifa efetiva, com encargos |
| `maintenance_cents_hour` | Horas de máquina × reserva de manutenção/hora |
| `labor_hours`, `labor_cents_hour` | Horas de trabalho humano × custo/hora; independente do tempo da máquina |
| `packaging_cents` | Embalagem por unidade/simulação |
| `fixed_fee_cents` | Taxa fixa por venda |
| `tax_bps`, `sales_fee_bps` | Percentuais sobre o preço bruto de venda |
| `target_margin_bps` | Margem desejada sobre venda, não markup sobre custo |

Perdas aumentam somente material; tempo de reimpressão deve ser incluído nas horas.
Tarifa efetiva pode ser obtida pelo responsável a partir do custo elegível da fatura/kWh;
tributação e taxas devem ser confirmadas pelo negócio/contador. Nenhuma alíquota real é
assumida ou buscada automaticamente. Os defaults são zero e não representam isenção.

Cada componente arredonda half-up para centavos antes da soma. `base_cents` soma
produção + taxa fixa, sem percentuais de venda. `total_cents` acrescenta impostos e
taxa percentual calculados sobre a venda informada. Lucro = venda − total; margem =
lucro ÷ venda; venda zero produz margem nula (não infinito).

Preço sugerido = teto(base ÷ (1 − impostos − taxas − margem)), em centavos.
Como impostos/taxas arredondam separadamente, há checagem posterior da margem e buffer
conservador de até um centavo na base quando necessário. É **preço sugerido**, não
promessa de menor preço matemático. Impostos + taxas + margem devem ser <100%.
Custos/preço sugerido acima de R$ 10 milhões por simulação são rejeitados.

## Exemplo inteiramente fictício

100 g de um rolo de 1000 g/R$100; perda adicional 10%; máquina 2,5h/200W;
energia R$1/kWh; manutenção R$1/h; trabalho 1,5h/R$10; embalagem R$2;
taxa fixa R$1; impostos 6%; taxa de venda 4%; venda R$50; margem alvo 20%.

Resultado: base R$32; impostos R$3; taxa percentual R$2; total R$37;
lucro R$13; margem 26%; preço sugerido R$45,72.

Testes: `test_pricing.py` cobre exemplo completo, meios centavos, margem após
arredondamento, 120 combinações de custos/margens, percentuais inválidos, valores
não finitos, origem medida sem referência e dupla contagem de perdas.
Mudança de preço permanece coberta por `test_filament_price_update_requires_confirmation`.
