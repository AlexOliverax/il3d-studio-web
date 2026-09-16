import type { Product } from '../types'

// ============================================================
// Catálogo de produtos do IL 3D Studio — Versão 2.0
// Regra de Ouro:
// - image.type = REAL_PRODUCT somente com validação e fotografia física do estúdio.
// - licenceStatus: ORIGINAL apenas para criações proprietárias do IL 3D Studio.
// - Modelos de terceiros com autorização comercial usam LICENSED com créditos e verificação.
// ============================================================

export const products: Product[] = [
  // ----------------------------------------------------------
  // 1. ARTICULADOS
  // ----------------------------------------------------------
  {
    id: 'art-001',
    slug: 'polvo-articulado',
    name: 'Polvo Articulado',
    category: 'ARTICULADOS',
    shortDescription: 'Oito tentáculos articulados com movimento fluido e suave, impresso em peça única.',
    description:
      'Um dos grandes clássicos da impressão 3D criativa. O Polvo Articulado possui 8 tentáculos impressos em peça única, sem necessidade de montagem ou cola. Seu movimento suave e maleável é irresistível ao toque, sendo perfeito para mesas de trabalho, decoração ou alívio de tensão.',
    image: {
      src: '/images/polvo-articulado.webp',
      alt: 'Polvo Articulado impresso em 3D em PLA rosa e preto pelo IL 3D Studio',
      type: 'REAL_PRODUCT',
      width: 800,
      height: 600,
    },
    status: 'AVAILABLE',
    customizable: true,
    availableColors: ['Rosa Choque', 'Amarelo Sol', 'Preto Grafite', 'Azul Metálico', 'Branco Puro'],
    approximateDimensions: '12 x 12 x 4.5 cm',
    material: 'PLA Premium Biodegradável',
    tags: ['articulado', 'polvo', 'decoracao', 'sensorial'],
    licenseStatus: 'LICENSED',
    creator: 'McGybeer',
    sourceUrl: 'https://makerworld.com',
    commercialLicense: 'Licença comercial ativa e verificada',
    licenseVerifiedAt: '2024-05-10',
    accentColor: '#FF2D78',
  },

  // ----------------------------------------------------------
  // 2. PERSONALIZADOS
  // ----------------------------------------------------------
  {
    id: 'pers-001',
    slug: 'chaveiro-personalizado',
    name: 'Chaveiro Personalizado',
    category: 'PERSONALIZADOS',
    shortDescription: 'Com seu nome, logotipo ou palavra especial em relevo de alta definição.',
    description:
      'Chaveiro resistente com acabamento em duas ou mais cores, perfeito para identificação de chaves, mochilas ou como lembrança corporativa. Personalizado com o texto, nome ou símbolo que você desejar.',
    image: {
      src: '/images/chaveiro-personalizado.webp',
      alt: 'Chaveiro personalizado com nome em relevo fabricado em impressão 3D',
      type: 'REAL_PRODUCT',
      width: 800,
      height: 600,
    },
    status: 'AVAILABLE',
    customizable: true,
    availableColors: ['Preto + Amarelo', 'Rosa + Branco', 'Azul + Branco', 'Dourado + Preto'],
    approximateDimensions: '6.5 x 2.2 x 0.5 cm',
    material: 'PLA de alta densidade',
    tags: ['chaveiro', 'personalizado', 'presente', 'acessorio'],
    licenseStatus: 'ORIGINAL',
    creator: 'IL 3D Studio',
    commercialLicense: 'Propriedade autoral exclusiva IL 3D Studio',
    licenseVerifiedAt: '2024-01-15',
    accentColor: '#FFE000',
  },
  {
    id: 'pers-002',
    slug: 'tag-de-mochila',
    name: 'Tag de Mochila Personalizada',
    category: 'PERSONALIZADOS',
    shortDescription: 'Identificador estiloso e resistente para mochilas, malas e estojos.',
    description:
      'Tag identificadora personalizada em cores contrastantes. Ideal para crianças em fase escolar, viagens ou identificação de equipamentos de trabalho. Resistente a impactos cotidianos e de fácil limpeza.',
    image: {
      src: '/images/tag-mochila.webp',
      alt: 'Tag de mochila personalizada em 3D com furo de fixação e nome gravado',
      type: 'REAL_PRODUCT',
      width: 800,
      height: 600,
    },
    status: 'AVAILABLE',
    customizable: true,
    availableColors: ['Rosa IL 3D', 'Amarelo Sol', 'Preto Grafite', 'Azul Bebê', 'Verde Menta'],
    approximateDimensions: '8.0 x 3.5 x 0.6 cm',
    material: 'PLA reforçado',
    tags: ['tag', 'mochila', 'escola', 'identificacao'],
    licenseStatus: 'ORIGINAL',
    creator: 'IL 3D Studio',
    commercialLicense: 'Propriedade autoral exclusiva IL 3D Studio',
    licenseVerifiedAt: '2024-02-20',
    accentColor: '#FF2D78',
  },

  // ----------------------------------------------------------
  // 3. UTILIDADES
  // ----------------------------------------------------------
  {
    id: 'util-001',
    slug: 'suporte-celular-mesa',
    name: 'Suporte Funcional de Mesa',
    category: 'UTILIDADES',
    shortDescription: 'Suporte ergonômico e estável para celulares e tablets em formato compacto.',
    description:
      'Projetado para manter seu smartphone na vertical ou horizontal no ângulo ideal para chamadas de vídeo, leitura de receitas ou apoio durante o expediente. Base com geometria reforçada e passagem para cabo de carregamento.',
    image: {
      src: '/images/suporte-celular.webp',
      alt: 'Suporte de celular para mesa impresso em 3D ergonômico',
      type: 'REAL_PRODUCT',
      width: 800,
      height: 600,
    },
    status: 'AVAILABLE',
    customizable: true,
    availableColors: ['Preto Fosco', 'Amarelo IL 3D', 'Cinza Concreto', 'Rosa Pastel'],
    approximateDimensions: '8.5 x 7.0 x 9.0 cm',
    material: 'PLA com reforço interno de preenchimento',
    tags: ['utilidade', 'suporte', 'celular', 'homeoffice', 'mesa'],
    licenseStatus: 'LICENSED',
    creator: 'holmes4',
    sourceUrl: 'https://printables.com',
    commercialLicense: 'Licença comercial verificada',
    licenseVerifiedAt: '2024-03-01',
    accentColor: '#FFE000',
  },

  // ----------------------------------------------------------
  // 4. FIDGETS
  // ----------------------------------------------------------
  {
    id: 'fidg-001',
    slug: 'fidget-slider',
    name: 'Fidget Slider Sensorial',
    category: 'FIDGETS',
    shortDescription: 'Dispositivo deslizante magnético de bolso para concentração e anti-stress.',
    description:
      'Slider magnético com clique tátil e deslizamento suave. Compacto para carregar no bolso ou manter na mão durante reuniões, aulas ou períodos de foco intenso. Peça com acabamento ultra liso.',
    image: {
      src: '/images/fidget-slider.webp',
      alt: 'Fidget slider impresso em 3D com detalhes magnéticos',
      type: 'REAL_PRODUCT',
      width: 800,
      height: 600,
    },
    status: 'QUOTE_ONLY',
    customizable: true,
    availableColors: ['Preto + Rosa', 'Branco + Amarelo', 'Grafite + Dourado'],
    approximateDimensions: '5.0 x 3.0 x 1.2 cm',
    material: 'PLA Premium + Ímãs de Neodímio N52',
    tags: ['fidget', 'slider', 'foco', 'anti-stress'],
    licenseStatus: 'LICENSED',
    creator: 'MakerWorld OpenLab',
    sourceUrl: 'https://makerworld.com',
    commercialLicense: 'Licença comercial ativa',
    licenseVerifiedAt: '2024-04-12',
    accentColor: '#FF2D78',
  },

  // ----------------------------------------------------------
  // 5. PRESENTES E LEMBRANCINHAS
  // ----------------------------------------------------------
  {
    id: 'pres-001',
    slug: 'kit-festa-lembrancinhas',
    name: 'Kit Lembrancinhas e Festas',
    category: 'PRESENTES_LEMBRANCINHAS',
    shortDescription: 'Lembrancinhas temáticas, topos de bolo e centros de mesa sob medida.',
    description:
      'Soluções completas e exclusivas para aniversários, batizados, casamentos e comemorações. Desenvolvemos peças no tema da sua festa com o nome do aniversariante ou marca da celebração.',
    image: {
      src: '/images/itens-festa.webp',
      alt: 'Itens decorativos e lembrancinhas de aniversário impressos em 3D',
      type: 'REAL_PRODUCT',
      width: 800,
      height: 600,
    },
    status: 'QUOTE_ONLY',
    customizable: true,
    availableColors: ['Paleta combinada de acordo com o tema da comemoração'],
    approximateDimensions: 'Projetos sob medida',
    material: 'PLA atóxico premium',
    tags: ['festa', 'lembrancinha', 'aniversario', 'decoracao'],
    licenseStatus: 'ORIGINAL',
    creator: 'IL 3D Studio',
    commercialLicense: 'Criações exclusivas sob medida',
    licenseVerifiedAt: '2024-01-10',
    accentColor: '#FFE000',
  },

  // ----------------------------------------------------------
  // 6. PROJETOS EM DESENVOLVIMENTO (LABORATÓRIO / CONCEITO)
  // Segregados visualmente para não enganar o consumidor
  // ----------------------------------------------------------
  {
    id: 'bdp-001',
    slug: 'tico-o-tatu',
    name: 'Tico, o Tatu',
    category: 'PRESENTES_LEMBRANCINHAS',
    shortDescription: 'Tatuzinho articulado de bolso inspirado na fauna brasileira.',
    description:
      'Personagem conceitual autoral inspirado no tatu-bola brasileiro. Tico se curva ao ser segurado e retorna suavemente. Atualmente em fase de refinamento de tolerâncias das juntas articuladas.',
    image: {
      src: '/images/tico-tatu.webp',
      alt: 'Conceito 3D de Tico, o Tatu — projeto em desenvolvimento IL 3D Studio',
      type: 'CONCEPT',
      width: 800,
      height: 600,
    },
    status: 'DEVELOPMENT',
    customizable: false,
    availableColors: ['Marrom Terra', 'Verde Oliva'],
    approximateDimensions: 'Aprox. 6 x 4 x 3.5 cm (estimado)',
    material: 'PLA (fase de protótipo)',
    tags: ['bicho', 'articulado', 'brasil', 'pocket'],
    developmentNote: 'Ajustando folgas dos encaixes mecânicos. Primeiro lote físico em teste.',
    licenseStatus: 'ORIGINAL',
    creator: 'IL 3D Studio',
    accentColor: '#8B5E3C',
  },
  {
    id: 'bdp-002',
    slug: 'cora-a-capivara',
    name: 'Cora, a Capivara',
    category: 'PRESENTES_LEMBRANCINHAS',
    shortDescription: 'A capivara mais zen em miniatura articulada de bolso.',
    description:
      'Cora tem articulações na cabeça e patinhas com movimento suave. Personagem autoral em processo de modelagem 3D e validação estética.',
    image: {
      src: '/images/cora-capivara.webp',
      alt: 'Conceito 3D de Cora, a Capivara — projeto em desenvolvimento IL 3D Studio',
      type: 'CONCEPT',
      width: 800,
      height: 600,
    },
    status: 'DEVELOPMENT',
    customizable: false,
    availableColors: ['Caramelo', 'Chocolate'],
    approximateDimensions: 'Aprox. 7 x 4 x 5 cm (estimado)',
    material: 'PLA (fase de protótipo)',
    tags: ['bicho', 'capivara', 'articulado', 'pocket'],
    developmentNote: 'Validação visual e teste de peso. Em breve em pré-lançamento.',
    licenseStatus: 'ORIGINAL',
    creator: 'IL 3D Studio',
    accentColor: '#7A9B5F',
  },
  {
    id: 'bdp-003',
    slug: 'pingo-o-sapo',
    name: 'Pingo, o Sapo',
    category: 'PRESENTES_LEMBRANCINHAS',
    shortDescription: 'Sapinho miniatura expressivo com patinhas articuladas.',
    description:
      'Exploração de design autoral para um sapinho compacto que cabe na palma da mão. Em fase de desenho tridimensional preliminar.',
    image: {
      src: '/images/pingo-sapo.webp',
      alt: 'Conceito 3D de Pingo, o Sapo — projeto em desenvolvimento IL 3D Studio',
      type: 'CONCEPT',
      width: 800,
      height: 600,
    },
    status: 'DEVELOPMENT',
    customizable: false,
    availableColors: ['Verde Floresta', 'Amarelo Tropical'],
    approximateDimensions: 'Aprox. 5 x 5 x 3 cm (estimado)',
    material: 'PLA (fase de protótipo)',
    tags: ['bicho', 'sapo', 'articulado', 'pocket'],
    developmentNote: 'Rascunho digital em andamento. Aguardando fila de prototipagem.',
    licenseStatus: 'ORIGINAL',
    creator: 'IL 3D Studio',
    accentColor: '#4CAF50',
  },
  {
    id: 'bdp-004',
    slug: 'zigue-o-lagarto',
    name: 'Zigue, o Lagarto',
    category: 'PRESENTES_LEMBRANCINHAS',
    shortDescription: 'Lagartinho com cauda segmentada flexível para colecionadores.',
    description:
      'Conceito autoral de réptil articulado com textura de escamas geométricas. A cauda balança livremente quando movimentada.',
    image: {
      src: '/images/zigue-lagarto.webp',
      alt: 'Conceito 3D de Zigue, o Lagarto — projeto em desenvolvimento IL 3D Studio',
      type: 'CONCEPT',
      width: 800,
      height: 600,
    },
    status: 'DEVELOPMENT',
    customizable: false,
    availableColors: ['Laranja Queimado', 'Azul Petróleo'],
    approximateDimensions: 'Aprox. 14 x 4 x 2.5 cm (estimado)',
    material: 'PLA (fase de protótipo)',
    tags: ['bicho', 'lagarto', 'articulado', 'pocket'],
    developmentNote: 'Modelagem 3D em rascunho.',
    licenseStatus: 'ORIGINAL',
    creator: 'IL 3D Studio',
    accentColor: '#FF9800',
  },
]

export default products
