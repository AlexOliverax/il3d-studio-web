import { useState } from 'react'
import { ProductCard } from '../ui/ProductCard'
import products from '../../data/products'
import type { Product, FilterCategory } from '../../types'
import { CATEGORY_LABELS } from '../../types'
import { trackEvent } from '../../utils/analytics'
import './CollectionSection.css'

interface CollectionSectionProps {
  onAddToCart: (product: Product) => void
  onOpenDetails: (product: Product) => void
  isInCart: (id: string) => boolean
}

const filterCategories: FilterCategory[] = [
  'ALL',
  'ARTICULADOS',
  'PRESENTES_LEMBRANCINHAS',
  'PERSONALIZADOS',
  'FIDGETS',
  'UTILIDADES',
]

export function CollectionSection({
  onAddToCart,
  onOpenDetails,
  isInCart,
}: CollectionSectionProps) {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('ALL')

  function handleFilter(cat: FilterCategory) {
    setActiveCategory(cat)
    trackEvent({ name: 'category_filter', payload: { category: cat } })
  }

  // Separação estrita de produtos prontos para encomenda vs desenvolvimento
  const orderableProducts = products.filter(
    (p) =>
      (p.status === 'AVAILABLE' || p.status === 'QUOTE_ONLY') &&
      (activeCategory === 'ALL' || p.category === activeCategory)
  )

  const developmentProducts = products.filter(
    (p) =>
      p.status === 'DEVELOPMENT' &&
      (activeCategory === 'ALL' || p.category === activeCategory)
  )

  return (
    <section className="collection-section" id="produtos" aria-labelledby="collection-title">
      <div className="container">
        {/* Cabeçalho da Seção */}
        <div className="section-header">
          <span className="pill-tag">CATÁLOGO EXCLUSIVO</span>
          <h2 className="section-title" id="collection-title">
            ENCONTRE SUA<br />
            <span className="section-title__accent">PRÓXIMA PEÇA.</span>
          </h2>
          <p className="section-subtitle">
            Peças impressas em PLA com acabamento artesanal. Cores, medidas e prazos
            são combinados diretamente com você no orçamento.
          </p>
        </div>

        {/* Filtros de Categoria */}
        <div
          className="collection-filters"
          role="group"
          aria-label="Filtrar por categoria de produto"
        >
          {filterCategories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn${activeCategory === cat ? ' filter-btn--active' : ''}`}
              onClick={() => handleFilter(cat)}
              aria-pressed={activeCategory === cat}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Grid de Produtos Encomendáveis (Disponíveis e Sob Orçamento) */}
        {orderableProducts.length > 0 ? (
          <div
            className="products-grid"
            role="list"
            aria-label={`${orderableProducts.length} produtos disponíveis para encomenda`}
          >
            {orderableProducts.map((product) => (
              <div key={product.id} role="listitem">
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  onOpenDetails={onOpenDetails}
                  isInCart={isInCart(product.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="collection-empty" role="status">
            <p>Nenhuma peça pronta nesta categoria no momento.</p>
          </div>
        )}

        {/* Bloco Segregado de Projetos em Desenvolvimento (Laboratório do Estúdio) */}
        {developmentProducts.length > 0 && (
          <div className="dev-showcase" aria-labelledby="dev-showcase-title">
            <div className="dev-showcase__header">
              <div className="dev-showcase__badge">
                <span>🔬 LABORATÓRIO &amp; PROTÓTIPOS</span>
              </div>
              <h3 id="dev-showcase-title" className="dev-showcase__title">
                Projetos em Fase de Validação
              </h3>
              <p className="dev-showcase__desc">
                Ideias em teste de tolerância mecânica e impressão. Ainda não estão
                disponíveis para encomenda imediata — clique em <strong>Quero ser avisado</strong> para
                receber uma mensagem assim que o primeiro lote físico for aprovado!
              </p>
            </div>

            <div
              className="products-grid products-grid--development"
              role="list"
              aria-label="Projetos em desenvolvimento no estúdio"
            >
              {developmentProducts.map((product) => (
                <div key={product.id} role="listitem">
                  <ProductCard
                    product={product}
                    onAddToCart={onAddToCart}
                    onOpenDetails={onOpenDetails}
                    isInCart={isInCart(product.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
