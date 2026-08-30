import { useFilter } from '../../hooks/useFilter'
import { ProductCard } from '../ui/ProductCard'
import products from '../../data/products'
import type { Product, FilterCategory } from '../../types'
import { CATEGORY_LABELS } from '../../types'
import './CollectionSection.css'

interface CollectionSectionProps {
  onAddToCart: (product: Product) => void
  isInCart: (id: string) => boolean
}

const filterCategories: FilterCategory[] = [
  'ALL',
  'BICHOS_DE_BOLSO',
  'ARTICULADOS',
  'FIDGETS',
  'PERSONALIZADOS',
  'FUNCIONAIS',
]

export function CollectionSection({ onAddToCart, isInCart }: CollectionSectionProps) {
  const { active, setFilter } = useFilter('ALL')

  const filtered =
    active === 'ALL'
      ? products
      : products.filter((p) => p.category === active)

  return (
    <section className="collection-section" id="colecao" aria-labelledby="collection-title">
      <div className="container">
        {/* Cabeçalho */}
        <div className="section-header">
          <h2 className="section-title" id="collection-title">
            ESCOLHA SEU<br />
            <span className="section-title__accent">PRÓXIMO VÍCIO.</span>
          </h2>
          <p className="section-subtitle">
            Peças impressas em PLA, uma a uma. Cores, medidas, acabamento e disponibilidade
            são confirmados no orçamento.
          </p>
        </div>

        {/* Filtros */}
        <div
          className="collection-filters"
          role="group"
          aria-label="Filtrar por categoria"
        >
          {filterCategories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn${active === cat ? ' filter-btn--active' : ''}`}
              onClick={() => setFilter(cat)}
              aria-pressed={active === cat}
              aria-label={`Filtrar: ${CATEGORY_LABELS[cat]}`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Bichos de Bolso callout (quando ativo ou ALL) */}
        {(active === 'ALL' || active === 'BICHOS_DE_BOLSO') && (
          <div className="bichos-callout" aria-label="Coleção Bichos de Bolso">
            <div className="bichos-callout__inner">
              <div className="bichos-callout__text">
                <span className="pill-tag">🇧🇷 COLEÇÃO ESPECIAL</span>
                <h3 className="bichos-callout__title">BICHOS DE BOLSO</h3>
                <p>
                  Quatro conceitos inspirados em bichos brasileiros para levar no bolso.
                  Cada personagem é uma criação original IL 3D Studio — ainda em desenvolvimento.
                </p>
              </div>
              <div className="bichos-callout__chars" aria-hidden="true">
                <BichoChar name="TICO" emoji="🦔" color="#8B5E3C" />
                <BichoChar name="CORA" emoji="🐀" color="#7A9B5F" />
                <BichoChar name="PINGO" emoji="🐸" color="#4CAF50" />
                <BichoChar name="ZIGUE" emoji="🦎" color="#FF9800" />
              </div>
            </div>
          </div>
        )}

        {/* Grid de produtos */}
        {filtered.length > 0 ? (
          <div
            className="products-grid"
            role="list"
            aria-label={`${filtered.length} produto${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
          >
            {filtered.map((product) => (
              <div key={product.id} role="listitem">
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  isInCart={isInCart(product.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="collection-empty" role="status">
            <p>Nenhum produto nesta categoria ainda.</p>
          </div>
        )}
      </div>
    </section>
  )
}

function BichoChar({ name, emoji, color }: { name: string; emoji: string; color: string }) {
  return (
    <div className="bicho-char" style={{ '--char-color': color } as React.CSSProperties}>
      <span className="bicho-char__emoji" aria-hidden="true">{emoji}</span>
      <span className="bicho-char__name">{name}</span>
    </div>
  )
}
