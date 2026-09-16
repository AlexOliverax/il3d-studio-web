import { useState, useEffect } from 'react'
import { SITE_CONFIG } from '../../config/site'
import { generateGeneralWhatsAppLink } from '../../utils/whatsapp'
import { trackEvent } from '../../utils/analytics'
import './Header.css'

interface HeaderProps {
  cartCount: number
  onCartOpen: () => void
}

export function Header({ cartCount, onCartOpen }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Fecha menu ao pressionar ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Bloqueia scroll do body quando menu mobile aberto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  function handleWhatsAppClick() {
    trackEvent({ name: 'whatsapp_click', payload: { origin: 'Header - WhatsApp' } })
  }

  return (
    <header className={`site-header${scrolled ? ' site-header--scrolled' : ''}`} role="banner">
      <div className="container header-inner">
        {/* Logo */}
        <a href="/" className="header-logo" aria-label="IL 3D Studio — Página inicial">
          <span className="header-logo__il">IL</span>
          <span className="header-logo__studio">3D STUDIO</span>
        </a>

        {/* Nav desktop */}
        <nav className="header-nav" aria-label="Navegação principal">
          <ul>
            {SITE_CONFIG.nav.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="header-nav__link"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Actions desktop */}
        <div className="header-actions">
          {/* Botão Meu Orçamento */}
          <button
            className="btn btn-primary btn-sm header-cart-btn"
            onClick={onCartOpen}
            aria-label={`Meu Orçamento — ${cartCount} ${cartCount === 1 ? 'item' : 'itens'}`}
          >
            <CartIcon />
            <span>MEU ORÇAMENTO</span>
            {cartCount > 0 && (
              <span className="cart-badge" aria-hidden="true">
                {cartCount}
              </span>
            )}
          </button>

          {/* Botão WhatsApp */}
          <a
            href={generateGeneralWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm header-whatsapp-btn"
            onClick={handleWhatsAppClick}
            aria-label="Abrir conversa no WhatsApp"
          >
            <WhatsAppIcon />
            <span>WHATSAPP</span>
          </a>

          {/* Hambúrguer mobile */}
          <button
            className={`header-hamburger${menuOpen ? ' is-open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div
          className="mobile-menu"
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação mobile"
        >
          <nav aria-label="Navegação mobile">
            <ul>
              {SITE_CONFIG.nav.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="mobile-menu__link"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="mobile-menu__actions">
                <button
                  className="btn btn-primary btn-lg mobile-menu__cart"
                  onClick={() => {
                    setMenuOpen(false)
                    onCartOpen()
                  }}
                >
                  <CartIcon />
                  MEU ORÇAMENTO
                  {cartCount > 0 && (
                    <span className="cart-badge" aria-hidden="true">
                      {cartCount}
                    </span>
                  )}
                </button>

                <a
                  href={generateGeneralWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-lg mobile-menu__whatsapp"
                  onClick={() => {
                    setMenuOpen(false)
                    handleWhatsAppClick()
                  }}
                >
                  <WhatsAppIcon />
                  FALAR NO WHATSAPP
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}

function CartIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
