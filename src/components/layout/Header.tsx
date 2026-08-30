import { useState, useEffect } from 'react'
import './Header.css'

interface HeaderProps {
  cartCount: number
  onCartOpen: () => void
}

const navLinks = [
  { label: 'COLEÇÃO', href: '#colecao' },
  { label: 'COMO FUNCIONA', href: '#como-funciona' },
  { label: 'PERSONALIZADOS', href: '#personalizados' },
  { label: 'DETALHES', href: '#detalhes' },
]

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
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

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
            {navLinks.map((link) => (
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

        {/* Actions */}
        <div className="header-actions">
          <button
            className="btn btn-primary btn-sm header-cart-btn"
            onClick={onCartOpen}
            aria-label={`Meu Pedido — ${cartCount} ${cartCount === 1 ? 'item' : 'itens'}`}
          >
            <CartIcon />
            MEU PEDIDO
            {cartCount > 0 && (
              <span className="cart-badge" aria-hidden="true">
                {cartCount}
              </span>
            )}
          </button>

          {/* Hambúrguer mobile */}
          <button
            className={`header-hamburger${menuOpen ? ' is-open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="mobile-menu" id="mobile-menu" role="dialog" aria-label="Menu de navegação">
          <nav aria-label="Navegação mobile">
            <ul>
              {navLinks.map((link) => (
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
              <li>
                <button
                  className="btn btn-primary btn-lg mobile-menu__cart"
                  onClick={() => { setMenuOpen(false); onCartOpen() }}
                >
                  <CartIcon />
                  MEU PEDIDO
                  {cartCount > 0 && (
                    <span className="cart-badge" aria-hidden="true">{cartCount}</span>
                  )}
                </button>
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  )
}
