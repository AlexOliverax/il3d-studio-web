# Ano Novo modular — produto e vídeo

Produto `ano-novo-modular-01`, slug `feliz-ano-novo-numeros-trocaveis`, na coleção **Ano Novo** e na busca geral. PETG dourado, dimensões aproximadas de 19 × 11 × 3,2 cm. Base, FELIZ 20, 2 e 7 removíveis e seis extras (8, 9, 3, 0, 1, 2). Cadastro sob orçamento, sem publicar a estimativa comercial de R$ 95 como preço confirmado.

As duas imagens fornecidas pelo proprietário foram preservadas e convertidas em WebP. Estão classificadas como ilustrativas; não há alegação de fotografia de produto físico ou de teste físico completo.

Vídeo em `public/videos/feliz-ano-novo-troca-numeros.mp4`: 18 segundos, vertical 720 × 1280, 24 fps, H.264/AAC, trilha instrumental e assinatura IL 3D Studio nos três segundos finais. Sem narração. Abertura com imagem de ambientação; demonstração do modelo aprovado mostra retirada vertical, afastamento e encaixe dos algarismos: 2027 → 2028 → 2029 → 2030. Animação identificada como ilustrativa em 3D. A frente da base oculta os pinos encaixados. Legendas em português no VTT adjacente.

Ficha do produto com player de vídeo responsivo, controles, poster, reprodução manual e `preload="none"`; sem carregar o vídeo inteiro na abertura da ficha. O recurso é opcional e não altera as fichas dos demais produtos.

Validação: suíte de regressão completa, incluindo descoberta do produto, segregação da coleção, mídias/legendas e player sem autoplay; build de produção; reprodução dos 18 segundos no navegador local, sem erro de mídia; inspeção visual da troca de números e da assinatura. Áudio confirmado por metadados, não por escuta.

O runner original de testes apresentou EISDIR no symlink no Windows. A mesma suíte foi executada em diretório temporário dentro do checkout, resolvendo React sem symlink; o runner versionado foi preservado.

## Publicação pela Lucy

Alteração adicionada à branch existente `codex/catalogo-natal-comercial` e ao PR #3, preservando os produtos e imagens já presentes nessa branch. Usar a revisão completa dessa branch; não substituir o catálogo por `main` antigo.

O usuário definiu o fluxo: preparar no GitHub; Lucy publica depois. Este trabalho não altera o servidor, DNS, TLS, variáveis de ambiente ou WhatsApp, nem faz merge em main. Na publicação, manter as coleções já existentes no servidor e incorporar a nova coleção Ano Novo. Verificar o vídeo e o arquivo VTT no domínio após o build.
