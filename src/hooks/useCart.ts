import { useReducer, useEffect } from 'react'
import type { CartItem, CartAction, Product } from '../types'

const STORAGE_KEY = 'il3d_cart'

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD': {
      const existing = state.find((item) => item.product.id === action.product.id)
      if (existing) {
        return state.map((item) =>
          item.product.id === action.product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...state, { product: action.product, quantity: 1 }]
    }

    case 'REMOVE':
      return state.filter((item) => item.product.id !== action.productId)

    case 'UPDATE_QTY':
      return state.map((item) =>
        item.product.id === action.productId
          ? { ...item, quantity: Math.max(1, action.quantity) }
          : item
      )

    case 'UPDATE_COLOR':
      return state.map((item) =>
        item.product.id === action.productId
          ? { ...item, desiredColor: action.color }
          : item
      )

    case 'UPDATE_NOTES':
      return state.map((item) =>
        item.product.id === action.productId
          ? { ...item, notes: action.notes }
          : item
      )

    case 'CLEAR':
      return []

    default:
      return state
  }
}

function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

export function useCart() {
  const [items, dispatch] = useReducer(cartReducer, [], loadFromStorage)

  // Persiste no localStorage sempre que o carrinho mudar
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  function addProduct(product: Product) {
    dispatch({ type: 'ADD', product })
  }

  function removeProduct(productId: string) {
    dispatch({ type: 'REMOVE', productId })
  }

  function updateQuantity(productId: string, quantity: number) {
    dispatch({ type: 'UPDATE_QTY', productId, quantity })
  }

  function updateColor(productId: string, color: string) {
    dispatch({ type: 'UPDATE_COLOR', productId, color })
  }

  function updateNotes(productId: string, notes: string) {
    dispatch({ type: 'UPDATE_NOTES', productId, notes })
  }

  function clearCart() {
    dispatch({ type: 'CLEAR' })
  }

  function isInCart(productId: string): boolean {
    return items.some((item) => item.product.id === productId)
  }

  return {
    items,
    totalItems,
    addProduct,
    removeProduct,
    updateQuantity,
    updateColor,
    updateNotes,
    clearCart,
    isInCart,
  }
}
