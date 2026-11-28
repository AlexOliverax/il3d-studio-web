# IL 3D Studio

Site comercial em React, TypeScript e Vite para https://www.il3dstudio.com.br.

A vitrine apresenta a coleção cristã em HueForge confirmada pelo estúdio e a
fotografia fornecida por Alexsandro. Preços, medidas, opções e prazo são
combinados pelo WhatsApp. Projetos personalizados são avaliados sob orçamento.

## Desenvolvimento

```bash
npm ci
npm run dev
```

O WhatsApp usa a configuração em `src/config/site.ts`. Para substituí-la no
build, configure `VITE_IL3D_WHATSAPP_NUMBER` com um número brasileiro válido
(com DDI e DDD). Configurações inválidas usam o número padrão do estúdio.
Não inclua tokens ou credenciais no frontend.

## Verificação

```bash
npm test
npm run build
```

Os testes verificam recuperação de dados antigos ou inválidos do orçamento,
quantidades, mensagens do WhatsApp, imagem existente, controles de janelas
fechadas, rótulos de licença e consistência do FAQ com os dados estruturados.
O build executa a checagem de tipos e gera `dist/`.

## Conteúdo

- `src/data/products.ts`: coleção e fotografias confirmadas.
- `src/data/faq.ts`: perguntas visíveis e fonte do JSON-LD do FAQ.
- `src/config/site.ts`: contato e navegação.
- `public/images/hueforge-cristao.jpg`: fotografia fornecida pelo estúdio.

Somente adicione produtos, fotos reais, disponibilidade ou informações de
autoria/licenciamento quando confirmados. A foto representa um painel da
coleção; não implica que todas as obras estão disponíveis ou com o mesmo preço.

## Publicação

O domínio atual usa Caddy no servidor da Lucy. Atualizar o GitHub não publica
sozinho os arquivos no servidor. Consulte `docs/LUCY_DEPLOYMENT_HANDOFF.md`.

## Módulo privado Gestão (desenvolvimento)

A primeira versão isolada está em [management/](management/README.md).
Não faz parte do build público, não publica produtos e não se conecta a dados reais.
Veja a [análise e arquitetura](docs/GESTAO_ARCHITECTURE.md) e o
[contrato para agentes/Hermes](docs/GESTAO_HERMES_API.md).
