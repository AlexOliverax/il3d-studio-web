import { useState, useCallback } from 'react'
import { useCart } from './hooks/useCart'
import type { Product } from './types'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { HeroSection } from './components/sections/HeroSection'
import { CollectionSection } from './components/sections/CollectionSection'
import { HowItWorksSection } from './components/sections/HowItWorksSection'
import { CustomSection } from './components/sections/CustomSection'
import { KitBuilderSection } from './components/sections/KitBuilderSection'
import { DetailsSection } from './components/sections/DetailsSection'
import { CartDrawer } from './components/cart/CartDrawer'
import './index.css'

function App() {
  const [cartOpen, setCartOpen] = useState(false)

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

  function scrollToSection(id: string) {
    const el = document.getElementById(id)
    if (el) {
      const headerH = 64
      const y = el.getBoundingClientRect().top + window.scrollY - headerH
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Skip link acessibilidade */}
      <a href="#main-content" className="skip-link">
        Ir para conteúdo principal
      </a>

      {/* Header */}
      <Header
        cartCount={totalItems}
        onCartOpen={() => setCartOpen(true)}
      />

      {/* Conteúdo principal */}
      <main id="main-content" tabIndex={-1}>
        <HeroSection
          onCatalogClick={() => scrollToSection('colecao')}
          onCustomClick={() => scrollToSection('personalizados')}
        />

        <CollectionSection
          onAddToCart={handleAddToCart}
          isInCart={isInCart}
        />

        <HowItWorksSection />

        <CustomSection />

        <KitBuilderSection
          onAddToCart={handleAddToCart}
          isInCart={isInCart}
          onCartOpen={() => setCartOpen(true)}
        />

        <DetailsSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        items={items}
        onClose={() => setCartOpen(false)}
        onRemove={removeProduct}
        onUpdateQuantity={updateQuantity}
        onUpdateColor={updateColor}
        onUpdateNotes={updateNotes}
      />
    </>
  )
}

export default App
