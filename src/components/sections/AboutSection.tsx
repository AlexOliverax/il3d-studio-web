import './AboutSection.css'

export function AboutSection() {
  return (
    <section className="about-section" id="sobre" aria-labelledby="about-title">
      <div className="container about-grid">
        <div className="about-content">
          <span className="pill-tag">ISADORA + LUÍSA</span>
          <h2 className="about-title" id="about-title">UM ESTÚDIO COM<br />
            <span className="about-title__accent">HISTÓRIA DE FAMÍLIA.</span></h2>
          <p className="about-lead">O nome <strong>IL 3D Studio</strong> vem de Isadora e Luísa.
            Em São Paulo, transformamos ideias em peças por meio da impressão 3D.</p>
          <p className="about-text">Nossa coleção cristã em HueForge é uma criação própria do estúdio.
            Também avaliamos projetos personalizados e a impressão de arquivos enviados por você.</p>
          <p className="about-text">Produzimos com a Bambu Lab A1 e sistema multicolor.
            O material, as cores, o acabamento e o prazo são definidos de acordo com cada projeto.</p>
        </div>
        <div className="about-brand-card" aria-label="IL: Isadora e Luísa">
          <span className="about-brand-monogram" aria-hidden="true">IL</span>
          <strong>3D STUDIO</strong>
          <p>Ideias de família.<br />Peças feitas para você.</p>
          <span className="pill-tag">SÃO PAULO • PRODUÇÃO SOB DEMANDA</span>
        </div>
      </div>
    </section>
  )
}
