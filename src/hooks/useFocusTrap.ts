import { useEffect, useRef } from 'react'

interface UseFocusTrapOptions {
  isOpen: boolean
  onClose: () => void
  returnFocusRef?: React.RefObject<HTMLElement | null>
}

export function useFocusTrap<T extends HTMLElement = HTMLDivElement>({
  isOpen,
  onClose,
  returnFocusRef,
}: UseFocusTrapOptions) {
  const containerRef = useRef<T>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    // Salva elemento que tinha foco antes da abertura
    previousActiveElementRef.current = document.activeElement as HTMLElement
    const returnFocusElement = returnFocusRef?.current

    const container = containerRef.current
    if (!container) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Busca elementos focáveis
    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

    // Foca no primeiro elemento focável ou no próprio container
    const setInitialFocus = () => {
      const focusable = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(el => el.getClientRects().length > 0)
      if (focusable.length > 0) {
        focusable[0].focus()
      } else {
        container.focus()
      }
    }

    const timer = setTimeout(setInitialFocus, 50)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current()
        return
      }

      if (e.key !== 'Tab') return

      const focusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((el) => el.getClientRects().length > 0 && el.getAttribute('aria-hidden') !== 'true')

      if (focusableElements.length === 0) {
        e.preventDefault()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === firstElement || document.activeElement === container) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      clearTimeout(timer)
      document.removeEventListener('keydown', handleKeyDown)

      // Restaura foco
      const restoreTarget = returnFocusElement || previousActiveElementRef.current
      if (restoreTarget && typeof restoreTarget.focus === 'function') {
        restoreTarget.focus()
      }
    }
  }, [isOpen, returnFocusRef])

  return containerRef
}
