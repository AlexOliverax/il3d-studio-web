# Publicação do IL 3D Studio no servidor da Lucy

O domínio existente usa Caddy e arquivos estáticos em
`/opt/il3d-studio-web/dist`. O repositório é
https://github.com/AlexOliverax/il3d-studio-web.

## Atualizar a versão

Depois de a correção estar em `main`, executar no servidor:

```bash
cd /opt/il3d-studio-web
git status --short
# Continuar somente se não houver modificações locais a preservar.
git pull --ff-only origin main
npm ci
npm test
npm run build
```

Preservar o `.env` existente e a configuração de WhatsApp. O build precisa
terminar com sucesso antes de disponibilizar o novo `dist/`. Para uma publicação
sem interrupção, gerar o build em um checkout de release separado e trocar
atomicamente a pasta/ligação servida pelo Caddy. Não alterar DNS, TLS ou outros
serviços do servidor para esta atualização.

## Verificar

- Página inicial e foto HueForge carregam no domínio com e sem `www`.
- Menu abre/fecha no celular e fecha com Escape.
- Detalhes → adicionar ao orçamento deixa somente o orçamento aberto.
- Quantidade e observações são preservadas após recarregar.
- Fechar orçamento remove seus controles da navegação por teclado.
- Link WhatsApp abre o número correto e inclui os detalhes digitados.
- Botão flutuante não cobre a barra de orçamento em tela pequena.
- Privacidade, termos e perguntas frequentes abrem corretamente.

Para verificar o arquivo estático sem depender de execução de JavaScript:

```bash
curl -I https://www.il3dstudio.com.br/images/hueforge-cristao.jpg
```

## Recuperação

Reter a versão anterior de `dist/` até concluir a verificação. Se a nova versão
falhar, restaurar essa pasta ou a ligação para a release anterior. Não reverter
outros serviços nem sobrescrever modificações locais do servidor.
