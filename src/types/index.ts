// ============================================================
// Tipos centrais do IL 3D Studio
// ============================================================

export type ProductStatus = 'AVAILABLE' | 'DEVELOPMENT' | 'QUOTE_ONLY'

export type ProductCategory =
  | 'BICHOS_DE_BOLSO'
  | 'ARTICULADOS'
  | 'FIDGETS'
  | 'PERSONALIZADOS'
  | 'FUNCIONAIS'

export type ImageType = 'CONCEPT' | 'PROTOTYPE' | 'REAL_PRODUCT'

export type LicenseStatus =
  | 'ORIGINAL'          // criação própria do IL 3D Studio
  | 'LICENSED'          // com licença comercial verificada
  | 'PENDING_LICENSE'   // aguardando validação de licença

export interface ProductImage {
  src: string
  alt: string
  type: ImageType
}

export interface Product {
  id: string
  slug: string
  name: string
  category: ProductCategory
  description: string
  image: ProductImage
  status: ProductStatus
  customizable: boolean
  tags: string[]
  developmentNote?: string
  licenseStatus: LicenseStatus
  accentColor?: string // cor de destaque do card
}

// ============================================================
// Tipos do carrinho (Meu Pedido)
// ============================================================

export interface CartItem {
  product: Product
  quantity: number
  desiredColor?: string
  notes?: string
}

export type CartAction =
  | { type: 'ADD'; product: Product }
  | { type: 'REMOVE'; productId: string }
  | { type: 'UPDATE_QTY'; productId: string; quantity: number }
  | { type: 'UPDATE_COLOR'; productId: string; color: string }
  | { type: 'UPDATE_NOTES'; productId: string; notes: string }
  | { type: 'CLEAR' }

// ============================================================
// Tipos do formulário de pedido personalizado
// ============================================================

export interface CustomRequestForm {
  name: string
  idea: string
  color: string
  quantity: string
  deadline: string
}

// ============================================================
// Filtro do catálogo
// ============================================================

export type FilterCategory = 'ALL' | ProductCategory

export const CATEGORY_LABELS: Record<FilterCategory, string> = {
  ALL: 'TUDO',
  BICHOS_DE_BOLSO: 'BICHOS DE BOLSO',
  ARTICULADOS: 'ARTICULADOS',
  FIDGETS: 'FIDGETS',
  PERSONALIZADOS: 'PERSONALIZADOS',
  FUNCIONAIS: 'FUNCIONAIS',
}

export const STATUS_LABELS: Record<ProductStatus, string> = {
  AVAILABLE: 'DISPONÍVEL',
  DEVELOPMENT: 'EM DESENVOLVIMENTO',
  QUOTE_ONLY: 'SOB ORÇAMENTO',
}

export const IMAGE_TYPE_LABELS: Record<ImageType, string | null> = {
  CONCEPT: 'Imagem conceitual',
  PROTOTYPE: 'Protótipo',
  REAL_PRODUCT: null,
}
