import type { Product } from '../types'

// ============================================================
// Catálogo de produtos do IL 3D Studio
// Adicione, remova ou edite produtos aqui.
// NUNCA marque como AVAILABLE sem validação física real.
// ============================================================

export const products: Product[] = [
  // ----------------------------------------------------------
  // BICHOS DE BOLSO
  // ----------------------------------------------------------
  {
    id: 'bdp-001',
    slug: 'tico-o-tatu',
    name: 'Tico, o Tatu',
    category: 'BICHOS_DE_BOLSO',
    description:
      'Um tatuzinho articulado cabível no bolso. Inspirado no tatu-bola brasileiro, Tico se curva ao ser segurado e volta sozinho. Conceito em desenvolvimento.',
    image: {
      src: '/images/placeholder-tico.svg',
      alt: 'Tico, o Tatu — personagem conceitual do IL 3D Studio',
      type: 'CONCEPT',
    },
    status: 'DEVELOPMENT',
    customizable: false,
    tags: ['bicho', 'articulado', 'brasil', 'pocket'],
    developmentNote: 'Modelagem em andamento. Primeiro protótipo previsto em breve.',
    licenseStatus: 'ORIGINAL',
    accentColor: '#8B5E3C',
  },
  {
    id: 'bdp-002',
    slug: 'cora-a-capivara',
    name: 'Cora, a Capivara',
    category: 'BICHOS_DE_BOLSO',
    description:
      'A capivara mais zen do Brasil, agora em versão miniatura articulada. Cora tem cabeça e patas com movimento suave. Conceito em desenvolvimento.',
    image: {
      src: '/images/placeholder-cora.svg',
      alt: 'Cora, a Capivara — personagem conceitual do IL 3D Studio',
      type: 'CONCEPT',
    },
    status: 'DEVELOPMENT',
    customizable: false,
    tags: ['bicho', 'articulado', 'brasil', 'pocket', 'capivara'],
    developmentNote: 'Conceito em validação visual. Sem prazo definido ainda.',
    licenseStatus: 'ORIGINAL',
    accentColor: '#7A9B5F',
  },
  {
    id: 'bdp-003',
    slug: 'pingo-o-sapo',
    name: 'Pingo, o Sapo',
    category: 'BICHOS_DE_BOLSO',
    description:
      'Pequeno e expressivo, Pingo é um sapinho de bolso com patas articuladas. Inspirado na fauna brasileira, ele ocupa pouco espaço e diverte muito.',
    image: {
      src: '/images/placeholder-pingo.svg',
      alt: 'Pingo, o Sapo — personagem conceitual do IL 3D Studio',
      type: 'CONCEPT',
    },
    status: 'DEVELOPMENT',
    customizable: false,
    tags: ['bicho', 'articulado', 'brasil', 'pocket', 'sapo'],
    developmentNote: 'Exploração de design inicial. Em fase de rascunho.',
    licenseStatus: 'ORIGINAL',
    accentColor: '#4CAF50',
  },
  {
    id: 'bdp-004',
    slug: 'zigue-o-lagarto',
    name: 'Zigue, o Lagarto',
    category: 'BICHOS_DE_BOLSO',
    description:
      'Com escamas digitais e uma cauda que balança de verdade, Zigue é o lagarto articulado que todo colecionador vai querer. Conceito em desenvolvimento.',
    image: {
      src: '/images/placeholder-zigue.svg',
      alt: 'Zigue, o Lagarto — personagem conceitual do IL 3D Studio',
      type: 'CONCEPT',
    },
    status: 'DEVELOPMENT',
    customizable: false,
    tags: ['bicho', 'articulado', 'brasil', 'pocket', 'lagarto'],
    developmentNote: 'Aguardando modelagem inicial.',
    licenseStatus: 'ORIGINAL',
    accentColor: '#FF9800',
  },

  // ----------------------------------------------------------
  // ARTICULADOS
  // ----------------------------------------------------------
  {
    id: 'art-001',
    slug: 'polvo-articulado',
    name: 'Polvo Articulado',
    category: 'ARTICULADOS',
    description:
      'Oito tentáculos totalmente articulados, impressos em PLA flex. Cores variadas disponíveis sob orçamento. Um clássico da impressão 3D criativa.',
    image: {
      src: '/images/placeholder-polvo.svg',
      alt: 'Polvo articulado impresso em 3D',
      type: 'CONCEPT',
    },
    status: 'QUOTE_ONLY',
    customizable: true,
    tags: ['articulado', 'polvo', 'flex', 'colorido'],
    licenseStatus: 'ORIGINAL',
    accentColor: '#FF2D78',
  },
  {
    id: 'art-002',
    slug: 'cobrinha-segmentada',
    name: 'Cobrinha Segmentada',
    category: 'ARTICULADOS',
    description:
      'Serpente em segmentos encaixados, totalmente flexível. Cabe no bolso e fica horas passando de mão em mão. Disponível sob orçamento.',
    image: {
      src: '/images/placeholder-cobrinha.svg',
      alt: 'Cobrinha segmentada articulada impressa em 3D',
      type: 'CONCEPT',
    },
    status: 'QUOTE_ONLY',
    customizable: true,
    tags: ['articulado', 'cobra', 'segmentada', 'flex'],
    licenseStatus: 'ORIGINAL',
    accentColor: '#FFE000',
  },

  // ----------------------------------------------------------
  // FIDGETS
  // ----------------------------------------------------------
  {
    id: 'fidg-001',
    slug: 'fidget-slider',
    name: 'Fidget Slider',
    category: 'FIDGETS',
    description:
      'Slider deslizante com movimento suave. Impresso em PLA com acabamento liso. Ideal para quem precisa de algo na mão durante reuniões e estudos.',
    image: {
      src: '/images/placeholder-slider.svg',
      alt: 'Fidget slider impresso em 3D',
      type: 'CONCEPT',
    },
    status: 'DEVELOPMENT',
    customizable: true,
    tags: ['fidget', 'slider', 'foco', 'anti-stress'],
    developmentNote: 'Testando tolerâncias de encaixe. Aguardando protótipo.',
    licenseStatus: 'ORIGINAL',
    accentColor: '#FF2D78',
  },
  {
    id: 'fidg-002',
    slug: 'anel-fidget',
    name: 'Anel Giratório / Fidget Ring',
    category: 'FIDGETS',
    description:
      'Anel com camada externa giratória. Usa como acessório ou fidget discreto. Disponível em diferentes tamanhos mediante orçamento.',
    image: {
      src: '/images/placeholder-anel.svg',
      alt: 'Anel giratório fidget impresso em 3D',
      type: 'CONCEPT',
    },
    status: 'QUOTE_ONLY',
    customizable: true,
    tags: ['fidget', 'anel', 'giratorio', 'acessorio'],
    licenseStatus: 'ORIGINAL',
    accentColor: '#FFE000',
  },

  // ----------------------------------------------------------
  // PERSONALIZADOS
  // ----------------------------------------------------------
  {
    id: 'pers-001',
    slug: 'chaveiro-personalizado',
    name: 'Chaveiro Personalizado',
    category: 'PERSONALIZADOS',
    description:
      'Chaveiro com nome, inicial, símbolo ou formato especial, impresso em PLA. Perfeito para presentes, lembrancinhas de aniversário e eventos.',
    image: {
      src: '/images/placeholder-chaveiro.svg',
      alt: 'Chaveiro personalizado impresso em 3D',
      type: 'CONCEPT',
    },
    status: 'QUOTE_ONLY',
    customizable: true,
    tags: ['chaveiro', 'presente', 'personalizado', 'lembrancinha'],
    licenseStatus: 'ORIGINAL',
    accentColor: '#FF2D78',
  },
  {
    id: 'pers-002',
    slug: 'tag-de-mochila',
    name: 'Tag de Mochila',
    category: 'PERSONALIZADOS',
    description:
      'Tag de identificação ou decorativa para mochila. Com nome, apelido ou arte personalizada. Resistente e leve.',
    image: {
      src: '/images/placeholder-tag.svg',
      alt: 'Tag de mochila personalizada impressa em 3D',
      type: 'CONCEPT',
    },
    status: 'QUOTE_ONLY',
    customizable: true,
    tags: ['tag', 'mochila', 'personalizado', 'escola'],
    licenseStatus: 'ORIGINAL',
    accentColor: '#FFE000',
  },

  // ----------------------------------------------------------
  // FUNCIONAIS
  // ----------------------------------------------------------
  {
    id: 'func-001',
    slug: 'itens-para-festa',
    name: 'Itens para Festa',
    category: 'FUNCIONAIS',
    description:
      'Lembrancinhas, enfeites de mesa, topos de bolo e decoração temática em 3D. Cotação por pedido com prazo e quantidade a combinar.',
    image: {
      src: '/images/placeholder-festa.svg',
      alt: 'Itens decorativos para festa impressos em 3D',
      type: 'CONCEPT',
    },
    status: 'QUOTE_ONLY',
    customizable: true,
    tags: ['festa', 'lembrancinha', 'decoracao', 'evento', 'aniversario'],
    licenseStatus: 'ORIGINAL',
    accentColor: '#FF2D78',
  },
  {
    id: 'func-002',
    slug: 'suporte-funcional',
    name: 'Suporte Funcional',
    category: 'FUNCIONAIS',
    description:
      'Suportes personalizados: celular, fone de ouvido, canetas, cabo USB e muito mais. Design sob medida para a sua necessidade.',
    image: {
      src: '/images/placeholder-suporte.svg',
      alt: 'Suporte funcional personalizado impresso em 3D',
      type: 'CONCEPT',
    },
    status: 'DEVELOPMENT',
    customizable: true,
    tags: ['suporte', 'organizacao', 'funcional', 'escritorio'],
    developmentNote: 'Categoria em expansão. Modelos genéricos disponíveis por orçamento.',
    licenseStatus: 'ORIGINAL',
    accentColor: '#FFE000',
  },
]

export default products
