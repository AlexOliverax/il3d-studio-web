import { useEffect, useState, useRef } from 'react'
import type { CartItem } from '../../types'
import { generateCartWhatsAppLink } from '../../utils/whatsapp'
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
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // ESC para fechar
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Foca no botão fechar ao abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeRef.current?.focus(), 50)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  function handleSendOrder() {
    if (!customerName.trim()) {
      setNameError(true)
      return
    }
    setNameError(false)
    const link = generateCartWhatsAppLink(items, customerName, globalNotes)
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  if (!isOpen && items.length === 0) return null

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
        aria-label="Meu Pedido"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="cart-drawer__header">
          <div className="cart-drawer__title-wrap">
            <h2 className="cart-drawer__title">MEU PEDIDO</h2>
            {items.length > 0 && (
              <span className="cart-badge cart-drawer__badge" aria-label={`${items.reduce((s, i) => s + i.quantity, 0)} itens`}>
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            ref={closeRef}
            className="cart-drawer__close"
            onClick={onClose}
            aria-label="Fechar carrinho"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Aviso cotação */}
        <div className="cart-quote-notice" role="note">
          <span aria-hidden="true">💬</span>
          <p>Este é um pedido de <strong>orçamento</strong>, não uma compra. Preços e prazos são combinados no atendimento.</p>
        </div>

        {/* Conteúdo */}
        {items.length === 0 ? (
          <div className="cart-empty">
            <span className="cart-empty__icon" aria-hidden="true">🛒</span>
            <p className="cart-empty__text">Seu pedido está vazio.</p>
            <p className="cart-empty__sub">Adicione produtos da coleção!</p>
            <button className="btn btn-primary" onClick={onClose}>
              VER COLEÇÃO
            </button>
          </div>
        ) : (
          <div className="cart-drawer__body">
            {/* Lista de itens */}
            <ul className="cart-items" aria-label="Itens do pedido">
              {items.map((item) => (
                <li key={item.product.id} className="cart-item">
                  <div className="cart-item__info">
                    <span className="cart-item__emoji" aria-hidden="true">
                      {categoryEmojis[item.product.category] ?? '🔹'}
                    </span>
                    <div className="cart-item__details">
                      <p className="cart-item__name">{item.product.name}</p>
                      <p className="cart-item__cat">{categoryLabel(item.product.category)}</p>
                    </div>
                    <button
                      className="cart-item__remove"
                      onClick={() => onRemove(item.product.id)}
                      aria-label={`Remover ${item.product.name} do pedido`}
                    >
                      <TrashIcon />
                    </button>
                  </div>

                  {/* Quantidade */}
                  <div className="cart-item__qty">
                    <button
                      className="qty-btn"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      aria-label="Diminuir quantidade"
                      disabled={item.quantity <= 1}
                    >−</button>
                    <span className="qty-value" aria-label={`Quantidade: ${item.quantity}`}>
                      {item.quantity}
                    </span>
                    <button
                      className="qty-btn"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      aria-label="Aumentar quantidade"
                    >+</button>
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
                      placeholder="Ex: rosa, azul marinho..."
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
                      Observações (opcional)
                    </label>
                    <input
                      id={`notes-${item.product.id}`}
                      type="text"
                      className="form-input"
                      placeholder="Tamanho, acabamento, texto..."
                      value={item.notes ?? ''}
                      onChange={(e) => onUpdateNotes(item.product.id, e.target.value)}
                    />
                  </div>
                </li>
              ))}
            </ul>

            {/* Nome e notas globais */}
            <div className="cart-summary">
              <div className="form-field">
                <label className="form-label" htmlFor="cart-name">
                  Seu nome <span className="form-required" aria-label="obrigatório">*</span>
                </label>
                <input
                  id="cart-name"
                  type="text"
                  className={`form-input${nameError ? ' form-input--error' : ''}`}
                  placeholder="Como posso te chamar?"
                  value={customerName}
                  onChange={(e) => { setCustomerName(e.target.value); if (e.target.value.trim()) setNameError(false) }}
                  autoComplete="given-name"
                  aria-required="true"
                  aria-invalid={nameError}
                />
                {nameError && (
                  <span className="form-error" role="alert">Por favor, informe seu nome.</span>
                )}
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="cart-notes">
                  Observações gerais
                </label>
                <textarea
                  id="cart-notes"
                  className="form-input form-textarea"
                  placeholder="Prazo, evento especial, dúvidas..."
                  value={globalNotes}
                  onChange={(e) => setGlobalNotes(e.target.value)}
                  rows={3}
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
                ENVIAR PEDIDO VIA WHATSAPP
              </button>
              <p className="cart-send-note">
                Você será redirecionado ao WhatsApp com o pedido já formatado.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const categoryEmojis: Record<string, string> = {
  BICHOS_DE_BOLSO: '🐾',
  ARTICULADOS: '🦾',
  FIDGETS: '🔄',
  PERSONALIZADOS: '✨',
  FUNCIONAIS: '⚙️',
}

function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    BICHOS_DE_BOLSO: 'Bichos de Bolso',
    ARTICULADOS: 'Articulado',
    FIDGETS: 'Fidget',
    PERSONALIZADOS: 'Personalizado',
    FUNCIONAIS: 'Funcional',
  }
  return map[cat] ?? cat
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
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
