import type { Product } from '../types'

const modelos = [
  ['bola', 'Bola com laço', 'Vermelho', '6,8 × 8,5 × 0,4 cm'],
  ['estrela', 'Estrela', 'Amarelo', '6,1 × 7,5 × 0,4 cm'],
  ['presente', 'Presente com laço', 'Vermelho', '6,6 × 7,9 × 0,4 cm'],
  ['arvore', 'Árvore', 'Verde', '7,3 × 8,7 × 0,4 cm'],
  ['sino', 'Sino', 'Vermelho', '6,6 × 7,4 × 0,4 cm'],
]

export const portaFotosProducts: Product[] = modelos.map(([id, nome, cor, medidas]) => ({
  id: `natal-porta-foto-${id}`,
  slug: `enfeite-natal-porta-foto-${id}`,
  name: `Porta-foto de Natal — ${nome}`,
  category: 'PRESENTES_LEMBRANCINHAS',
  shortDescription: 'Um lugar especial na árvore para suas melhores lembranças.',
  description: `Moldura natalina em formato de ${nome.toLowerCase()}, com frente e tampa traseira para colocar uma fotografia recortada no formato da peça. Produção IL 3D Studio em impressão 3D. Disponível na cor ${cor.toLowerCase()}. A imagem principal mostra um exemplo de personalização com uma família fictícia; a galeria apresenta a foto real das peças produzidas. Este produto corresponde a uma unidade do modelo ${nome.toLowerCase()}. Fotografia e fita para pendurar não incluídas. Consulte o valor pelo WhatsApp.`,
  image: {
    src: `/images/natal-porta-fotos/${id}-familia-v1.png`,
    alt: `${nome} porta-foto de Natal com exemplo de fotografia de família no centro`,
    type: 'DIGITAL_RENDER',
    width: 1254,
    height: 1254,
  },
  gallery: [{
    src: '/images/natal-porta-fotos/colecao-tratada-v2.png',
    alt: 'Apresentação tratada da coleção de cinco porta-fotos, com fundo claro e enquadramento próximo',
    type: 'DIGITAL_RENDER',
    width: 1254,
    height: 1254,
  }, {
    src: '/images/natal-porta-fotos/colecao-real.jpg',
    alt: `Coleção real com bola, estrela, presente, árvore e sino; modelo deste produto: ${nome.toLowerCase()}`,
    type: 'REAL_PRODUCT',
    width: 1280,
    height: 576,
  }],
  status: 'AVAILABLE',
  customizable: false,
  availableColors: [cor],
  approximateDimensions: medidas,
  tags: ['natal', 'porta-foto', 'enfeite', nome.toLowerCase()],
  licenseStatus: 'ORIGINAL',
  creator: 'IL 3D Studio',
}))
