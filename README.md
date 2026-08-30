# IL 3D Studio — Site Comercial Oficial

**Site:** https://il3dstudio.com.br  
**Repositório:** `il3d-studio-web`

> Impressão 3D criativa, personalizada e feita sob demanda. Articulados, fidgets, presentes e peças personalizadas impressas em 3D em São Paulo.

---

## 📦 Stack

| Ferramenta | Versão |
|-----------|--------|
| React | 18.x |
| Vite | 5.x |
| TypeScript | 5.x |
| CSS puro | mobile-first |

**Saída:** arquivos estáticos (`dist/`) — sem backend, sem banco, sem SSR.

---

## 🚀 Desenvolvimento local

### Pré-requisitos

- Node.js >= 18
- npm >= 9

### 1. Clone o repositório

```bash
git clone https://github.com/SEU_USUARIO/il3d-studio-web.git
cd il3d-studio-web
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` e defina o número real do WhatsApp:

```env
VITE_IL3D_WHATSAPP_NUMBER=5511950455233
```

> ⚠️ **Nunca commite o `.env` com o número real.**

### 3. Instale as dependências

```bash
npm install
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:5173

---

## 🏗️ Build de produção

```bash
npm run build
```

A saída estática ficará em `dist/`. Esse diretório contém tudo que a Lucy precisa para fazer o deploy.

---

## 🌿 Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `VITE_IL3D_WHATSAPP_NUMBER` | ✅ Sim | Número WhatsApp sem + nem espaços. Ex: `5511950455233` |

---

## 🗂️ Arquitetura do projeto

```
src/
├── components/
│   ├── layout/       # Header, Footer
│   ├── sections/     # Hero, Coleção, Como Funciona, Personalizados, Kit, Detalhes
│   ├── ui/           # ProductCard
│   └── cart/         # CartDrawer
├── data/
│   └── products.ts   # Catálogo de produtos (editar aqui para adicionar/remover)
├── hooks/
│   ├── useCart.ts    # Estado do carrinho + localStorage
│   └── useFilter.ts  # Filtro da coleção
├── types/
│   └── index.ts      # Tipos TypeScript centrais
├── utils/
│   └── whatsapp.ts   # Geração de links wa.me
├── App.tsx           # Componente raiz
├── main.tsx          # Entry point
└── index.css         # Sistema de design global
```

---

## 🛍️ Carrinho (Meu Pedido)

- **Tecnologia:** `useReducer` + `localStorage`
- **Funcionalidades:** adicionar, remover, editar quantidade, cor e observações
- **Sem pagamento:** é um carrinho de orçamento — gera mensagem estruturada para WhatsApp

---

## 📱 Responsividade

| Breakpoint | Layout |
|-----------|--------|
| 375px | Mobile (base) |
| 768px | Tablet — 2 colunas |
| 1024px | Desktop — 3-4 colunas |
| 1280px+ | Desktop largo |

---

## ✏️ Como adicionar um produto

Edite `src/data/products.ts` e adicione um novo objeto seguindo o esquema:

```typescript
{
  id: 'pers-003',
  slug: 'novo-produto',
  name: 'Nome do Produto',
  category: 'PERSONALIZADOS',         // BICHOS_DE_BOLSO | ARTICULADOS | FIDGETS | PERSONALIZADOS | FUNCIONAIS
  description: 'Descrição aqui.',
  image: {
    src: '/images/foto-produto.jpg',
    alt: 'Texto alternativo descritivo',
    type: 'CONCEPT',                  // CONCEPT | PROTOTYPE | REAL_PRODUCT
  },
  status: 'QUOTE_ONLY',               // AVAILABLE | DEVELOPMENT | QUOTE_ONLY
  customizable: true,
  tags: ['tag1', 'tag2'],
  licenseStatus: 'ORIGINAL',          // ORIGINAL | LICENSED | PENDING_LICENSE
}
```

> ⚠️ **Nunca marque `status: 'AVAILABLE'` sem validação física real do produto.**

---

## 🚢 Deploy (ver docs/LUCY_DEPLOYMENT_HANDOFF.md)

O deploy é feito por Lucy via Caddy. Consulte o handoff completo em [`docs/LUCY_DEPLOYMENT_HANDOFF.md`](./docs/LUCY_DEPLOYMENT_HANDOFF.md).

---

## 🔒 Segurança

- Nenhum token, senha ou credencial deve ser commitado
- O `.env` está no `.gitignore`
- O site não se comunica com APIs internas — apenas gera links `wa.me`
- Não há Evolution API, n8n, PostgreSQL ou qualquer backend exposto no frontend

---

## 📍 Sobre o IL 3D Studio

Impressão 3D criativa feita sob demanda em São Paulo — SP.  
Articulados, fidgets, chaveiros, lembrancinhas e peças personalizadas.
