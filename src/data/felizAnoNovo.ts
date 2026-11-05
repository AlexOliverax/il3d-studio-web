import type { Product } from '../types'

export const felizAnoNovoProducts: Product[] = [{
  id: 'ano-novo-modular-01',
  slug: 'feliz-ano-novo-numeros-trocaveis',
  name: 'Feliz Ano Novo — Números Trocáveis',
  category: 'PRESENTES_LEMBRANCINHAS',
  shortDescription: 'Uma decoração dourada para celebrar este ano e os próximos: basta trocar os números.',
  description: 'Enfeite de mesa em PETG dourado, com FELIZ sobre o 20 e os dois últimos algarismos removíveis. Os números se encaixam pela parte de baixo na base, permitindo montar 2027, 2028, 2029, 2030 e outros anos. O conjunto inclui base, bloco FELIZ 20, números 2 e 7 e seis extras: 8, 9, 3, 0, 1 e 2. As imagens de ambientação e a demonstração são ilustrativas; o acabamento da impressão pode variar. Consulte o valor e o prazo para o seu pedido.',
  image: {
    src: '/images/ano-novo-modular/produto.webp',
    alt: 'Enfeite dourado FELIZ 2027 sobre base, com FELIZ acima do 20 e os dois últimos números trocáveis',
    type: 'DIGITAL_RENDER', width: 1024, height: 480,
  },
  gallery: [{
    src: '/images/ano-novo-modular/ambientacao.webp',
    alt: 'Ambientação ilustrativa do enfeite FELIZ 2027 em uma mesa de celebração de Ano Novo',
    type: 'DIGITAL_RENDER', width: 765, height: 1024,
  }],
  video: {
    src: '/videos/feliz-ano-novo-troca-numeros.mp4',
    poster: '/images/ano-novo-modular/ambientacao.webp',
    captions: '/videos/feliz-ano-novo-troca-numeros.vtt',
    caption: 'Veja como trocar os números: 2027 → 2028 → 2029 → 2030. Demonstração ilustrativa em 3D.',
  },
  status: 'QUOTE_ONLY', customizable: false,
  material: 'PETG', availableColors: ['Dourado'],
  approximateDimensions: '19 cm de largura × 11 cm de altura × 3,2 cm de profundidade',
  tags: ['ano novo', 'réveillon', 'números trocáveis', 'decoração', 'mesa', 'dourado', '2027'],
  licenseStatus: 'ORIGINAL', creator: 'IL 3D Studio', accentColor: '#C9961A',
}]
