import { SITE_CONFIG } from '../../config/site'
import { OptimizedImage } from '../ui/OptimizedImage'
import { trackEvent } from '../../utils/analytics'
import './HeroSection.css'

interface HeroSectionProps {
  onCatalogClick: () => void
  onCustomClick: () => void
}

export function HeroSection({ onCatalogClick, onCustomClick }: HeroSectionProps) {
  function handleCatalog() {
    onCatalogClick()
    trackEvent({ name: 'whatsapp_click', payload: { origin: 'Hero - Ver Produtos', target: 'Catalog' } })
  }

  function handleCustom() {
    onCustomClick()
    trackEvent({ name: 'whatsapp_click', payload: { origin: 'Hero - Peça Personalizada', target: 'Custom' } })
  }

  return (
    <section className="hero" aria-label="Seção principal — IL 3D Studio">
      {/* Decorações de fundo */}
      <div className="hero-blob hero-blob--pink" aria-hidden="true" />
      <div className="hero-blob hero-blob--yellow" aria-hidden="true" />

      <div className="container hero-inner">
        <div className="hero-content">
          {/* Eyebrow de localização e foco */}
          <div className="hero-eyebrow-wrap">
            <span className="pill-tag">📍 IMPRESSÃO 3D CRIATIVA • SÃO PAULO</span>
          </div>

          {/* Headline principal */}
          <h1 className="hero-headline">
            IDEIAS QUE VIRAM PEÇAS.<br />
            <span className="hero-headline__accent">IMPRESSÃO 3D DO SEU JEITO.</span>
          </h1>

          {/* Subtítulo */}
          <p className="hero-subtitle">
            Presentes, lembrancinhas, articulados, peças úteis e projetos personalizados
            produzidos sob demanda com acabamento de verdade.
          </p>

          {/* CTAs */}
          <div className="hero-ctas" role="group" aria-label="Ações principais">
            <button
              className="btn btn-primary btn-lg hero-cta-primary"
              onClick={handleCatalog}
            >
              VER PRODUTOS
              <ArrowIcon />
            </button>
            <button
              className="btn btn-secondary btn-lg hero-cta-secondary"
              onClick={handleCustom}
            >
              PEDIR PEÇA PERSONALIZADA
            </button>
          </div>

          {/* 4 Badges de Confiança */}
          <div className="hero-trust" aria-label="Diferenciais da IL 3D Studio">
            {SITE_CONFIG.trustBadges.map((badge) => (
              <div key={badge.text} className="hero-trust__item">
                <span className="hero-trust__icon" aria-hidden="true">{badge.icon}</span>
                <span className="hero-trust__text">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vitrine visual do Hero substituindo o antigo SVG de robô */}
        <div className="hero-visual" aria-label="Vitrine de produtos do IL 3D Studio">
          <div className="hero-showcase-card">
            <div className="hero-showcase-card__badge">
              <span>● ESTÚDIO SÃO PAULO</span>
            </div>
            
            <div className="hero-showcase-card__image-container">
              <OptimizedImage
                src="/images/hero-showcase.webp"
                alt="Composição de peças reais impressas em 3D pelo IL 3D Studio: polvo articulado, chaveiro personalizado e suporte funcional"
                width={800}
                height={600}
                type="REAL_PRODUCT"
                priority={true}
                aspectRatio="4/3"
                className="hero-showcase-img"
              />
            </div>

            <div className="hero-showcase-card__footer">
              <div className="showcase-detail">
                <span className="showcase-detail__title">Produção Sob Demanda</span>
                <span className="showcase-detail__sub">Bambu Lab A1 • Peças em PLA de alta fidelidade</span>
              </div>
              <span className="showcase-tag">100% PERSONALIZÁVEL</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ArrowIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}
