import './DetailsSection.css'

const details = [
  {
    icon: '🔸',
    title: 'Produção sob demanda',
    body: 'Cada peça é produzida após a confirmação do pedido. Não mantemos estoque. Isso garante frescor, personalização e menos desperdício.',
  },
  {
    icon: '💬',
    title: 'Preço confirmado no orçamento',
    body: 'O preço final é sempre combinado no atendimento. Nenhum valor é automático ou garantido pelo site.',
  },
  {
    icon: '📦',
    title: 'Entrega ou retirada combinada',
    body: 'Não prometemos prazos automáticos. Retirada ou envio é acordado individualmente para cada pedido.',
  },
  {
    icon: '🖨️',
    title: 'Textura natural da impressão',
    body: 'Objetos impressos em 3D podem apresentar textura de camadas — parte da estética e do processo artesanal. Adicionamos acabamento quando combinado.',
  },
]

export function DetailsSection() {
  return (
    <section className="details-section" id="detalhes" aria-labelledby="details-title">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title" id="details-title">
            DETALHES<br />
            <span className="section-title__accent">E TRANSPARÊNCIA</span>
          </h2>
          <p className="section-subtitle">
            Porque você merece saber exatamente o que está pedindo.
          </p>
        </div>

        <div className="details-grid">
          {details.map((item) => (
            <div key={item.title} className="detail-card">
              <span className="detail-card__icon" aria-hidden="true">{item.icon}</span>
              <h3 className="detail-card__title">{item.title}</h3>
              <p className="detail-card__body">{item.body}</p>
            </div>
          ))}
        </div>

        {/* IP Notice */}
        <div className="ip-notice" role="note" aria-label="Aviso sobre propriedade intelectual">
          <div className="ip-notice__icon" aria-hidden="true">⚖️</div>
          <div className="ip-notice__content">
            <h3 className="ip-notice__title">Propriedade Intelectual</h3>
            <p className="ip-notice__body">
              Modelos de terceiros só entram no catálogo ou são vendidos quando a{' '}
              <strong>licença comercial permite</strong>. Personagens, designs e criações do IL 3D Studio
              são originais. Em caso de dúvida sobre licenciamento de um produto específico,
              consulte no atendimento antes de encomendar.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
