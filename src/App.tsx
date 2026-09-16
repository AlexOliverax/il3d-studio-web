import { useState, useCallback } from 'react'
import { useCart } from './hooks/useCart'
import type { Product } from './types'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { HeroSection } from './components/sections/HeroSection'
import { CollectionSection } from './components/sections/CollectionSection'
import { HowItWorksSection } from './components/sections/HowItWorksSection'
import { CustomSection } from './components/sections/CustomSection'
import { SocialProofSection } from './components/sections/SocialProofSection'
import { AboutSection } from './components/sections/AboutSection'
import { FaqSection } from './components/sections/FaqSection'
import { CartDrawer } from './components/cart/CartDrawer'
import { ProductModal } from './components/ui/ProductModal'
import { PolicyModal, PolicyModalType } from './components/ui/PolicyModal'
import { FloatingWhatsApp } from './components/ui/FloatingWhatsApp'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import './index.css'

function App() {
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [policyType, setPolicyType] = useState<PolicyModalType>(null)

  const {
    items,
    totalItems,
    addProduct,
    removeProduct,
    updateQuantity,
    updateColor,
    updateNotes,
    isInCart,
  } = useCart()

  const handleAddToCart = useCallback(
    (product: Product) => {
      addProduct(product)
      setCartOpen(true)
    },
    [addProduct]
  )

  const handleOpenDetails = useCallback((product: Product) => {
    setSelectedProduct(product)
  }, [])

  function scrollToSection(id: string) {
    const el = document.getElementById(id)
    if (el) {
      const headerH = 64
      const y = el.getBoundingClientRect().top + window.scrollY - headerH
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <ErrorBoundary>
      {/* Skip link acessibilidade WCAG AA */}
      <a href="#main-content" className="skip-link">
        Ir para o conteúdo principal
      </a>

      {/* Header com Navegação e Ações */}
      <Header cartCount={totalItems} onCartOpen={() => setCartOpen(true)} />

      {/* Conteúdo principal */}
      <main id="main-content" tabIndex={-1}>
        {/* 1. Hero com nova cópia, sem robô SVG e com vitrine de peças reais */}
        <HeroSection
          onCatalogClick={() => scrollToSection('produtos')}
          onCustomClick={() => scrollToSection('personalizados')}
        />

        {/* 2. Catálogo completo e segregação de protótipos */}
        <CollectionSection
          onAddToCart={handleAddToCart}
          onOpenDetails={handleOpenDetails}
          isInCart={isInCart}
        />

        {/* 3. Peças Personalizadas e Festa & Eventos */}
        <CustomSection />

        {/* 4. Como funciona em 4 etapas */}
        <HowItWorksSection />

        {/* 5. Galeria de peças reais e bastidores do estúdio */}
        <SocialProofSection />

        {/* 6. Sobre a oficina e equipamentos (Bambu Lab A1, AMS) */}
        <AboutSection />

        {/* 7. FAQ Estruturado com 9 perguntas */}
        <FaqSection />
      </main>

      {/* Footer com transparência e modais legais */}
      <Footer onOpenPolicy={(type) => setPolicyType(type)} />

      {/* Drawer: Meu Orçamento */}
      <CartDrawer
        isOpen={cartOpen}
        items={items}
        onClose={() => setCartOpen(false)}
        onRemove={removeProduct}
        onUpdateQuantity={updateQuantity}
        onUpdateColor={updateColor}
        onUpdateNotes={updateNotes}
      />

      {/* Modal de Detalhes do Produto */}
      <ProductModal
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        isInCart={selectedProduct ? isInCart(selectedProduct.id) : false}
      />

      {/* Modal de Termos & Privacidade */}
      <PolicyModal
        type={policyType}
        isOpen={policyType !== null}
        onClose={() => setPolicyType(null)}
      />

      {/* Botão Flutuante Discreto WhatsApp */}
      <FloatingWhatsApp />

      {/* Barra Sticky Mobile quando houver itens no orçamento */}
      {totalItems > 0 && !cartOpen && (
        <aside className="mobile-sticky-cart" aria-label="Acesso rápido ao orçamento">
          <button
            className="mobile-sticky-cart__btn"
            onClick={() => setCartOpen(true)}
            aria-label={`Ver orçamento com ${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`}
          >
            <span>🛍️ MEU ORÇAMENTO ({totalItems})</span>
            <span className="mobile-sticky-cart__action">CONCLUIR →</span>
          </button>
        </aside>
      )}
    </ErrorBoundary>
  )
}

export default App
