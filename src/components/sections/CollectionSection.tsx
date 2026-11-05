import { useRef, useState } from 'react'
import { ProductCard } from '../ui/ProductCard'
import products from '../../data/products'
import type { Product } from '../../types'
import { catalogCollections, CATALOG_PAGE_SIZE, filterCatalog } from '../../utils/catalog'
import type { CatalogCollection } from '../../utils/catalog'
import './CollectionSection.css'

interface CollectionSectionProps {
  onAddToCart: (product: Product) => void
  onOpenDetails: (product: Product) => void
  isInCart: (id: string) => boolean
}

export function CollectionSection({ onAddToCart, onOpenDetails, isInCart }: CollectionSectionProps) {
  const [collection, setCollection] = useState<CatalogCollection>('todos')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const resultsRef = useRef<HTMLHeadingElement>(null)
  const ordered = [...products].sort((a, b) => Number(b.id.startsWith('natal-biscoito-')) - Number(a.id.startsWith('natal-biscoito-')))
  const filtered = filterCatalog(ordered, collection, search)
  const pages = Math.max(1, Math.ceil(filtered.length / CATALOG_PAGE_SIZE))
  const visible = filtered.slice((page - 1) * CATALOG_PAGE_SIZE, page * CATALOG_PAGE_SIZE)
  const title = catalogCollections.find(item => item.id === collection)?.name ?? 'Todas as criações'

  function selectCollection(id: CatalogCollection) {
    setCollection(id)
    setSearch('')
    setPage(1)
  }

  function changePage(next: number) {
    setPage(next)
    resultsRef.current?.scrollIntoView({ block: 'start' })
    resultsRef.current?.focus({ preventScroll: true })
  }

  return (
    <section className="collection-section" id="produtos" aria-labelledby="collection-title">
      <div className="container">
        <div className="section-header">
          <span className="pill-tag">CRIAÇÕES IL 3D STUDIO</span>
          <h2 className="section-title" id="collection-title">ENCONTRE SEU<br /><span className="section-title__accent">PRÓXIMO PRESENTE.</span></h2>
          <p className="section-subtitle">Escolha uma coleção e descubra peças para decorar, presentear e celebrar.</p>
        </div>
        <div className="catalog-collections" aria-label="Escolher coleção">
          {catalogCollections.map(item => (
            <button key={item.id} className={`catalog-collection${collection === item.id ? ' is-active' : ''}`}
              aria-pressed={collection === item.id} aria-controls="catalog-results" onClick={() => selectCollection(item.id)}>
              <img src={item.image} alt="" width="240" height="160" loading="lazy" />
              <span className="catalog-collection__name">{item.name} <span>({filterCatalog(products, item.id).length})</span></span>
              <span className="catalog-collection__subtitle">{item.subtitle}</span>
            </button>
          ))}
        </div>
        <div className="catalog-toolbar">
          <button className={`filter-btn${collection === 'todos' ? ' is-active' : ''}`} aria-pressed={collection === 'todos'}
            aria-controls="catalog-results" onClick={() => selectCollection('todos')}>Ver todos ({products.length})</button>
          <label className="catalog-search">Buscar nesta coleção
            <input type="search" value={search} placeholder="Ex.: casinha, professora, Natal…"
              onChange={event => { setSearch(event.target.value); setPage(1) }} />
          </label>
        </div>
        <div id="catalog-results">
          <h3 className="catalog-results-title" ref={resultsRef} tabIndex={-1}>{title}</h3>
          <p className="catalog-count" role="status">{filtered.length} {filtered.length === 1 ? 'produto encontrado' : 'produtos encontrados'}{filtered.length > 0 && ` · página ${page} de ${pages}`}</p>
          <div className="products-grid" role="list" aria-label={title}>
            {visible.map(product => (
              <div key={product.id} role="listitem">
                <ProductCard product={product} onAddToCart={onAddToCart}
                  onOpenDetails={onOpenDetails} isInCart={isInCart(product.id)} />
              </div>
            ))}
          </div>
          {filtered.length === 0 && <div className="catalog-empty"><p>Nenhuma peça encontrada. Tente outro nome ou escolha uma coleção.</p>
            <button className="btn btn-outline" onClick={() => selectCollection('todos')}>Limpar busca e ver todos</button></div>}
          {pages > 1 && <nav className="catalog-pagination" aria-label="Páginas do catálogo">
            <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => changePage(page - 1)}>← Anterior</button>
            <span>{page} de {pages}</span>
            <button className="btn btn-outline btn-sm" disabled={page === pages} onClick={() => changePage(page + 1)}>Próxima →</button>
          </nav>}
        </div>
      </div>
    </section>
  )
}
