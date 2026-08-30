import './HowItWorksSection.css'

const steps = [
  {
    number: '01',
    title: 'VOCÊ ESCOLHE A IDEIA OU UMA PEÇA DA COLEÇÃO.',
    description:
      'Navegue pelo catálogo, escolha um produto disponível ou traga sua própria ideia. Tudo começa por aqui.',
    icon: '💡',
    accent: 'var(--color-pink)',
  },
  {
    number: '02',
    title: 'CONFIRMAMOS COR, QUANTIDADE, ACABAMENTO E PRAZO.',
    description:
      'Sem mistério. Combinamos todos os detalhes do pedido por WhatsApp antes de qualquer etapa de produção.',
    icon: '💬',
    accent: 'var(--color-yellow)',
  },
  {
    number: '03',
    title: 'PRODUZIMOS CAMADA POR CAMADA.',
    description:
      'Cada peça é impressa individualmente em PLA, com atenção a cada detalhe. A mágica acontece aqui.',
    icon: '🖨️',
    accent: 'var(--color-pink)',
  },
  {
    number: '04',
    title: 'COMBINAMOS RETIRADA OU ENVIO E PAGAMENTO PELO ATENDIMENTO.',
    description:
      'Entrega ou retirada? Decidimos juntos. O pagamento também é combinado direto no atendimento.',
    icon: '📦',
    accent: 'var(--color-yellow)',
  },
]

export function HowItWorksSection() {
  return (
    <section
      className="how-section"
      id="como-funciona"
      aria-labelledby="how-title"
    >
      <div className="container">
        <div className="section-header">
          <h2 className="section-title" id="how-title">
            COMO<br />
            <span className="section-title__accent">FUNCIONA</span>
          </h2>
          <p className="section-subtitle">
            Do pedido à entrega, tudo é tratado com você diretamente.
          </p>
        </div>

        <ol className="how-steps" aria-label="Passos do processo">
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
