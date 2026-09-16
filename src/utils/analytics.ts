// ============================================================
// Camada de Telemetria & Analytics — IL 3D Studio
// Despacha eventos compatíveis com Google Analytics (GA4) / Plausible / Custom
// Respeita privacidade e não coleta dados sensíveis.
// ============================================================

type AnalyticsCallable = (...args: unknown[]) => void

export type AnalyticsEvent =
  | { name: 'whatsapp_click'; payload: { origin: string; target?: string } }
  | { name: 'product_view'; payload: { productId: string; productName: string; category: string } }
  | { name: 'add_to_quote'; payload: { productId: string; productName: string } }
  | { name: 'remove_from_quote'; payload: { productId: string } }
  | { name: 'quote_whatsapp_submit'; payload: { itemCount: number } }
  | { name: 'custom_request_submit'; payload: { hasColor: boolean; hasQty: boolean } }
  | { name: 'category_filter'; payload: { category: string } }
  | { name: 'faq_open'; payload: { questionIndex: number; question: string } }

export function trackEvent(event: AnalyticsEvent): void {
  try {
    // 1. GA4 gtag wrapper
    if (
      typeof window !== 'undefined' &&
      typeof (window as unknown as { gtag?: AnalyticsCallable }).gtag === 'function'
    ) {
      ;(window as unknown as { gtag: AnalyticsCallable }).gtag('event', event.name, event.payload)
    }

    // 2. Plausible wrapper
    if (
      typeof window !== 'undefined' &&
      typeof (window as unknown as { plausible?: AnalyticsCallable }).plausible === 'function'
    ) {
      ;(window as unknown as { plausible: AnalyticsCallable }).plausible(event.name, {
        props: event.payload,
      })
    }

    // 3. Log discreto em ambiente de desenvolvimento
    if (import.meta.env.DEV) {
      console.log(`📊 [Analytics] ${event.name}:`, event.payload)
    }
  } catch (err) {
    // Analytics nunca deve quebrar o fluxo do usuário
    console.debug('[Analytics Error]', err)
  }
}
