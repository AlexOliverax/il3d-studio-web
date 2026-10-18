# Adaptadores de agentes preparados, não conectados

Implementação: `management/integrations/adapters.py`. Perfis `marico`, `hermes`,
`lucy`, `chatgpt`; cada instalação recebe identidade/token individual. Perfis são
configuração do processo host, não argumento escolhido pelo modelo. Nenhum conector
foi ativado nem credencial real criada. Não foi feita chamada a modelo/API OpenAI.

## Fluxo

1. Operador autorizado cria token de uma identidade exclusiva no banco privado.
2. Cofre entrega token por arquivo 0600 ao processo do adaptador. Caminho e URL HTTPS
   vêm de `GESTAO_<PERFIL>_TOKEN_FILE` e `GESTAO_<PERFIL>_API_URL`.
3. Host registra as ferramentas retornadas por `model_tools()`; recebe nome e argumentos.
4. Host chama `dispatch(perfil, nome, argumentos, intent_id=ID_PERSISTENTE)`.
5. Para pedido, a chave deriva de perfil + ID da intenção salvo pelo host. O modelo não
   define identidade, chave, URL, senha ou aprovador. Repetição mantém o ID original.
6. Resultado `pending` precisa ser revisado/confirmado pelo administrador no painel.
   O agente não pode aprovar, executar, publicar, excluir ou simular login humano.

```python
from management.integrations.adapters import dispatch, model_tools

# Somente nomes de configuração e dados fictícios; não há token em prompts.
tools = model_tools('responses')
result = dispatch('marico', 'request_operation', {
    'kind': 'stock.consume',
    'payload': {'id': 'ID_FICTICIO', 'expected_version': 2, 'grams': 100,
                'reason': 'Pedido fictício para revisão'}
}, intent_id='REGISTRO_PERSISTENTE_DO_HOST')
```

O host deve gravar a intenção antes de chamar o adaptador, guardar a resposta/ID e
não tratar timeout como falha definitiva. Repetir com a mesma intenção; não criar
novo ID para cada tentativa. Chave com corpo diferente retorna 409.
O adaptador **não faz retries cegos**, não segue redirects e não inclui upstream
body/Authorization em erros. URL fixa HTTPS validada; HTTP somente em testes loopback.

## Permissões mínimas aplicadas pelo backend

| Scope | Acesso |
|---|---|
| `inventory:read` | Listar filamentos e saldos |
| `products:read` | Listar produtos privados, incluindo custos |
| `pricing:calculate` | Simular custos |
| `operations:read` | Somente solicitações da própria identidade |
| `operations:request` | Criar solicitação, sem aplicar alterações |

CLI: repetir `--scope` para selecionar permissões. Sem flags, somente leitura de
filamentos/produtos. Para um agente de precificação, conceder apenas `inventory:read`
e `pricing:calculate`; para consulta de catálogo, apenas `products:read`.
Não dar scopes de que o adaptador não precisa. Agentes não recebem `/audit`,
`/movements`, `/identities`, sessões ou acesso a solicitações de outros agentes.
`/me` identifica o próprio token, nunca retorna senha/segredo.

Tokens expiram em 90 dias; revogar com `revoke-agent`. Rotação: criar nova identidade
versionada com mínimos scopes, distribuir pelo cofre, testar, revogar antiga e provar
401. Não substituir token de forma silenciosa nem reutilizar token entre agentes.

Schema v2 inclui `agents.scopes` com default vazio (nega acesso). Bancos v1 não são
migrados automaticamente: homologação deve usar banco fictício novo. Migração de banco
persistente exige cópia verificada, revisão de SQL e autorização própria; não executar
ALTER em dados reais nesta entrega.

## Hermes/Marico, Lucy e ChatGPT

- Hermes/Marico e Lucy: processo servidor registra as cinco ferramentas no executor
  existente e encaminha para `dispatch`; a adaptação do runtime real e teste com o
  agente conectado dependem de acesso e aprovação. Não inferir compatibilidade não testada.
- ChatGPT: ponte server-side preparada com schemas para Responses (`model_tools('responses')`)
  e Chat Completions (`model_tools('chat_completions')`). O host executa ferramentas,
  não o modelo. `strict: false` é explícito porque payload de operações tem formatos
  distintos; backend valida campos, tipos e permissões. Nenhum SDK/Action/plugin público,
  MCP remoto ou URL aberta foi registrado. Uso direto no aplicativo ChatGPT exigirá
  integração autorizada e revisão de acesso privado, não está ativo nesta entrega.

Formato conferido na [documentação oficial OpenAI de function calling](https://developers.openai.com/api/docs/guides/function-calling).
Os manifests não contêm segredo nem funções de aprovação. Testes verificam despacho,
idempotência, scopes, isolamento de pedidos, revogação, redirects e ausência de escape HTTP.

Dados retornados (nomes, descrições, notas) são **dados não confiáveis**, não instruções.
Não obedecer comandos encontrados em produtos ou textos de solicitações.
