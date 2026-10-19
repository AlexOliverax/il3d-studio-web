import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { products } from '../src/data/products'
import { cartReducer, restoreCart, MAX_QUANTITY } from '../src/utils/cartState'
import { generateCartWhatsAppLink, generateGeneralWhatsAppLink } from '../src/utils/whatsapp'
import { SITE_CONFIG } from '../src/config/site'
import { CartDrawer } from '../src/components/cart/CartDrawer'
import { ProductModal } from '../src/components/ui/ProductModal'
import { FaqSection } from '../src/components/sections/FaqSection'
import { faqList } from '../src/data/faq'

const product = products[0]
for (const raw of [null, '', '{', '{}', 'null', '42', '[null,{}]', '[{"product":null,"quantity":1}]']) {
  assert.deepEqual(restoreCart(raw), [], 'Invalid persisted data must not crash the page')
}
const restored = restoreCart(JSON.stringify([
  { product: { id: product.id, name: 'Outdated name' }, quantity: 2.8, notes: 'Teste' },
  { product: { id: 'art-001' }, quantity: 1 },
  { product: { id: product.id }, quantity: 9 },
]))
assert.equal(restored.length, 1)
assert.equal(restored[0].product, product, 'Saved products must use the current catalog')
assert.equal(restored[0].quantity, 2)
for (const qty of [NaN, Infinity, -1, 0, 1.5, 5000]) {
  const result = cartReducer(restored, { type: 'UPDATE_QTY', productId: product.id, quantity: qty })
  assert(Number.isInteger(result[0].quantity) && result[0].quantity >= 1 && result[0].quantity <= MAX_QUANTITY)
}
const url = new URL(generateCartWhatsAppLink(restored, 'João & Maria', 'Entregar após 18h'))
const text = url.searchParams.get('text')!
assert(text.includes('João & Maria') && text.includes(product.name) && text.includes('(x2)') && text.includes('Teste'))
assert.equal(new URL(generateGeneralWhatsAppLink()).pathname, `/${SITE_CONFIG.whatsapp.defaultNumber}`)
for (const p of products) assert(existsSync(`public${p.image.src}`), 'Catalog image must exist')
const noop = () => {}
const drawer = renderToStaticMarkup(React.createElement(CartDrawer, {
  isOpen: false, items: restored, onClose: noop, onRemove: noop,
  onUpdateQuantity: noop, onUpdateColor: noop, onUpdateNotes: noop,
}))
assert.equal(drawer, '', 'Closed quote drawers must not expose focusable controls')
const pending = { ...product, licenseStatus: 'PENDING_LICENSE' as const }
const modal = renderToStaticMarkup(React.createElement(ProductModal, {
  product: pending, isOpen: true, onClose: noop, onAddToCart: noop, isInCart: false,
}))
assert(modal.includes('Autorização comercial em verificação'))
assert(!modal.includes('licença comercial autorizada'))
const faq = renderToStaticMarkup(React.createElement(FaqSection))
const structured = JSON.parse(faq.match(/<script[^>]*>(.*?)<\/script>/)![1])
assert.deepEqual(structured.mainEntity.map((q: { acceptedAnswer: { text: string } }) => q.acceptedAnswer.text), faqList.map(q => q.answer))
console.log('Passed: cart recovery, quantities, WhatsApp encoding, assets, hidden drawers, license labels and FAQ consistency.')

// Catalog navigation and product presentation.
const { filterCatalog, catalogCollections, CATALOG_PAGE_SIZE } = await import('../src/utils/catalog')
const { CollectionSection } = await import('../src/components/sections/CollectionSection')
const { ProductCard } = await import('../src/components/ui/ProductCard')
assert.equal(new Set(products.map(p => p.id)).size, products.length)
for (const p of products) {
  for (const image of p.gallery ?? []) assert(existsSync(`public${image.src}`), `Missing gallery image: ${image.src}`)
}
for (const collection of catalogCollections) {
  assert(existsSync(`public${collection.image}`))
  assert(filterCatalog(products, collection.id).length > 0)
}
assert.deepEqual(filterCatalog(products, 'natal', 'arvore'), filterCatalog(products, 'natal', 'árvore'), 'Search ignores accents')
assert.equal(filterCatalog(products, 'hueforge', 'casinha').length, 0, 'Search respects collection')
assert.equal(filterCatalog(products, 'todos', 'inexistente-xyz').length, 0)
const ornaments = products.filter(p => p.id.startsWith('natal-biscoito-'))
assert.equal(ornaments.length, 6)
assert(ornaments.every(p => p.status === 'QUOTE_ONLY' && p.licenseStatus === 'ORIGINAL' && p.image.type === 'DIGITAL_RENDER'))
const catalog = renderToStaticMarkup(React.createElement(CollectionSection, { onAddToCart: noop, onOpenDetails: noop, isInCart: () => false }))
assert.equal((catalog.match(/class="product-card product-card--/g) ?? []).length, CATALOG_PAGE_SIZE, 'Only one page of products renders')
assert(catalog.includes('Buscar nesta coleção') && catalog.includes('Próxima'))
const developmentProduct = { ...ornaments[0], status: 'DEVELOPMENT' as const, developmentNote: 'Encaixe precisa de teste' }
for (const markup of [
  renderToStaticMarkup(React.createElement(ProductCard, { product: developmentProduct, onAddToCart: noop, onOpenDetails: noop, isInCart: false })),
  renderToStaticMarkup(React.createElement(ProductModal, { product: developmentProduct, isOpen: true, onClose: noop, onAddToCart: noop, isInCart: false })),
]) {
  assert(!/CONCEITO|EM DESENVOLVIMENTO|Encaixe precisa de teste|Fase de Laboratório|FOTO REAL/.test(markup))
  assert(markup.includes('CONSULTAR DISPONIBILIDADE'))
}
console.log('Passed: catalog collections, accent-insensitive search, pagination, six ornaments, gallery assets and commercial presentation.')
