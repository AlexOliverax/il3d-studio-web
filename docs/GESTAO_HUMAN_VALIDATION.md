# Roteiro para revisão conjunta — sem produção

Primeiro revisar documentos/capturas do PR. Depois de autorizar ativação da homologação,
executar cada fluxo em computador e celular; usar somente os dois logins fictícios
entregues privadamente. Não anexar credenciais ou nomes reais ao PR.

## Evidências de interface sintética

- [Precificação desktop](../management/evidence/pricing-1280.png)
- [Precificação celular 390px](../management/evidence/pricing-390.png)
- [Rascunhos desktop](../management/evidence/products-1280.png)
- [Rascunhos celular 390px](../management/evidence/products-390.png)

São capturas de testes em Chromium, não screenshots de um serviço público ou de contas reais.

## Checklist humano

| Caso | Ação | Esperado |
|---|---|---|
| Acesso | Abrir sem VPN/sem sessão | Sem acesso à rede privada; sem sessão, dados retornam 401 |
| Dois avaliadores | Entrar com DemoAdmin1 e DemoAdmin2 em aparelhos separados | Identidades separadas na auditoria; sem conta compartilhada |
| Filamento | Solicitar cadastro/entrada | Saldo só muda após revisão, checkbox e senha no painel |
| Precificação | Usar exemplo de `GESTAO_PRICING.md` | Base R$32, total R$37, lucro R$13, margem 26%, sugestão R$45,72 |
| Medidos | Escolher valores medidos sem referência ou com perda adicional | Rejeita; não contabiliza como custo real nem muda estoque |
| Percentuais | Impostos+taxas+margem >=100% | Erro claro, sem preço enganoso/infinito |
| Conflito | Dois pedidos de consumo na mesma versão | Primeiro aprovado aplica; segundo acusa versão alterada |
| Repetição | Reenviar a mesma intenção/agente | Mesmo pedido; não duplica movimento |
| Estoque | Solicitar consumo maior que saldo | Aprovação falha, saldo/auditoria de execução intactos |
| Produto | Salvar rascunho e preparar catálogo | Draft/ready internos; nenhuma publicação na vitrine |
| Agente | Consultar/pedir com token restrito, tentar aprovar | Leitura/pedido conforme scopes; aprovação 403 |
| Revogação | Revogar token de teste via operador | Próxima chamada 401; outros agentes continuam independentes |
| Mobile | Navegar, digitar, revisar aprovação, sair | Sem overflow horizontal, campos/ações usáveis, sessão encerrada |
| Auditoria | Conferir execução | Solicitante, aprovador, executor, UTC, antes/depois |
| Restauração | Operador restaura cópia fictícia em caminho novo | Integridade ok, saldos/histórico/login preservados; origem intacta |

Registrar: caso, dispositivo/navegador, passou/falhou, evidência sintética, problema e
responsável. Não incluir IP privado, token, senha ou dados pessoais no PR público.

## Decisões que ainda precisam de confirmação

- Autorizar (ou não) ativação temporária do kit privado e dispositivos/ACL/hostname.
- Aceitar definição de perdas, manutenção, tarifa efetiva e margem; fornecer parâmetros
  reais somente em etapa autorizada fora do Git.
- Confirmar proposta de MFA/recuperação, objetivos de backup e revisão independente.
- Aprovar estratégia de reconciliação da vitrine antes de qualquer publicação.

Aceitar esta homologação **não autoriza** merge, deploy produtivo, contas reais,
publicação de catálogo ou alterações de dados reais. Essas decisões continuam separadas.
