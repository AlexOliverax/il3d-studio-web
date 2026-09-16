import { OptimizedImage } from '../ui/OptimizedImage'
import './SocialProofSection.css'

const studioShowcase = [
  {
    title: 'Polvo Articulado Flex',
    material: 'PLA Rosa Choque & Preto',
    desc: 'Movimento contínuo impresso sem suportes nem montagem.',
    img: '/images/polvo-articulado.webp',
  },
  {
    title: 'Chaveiros Bicolores',
    material: 'PLA Alta Densidade Preto & Amarelo',
    desc: 'Nomes e logos em relevo com contraste tátil.',
    img: '/images/chaveiro-personalizado.webp',
  },
  {
    title: 'Suportes para Celular & Tablet',
    material: 'PLA Reforçado Amarelo Sol',
    desc: 'Design estrutural com canais para cabos e ângulo ergonômico.',
    img: '/images/suporte-celular.webp',
  },
  {
    title: 'Tags de Identificação Escolar',
    material: 'PLA Premium Rosa & Branco',
    desc: 'Letras fundidas na massa para não desgastar com o tempo.',
    img: '/images/tag-mochila.webp',
  },
]

export function SocialProofSection() {
  return (
    <section className="social-proof-section" aria-labelledby="social-proof-title">
      <div className="container">
        <div className="section-header">
          <span className="pill-tag">TRANSPARÊNCIA TOTAL</span>
          <h2 className="section-title" id="social-proof-title">
            PRODUZIDO NO ESTÚDIO,<br />
            <span className="section-title__accent">DIRETO DA MESA DE IMPRESSÃO.</span>
          </h2>
          <p className="section-subtitle">
            Nada de renders genéricos de computador ou números inventados.
            Aqui você vê peças reais que saem das nossas máquinas em São Paulo.
          </p>
        </div>

        <div className="showcase-grid" role="list" aria-label="Galeria de peças reais do estúdio">
          {studioShowcase.map((item) => (
            <div key={item.title} className="showcase-card" role="listitem">
              <div className="showcase-card__media">
                <OptimizedImage
                  src={item.img}
                  alt={`Fotografia real de ${item.title} impresso pelo IL 3D Studio`}
                  width={800}
                  height={600}
                  type="REAL_PRODUCT"
                  aspectRatio="4/3"
                />
                <span className="showcase-card__tag">● PEÇA FÍSICA REAL</span>
              </div>
              <div className="showcase-card__body">
                <h3 className="showcase-card__title">{item.title}</h3>
                <span className="showcase-card__material">{item.material}</span>
                <p className="showcase-card__desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
