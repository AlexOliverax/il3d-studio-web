import type { Product } from '../types'

// Only the collection confirmed by the studio is listed here.
// Only confirmed prices and dimensions are listed; lead times are agreed by WhatsApp.
export const products: Product[] = [{
  id: 'natal-pote-biscoito',
  slug: 'pote-natalino-biscoito',
  name: 'Pote natalino com tampa — Biscoito',
  category: 'PRESENTES_LEMBRANCINHAS',
  price: 39.90,
  shortDescription: 'Pote decorativo natalino com tampa de rostinho e laço rosa. Doces não incluídos.',
  description: 'Um encanto de Natal para presentear e organizar pequenos objetos. Pote redondo impresso em 3D, com tampa decorada com rostinho sorridente, detalhes brancos e laço rosa. Preço por unidade, referente ao pote com tampa. Os doces da imagem são ilustrativos e não estão incluídos. Para compor presentes com doces, utilize embalagens individuais; o pote não é indicado para contato direto com alimentos. Produção sob encomenda. Consulte pelo WhatsApp o prazo e o frete.',
  image: {
    src: '/images/pote-natalino-doces.jpg',
    alt: 'Pote natalino amarelo com tampa de rostinho e laço rosa, acompanhado de doces embalados ilustrativos não incluídos',
    type: 'PROMOTIONAL',
    width: 1000,
    height: 1250,
  },
  status: 'QUOTE_ONLY',
  customizable: false,
  availableColors: [],
  material: 'PLA',
  tags: ['natal', 'pote', 'organização', 'decoração', 'presente'],
  licenseStatus: 'PENDING_LICENSE',
  accentColor: '#147D43',
}, {
  id: 'hue-001',
  slug: 'colecao-crista-hueforge',
  name: 'Coleção Cristã em HueForge',
  category: 'HUEFORGE',
  shortDescription: 'Arte cristã impressa em camadas para decorar e presentear com significado.',
  description: 'Uma coleção própria da IL 3D Studio que transforma arte cristã em peças impressas em camadas de filamento. A imagem mostra o painel apresentado pelo estúdio, com Jesus e cenas de sua vida. Consulte pelo WhatsApp as obras da coleção, tamanhos, valores e prazo de produção.',
  image: {
    src: '/images/hueforge-cristao.jpg',
    alt: 'Painel cristão em HueForge da IL 3D Studio, com Jesus e cenas de sua vida',
    type: 'REAL_PRODUCT',
    width: 1043,
    height: 1536,
  },
  status: 'QUOTE_ONLY',
  customizable: false,
  availableColors: [],
  tags: ['hueforge', 'arte cristã', 'decoração', 'presente'],
  licenseStatus: 'ORIGINAL',
  creator: 'IL 3D Studio',
  accentColor: '#FF2D78',
}, ...([
  { id: 'natal-arvore-mini-5cm', slug: 'arvore-natal-articulada-mini-5cm', name: 'Árvore de Natal articulada — Mini 5 cm', price: 29.90, approximateDimensions: '5 cm de altura' },
  { id: 'natal-arvore-maior', slug: 'arvore-natal-articulada-maior', name: 'Árvore de Natal articulada — Versão maior', price: 49.90 },
].map((variant): Product => ({
  ...variant,
  category: 'ARTICULADOS',
  shortDescription: 'Decoração de Natal articulada impressa em 3D. Produção sob encomenda.',
  description: 'Árvore de Natal articulada impressa em 3D, com gorro natalino e detalhes coloridos. Preço por unidade. Imagem ilustrativa fornecida pelo estúdio com os dois tamanhos; os pedestais da composição não fazem parte da oferta. Consulte pelo WhatsApp o prazo de produção, o frete e os detalhes da encomenda.',
  image: {
    src: '/images/arvore-natal-dois-tamanhos.png',
    alt: 'Banner IL 3D Studio: árvore de Natal articulada mini de 5 cm por R$ 29,90 e versão maior por R$ 49,90 por unidade',
    type: 'PROMOTIONAL',
    width: 1229,
    height: 1536,
  },
  status: 'QUOTE_ONLY',
  customizable: false,
  availableColors: [],
  tags: ['natal', 'árvore de natal', 'articulado', 'decoração', 'presente'],
  licenseStatus: 'PENDING_LICENSE',
  accentColor: '#147D43',
}))) ]

export default products
