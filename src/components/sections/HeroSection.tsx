import './HeroSection.css'

interface HeroSectionProps {
  onCatalogClick: () => void
  onCustomClick: () => void
}

export function HeroSection({ onCatalogClick, onCustomClick }: HeroSectionProps) {
  return (
    <section className="hero" aria-label="Seção principal — IL 3D Studio">
      {/* Decorações de fundo */}
      <div className="hero-blob hero-blob--pink" aria-hidden="true" />
      <div className="hero-blob hero-blob--yellow" aria-hidden="true" />

      <div className="container hero-inner">
        {/* Pill tag localização */}
        <div className="hero-location" aria-label="Localização">
          <span className="pill-tag">📍 IMPRESSO EM SÃO PAULO — SP</span>
        </div>

        {/* Headline principal */}
        <h1 className="hero-headline">
          COLECIONE<br />
          <span className="hero-headline__accent">O QUE SE</span><br />
          MEXE.
        </h1>

        {/* Subtítulo */}
        <p className="hero-subtitle">
          Articulados, fidgets, presentes e peças personalizadas<br className="hero-br" />
          impressas em 3D.
        </p>

        {/* CTAs */}
        <div className="hero-ctas" role="group" aria-label="Ações principais">
          <button
            className="btn btn-primary btn-lg hero-cta-primary"
            onClick={onCatalogClick}
          >
            CONHECER A COLEÇÃO
            <ArrowIcon />
          </button>
          <button
            className="btn btn-secondary btn-lg hero-cta-secondary"
            onClick={onCustomClick}
          >
            QUERO UMA PEÇA ÚNICA
          </button>
        </div>

        {/* Badges de confiança */}
        <div className="hero-trust" aria-label="Diferenciais">
          <TrustBadge icon="🔸" text="FEITO SOB DEMANDA" />
          <TrustBadge icon="🎨" text="CORES PARA ESCOLHER" />
          <TrustBadge icon="💬" text="ATENDIMENTO DIRETO" />
        </div>
      </div>

      {/* Visual decorativo hero */}
      <div className="hero-visual" aria-hidden="true">
        <HeroVisual />
      </div>
    </section>
  )
}

function TrustBadge({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="hero-trust__item">
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  )
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

// Visual decorativo SVG — peça 3D estilizada
function HeroVisual() {
  return (
    <div className="hero-visual-card">
      <div className="hero-visual-card__inner">
        {/* Ícone central estilizado */}
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="hero-3d-icon" aria-label="Objeto 3D articulado">
          {/* Corpo principal */}
          <rect x="50" y="60" width="100" height="80" rx="16" fill="#FF2D78" stroke="#1A1A1A" strokeWidth="3"/>
          {/* Cabeça */}
          <rect x="65" y="30" width="70" height="45" rx="12" fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="3"/>
          {/* Olhos */}
          <circle cx="85" cy="50" r="7" fill="#1A1A1A"/>
          <circle cx="115" cy="50" r="7" fill="#1A1A1A"/>
          <circle cx="87" cy="48" r="2.5" fill="#FAF7F2"/>
          <circle cx="117" cy="48" r="2.5" fill="#FAF7F2"/>
          {/* Sorriso */}
          <path d="M88 62 Q100 72 112 62" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          {/* Braço esq */}
          <rect x="20" y="75" width="32" height="16" rx="8" fill="#FFE000" stroke="#1A1A1A" strokeWidth="2.5"/>
          {/* Braço dir */}
          <rect x="148" y="75" width="32" height="16" rx="8" fill="#FFE000" stroke="#1A1A1A" strokeWidth="2.5"/>
          {/* Perna esq */}
          <rect x="65" y="136" width="28" height="40" rx="10" fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="2.5"/>
          {/* Perna dir */}
          <rect x="107" y="136" width="28" height="40" rx="10" fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="2.5"/>
          {/* Articulação simbolizada */}
          <circle cx="65" cy="100" r="6" fill="#FFE000" stroke="#1A1A1A" strokeWidth="2"/>
          <circle cx="135" cy="100" r="6" fill="#FFE000" stroke="#1A1A1A" strokeWidth="2"/>
          <circle cx="79" cy="136" r="6" fill="#FFE000" stroke="#1A1A1A" strokeWidth="2"/>
          <circle cx="121" cy="136" r="6" fill="#FFE000" stroke="#1A1A1A" strokeWidth="2"/>
        </svg>
        <div className="hero-visual-card__label">
          <span>ARTICULADO</span>
          <span className="hero-visual-card__sub">Conceito IL 3D Studio</span>
        </div>
      </div>
    </div>
  )
}
