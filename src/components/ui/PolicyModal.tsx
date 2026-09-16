import { useFocusTrap } from '../../hooks/useFocusTrap'
import './PolicyModal.css'

export type PolicyModalType = 'privacy' | 'terms' | null

interface PolicyModalProps {
  type: PolicyModalType
  isOpen: boolean
  onClose: () => void
}

export function PolicyModal({ type, isOpen, onClose }: PolicyModalProps) {
  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose })

  if (!isOpen || !type) return null

  const isPrivacy = type === 'privacy'

  return (
    <>
      <div className="overlay policy-modal-overlay" onClick={onClose} aria-hidden="true" />
      <div
        ref={modalRef}
        className="policy-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="policy-modal-title"
      >
        <button
          className="policy-modal__close"
          onClick={onClose}
          aria-label="Fechar janela"
        >
          ✕
        </button>

        <h2 id="policy-modal-title" className="policy-modal__title">
          {isPrivacy ? 'Política de Privacidade' : 'Termos Básicos de Uso e Encomenda'}
        </h2>

        <div className="policy-modal__content">
          {isPrivacy ? (
            <>
              <p>
                A <strong>IL 3D Studio</strong> preza pela transparência, privacidade e segurança
                dos seus clientes e visitantes.
              </p>
              <h3>1. Coleta de Informações</h3>
              <p>
                Este site opera como um catálogo estático e montador de orçamento. Nós{' '}
                <strong>não armazenamos senhas, dados de cartão de crédito nem dados bancários</strong>{' '}
                em bancos de dados próprios ou servidores web.
              </p>
              <h3>2. Orçamentos via WhatsApp</h3>
              <p>
                Ao preencher seu nome, preferências ou lista de peças, essas informações são
                formatadas e enviadas unicamente através do aplicativo oficial do WhatsApp
                (wa.me) diretamente para o canal de atendimento da IL 3D Studio.
              </p>
              <h3>3. Armazenamento Local (localStorage)</h3>
              <p>
                Utilizamos o armazenamento local do seu próprio navegador exclusivamente para manter
                os itens que você adicionou ao seu orçamento enquanto navega pelo site. Esses dados
                ficam salvos apenas no seu dispositivo.
              </p>
              <h3>4. Métricas e Melhorias</h3>
              <p>
                Podemos coletar métricas anônimas de visitação para avaliar quais modelos despertam
                maior interesse, sem cruzamento com identidades civis ou venda de dados a terceiros.
              </p>
            </>
          ) : (
            <>
              <p>
                Bem-vindo ao site comercial da <strong>IL 3D Studio</strong>. Ao solicitar orçamentos
                ou encomendar peças, você concorda com as diretrizes abaixo:
              </p>
              <h3>1. Natureza da Produção Sob Demanda</h3>
              <p>
                Nossos produtos são impressos em 3D camada por camada após a confirmação do pedido.
                Características inerentes ao processo de manufatura aditiva (como linhas sutis de
                camada) fazem parte da autenticidade artesanal de cada peça.
              </p>
              <h3>2. Confirmação de Orçamento e Prazos</h3>
              <p>
                Os itens adicionados ao carrinho configuram um pedido de cotação. Valores finais,
                disponibilidade de cores específicas de filamento, formas de pagamento e prazos de
                produção são confirmados no atendimento direto pelo WhatsApp.
              </p>
              <h3>3. Propriedade Intelectual e Licenciamento</h3>
              <p>
                A IL 3D Studio respeita rigorosamente direitos autorais. Criações originais
                pertencem ao estúdio, e modelos abertos de terceiros são impressos estritamente
                sob autorização de licença comercial concedida pelos respectivos criadores.
              </p>
              <h3>4. Retirada e Envio</h3>
              <p>
                As entregas são acordadas individualmente conforme disponibilidade para São Paulo - SP
                e demais localidades através dos canais de envio combinados.
              </p>
            </>
          )}
        </div>

        <div className="policy-modal__footer">
          <button className="btn btn-primary" onClick={onClose}>
            ENTENDI E CONCORDO
          </button>
        </div>
      </div>
    </>
  )
}
