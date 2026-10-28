# Imagens dos porta-fotos — imagegen integrado

Modo usado: ferramenta imagegen integrada, sem CLI/API externa. Referência: public/images/natal-porta-fotos/colecao-real.jpg, fotografia fornecida pelo proprietário.

Especificação comum dos prompts: compositing/product-mockup; uma imagem quadrada por produto, fotografia comercial frontal, enfeite inteiro centralizado ocupando cerca de 75% do quadro, textura sutil de filamento impresso, pendurado por cordão em pinheiro, fundo natalino desfocado com luz dourada, sem texto/logotipo/marca d'água. Retrato fictício de dois pais com duas crianças, recortado dentro da abertura sob a moldura. Preservar o contorno real; não adicionar ornamentos nem redesenhar o produto.

- Bola: moldura vermelha circular, duas alças alongadas vazadas do laço no topo e argola central; sem pontas de fita. 68 × 85 × 4 mm.
- Estrela: amarela, seis pontas arredondadas, argola no topo, borda fina; não usar cinco pontas. 61 × 75 × 4 mm.
- Presente: vermelho, quadrado arredondado com duas alças vazadas do laço no topo; sem fitas cruzando o retrato. 66 × 79 × 4 mm.
- Árvore: verde turquesa, pinheiro angular com três níveis, argola acima da ponta e tronco retangular curto. Retrato recortado na abertura da árvore. 72,9 × 87,3 × 4 mm.
- Sino: vermelho, cúpula arredondada e base alargada, badalo arredondado central abaixo e argola no topo; sem laço. Retrato recortado na abertura do sino. 65,9 × 74,3 × 4 mm.

Arquivos finais: public/images/natal-porta-fotos/{bola,estrela,presente,arvore,sino}-familia-v1.png. A foto real original permanece como colecao-real.jpg.

## Tratamento da foto de coleção — v2

Ferramenta: imagegen integrado; alvo: fotografia original do lote. Prompt: remover as paredes prateadas e emendas pretas da caixa de luz pelo enquadramento, aproximar os cinco enfeites com margem confortável, corrigir exposição e balanço de branco, melhorar suavemente clareza e contraste, fundo branco neutro e sombras naturais. Preservar os cinco objetos, suas formas, cores, posições e rotações, sem retratos, texto ou detalhes adicionais. Saída: public/images/natal-porta-fotos/colecao-tratada-v2.png. Tratamento generativo identificado como DIGITAL_RENDER; fotografia original preservada como REAL_PRODUCT na galeria.
