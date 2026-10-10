import type { CartItem, CartAction, Product } from '../types'
import { products } from '../data/products'

export const STORAGE_KEY = 'il3d_cart'
export const MAX_QUANTITY = 999

function normalizeQuantity(quantity: number): number {
  return Number.isFinite(quantity) ? Math.min(MAX_QUANTITY, Math.max(1, Math.floor(quantity))) : 1
}

export function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD': {
      const existing = state.find(item => item.product.id === action.product.id)
      return existing
        ? state.map(item => item.product.id === action.product.id
          ? { ...item, quantity: normalizeQuantity(item.quantity + 1) } : item)
        : [...state, { product: action.product, quantity: 1 }]
    }
    case 'REMOVE': return state.filter(item => item.product.id !== action.productId)
    case 'UPDATE_QTY': return state.map(item => item.product.id === action.productId
      ? { ...item, quantity: normalizeQuantity(action.quantity) } : item)
    case 'UPDATE_COLOR': return state.map(item => item.product.id === action.productId
      ? { ...item, desiredColor: action.color } : item)
    case 'UPDATE_NOTES': return state.map(item => item.product.id === action.productId
      ? { ...item, notes: action.notes } : item)
    case 'CLEAR': return []
    default: return state
  }
}

// Treat browser storage as untrusted, and always use current catalog data.
export function restoreCart(raw: string | null, catalog: Product[] = products): CartItem[] {
  if (!raw) return []
  try {
    const saved: unknown = JSON.parse(raw)
    if (!Array.isArray(saved)) return []
    const restored: CartItem[] = []
    for (const entry of saved) {
      if (!entry || typeof entry !== 'object') continue
      const { product: savedProduct, quantity, desiredColor, notes } = entry
      if (!savedProduct || typeof savedProduct.id !== 'string') continue
      const product = catalog.find(p => p.id === savedProduct.id && p.status !== 'DEVELOPMENT')
      if (!product || typeof quantity !== 'number' || !Number.isFinite(quantity) || quantity < 1) continue
      if (restored.some(item => item.product.id === product.id)) continue
      restored.push({ product, quantity: normalizeQuantity(quantity),
        desiredColor: typeof desiredColor === 'string' ? desiredColor.slice(0, 100) : undefined,
        notes: typeof notes === 'string' ? notes.slice(0, 2000) : undefined })
    }
    return restored
  } catch { return [] }
}
