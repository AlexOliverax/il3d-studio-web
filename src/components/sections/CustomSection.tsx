import { useState } from 'react'
import type { CustomRequestForm } from '../../types'
import {
  generateCustomRequestWhatsAppLink,
  generatePartyWhatsAppLink,
} from '../../utils/whatsapp'
import { trackEvent } from '../../utils/analytics'
import './CustomSection.css'

const initialForm: CustomRequestForm = {
  name: '',
  idea: '',
  color: '',
  quantity: '',
  approximateDimensions: '',
  deadline: '',
}

export function CustomSection() {
  const [form, setForm] = useState<CustomRequestForm>(initialForm)
  const [touched, setTouched] = useState<Partial<Record<keyof CustomRequestForm, boolean>>>({})

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({
      name: true,
      idea: true,
      color: true,
      quantity: true,
      approximateDimensions: true,
      deadline: true,
    })

    if (!form.name.trim() || !form.idea.trim()) return

    trackEvent({
      name: 'custom_request_submit',
      payload: { hasColor: !!form.color.trim(), hasQty: !!form.quantity.trim() },
    })

    const link = generateCustomRequestWhatsAppLink(form)
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  const nameError = touched.name && !form.name.trim()
  const ideaError = touched.idea && !form.idea.trim()

  return (
    <section className="custom-section" id="personalizados" aria-labelledby="custom-title">
      <div className="container custom-inner">
        {/* Bloco Festa & Lembrancinhas */}
        <div className="party-card">
          <div className="party-card__badge">
            <span className="pill-tag">🎉 EVENTOS &amp; LEMBRANCINHAS</span>
          </div>
          <h2 className="party-card__title">
            FESTA &amp;<br />
            <span className="party-card__title-accent">EVENTOS</span>
          </h2>
          <p className="party-card__desc">
            Lembrancinhas, brindes e itens temáticos impressos em 3D para aniversários,
            casamentos ou eventos corporativos em São Paulo. Fazemos chaveiros com nomes,
            tags de mochila, centros de mesa e decorações personalizadas.
          </p>

          <ul className="party-features" aria-label="O que podemos produzir para seu evento">
            {[
              { icon: '🔑', text: 'Chaveiros com nomes, iniciais e logos' },
              { icon: '🎒', text: 'Tags de mochila e identificadores duráveis' },
              { icon: '🎂', text: 'Topos de bolo e enfeites temáticos exclusivos' },
              { icon: '🏆', text: 'Troféus e lembranças personalizadas' },
              { icon: '🎁', text: 'Brindes criativos em quantidade sob demanda' },
            ].map((item) => (
              <li key={item.text} className="party-feature">
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>

          <a
            href={generatePartyWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-lg party-cta"
            aria-label="Pedir orçamento para festas e lembrancinhas via WhatsApp"
            onClick={() =>
              trackEvent({
                name: 'whatsapp_click',
                payload: { origin: 'Festa e Lembrancinhas - CTA' },
              })
            }
          >
            <WhatsAppIcon />
            PEDIR ORÇAMENTO PARA FESTA
          </a>
        </div>

        {/* Formulário de Ideia Personalizada */}
        <div className="custom-form-card">
          <span className="pill-tag">PROJETOS ESPECIAIS</span>
          <h2 className="custom-form-title" id="custom-title">
            TEM UMA IDEIA?<br />
            <span className="custom-form-title__accent">A GENTE TRANSFORMA EM 3D.</span>
          </h2>
          <p className="custom-form-desc">
            Conte o que você quer produzir. Analisamos a viabilidade técnica, acabamento
            e tempo de máquina, e retornamos com o orçamento pelo WhatsApp.
          </p>

          <form
            className="custom-form"
            onSubmit={handleSubmit}
            noValidate
            aria-label="Formulário de solicitação de projeto personalizado"
          >
            {/* Nome */}
            <div className="form-field">
              <label htmlFor="custom-name" className="form-label">
                Seu nome <span aria-label="obrigatório" className="form-required">*</span>
              </label>
              <input
                id="custom-name"
                name="name"
                type="text"
                className={`form-input${nameError ? ' form-input--error' : ''}`}
                placeholder="Como prefere ser chamado(a)?"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                aria-required="true"
                aria-invalid={nameError}
                aria-describedby={nameError ? 'name-error' : undefined}
                autoComplete="given-name"
              />
              {nameError && (
                <span id="name-error" className="form-error" role="alert">
                  Por favor, informe seu nome.
                </span>
              )}
            </div>

            {/* Ideia */}
            <div className="form-field">
              <label htmlFor="custom-idea" className="form-label">
                Descrição da ideia <span aria-label="obrigatório" className="form-required">*</span>
              </label>
              <textarea
                id="custom-idea"
                name="idea"
                className={`form-input form-textarea${ideaError ? ' form-input--error' : ''}`}
                placeholder="Descreva a peça: o que é, formato, utilidade, inspiração..."
                value={form.idea}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                aria-required="true"
                aria-invalid={ideaError}
                aria-describedby={ideaError ? 'idea-error' : undefined}
                rows={3}
              />
              {ideaError && (
                <span id="idea-error" className="form-error" role="alert">
                  Por favor, descreva brevemente a ideia ou peça que deseja imprimir.
                </span>
              )}
            </div>

            {/* Linha 1: Cor & Quantidade */}
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="custom-color" className="form-label">
                  Cor desejada
                </label>
                <input
                  id="custom-color"
                  name="color"
                  type="text"
                  className="form-input"
                  placeholder="Ex: Rosa, preto fosco, bicolor..."
                  value={form.color}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>

              <div className="form-field">
                <label htmlFor="custom-qty" className="form-label">
                  Quantidade
                </label>
                <input
                  id="custom-qty"
                  name="quantity"
                  type="text"
                  className="form-input"
                  placeholder="Ex: 1 un, 10 un, 50 un..."
                  value={form.quantity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
            </div>

            {/* Linha 2: Tamanho Aproximado & Prazo */}
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="custom-dim" className="form-label">
                  Tamanho aproximado
                </label>
                <input
                  id="custom-dim"
                  name="approximateDimensions"
                  type="text"
                  className="form-input"
                  placeholder="Ex: 10 cm, tamanho de bolso, etc."
                  value={form.approximateDimensions}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>

              <div className="form-field">
                <label htmlFor="custom-deadline" className="form-label">
                  Prazo desejado
                </label>
                <input
                  id="custom-deadline"
                  name="deadline"
                  type="text"
                  className="form-input"
                  placeholder="Ex: Para próxima semana, sem pressa..."
                  value={form.deadline}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
            </div>

            {/* Alerta de Segurança / Envio de Arquivos STL/3MF/Fotos */}
            <div className="file-upload-notice" role="note">
              <span className="file-upload-notice__icon" aria-hidden="true">📎</span>
              <p>
                <strong>Possui arquivo 3D ou foto?</strong> Você poderá anexar seus arquivos
                (STL, 3MF, PNG ou fotos de referência) diretamente na conversa do WhatsApp
                após clicar no botão abaixo.
              </p>
            </div>

            <button type="submit" className="btn btn-primary btn-lg form-submit">
              <WhatsAppIcon />
              ENVIAR IDEIA VIA WHATSAPP
            </button>

            <p className="form-note">
              Ao clicar, você será direcionado ao WhatsApp com todos os campos estruturados.
              Nenhum dado pessoal é armazenado no servidor.
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
