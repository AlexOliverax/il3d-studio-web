import './HowItWorksSection.css'

const steps = [
  {
    number: '01',
    title: 'Escolha ou envie sua ideia',
    description: 'Selecione uma peça do catálogo ou conte o que você quer criar.',
    icon: '💡',
    accent: 'var(--color-pink)',
  },
  {
    number: '02',
    title: 'Receba a análise',
    description: 'Confirmamos viabilidade, tamanho, cor, quantidade, prazo e acabamento.',
    icon: '🔍',
    accent: 'var(--color-yellow)',
  },
  {
    number: '03',
    title: 'Aprove o orçamento',
    description: 'Só produzimos depois da sua aprovação e alinhamento dos detalhes.',
    icon: '✅',
    accent: 'var(--color-pink)',
  },
  {
    number: '04',
    title: 'Produção e entrega',
    description: 'A peça é impressa no estúdio e combinamos retirada ou forma de envio.',
    icon: '📦',
    accent: 'var(--color-yellow)',
  },
]

export function HowItWorksSection() {
  return (
    <section className="how-section" id="como-funciona" aria-labelledby="how-title">
      <div className="container">
        <div className="section-header">
          <span className="pill-tag">TRANSPARÊNCIA DO PROCESSO</span>
          <h2 className="section-title" id="how-title">
            COMO<br />
            <span className="section-title__accent">FUNCIONA</span>
          </h2>
          <p className="section-subtitle">
            Do primeiro clique à peça pronta na sua mão, tudo é transparente e tratado
            diretamente com você pelo WhatsApp.
          </p>
        </div>

        <ol className="how-steps" aria-label="Passos para solicitar sua peça">
          {steps.map((step) => (
            <li key={step.number} className="how-step">
              <div
                className="how-step__number"
                style={{ '--step-accent': step.accent } as React.CSSProperties}
                aria-hidden="true"
              >
                {step.number}
              </div>
              <div className="how-step__body">
                <span className="how-step__icon" aria-hidden="true">{step.icon}</span>
                <h3 className="how-step__title">{step.title}</h3>
                <p className="how-step__description">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
