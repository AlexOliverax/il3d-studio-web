// ============================================================
// Tipos centrais do IL 3D Studio
// ============================================================

export type ProductStatus = 'AVAILABLE' | 'DEVELOPMENT' | 'QUOTE_ONLY'

export type ProductCategory =
  | 'ARTICULADOS'
  | 'PRESENTES_LEMBRANCINHAS'
  | 'PERSONALIZADOS'
  | 'FIDGETS'
  | 'UTILIDADES'

export type ImageType = 'CONCEPT' | 'PROTOTYPE' | 'REAL_PRODUCT'

export type LicenseStatus =
  | 'ORIGINAL' // criação original/modelagem própria IL 3D Studio
  | 'LICENSED' // modelo de terceiro com licença comercial confirmada
  | 'PENDING_LICENSE' // sob auditoria de licença antes de comercialização

export interface ProductImage {
  src: string
  alt: string
  type: ImageType
  width?: number
  height?: number
}

export interface Product {
  id: string
  slug: string
  name: string
  category: ProductCategory
  shortDescription: string
  description: string
  image: ProductImage
  gallery?: ProductImage[]
  status: ProductStatus
  customizable: boolean
  availableColors: string[]
  approximateDimensions?: string
  material?: string
  tags: string[]
  developmentNote?: string
  licenseStatus: LicenseStatus
  sourceUrl?: string
  creator?: string
  commercialLicense?: boolean | string
  licenseVerifiedAt?: string
  accentColor?: string
}

// ============================================================
// Tipos do carrinho (Meu Orçamento)
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
  approximateDimensions: string
  deadline: string
}

// ============================================================
// Filtro do catálogo
// ============================================================

export type FilterCategory = 'ALL' | ProductCategory

export const CATEGORY_LABELS: Record<FilterCategory, string> = {
  ALL: 'Todos',
  ARTICULADOS: 'Articulados',
  PRESENTES_LEMBRANCINHAS: 'Presentes e lembrancinhas',
  PERSONALIZADOS: 'Personalizados',
  FIDGETS: 'Fidgets',
  UTILIDADES: 'Utilidades',
}

export const STATUS_LABELS: Record<ProductStatus, string> = {
  AVAILABLE: 'DISPONÍVEL',
  QUOTE_ONLY: 'SOB ORÇAMENTO',
  DEVELOPMENT: 'EM DESENVOLVIMENTO',
}

export const IMAGE_TYPE_LABELS: Record<ImageType, string | null> = {
  REAL_PRODUCT: 'FOTO REAL',
  PROTOTYPE: 'Protótipo físico',
  CONCEPT: 'Ilustração conceitual',
}
