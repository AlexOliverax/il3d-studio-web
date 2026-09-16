export interface FaqItem {
  question: string
  answer: string
}

export const faqList: FaqItem[] = [
  {
    question: 'Quanto custa uma impressão 3D?',
    answer:
      'O valor de uma peça em 3D depende principalmente do tempo de máquina, quantidade de material (gramas de PLA), acabamento e se o modelo precisa de personalização ou modelagem digital. Nossos chaveiros e miniaturas começam em faixas muito acessíveis, e fornecemos o orçamento exato rapidamente pelo WhatsApp sem qualquer compromisso.',
  },
  {
    question: 'Vocês fazem peças personalizadas?',
    answer:
      'Sim! Personalização é um dos nossos maiores pontos fortes. Conseguimos adicionar nomes, logotipos, frases, criar chaveiros personalizados, tags de identificação, troféus e adaptar modelos para a sua necessidade específica.',
  },
  {
    question: 'Posso escolher a cor?',
    answer:
      'Com certeza. Temos uma ampla variedade de cores em filamento PLA premium: rosa choque, amarelo vibrante, preto fosco, branco puro, azul metálico, cinza espacial, verde, dourado e combinações multicoloridas (graças ao nosso sistema AMS). Você escolhe no momento do orçamento.',
  },
  {
    question: 'Qual material vocês usam?',
    answer:
      'Utilizamos principalmente o PLA (Poliácido Láctico) de alta qualidade. É um termoplástico biodegradável de origem vegetal (como amido de milho e cana-de-açúcar), seguro, atóxico, inodoro e com acabamento de superfície limpo e preciso.',
  },
  {
    question: 'Vocês imprimem um arquivo STL ou 3MF que eu já tenho?',
    answer:
      'Sim! Se você já tem o arquivo STL, 3MF ou OBJ baixado de plataformas como MakerWorld, Printables, Thingiverse ou Cults3D, basta nos enviar pelo WhatsApp. Analisamos a geometria, tempo de impressão e geramos a cotação.',
  },
  {
    question: 'Vocês criam o modelo 3D a partir de uma ideia ou foto?',
    answer:
      'Criamos modelos paramétricos (como letreiros, chaveiros de nome, suportes técnicos e adaptações funcionais). Para esculturas artísticas complexas ou reprodução exata de personagens, avaliamos caso a caso a viabilidade ou sugerimos modelos abertos já validados.',
  },
  {
    question: 'Quanto tempo demora?',
    answer:
      'Peças unitárias em catálogo geralmente levam de 1 a 3 dias úteis para impressão e acabamento. Para pedidos maiores (como lembrancinhas de festas ou brindes corporativos), alinhamos o cronograma para que tudo fique pronto com antecedência ao seu evento.',
  },
  {
    question: 'Vocês fazem lembrancinhas em quantidade?',
    answer:
      'Sim, produzimos lotes para aniversários, batizados, formaturas e eventos empresariais em São Paulo. Em pedidos com múltiplas unidades do mesmo modelo, oferecemos condições especiais de orçamento.',
  },
  {
    question: 'Como funciona a retirada ou entrega?',
    answer:
      'Atendemos em São Paulo - SP. Combinamos a melhor opção diretamente no atendimento: você pode optar por retirada combinada no ponto de encontro ou envio via Uber Flash / Correios / transportadora com frete a combinar de acordo com sua localidade.',
  },
]
