import type { CartItem, CustomRequestForm } from '../types'
import { SITE_CONFIG } from '../config/site'

function getWhatsAppNumber(): string {
  const envNumber = import.meta.env.VITE_IL3D_WHATSAPP_NUMBER as string | undefined
  if (envNumber && envNumber.trim() !== '' && envNumber !== '5511999999999') {
    return envNumber.trim().replace(/\D/g, '')
  }
  return SITE_CONFIG.whatsapp.defaultNumber
}

function encodeMessage(text: string): string {
  return encodeURIComponent(text.trim())
}

// ============================================================
// Gera link WhatsApp para o orçamento (Meu Orçamento)
// ============================================================
export function generateCartWhatsAppLink(
  items: CartItem[],
  customerName: string,
  globalNotes: string
): string {
  const number = getWhatsAppNumber()

  const itemLines = items
    .map((item, idx) => {
      const color = item.desiredColor ? ` | Cor: ${item.desiredColor}` : ''
      const note = item.notes ? ` | Obs: ${item.notes}` : ''
      return `   ${idx + 1}. ${item.product.name} (x${item.quantity})${color}${note}`
    })
    .join('\n')

  const totalQty = items.reduce((acc, curr) => acc + curr.quantity, 0)

  const message = `Olá, IL 3D Studio! 👋

Gostaria de solicitar um orçamento para as seguintes peças:

👤 *Nome:* ${customerName || 'A combinar'}
📦 *Itens solicitados:*
${itemLines}
${globalNotes ? `\n📝 *Observações:* ${globalNotes}` : ''}

Por favor, me informe a estimativa de prazo, valores e opções de acabamento/retirada. Obrigado!

---
[Origem: Meu Orçamento — ${totalQty} ${totalQty === 1 ? 'item' : 'itens'}]`

  return `https://wa.me/${number}?text=${encodeMessage(message)}`
}

// ============================================================
// Gera link WhatsApp para formulário de pedido personalizado
// ============================================================
export function generateCustomRequestWhatsAppLink(form: CustomRequestForm): string {
  const number = getWhatsAppNumber()

  const message = `Olá, IL 3D Studio! ✨

Tenho uma ideia de peça personalizada e gostaria de um orçamento:

👤 *Nome:* ${form.name}
💡 *Ideia/Descrição:* ${form.idea}
🎨 *Cor desejada:* ${form.color || 'A combinar'}
📊 *Quantidade:* ${form.quantity || '1 unidade'}
📏 *Tamanho aproximado:* ${form.approximateDimensions || 'A combinar'}
📅 *Prazo desejado:* ${form.deadline || 'Flexível'}

(Estou pronto(a) para enviar imagens de referência ou arquivos STL/3MF aqui no chat).

---
[Origem: Pedido Personalizado]`

  return `https://wa.me/${number}?text=${encodeMessage(message)}`
}

// ============================================================
// Gera link WhatsApp para "Consultar Disponibilidade / Orçamento de Peça"
// ============================================================
export function generateAvailabilityWhatsAppLink(productName: string): string {
  const number = getWhatsAppNumber()

  const message = `Olá, IL 3D Studio! 👋
Gostaria de solicitar um orçamento para a peça *${productName}*.
Poderia me informar valores, cores disponíveis e prazo de produção?

---
[Origem: Catálogo — ${productName}]`

  return `https://wa.me/${number}?text=${encodeMessage(message)}`
}

// ============================================================
// Gera link WhatsApp para "Quero Ser Avisado" (em desenvolvimento)
// ============================================================
export function generateNotifyWhatsAppLink(productName: string): string {
  const number = getWhatsAppNumber()

  const message = `Olá, IL 3D Studio! 👋
Vi que o modelo *${productName}* está em desenvolvimento no catálogo.
Gostaria de ser avisado(a) assim que o protótipo for validado e estiver disponível para encomenda! 🙌

---
[Origem: Desenvolvimento — ${productName}]`

  return `https://wa.me/${number}?text=${encodeMessage(message)}`
}

// ============================================================
// Gera link WhatsApp para orçamento de festa / lembrancinhas
// ============================================================
export function generatePartyWhatsAppLink(): string {
  const number = getWhatsAppNumber()

  const message = `Olá, IL 3D Studio! 🎉
Gostaria de pedir um orçamento para lembrancinhas, brindes ou decoração para evento/festa.
Poderia me explicar prazos para produção em quantidade e modelos disponíveis?

---
[Origem: Lembrancinhas e Festas]`

  return `https://wa.me/${number}?text=${encodeMessage(message)}`
}

// ============================================================
// Gera link WhatsApp para botão flutuante rápido
// ============================================================
export function generateFloatingWhatsAppLink(): string {
  const number = getWhatsAppNumber()

  const message = `Olá, IL 3D Studio! 👋
Estou visitando o site e gostaria de tirar uma dúvida sobre impressão 3D sob demanda.

---
[Origem: Botão Flutuante Site]`

  return `https://wa.me/${number}?text=${encodeMessage(message)}`
}

// ============================================================
// Gera link WhatsApp para contato geral (Header / Footer)
// ============================================================
export function generateGeneralWhatsAppLink(): string {
  const number = getWhatsAppNumber()

  const message = `Olá, IL 3D Studio! 👋
Gostaria de mais informações sobre serviços de impressão 3D e orçamento.

---
[Origem: Contato Direto]`

  return `https://wa.me/${number}?text=${encodeMessage(message)}`
}
