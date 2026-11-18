import type { Product } from '../types'

export const products: Product[] = [{
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
}, {
  id: 'nat-001',
  slug: 'arvore-de-natal-articulada',
  name: 'Árvore de Natal Articulada',
  category: 'ARTICULADOS',
  shortDescription: 'Enfeite natalino impresso em 3D com gorro de Papai Noel, luvas brancas e sapatos amarelos.',
  description: 'Árvore decorativa com pernas articuladas e pose sentada para apoiar na borda de uma prateleira. O banner ilustra a combinação de cores proposta para a peça.',
  image: {
    src: '/images/arvore-natal-articulada.webp',
    alt: 'Banner ilustrativo da árvore de Natal articulada com pernas pretas e sapatos amarelos',
    type: 'CONCEPT',
    width: 900,
    height: 1125,
  },
  status: 'DEVELOPMENT',
  estimatedUnitPrice: 49.90,
  customizable: false,
  availableColors: [],
  tags: ['natal', 'decoração', 'articulados'],
  licenseStatus: 'PENDING_LICENSE',
  accentColor: '#CE292C',
}]

export default products
