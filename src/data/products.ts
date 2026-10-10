import type { Product } from '../types'

// Only the collection confirmed by the studio is listed here.
// Dimensions, prices and lead times are confirmed during the quote.
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
}]

export default products
