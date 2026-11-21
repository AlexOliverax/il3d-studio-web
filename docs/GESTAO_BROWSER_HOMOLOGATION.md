# Homologação temporária pelo navegador (sem VPN)

O responsável autorizou em 19/10/2026 preparar acesso protegido pelo navegador,
**somente para testes**, com retorno posterior ao acesso VPN. Isso substitui a
exigência de VPN para esta janela, não autoriza produção, merge, contas/dados reais,
publicação de catálogo nem conexão de agentes. A vitrine permanece inalterada.

## Proteções preparadas

- Compose separado `management/staging/compose.browser.yaml`, profile explícito,
  serviço não-root/read-only, banco fictício separado, sem política de reinício.
- Porta do backend vinculada exclusivamente ao loopback. Proxy HTTPS do host usa
  um **novo hostname**, nunca substitui o bloco ou arquivos da vitrine.
- `GESTAO_REQUIRE_MFA=1`: o processo recusa inicialização sem provisionamento MFA.
- Senha e TOTP individual obrigatórios no backend; seis dígitos/30 segundos, janela
  ±1 passo. Códigos já usados são rejeitados com estado persistente transacional.
- Tentativas incorretas de segundo fator contam para o limite existente de login
  (dez tentativas por conta/origem em quinze minutos). Senha correta sozinha não
  limpa esse contador. O proxy não fornece identidade administrativa.
- MFA é opcional nos ambientes antigos para compatibilidade, mas **obrigatório**
  no novo profile de navegador. Nenhuma garantia de MFA é atribuída ao profile antigo.
- Cookies Secure/HttpOnly/SameSite, Origin/CSRF, autorização e confirmações de
  operações no backend continuam obrigatórios.
- TOTP não é resistente a phishing. Segredos ficam em arquivo privado 0600,
  propriedade do usuário do serviço, fora do Git, montado somente para leitura.
  Não se trata de proteção contra comprometimento do host.

## Provisionamento e ativação — sequência operacional

1. Criar kit NOVO com `management.staging.prepare`; somente usuários fictícios.
2. Gerar segredo TOTP aleatório (20 bytes, Base32) por conta em arquivo JSON
   `{ "DemoAdmin1": "<segredo privado>", "DemoAdmin2": "<segredo privado>" }`.
   Não copiar valores reais para documentação, terminal, logs, Git ou PR.
3. Configurar fora do Git `GESTAO_BROWSER_HOST`, `GESTAO_STAGE_DATA`,
   `GESTAO_MFA_FILE`, `GESTAO_UID` e `GESTAO_GID`. A origem deve coincidir com HTTPS.
4. Entregar a cada avaliador suas credenciais e inscrição do autenticador por
   canal privado individual verificado. Não entregar a conta de outra pessoa.
   A entrega/enrollment ainda não está concluída. Perda do fator exige intervenção
   manual e revogação de sessões; não há recuperação self-service nem bypass.
5. Criar DNS do novo hostname apontando ao proxy autorizado; verificar resolução
   externa, emitir certificado confiável e conferir HTTPS sem ignorar alertas.
6. Validar Compose, build e login local com/sem MFA; acesso sem autenticação a
   dados deve retornar 401. Não expor o backend diretamente.
7. Antes de disponibilizar, agendar desligamento automático após **duas horas**
   (prazo proposto), preservar banco e registros e confirmar que não há reinício
   automático. A janela começa quando o acesso for entregue, não na preparação.
8. Instalar somente o bloco separado do proxy após backup e validação; verificar
   que a vitrine não mudou. Não registrar segredos ou IPs de avaliadores no PR.
9. Testar desktop e Android (inclusive rede móvel), MFA, aprovações e encerramento.

## Encerramento e retorno à VPN

Parar/remover os containers do projeto de homologação **sem `-v`**, retirar apenas
o bloco temporário do proxy e preservar evidências/banco fictício. O acesso deve
falhar após o encerramento. A volta à VPN não é automática: validar dispositivos,
ACL e TLS antes de reativar o profile privado. Não reutilizar senhas/segredos
fictícios em produção.

## Evidências e limites desta preparação

- 64 testes existentes passaram após alteração do login; 10 novos testes passaram:
  vetores RFC 6238, exigência do fator, login válido, replay, código expirado,
  limite de tentativas, campo na tela, permissões de arquivo e fail-closed.
- Compose validado e configuração de exemplo do proxy adaptada, sem reload do host.
- Build e smoke test do stack em loopback concluídos: dados sem sessão401, senha sem MFA401, login completo200, replay401 e flags de cookie verificadas. Containers encerrados após o teste. Um relay separado permite acesso do proxy local sem dar rede externa ao backend; conserva somente NET_BIND_SERVICE exigido pelo binário Caddy.
- DNS, certificado externo, inscrição dos autenticadores, entrega individual e
  validação humana são gates ainda pendentes. Não existe URL liberada nesta etapa.
- Recuperação self-service, revisão independente e demais gates de produção
  continuam pendentes. Este trabalho não declara o sistema pronto para produção.
