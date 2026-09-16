import { OptimizedImage } from '../ui/OptimizedImage'
import './AboutSection.css'

export function AboutSection() {
  return (
    <section className="about-section" id="sobre" aria-labelledby="about-title">
      <div className="container">
        <div className="about-grid">
          {/* Coluna Texto */}
          <div className="about-content">
            <span className="pill-tag">BASTIDORES DO ESTÚDIO</span>
            <h2 className="about-title" id="about-title">
              FEITO COM IDEIAS,<br />
              <span className="about-title__accent">FILAMENTO E MUITO TESTE.</span>
            </h2>

            <p className="about-lead">
              A <strong>IL 3D Studio</strong> nasceu em São Paulo da paixão por transformar
              linhas de código e polímeros sustentáveis em objetos reais com alma, utilidade e diversão.
            </p>

            <p className="about-text">
              Não somos uma indústria de plástico em massa. Cada peça é produzida sob demanda
              em impressoras de alta precisão <strong>Bambu Lab A1</strong>, equipadas com sistema
              multicolor AMS. Isso nos permite criar gradientes, textos em relevo e combinações
              vibrantes de cores com repetibilidade cirúrgica.
            </p>

            <div className="about-values">
              <div className="about-value-card">
                <span className="about-value-card__icon" aria-hidden="true">🖨️</span>
                <div>
                  <h3 className="about-value-card__title">Tecnologia de Ponta</h3>
                  <p className="about-value-card__desc">
                    Velocidade, calibração automática e precisão milimétrica em cada camada impressa.
                  </p>
                </div>
              </div>

              <div className="about-value-card">
                <span className="about-value-card__icon" aria-hidden="true">🌱</span>
                <div>
                  <h3 className="about-value-card__title">PLA Biodegradável</h3>
                  <p className="about-value-card__desc">
                    Filamento ecológico derivado de fontes vegetais renováveis, seguro e inodoro.
                  </p>
                </div>
              </div>

              <div className="about-value-card">
                <span className="about-value-card__icon" aria-hidden="true">✂️</span>
                <div>
                  <h3 className="about-value-card__title">Acabamento Cuidadoso</h3>
                  <p className="about-value-card__desc">
                    Remoção manual de suportes, inspeção de qualidade e embalagem segura peça por peça.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Imagens / Visual */}
          <div className="about-visual" aria-label="Bastidores da oficina de impressão">
            <div className="about-photo-card about-photo-card--primary">
              <div className="about-photo-card__tag">OFICINA EM PRODUÇÃO</div>
              <OptimizedImage
                src="/images/bambu-lab-a1.webp"
                alt="Impressora Bambu Lab A1 em produção na oficina do IL 3D Studio em São Paulo"
                width={800}
                height={600}
                type="REAL_PRODUCT"
                aspectRatio="4/3"
              />
              <div className="about-photo-card__caption">
                <strong>Bambu Lab A1:</strong> Precisão e acabamento impecável em PLA
              </div>
            </div>

            <div className="about-photo-card about-photo-card--secondary">
              <OptimizedImage
                src="/images/ams-colors.webp"
                alt="Sistema AMS multicolor com carretéis de filamentos coloridos para impressão 3D"
                width={800}
                height={600}
                type="REAL_PRODUCT"
                aspectRatio="4/3"
              />
              <div className="about-photo-card__caption">
                <strong>Multicolor AMS:</strong> Criações com até 4 cores simultâneas
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
