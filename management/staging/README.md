# Homologação privada — kit preparado, não disponibilizado

**Status desta entrega:** composição e dados fictícios preparados/testados; nenhum
container/serviço de staging iniciado, nenhuma porta aberta, nenhum link de acesso
publicado, nenhum usuário real criado. Não executar ativação sem confirmação explícita.
Os servidores de testes automatizados usam loopback temporário e são encerrados ao terminar.

## Componentes

- `prepare.py`: cria diretório novo fora do Git, SQLite v2, dois usuários `DemoAdmin1/2`
  com senhas aleatórias, um filamento/entrada e um produto fictícios. Passa pelas mesmas
  solicitações/aprovações da aplicação durante o seed, preservando auditoria.
- `demo-credentials.json`: gerado fora do Git, modo 0600, nunca imprimir em logs/chat.
  Apenas o banco é montado no container; esse arquivo de senhas não entra no container.
- `compose.yaml`: todos os serviços exigem profile `approved-staging`; `restart: no`.
  Backend sem porta publicada, rede Docker interna; proxy somente 127.0.0.1 por default.
- `Dockerfile`: backend Gunicorn não-root, read-only com diretório de dados separado.
- `Caddyfile`: TLS de CA interna persistente; admin API/redirect HTTP desativados.
- `compose.env`: configuração privada gerada fora do Git; não é carregada pelo CI.

## Preparação local sem publicar (já exercitada com dados fictícios)

```bash
# Exemplo: diretório novo e privado, sempre fora do checkout.
.venv-gestao/bin/python -m management.staging.prepare --directory /CAMINHO_PRIVADO/gestao-review

# Somente valida a configuração. Não cria containers, imagens ou listeners.
docker compose --env-file /CAMINHO_PRIVADO/gestao-review/compose.env \
  -f management/staging/compose.yaml --profile approved-staging config --quiet
```

O script recusa diretório existente e caminhos dentro do checkout. Não reutilizar banco
real nem banco v1; o kit gera schema v2 novo. As duas contas são de demonstração; na
homologação, uma é atribuída a cada avaliador por canal privado, sem usar nomes reais.
O kit só entrega arquivos; não configura rede, serviço, proxy existente ou autenticação real.

## Proposta de acesso desktop/celular (aguarda aprovação)

1. Hostname reservado proposto: `gestao.test`, resolvido por DNS privado para IP da VPN
   do host de homologação. Somente os dois dispositivos/usuários aprovados na ACL da VPN.
   Alternativamente, hostname privado escolhido pelo operador; atualizar Origin junto.
2. Publicação do proxy APENAS no IP da VPN, porta 9443. Manter bind 127.0.0.1 até a
   aprovação; nunca usar `0.0.0.0`, DNS público, port forwarding ou túnel público.
3. TLS interno: distribuir apenas o certificado **público** da CA e instalar confiança
   nos aparelhos aprovados (desktop/Android/iOS conforme usados). Não distribuir chave
   privada da CA. Não orientar “ignorar alerta de certificado”; validar hostname/cadeia.
   Para certificado de CA pública via DNS challenge, preparar proposta separada de
   permissões/credenciais; não abrir HTTP público automaticamente.
4. Entregar credenciais fictícias individualmente pelo canal privado/cofre. Não incluir
   senhas, tokens, QR de acesso ou certificados privados em issue/PR/chat de grupo.
5. Testar telefone na VPN e fora dela: dentro deve funcionar com HTTPS confiável; fora
   deve falhar. Conferir cookie Secure/HttpOnly e Origin/CSRF. Identidade de cada conta
   fictícia deve aparecer na auditoria.

TLS interno requer confiança explícita nos dispositivos; [documentação Caddy](https://caddyserver.com/docs/caddyfile/directives/tls).
Nenhuma dessas configurações de rede/TLS/dispositivo foi aplicada nesta entrega.

## Ativação futura — comandos somente após confirmação

Conferir host, recursos, permissão do diretório, UID/GID, DNS privado, ACL, trust da CA e
janela de desligamento. Aprovar/fixar digests das imagens e auditar OS antes de iniciar.
Rever `GESTAO_BIND_IP` privadamente para o IP autorizado da VPN e manter hostname/Origin
coerentes. Para validação somente local, manter 127.0.0.1 e túnel SSH autorizado.

```bash
# NÃO EXECUTADO nesta entrega; exige confirmação do responsável.
docker compose --env-file /CAMINHO_PRIVADO/gestao-review/compose.env \
  -f management/staging/compose.yaml --profile approved-staging up --build -d
```

A aplicação será `https://gestao.test:9443` apenas depois de configurar o acesso privado.
Este é um endereço proposto, **não um serviço ativo**. Verificar login, CSRF e isolamento
antes de entregar acesso. Imagens/Compose não foram iniciados; validação operacional do
stack HTTPS é pendência da janela de homologação, não evidência já concluída.

Desligamento autorizado ao terminar a janela:

```bash
docker compose --env-file /CAMINHO_PRIVADO/gestao-review/compose.env \
  -f management/staging/compose.yaml --profile approved-staging down
```

Não usar `down -v`, apagar bancos ou remover CA automaticamente; preservar evidências
privadas até decisão de descarte. Não instalar cron/systemd nem política de reinício.
O workflow GitHub só testa/builda a vitrine; não chama nenhum comando de ativação.

## Roteiro humano e aceite

Usar [roteiro de validação](../../docs/GESTAO_HUMAN_VALIDATION.md). Capturas automatizadas
com dados fictícios estão em `management/evidence/`. Execução automatizada não substitui
aceite dos avaliadores no computador e celular reais. Registrar resultado sem senhas
ou dados reais, bugs com reprodução e decisão de aprovação/rejeição.
