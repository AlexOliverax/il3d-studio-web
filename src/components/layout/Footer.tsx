import { generatePartyWhatsAppLink } from '../../utils/whatsapp'
import './Footer.css'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container footer-inner">
        {/* Brand block */}
        <div className="footer-brand">
          <p className="footer-logo">
            <span className="footer-logo__il">IL</span>
            <span className="footer-logo__studio">3D STUDIO</span>
          </p>
          <p className="footer-tagline">
            Impressão 3D criativa, personalizada<br />e feita sob demanda.
          </p>
          <p className="footer-location">
            <LocationIcon />
            Impresso em São Paulo — SP
          </p>
        </div>

        {/* Links */}
        <nav className="footer-nav" aria-label="Links do rodapé">
          <div className="footer-col">
            <h3 className="footer-col__title">Produtos</h3>
            <ul>
              <li><a href="#colecao">Coleção completa</a></li>
              <li><a href="#colecao">Bichos de Bolso</a></li>
              <li><a href="#colecao">Articulados</a></li>
              <li><a href="#colecao">Fidgets</a></li>
              <li><a href="#personalizados">Personalizados</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3 className="footer-col__title">Informações</h3>
            <ul>
              <li><a href="#como-funciona">Como funciona</a></li>
              <li><a href="#personalizados">Festa & Cor</a></li>
              <li><a href="#detalhes">Detalhes &amp; Transparência</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3 className="footer-col__title">Atendimento</h3>
            <a
              href={generatePartyWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm footer-whatsapp"
            >
              <WhatsAppIcon />
              WhatsApp
            </a>
          </div>
        </nav>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {year} IL 3D Studio. Todos os direitos reservados.</p>
          <p className="footer-note">
            Modelos de terceiros só entram no catálogo quando a licença comercial permite.
          </p>
        </div>
      </div>
    </footer>
  )
}

function LocationIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
