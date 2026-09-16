import { useState } from 'react'
import type { CartItem } from '../../types'
import { generateCartWhatsAppLink } from '../../utils/whatsapp'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { trackEvent } from '../../utils/analytics'
import './CartDrawer.css'

interface CartDrawerProps {
  isOpen: boolean
  items: CartItem[]
  onClose: () => void
  onRemove: (id: string) => void
  onUpdateQuantity: (id: string, qty: number) => void
  onUpdateColor: (id: string, color: string) => void
  onUpdateNotes: (id: string, notes: string) => void
}

export function CartDrawer({
  isOpen,
  items,
  onClose,
  onRemove,
  onUpdateQuantity,
  onUpdateColor,
  onUpdateNotes,
}: CartDrawerProps) {
  const [customerName, setCustomerName] = useState('')
  const [globalNotes, setGlobalNotes] = useState('')
  const [nameError, setNameError] = useState(false)

  const drawerRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose })

  function handleSendOrder() {
    if (!customerName.trim()) {
      setNameError(true)
      return
    }
    setNameError(false)

    trackEvent({
      name: 'quote_whatsapp_submit',
      payload: { itemCount: items.reduce((s, i) => s + i.quantity, 0) },
    })

    const link = generateCartWhatsAppLink(items, customerName, globalNotes)
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  function handleRemove(productId: string) {
    onRemove(productId)
    trackEvent({ name: 'remove_from_quote', payload: { productId } })
  }

  if (!isOpen && items.length === 0) return null

  const totalQuantity = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="overlay cart-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`cart-drawer${isOpen ? ' cart-drawer--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Meu Orçamento"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="cart-drawer__header">
          <div className="cart-drawer__title-wrap">
            <h2 className="cart-drawer__title">MEU ORÇAMENTO</h2>
            {items.length > 0 && (
              <span
                className="cart-badge cart-drawer__badge"
                aria-label={`${totalQuantity} itens`}
              >
                {totalQuantity}
              </span>
            )}
          </div>
          <button
            className="cart-drawer__close"
            onClick={onClose}
            aria-label="Fechar orçamento"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Aviso Cotação Oficial */}
        <div className="cart-quote-notice" role="note">
          <span className="cart-quote-notice__icon" aria-hidden="true">💬</span>
          <p>
            Você <strong>ainda não está comprando</strong>. Envie os itens e a IL 3D Studio confirma
            disponibilidade, personalização, prazo e valor final pelo WhatsApp.
          </p>
        </div>

        {/* Conteúdo */}
        {items.length === 0 ? (
          <div className="cart-empty">
            <span className="cart-empty__icon" aria-hidden="true">🛍️</span>
            <p className="cart-empty__text">Seu orçamento está vazio.</p>
            <p className="cart-empty__sub">Adicione peças do catálogo para solicitar!</p>
            <button className="btn btn-primary" onClick={onClose}>
              VER PRODUTOS
            </button>
          </div>
        ) : (
          <div className="cart-drawer__body">
            {/* Lista de itens */}
            <ul className="cart-items" aria-label="Itens do orçamento">
              {items.map((item) => (
                <li key={item.product.id} className="cart-item">
                  <div className="cart-item__info">
                    <span className="cart-item__tag-icon" aria-hidden="true">
                      {item.product.image.type === 'REAL_PRODUCT' ? '●' : '◐'}
                    </span>
                    <div className="cart-item__details">
                      <p className="cart-item__name">{item.product.name}</p>
                      <span className="cart-item__category">
                        {item.product.category.replace('_', ' ')}
                      </span>
                    </div>
                    <button
                      className="cart-item__remove"
                      onClick={() => handleRemove(item.product.id)}
                      aria-label={`Remover ${item.product.name} do orçamento`}
                    >
                      <TrashIcon />
                    </button>
                  </div>

                  {/* Quantidade */}
                  <div className="cart-item__qty-row">
                    <span className="cart-item__qty-label">Quantidade:</span>
                    <div className="cart-item__qty-controls">
                      <button
                        className="qty-btn"
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        aria-label="Diminuir quantidade"
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="qty-value" aria-label={`Quantidade: ${item.quantity}`}>
                        {item.quantity}
                      </span>
                      <button
                        className="qty-btn"
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        aria-label="Aumentar quantidade"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Cor */}
                  <div className="cart-item__field">
                    <label
                      className="cart-item__field-label"
                      htmlFor={`color-${item.product.id}`}
                    >
                      Cor desejada (opcional)
                    </label>
                    <input
                      id={`color-${item.product.id}`}
                      type="text"
                      className="form-input"
                      placeholder="Ex: Rosa choque, preto fosco, amarelo..."
                      value={item.desiredColor ?? ''}
                      onChange={(e) => onUpdateColor(item.product.id, e.target.value)}
                    />
                  </div>

                  {/* Observações */}
                  <div className="cart-item__field">
                    <label
                      className="cart-item__field-label"
                      htmlFor={`notes-${item.product.id}`}
                    >
                      Observações / Detalhes adicionais (opcional)
                    </label>
                    <input
                      id={`notes-${item.product.id}`}
                      type="text"
                      className="form-input"
                      placeholder="Tamanho específico, gravação de nome..."
                      value={item.notes ?? ''}
                      onChange={(e) => onUpdateNotes(item.product.id, e.target.value)}
                    />
                  </div>
                </li>
              ))}
            </ul>

            {/* Resumo e dados do solicitante */}
            <div className="cart-summary">
              <div className="form-field">
                <label className="form-label" htmlFor="cart-name">
                  Seu nome <span className="form-required" aria-label="obrigatório">*</span>
                </label>
                <input
                  id="cart-name"
                  type="text"
                  className={`form-input${nameError ? ' form-input--error' : ''}`}
                  placeholder="Como posso te chamar no WhatsApp?"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value)
                    if (e.target.value.trim()) setNameError(false)
                  }}
                  autoComplete="given-name"
                  aria-required="true"
                  aria-invalid={nameError}
                />
                {nameError && (
                  <span className="form-error" role="alert">
                    Por favor, informe seu nome para o atendimento.
                  </span>
                )}
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="cart-notes">
                  Observações gerais do pedido
                </label>
                <textarea
                  id="cart-notes"
                  className="form-input form-textarea"
                  placeholder="Prazo desejado, evento, dúvidas sobre frete ou retirada..."
                  value={globalNotes}
                  onChange={(e) => setGlobalNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {/* Enviar */}
            <div className="cart-actions">
              <button
                className="btn btn-primary btn-lg cart-send-btn"
                onClick={handleSendOrder}
              >
                <WhatsAppIcon />
                SOLICITAR ORÇAMENTO NO WHATSAPP
              </button>
              <p className="cart-send-note">
                Sua lista de peças será enviada pronta para o atendimento da IL 3D Studio.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
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
