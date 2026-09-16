import type { Product } from '../../types'
import { STATUS_LABELS, IMAGE_TYPE_LABELS } from '../../types'
import {
  generateAvailabilityWhatsAppLink,
  generateNotifyWhatsAppLink,
} from '../../utils/whatsapp'
import { OptimizedImage } from './OptimizedImage'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import './ProductModal.css'

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: Product) => void
  isInCart: boolean
}

export function ProductModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  isInCart,
}: ProductModalProps) {
  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose })

  if (!isOpen || !product) return null

  const isReal = product.image.type === 'REAL_PRODUCT'
  const isDevelopment = product.status === 'DEVELOPMENT'
  const isQuoteOnly = product.status === 'QUOTE_ONLY'
  const isAvailable = product.status === 'AVAILABLE'

  return (
    <>
      <div className="overlay product-modal-overlay" onClick={onClose} aria-hidden="true" />
      <div
        ref={modalRef}
        className="product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <button
          className="product-modal__close"
          onClick={onClose}
          aria-label="Fechar detalhes do produto"
        >
          <CloseIcon />
        </button>

        <div className="product-modal__grid">
          {/* Coluna Visual */}
          <div className="product-modal__media">
            <OptimizedImage
              src={product.image.src}
              alt={product.image.alt}
              width={product.image.width || 800}
              height={product.image.height || 600}
              type={product.image.type}
              priority={true}
              aspectRatio="4/3"
              className="product-modal__img"
            />
            <div className="product-modal__badges">
              {isReal ? (
                <span className="badge-pill badge-pill--real" aria-label="Fotografia do produto físico real">
                  ● FOTO REAL IL 3D
                </span>
              ) : (
                <span className="badge-pill badge-pill--concept" aria-label={IMAGE_TYPE_LABELS[product.image.type] || 'Conceito'}>
                  ◐ {IMAGE_TYPE_LABELS[product.image.type] || 'Conceito'}
                </span>
              )}
              {product.customizable && (
                <span className="badge-pill badge-pill--custom">
                  ✏️ Personalizável
                </span>
              )}
            </div>
          </div>

          {/* Coluna de Informações */}
          <div className="product-modal__content">
            <div className="product-modal__status">
              <span className={`status-indicator status-indicator--${product.status.toLowerCase()}`}>
                {STATUS_LABELS[product.status]}
              </span>
            </div>

            <h2 id="product-modal-title" className="product-modal__title">
              {product.name}
            </h2>

            <p className="product-modal__desc">{product.description}</p>

            <div className="product-modal__specs">
              {product.approximateDimensions && (
                <div className="spec-item">
                  <span className="spec-label">Dimensões:</span>
                  <span className="spec-value">{product.approximateDimensions}</span>
                </div>
              )}

              {product.material && (
                <div className="spec-item">
                  <span className="spec-label">Material:</span>
                  <span className="spec-value">{product.material}</span>
                </div>
              )}

              {product.availableColors && product.availableColors.length > 0 && (
                <div className="spec-item spec-item--colors">
                  <span className="spec-label">Cores Disponíveis:</span>
                  <div className="spec-color-tags">
                    {product.availableColors.map((color) => (
                      <span key={color} className="color-tag">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Informação sobre licença / autoria */}
              <div className="spec-item spec-item--license">
                <span className="spec-label">Origem & Licença:</span>
                <span className="spec-value">
                  {product.licenseStatus === 'ORIGINAL'
                    ? '✨ Criação Original do IL 3D Studio'
                    : `Licença comercial autorizada (${product.creator || 'Terceiro'})`}
                </span>
              </div>
            </div>

            {/* Alerta de desenvolvimento se aplicável */}
            {isDevelopment && product.developmentNote && (
              <div className="dev-alert">
                <span className="dev-alert__icon" aria-hidden="true">🔧</span>
                <p>
                  <strong>Fase de Laboratório:</strong> {product.developmentNote}
                </p>
              </div>
            )}

            {/* Ações */}
            <div className="product-modal__actions">
              {(isAvailable || isQuoteOnly) && (
                <button
                  className={`btn btn-primary btn-lg modal-action-btn${isInCart ? ' is-in-cart' : ''}`}
                  onClick={() => {
                    onAddToCart(product)
                  }}
                >
                  {isInCart ? '✓ ADICIONADO AO ORÇAMENTO' : 'ADICIONAR AO ORÇAMENTO'}
                </button>
              )}

              {isQuoteOnly && (
                <a
                  href={generateAvailabilityWhatsAppLink(product.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-lg modal-action-btn"
                >
                  <WhatsAppIcon />
                  CONVERSAR NO WHATSAPP
                </a>
              )}

              {isDevelopment && (
                <a
                  href={generateNotifyWhatsAppLink(product.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-lg modal-action-btn"
                >
                  🔔 QUERO SER AVISADO NO LANÇAMENTO
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
