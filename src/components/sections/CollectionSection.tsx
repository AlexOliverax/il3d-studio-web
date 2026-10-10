import { ProductCard } from '../ui/ProductCard'
import products from '../../data/products'
import type { Product } from '../../types'
import './CollectionSection.css'

interface CollectionSectionProps {
  onAddToCart: (product: Product) => void
  onOpenDetails: (product: Product) => void
  isInCart: (id: string) => boolean
}

export function CollectionSection({ onAddToCart, onOpenDetails, isInCart }: CollectionSectionProps) {
  return (
    <section className="collection-section" id="produtos" aria-labelledby="collection-title">
      <div className="container">
        <div className="section-header">
          <span className="pill-tag">COLEÇÃO PRÓPRIA</span>
          <h2 className="section-title" id="collection-title">
            UM PRESENTE COM<br /><span className="section-title__accent">SIGNIFICADO.</span>
          </h2>
          <p className="section-subtitle">
            Conheça a coleção cristã em HueForge. Consulte as opções de obras, medidas,
            valores e prazos diretamente com o estúdio.
          </p>
        </div>
        <div className="collection-featured" role="list" aria-label="Coleção do estúdio">
          {products.map((product) => (
            <div key={product.id} role="listitem">
              <ProductCard product={product} onAddToCart={onAddToCart}
                onOpenDetails={onOpenDetails} isInCart={isInCart(product.id)} />
            </div>
          ))}
          <div className="collection-intro">
            <span className="pill-tag">ARTE EM CAMADAS</span>
            <h3>Uma imagem que ganha textura.</h3>
            <p>No HueForge, camadas de filamento formam a imagem impressa. O resultado
              combina arte e impressão 3D em uma peça para decorar seu espaço ou presentear.</p>
            <p>Quer conhecer a coleção ou contar uma ideia? O atendimento é direto com
              quem produz. Combinamos cada detalhe antes da impressão.</p>
            <a className="btn btn-secondary" href="#personalizados">CONVERSAR SOBRE UMA IDEIA →</a>
          </div>
        </div>
      </div>
    </section>
  )
}
