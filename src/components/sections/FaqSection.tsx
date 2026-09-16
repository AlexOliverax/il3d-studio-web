import { useState } from 'react'
import { faqList } from '../../data/faq'
import { trackEvent } from '../../utils/analytics'
import './FaqSection.css'

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  function toggleFaq(index: number) {
    const isOpening = openIndex !== index
    setOpenIndex(isOpening ? index : null)
    if (isOpening) {
      trackEvent({
        name: 'faq_open',
        payload: { questionIndex: index, question: faqList[index].question },
      })
    }
  }

  return (
    <section className="faq-section" id="duvidas" aria-labelledby="faq-title">
      <div className="container">
        <div className="section-header">
          <span className="pill-tag">DÚVIDAS FREQUENTES</span>
          <h2 className="section-title" id="faq-title">
            PERGUNTAS &amp;<br />
            <span className="section-title__accent">RESPOSTAS</span>
          </h2>
          <p className="section-subtitle">
            Tudo o que você precisa saber sobre nosso processo de impressão 3D sob demanda,
            materiais, prazos e entrega em São Paulo.
          </p>
        </div>

        <div className="faq-accordion" role="region" aria-label="Perguntas Frequentes">
          {faqList.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={item.question}
                className={`faq-item${isOpen ? ' faq-item--open' : ''}`}
              >
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-btn-${index}`}
                >
                  <span className="faq-question__text">{item.question}</span>
                  <span className="faq-question__icon" aria-hidden="true">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div
                    className="faq-answer"
                    id={`faq-answer-${index}`}
                    role="region"
                    aria-labelledby={`faq-btn-${index}`}
                  >
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
