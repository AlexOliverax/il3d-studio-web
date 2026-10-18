# API Gestão v1 — Hermes Agente, Lucy, Marico e ChatGPT

Contrato de integração da branch de desenvolvimento. **Não existe URL de produção.**
A implantação e entrega de credenciais são etapas posteriores, mediante aprovação.
Base de teste local: `http://127.0.0.1:8787/api`; futura integração remota exige HTTPS
privado e restrição de rede. Não habilitar CORS para origens arbitrárias.

## Credenciais e limites

Um token individual por agente/integração, criado pela CLI e guardado em cofre.
Enviar `Authorization: Bearer <token>`; validade de 90 dias, revogação local imediata.
Escopo fixo da v1: leitura dos dados administrativos e criação de solicitações.
Não forneça credenciais a agentes sem necessidade de acesso a custos/estoque/auditoria.
Nunca passe cookie, senha ou CSRF de administrador para agentes/modelos.
Usuário/role/aprovador/executor são derivados no servidor; não são campos aceitos.

O adaptador Hermes deve guardar os IDs e a chave idempotente por intenção de negócio.
ChatGPT pode usar um adaptador server-side com token próprio; nenhum conector, Action
público, URL externa ou integração viva é criado automaticamente por esta branch.

## Endpoints

| Método | Caminho | Efeito |
|---|---|---|
| GET | `/me` | Identidade e papel |
| GET | `/identities` | Nomes privados para resolver identidades da auditoria (sem credenciais) |
| GET | `/filaments`, `/products` | Cadastros privados |
| GET | `/operations`, `/movements`, `/audit` | Pedidos e rastreabilidade |
| POST | `/calculate` | Simulação, sem persistência |
| POST | `/operations` | Solicitação pendente, sem alterar dados |
| POST | `/operations/{id}/approve` ou `/reject` | **Só sessão humana** + Origin + CSRF + senha |
| POST | `/login`, `/logout` | Sessões humanas; não usar no agente |

Leituras paginadas: `?offset=0`, até 100 itens, retorno `{items: [...], next_offset: 100|null}`.
Datas são UTC ISO 8601; dinheiro em centavos inteiros, pesos em gramas inteiras.
Campos `payload`, `images`, `materials`, `changes` nas listagens são strings JSON;
parsear antes de mostrar. Hash (`digest`) representa kind + payload canônicos.
IDs são opacos; não inferir entidade ou autorização a partir deles.

## Solicitação idempotente

`POST /operations`, `Content-Type: application/json`, `Idempotency-Key: <UUID estável>`:

```json
{
  "kind": "stock.consume",
  "payload": {
    "id": "ID_DO_FILAMENTO",
    "expected_version": 2,
    "grams": 120,
    "reason": "Produção do pedido TESTE-001"
  }
}
```

Resposta 201 contém `id`, `status: pending`, `digest`, `requester`, `payload`,
`created_at` e `expires` (Unix segundos). Repetir mesma chave + corpo retorna a mesma
solicitação (200). Mesma chave com outro conteúdo: 409. Chave é isolada por solicitante.
Em timeout ou 503, repetir a **mesma** chave e conteúdo; não gerar uma segunda intenção.
Estado `executed` significa operação aplicada; não existe estado intermediário `approved`
que permita execução posterior por agente. Conferir GET `/operations` e auditoria.

## Operações aceitas

- `filament.create`: `name`, `material`, `color`, `spool_weight_g` (>0), `price_cents` (>=0).
  Saldo inicial sempre zero; entrada é outra solicitação.
- `filament.update`: mesmos campos + `id`, `expected_version`.
- `stock.receive` / `stock.consume`: `id`, `expected_version`, `grams` (>0), `reason`.
- `stock.adjust`: mesmos campos; `grams` é saldo final absoluto (>=0), não delta.
- `product.save`: `name`, `description`, `images` (até 10 URLs HTTPS),
  `materials` (`[{"filament_id":"...","grams":20}]`), `cost_cents`, `sale_cents`.
  Atualização exige `id` + `expected_version`; criação omite ambos. Sempre resulta `draft`.
- `product.archive`: `id`, `expected_version`; exclusão lógica somente após aprovação.
- `catalog.prepare`: `id`, `expected_version`; status interno `ready`, **não publica**.

Campos desconhecidos são rejeitados. Saldo negativo, versão antiga, ID inexistente,
produto arquivado no preparo de catálogo ou solicitação expirada impedem aplicação.
Solicitações expiram em 24h. Após conflito de versão, ler o registro e solicitar nova
operação com nova chave; não reaprovar silenciosamente um conteúdo atualizado.

## Calculadora

```json
{
  "materials": [{"filament_id": "ID_DO_FILAMENTO", "grams": 100}],
  "hours": "2.5",
  "power_w": 200,
  "energy_cents_kwh": 100,
  "maintenance_cents_hour": 100,
  "packaging_cents": 200,
  "sale_cents": 3000
}
```

Retorna custos separados, `total_cents`, `profit_cents`, `sale_cents` e
`margin_percent` (string decimal; null se venda zero). Não grava preço nem baixa estoque.

## Aprovação humana — não automatizar

O painel mostra conteúdo e registro atual, pede checkbox e senha.
Backend exige cookie de sessão de admin + Origin exato + `X-CSRF-Token` e corpo:
`{"digest":"HASH","confirmation":"approve:ID","password":"SENHA_DO_ADMIN"}`.
Rejeição usa `reject:ID`. O ID na confirmação e o hash devem corresponder ao pedido
imutável. O backend recusa tokens de agentes mesmo que eles enviem esse corpo.

Hermes pode explicar o pedido ao administrador e informar o ID; não deve solicitar,
armazenar ou retransmitir a senha, simular confirmação ou afirmar que o pedido foi aplicado
antes de observar `executed`. Mensagem no chat dizendo “sim” não substitui esse fluxo.

## Erros e auditoria

- 400: dados/confirmacão inválidos; corrigir a intenção, não repetir indefinidamente.
- 401: autenticação ausente/inválida/expirada.
- 403: falta de papel humano, origem incorreta ou CSRF.
- 404: recurso inexistente ou operação não disponível.
- 409: replay encerrado, chave conflitante, versão antiga, prazo ou saldo inválido.
- 413: corpo acima de 64 KiB.
- 429: limite de falhas de senha; aguardar 15 minutos.
- 503: banco indisponível; preservar a chave idempotente ao repetir.

Auditoria registra solicitação e resultado, solicitante, aprovador, executor, UTC e
before/after. Segredos não são gravados na auditoria. O adaptador deve evitar logs de
Authorization e senhas; use ID da operação como correlação.
