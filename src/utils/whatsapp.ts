import type { CartItem, CustomRequestForm } from '../types'

const PLACEHOLDER_NUMBER = '5511999999999'

function getWhatsAppNumber(): string {
  const number = import.meta.env.VITE_IL3D_WHATSAPP_NUMBER as string | undefined
  if (!number || number === PLACEHOLDER_NUMBER || number.trim() === '') {
    console.warn(
      '[IL 3D Studio] VITE_IL3D_WHATSAPP_NUMBER não configurada ou ainda é o placeholder. Configure o .env com o número real antes de publicar.'
    )
    // Retorna o placeholder para que o link ainda funcione em dev
    return PLACEHOLDER_NUMBER
  }
  return number.trim()
}

function encodeMessage(text: string): string {
  return encodeURIComponent(text.trim())
}

// ============================================================
// Gera link WhatsApp para o carrinho (Meu Pedido)
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

  const message = `Olá, IL 3D Studio! 🎉

Gostaria de solicitar um orçamento.

👤 Nome: ${customerName || 'Não informado'}
📦 Itens do pedido:
${itemLines}
${globalNotes ? `\n📝 Observações gerais: ${globalNotes}` : ''}

Aguardo o retorno para confirmar cor, quantidade, acabamento e prazo. Obrigado!`

  return `https://wa.me/${number}?text=${encodeMessage(message)}`
}

// ============================================================
// Gera link WhatsApp para formulário de pedido personalizado
// ============================================================
export function generateCustomRequestWhatsAppLink(form: CustomRequestForm): string {
  const number = getWhatsAppNumber()

  const message = `Olá, IL 3D Studio! ✨

Tenho uma ideia para um produto personalizado!

👤 Nome: ${form.name}
💡 O que quero criar: ${form.idea}
🎨 Cor desejada: ${form.color || 'A combinar'}
📊 Quantidade: ${form.quantity || 'A definir'}
📅 Prazo desejado: ${form.deadline || 'Flexível'}

Aguardo retorno! Obrigado.`

  return `https://wa.me/${number}?text=${encodeMessage(message)}`
}

// ============================================================
// Gera link WhatsApp simples para "Consultar Disponibilidade"
// ============================================================
export function generateAvailabilityWhatsAppLink(productName: string): string {
  const number = getWhatsAppNumber()

  const message = `Olá, IL 3D Studio! Gostaria de consultar a disponibilidade de: *${productName}*. Poderia me informar sobre prazo e valores?`

  return `https://wa.me/${number}?text=${encodeMessage(message)}`
}

// ============================================================
// Gera link WhatsApp para "Quero Ser Avisado" (em desenvolvimento)
// ============================================================
export function generateNotifyWhatsAppLink(productName: string): string {
  const number = getWhatsAppNumber()

  const message = `Olá, IL 3D Studio! Vi que *${productName}* está em desenvolvimento. Gostaria de ser avisado quando estiver disponível! 🙌`

  return `https://wa.me/${number}?text=${encodeMessage(message)}`
}

// ============================================================
// Gera link WhatsApp para orçamento de festa
// ============================================================
export function generatePartyWhatsAppLink(): string {
  const number = getWhatsAppNumber()

  const message = `Olá, IL 3D Studio! Gostaria de pedir um orçamento para lembrancinhas ou itens para festa. Poderia me ajudar?`

  return `https://wa.me/${number}?text=${encodeMessage(message)}`
}
