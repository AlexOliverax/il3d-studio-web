import type { Product } from '../../types'
import products from '../../data/products'
import './KitBuilderSection.css'

interface KitBuilderSectionProps {
  onAddToCart: (product: Product) => void
  isInCart: (id: string) => boolean
  onCartOpen: () => void
}

const availableForKit = products.filter(
  (p) => p.status === 'AVAILABLE' || p.status === 'QUOTE_ONLY'
)

export function KitBuilderSection({ onAddToCart, isInCart, onCartOpen }: KitBuilderSectionProps) {
  const selectedCount = availableForKit.filter((p) => isInCart(p.id)).length

  return (
    <section className="kit-section" id="kit" aria-labelledby="kit-title">
      <div className="container">
        <div className="kit-header">
          <div>
            <span className="pill-tag">🛒 MONTE SEU PEDIDO</span>
            <h2 className="kit-title" id="kit-title">
              MONTE UM KIT<br />
              <span className="kit-title__accent">DO SEU JEITO.</span>
            </h2>
            <p className="kit-subtitle">
              Escolha os produtos, adicione ao pedido, informe as cores e mande tudo
              de uma vez pelo WhatsApp. Simples assim.
            </p>
          </div>

          {selectedCount > 0 && (
            <button
              className="btn btn-primary btn-lg kit-view-btn"
              onClick={onCartOpen}
              aria-label={`Ver meu pedido com ${selectedCount} produto${selectedCount !== 1 ? 's' : ''}`}
            >
              🛍️ VER MEU PEDIDO ({selectedCount})
            </button>
          )}
        </div>

        {/* Steps */}
        <div className="kit-steps" aria-label="Como montar um kit">
          {[
            { n: '1', label: 'ESCOLHA OS PRODUTOS', desc: 'Clique em "Adicionar ao pedido" nos produtos da coleção ou aqui embaixo.' },
            { n: '2', label: 'INFORME AS CORES', desc: 'No carrinho, diga a cor desejada para cada peça. Ou combine depois pelo WhatsApp.' },
            { n: '3', label: 'ENVIE VIA WHATSAPP', desc: 'Clique em "Enviar pedido" e a gente cuida do resto: prazo, acabamento e entrega.' },
          ].map((step) => (
            <div key={step.n} className="kit-step">
              <div className="kit-step__number" aria-hidden="true">{step.n}</div>
              <div>
                <p className="kit-step__label">{step.label}</p>
                <p className="kit-step__desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Grid rápido de produtos disponíveis */}
        {availableForKit.length > 0 && (
          <div className="kit-products">
            <h3 className="kit-products__title">ADICIONAR AO PEDIDO</h3>
            <div className="kit-grid" role="list" aria-label="Produtos disponíveis para pedido">
              {availableForKit.map((product) => {
                const inCart = isInCart(product.id)
                return (
                  <div key={product.id} role="listitem">
                    <button
                      className={`kit-product-btn${inCart ? ' kit-product-btn--added' : ''}`}
                      onClick={() => onAddToCart(product)}
                      aria-pressed={inCart}
                      aria-label={`${inCart ? 'Remover' : 'Adicionar'} ${product.name} ${inCart ? 'do' : 'ao'} pedido`}
                    >
                      <span className="kit-product-btn__emoji" aria-hidden="true">
                        {categoryEmojis[product.category] ?? '🔹'}
                      </span>
                      <span className="kit-product-btn__name">{product.name}</span>
                      <span className="kit-product-btn__status" aria-hidden="true">
                        {inCart ? '✓' : '+'}
                      </span>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className="kit-disclaimer">
          Este não é um carrinho de compras. Não há pagamento automático.
          Preços, prazos e detalhes são confirmados no atendimento via WhatsApp.
        </p>
      </div>
    </section>
  )
}

const categoryEmojis: Record<string, string> = {
  BICHOS_DE_BOLSO: '🐾',
  ARTICULADOS: '🦾',
  FIDGETS: '🔄',
  PERSONALIZADOS: '✨',
  FUNCIONAIS: '⚙️',
}
