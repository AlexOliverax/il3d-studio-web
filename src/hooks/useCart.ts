import { useReducer, useEffect } from 'react'
import type { CartItem, Product } from '../types'

import { cartReducer, restoreCart, STORAGE_KEY } from '../utils/cartState'

function loadFromStorage(): CartItem[] {
  try { return restoreCart(localStorage.getItem(STORAGE_KEY)) }
  catch { return [] }
}

export function useCart() {
  const [items, dispatch] = useReducer(cartReducer, [], loadFromStorage)

  // Persiste no localStorage sempre que o carrinho mudar
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) }
    catch { /* Quotes still work when browser storage is unavailable. */ }
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
