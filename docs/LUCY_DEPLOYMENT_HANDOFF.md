# 🚀 IL 3D Studio — Deployment Handoff para Lucy

> **Destinatária:** Lucy, IL 3D Studio Infrastructure Gatekeeper  
> **Projeto:** Site comercial estático — il3d-studio-web  
> **Domínio:** https://il3dstudio.com.br

---

## Visão geral

Este projeto é um **site estático** gerado pelo Vite (React + TypeScript).  
Não há backend, banco de dados, autenticação, nem SSR.  
A saída do build é uma pasta `dist/` com HTML, CSS e JS — deployável diretamente atrás do Caddy existente.

---

## Responsabilidades do handoff

| Responsabilidade | Frontend (feito) | Lucy (deploy) |
|-----------------|-----------------|---------------|
| Código-fonte | ✅ Completo | — |
| TypeScript sem erros | ✅ Verificado | — |
| npm run build limpo | ✅ Verificado | — |
| Variáveis de ambiente | ✅ Documentadas | **🔑 Configurar** |
| Deploy estático | — | **✅ Executar** |
| Certificado TLS | — | **✅ Caddy gerencia** |
| Rollback | — | **✅ Lucy executa** |
| Monitoramento | — | **✅ Lucy executa** |

---

## Passo a passo do deploy

### Pré-requisitos no servidor

- Node.js >= 18 (apenas para o build — não precisa em produção)
- npm >= 9
- Caddy já configurado e rodando

---

### 1. Clonar o repositório

```bash
git clone https://github.com/SEU_USUARIO/il3d-studio-web.git /opt/il3d-studio-web
cd /opt/il3d-studio-web
```

Ou, em atualizações futuras:

```bash
cd /opt/il3d-studio-web
git pull origin main
```

---

### 2. Instalar dependências (apenas para build)

```bash
npm ci
```

> Use `npm ci` (não `npm install`) em produção — respeita o `package-lock.json`.

---

### 3. Configurar variável de ambiente

Crie o arquivo `.env` **no servidor** (não commitar):

```bash
echo "VITE_IL3D_WHATSAPP_NUMBER=5511950455233" > .env
```

> ⚠️ **Substitua pelo número real do WhatsApp do IL 3D Studio.**  
> Sem essa variável, o site ainda funciona, mas os links do WhatsApp usarão um número placeholder.

---

### 4. Executar o build de produção

```bash
npm run build
```

Saída gerada em: `/opt/il3d-studio-web/dist/`

Arquivos gerados:
```
dist/
├── index.html
├── favicon.svg
└── assets/
    ├── index-XXXXX.css
    ├── index-XXXXX.js
    └── vendor-XXXXX.js
```

---

### 5. Configurar o Caddy

No `Caddyfile` existente, aponte a raiz do site para a pasta `dist/`:

```
il3dstudio.com.br {
    root * /opt/il3d-studio-web/dist
    file_server
    try_files {path} /index.html
}
```

> A diretiva `try_files {path} /index.html` garante que o React Router (se usado no futuro) e reloads de página funcionem corretamente.

Recarregar o Caddy:

```bash
caddy reload --config /etc/caddy/Caddyfile
# ou
systemctl reload caddy
```

---

### 6. Verificar

```bash
curl -I https://il3dstudio.com.br
# Esperado: HTTP/2 200
```

Checklist pós-deploy:
- [ ] Site carrega em https://il3dstudio.com.br
- [ ] TLS ativo (cadeado verde)
- [ ] Catálogo de produtos aparece
- [ ] Botões de WhatsApp abrem `wa.me` com número correto
- [ ] Menu mobile funciona em 375px
- [ ] Carrinho persiste ao recarregar a página

---

## Rollback

```bash
cd /opt/il3d-studio-web
git log --oneline -10     # ver commits disponíveis
git checkout COMMIT_HASH  # reverter para commit específico
npm ci
npm run build
caddy reload --config /etc/caddy/Caddyfile
```

---

## Atualizações futuras

Para publicar uma nova versão do site:

```bash
cd /opt/il3d-studio-web
git pull origin main
npm ci
npm run build
caddy reload --config /etc/caddy/Caddyfile
```

---

## O que Lucy NÃO precisa fazer

- ❌ Configurar banco de dados
- ❌ Configurar backend / API
- ❌ Instalar PHP, Python, Ruby ou qualquer runtime
- ❌ Configurar autenticação
- ❌ Modificar o código frontend

---

## Arquitetura de segurança

- **Nenhuma credencial** está no repositório
- O arquivo `.env` é gerado no servidor e nunca commitado
- O site não expõe:
  - n8n
  - PostgreSQL
  - Caddy admin
  - Evolution API
  - APIs internas
  - Tokens ou segredos
- Toda comunicação com o cliente vai **apenas via links `wa.me`** (WhatsApp deep links)

---

## Suporte

Para dúvidas sobre o código, layout ou funcionalidades:  
**Contato com o desenvolvedor frontend do IL 3D Studio.**

Para dúvidas sobre infraestrutura, TLS, DNS e servidor:  
**Lucy cuida disso 💜**
