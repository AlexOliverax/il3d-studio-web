import { SITE_CONFIG } from '../../config/site'
import { OptimizedImage } from '../ui/OptimizedImage'
import './HeroSection.css'

interface HeroSectionProps {
  onCatalogClick: () => void
  onCustomClick: () => void
}

export function HeroSection({ onCatalogClick, onCustomClick }: HeroSectionProps) {
  function handleCatalog() {
    onCatalogClick()
  }

  function handleCustom() {
    onCustomClick()
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
            ARTE, FÉ E IDEIAS.<br />
            <span className="hero-headline__accent">CAMADA POR CAMADA.</span>
          </h1>

          {/* Subtítulo */}
          <p className="hero-subtitle">
            Conheça nossa coleção cristã em HueForge e conte sua ideia de impressão 3D.
            Peças feitas sob demanda em São Paulo, com atendimento direto pelo WhatsApp.
          </p>

          {/* CTAs */}
          <div className="hero-ctas" role="group" aria-label="Ações principais">
            <button
              className="btn btn-primary btn-lg hero-cta-primary"
              onClick={handleCatalog}
            >
              CONHECER A COLEÇÃO
              <ArrowIcon />
            </button>
            <button
              className="btn btn-secondary btn-lg hero-cta-secondary"
              onClick={handleCustom}
            >
              PEDIR ORÇAMENTO
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
              <span>COLEÇÃO CRISTÃ • HUEFORGE</span>
            </div>
            
            <div className="hero-showcase-card__image-container">
              <OptimizedImage
                src="/images/hueforge-cristao.jpg"
                alt="Painel cristão em HueForge da IL 3D Studio, com Jesus e cenas de sua vida"
                width={1043}
                height={1536}
                type="REAL_PRODUCT"
                priority={true}
                aspectRatio="1043/1536"
                className="hero-showcase-img"
              />
            </div>

            <div className="hero-showcase-card__footer">
              <div className="showcase-detail">
                <span className="showcase-detail__title">Arte para decorar e presentear</span>
                <span className="showcase-detail__sub">Coleção própria da IL 3D Studio</span>
              </div>
              <span className="showcase-tag">CONSULTE VALORES</span>
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
