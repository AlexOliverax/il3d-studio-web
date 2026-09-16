// ============================================================
// Configurações comerciais e institucionais — IL 3D Studio
// ============================================================

export const SITE_CONFIG = {
  name: 'IL 3D Studio',
  legalName: 'IL 3D Studio',
  tagline: 'Impressão 3D criativa, personalizada e feita sob demanda em São Paulo.',
  shortDescription:
    'Impressão 3D sob demanda em São Paulo. Articulados, presentes, lembrancinhas, peças úteis e projetos personalizados. Peça seu orçamento pelo WhatsApp.',
  url: 'https://www.il3dstudio.com.br',
  location: {
    city: 'São Paulo',
    state: 'SP',
    country: 'Brasil',
    display: 'São Paulo — SP',
  },
  whatsapp: {
    // Número real de produção: 5511950455233 (55 = Brasil, 11 = SP, 950455233)
    defaultNumber: '5511950455233',
    displayNumber: '(11) 95045-5233',
  },
  social: {
    instagram: 'https://instagram.com/il3dstudio',
  },
  nav: [
    { label: 'Produtos', href: '#produtos' },
    { label: 'Personalizados', href: '#personalizados' },
    { label: 'Como funciona', href: '#como-funciona' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Dúvidas', href: '#duvidas' },
  ],
  trustBadges: [
    { icon: '⚙️', text: 'Produção sob demanda' },
    { icon: '🎨', text: 'Personalização de cores' },
    { icon: '💬', text: 'Atendimento direto pelo WhatsApp' },
    { icon: '📍', text: 'Produzido em São Paulo' },
  ],
} as const
