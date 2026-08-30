import { useState, useCallback } from 'react'
import type { FilterCategory } from '../types'

export function useFilter(initial: FilterCategory = 'ALL') {
  const [active, setActive] = useState<FilterCategory>(initial)

  const setFilter = useCallback((cat: FilterCategory) => {
    setActive(cat)
  }, [])

  return { active, setFilter }
}
