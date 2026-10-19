import type { Product } from '../types'

export const catalogCollections = [
  { id: 'natal', name: 'Natal', subtitle: 'Enfeites e decoração', image: '/images/natal-biscoitos/colecao.png' },
  { id: 'personalizados', name: 'Personalizados', subtitle: 'Presentes com a sua identidade', image: '/images/catalogo/lousa-frente.webp' },
  { id: 'hueforge', name: 'Arte em HueForge', subtitle: 'Imagens que ganham textura', image: '/images/hueforge-cristao.jpg' },
] as const

export type CatalogCollection = 'todos' | typeof catalogCollections[number]['id']
export const CATALOG_PAGE_SIZE = 6
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export function filterCatalog(products: Product[], collection: CatalogCollection, search = '') {
  const words = normalize(search).trim().split(/\s+/).filter(Boolean)
  return products.filter(product => {
    const belongs = collection === 'todos'
      || (collection === 'natal' && product.tags.includes('natal'))
      || (collection === 'personalizados' && product.category === 'PERSONALIZADOS')
      || (collection === 'hueforge' && product.category === 'HUEFORGE')
    const text = normalize([product.name, product.shortDescription, ...product.tags].join(' '))
    return belongs && words.every(word => text.includes(word))
  })
}
