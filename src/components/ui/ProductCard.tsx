import type { Product } from '../../types'
import { STATUS_LABELS } from '../../types'
import { generateNotifyWhatsAppLink } from '../../utils/whatsapp'
import { OptimizedImage } from './OptimizedImage'
import { trackEvent } from '../../utils/analytics'
import './ProductCard.css'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  onOpenDetails: (product: Product) => void
  isInCart: boolean
}

export function ProductCard({
  product,
  onAddToCart,
  onOpenDetails,
  isInCart,
}: ProductCardProps) {
  const {
    name,
    shortDescription,
    image,
    status,
    customizable,
    availableColors,
    approximateDimensions,
    developmentNote,
  } = product

  const isReal = image.type === 'REAL_PRODUCT'
  const isDevelopment = status === 'DEVELOPMENT'
  const isOrderable = status === 'AVAILABLE' || status === 'QUOTE_ONLY'

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation()
    onAddToCart(product)
    trackEvent({ name: 'add_to_quote', payload: { productId: product.id, productName: product.name } })
  }

  function handleCardClick() {
    onOpenDetails(product)
    trackEvent({
      name: 'product_view',
      payload: { productId: product.id, productName: product.name, category: product.category },
    })
  }

  return (
    <article
      className={`product-card product-card--${status.toLowerCase()}`}
      aria-label={`Produto: ${name}`}
      onClick={handleCardClick}
    >
      {/* Imagem com OptimizedImage */}
      <div className="product-card__image-wrap">
        <OptimizedImage
          src={image.src}
          alt={image.alt}
          width={image.width || 800}
          height={image.height || 600}
          type={image.type}
          aspectRatio="4/3"
        />

        {/* Badges superiores */}
        <div className="product-card__badges">
          {isReal ? (
            <span className="card-badge card-badge--real" title="Fotografia real da peça física produzida no estúdio">
              ● FOTO REAL
            </span>
          ) : (
            <span className="card-badge card-badge--concept">
              ◐ CONCEITO
            </span>
          )}

          {customizable && (
            <span className="card-badge card-badge--custom">
              ✏️ Personalizável
            </span>
          )}
        </div>
      </div>

      {/* Conteúdo do card */}
      <div className="product-card__body">
        <div className="product-card__header-row">
          <span className={`status-tag status-tag--${status.toLowerCase()}`}>
            {STATUS_LABELS[status]}
          </span>
          {approximateDimensions && (
            <span className="product-card__dim" title="Tamanho aproximado">
              📏 {approximateDimensions}
            </span>
          )}
        </div>

        <h3 className="product-card__name">{name}</h3>

        <p className="product-card__description">
          {shortDescription || product.description}
        </p>

        {/* Cores disponíveis prévias */}
        {availableColors && availableColors.length > 0 && (
          <div className="product-card__colors" aria-label="Cores disponíveis">
            <span className="colors-label">Cores:</span>
            <span className="colors-list">{availableColors.slice(0, 3).join(', ')}{availableColors.length > 3 ? '...' : ''}</span>
          </div>
        )}

        {/* Nota de desenvolvimento se aplicável */}
        {isDevelopment && developmentNote && (
          <p className="product-card__dev-note">
            <span aria-hidden="true">🔧</span> {developmentNote}
          </p>
        )}

        {/* Ações */}
        <div className="product-card__actions" onClick={(e) => e.stopPropagation()}>
          {isOrderable && (
            <button
              className={`btn btn-primary btn-sm product-card__btn-add${isInCart ? ' is-added' : ''}`}
              onClick={handleAdd}
              aria-label={isInCart ? `${name} já adicionado ao orçamento` : `Adicionar ${name} ao orçamento`}
            >
              {isInCart ? '✓ NO ORÇAMENTO' : status === 'AVAILABLE' ? 'ADICIONAR AO PEDIDO' : 'ADICIONAR AO ORÇAMENTO'}
            </button>
          )}

          {isDevelopment && (
            <a
              href={generateNotifyWhatsAppLink(name)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm product-card__btn-notify"
              aria-label={`Ser avisado no WhatsApp quando ${name} estiver disponível`}
              onClick={() =>
                trackEvent({
                  name: 'whatsapp_click',
                  payload: { origin: 'Desenvolvimento - Notificar', target: name },
                })
              }
            >
              🔔 QUERO SER AVISADO
            </a>
          )}

          <button
            className="btn btn-ghost btn-sm product-card__btn-details"
            onClick={handleCardClick}
            aria-label={`Ver detalhes de ${name}`}
          >
            DETALHES
          </button>
        </div>
      </div>
    </article>
  )
}
