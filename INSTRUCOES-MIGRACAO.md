# Instruções para Migração para Next.js

Este documento contém as instruções para migrar o projeto de Create React App (CRA) para Next.js.

## Arquivos Criados

Foram criados os seguintes arquivos para a migração:

- `next.config.js` - Configuração do Next.js
- `tsconfig.next.json` - Configuração do TypeScript para Next.js
- `package.next.json` - Novo package.json com dependências do Next.js
- `src/pages/_app.tsx` - Componente principal do Next.js
- `src/pages/_document.tsx` - Configuração do documento HTML
- `src/pages/index.tsx` - Página inicial
- `src/pages/login.tsx` - Página de login
- `src/pages/registro.tsx` - Página de registro
- `src/pages/dashboard.tsx` - Página do dashboard
- `src/pages/atendimento-humano.tsx` - Página de atendimento humano
- `src/pages/cliente/[token].tsx` - Página dinâmica para o painel do cliente
- `src/pages/cliente-login/[token].tsx` - Página dinâmica para o login do cliente
- `src/pages/diagnostico.tsx` - Página de diagnóstico
- `src/pages/api/cliente/whatsapp.ts` - API para buscar cliente por WhatsApp
- `src/pages/api/registrar-mensagem.ts` - API para registrar mensagem
- `src/pages/api/webhook/whatsapp.ts` - API para webhook do WhatsApp
- `src/styles/globals.css` - Estilos globais
- `src/middleware.ts` - Middleware para proteção de rotas
- `tailwind.config.next.js` - Configuração do Tailwind para Next.js
- `postcss.config.next.js` - Configuração do PostCSS para Next.js

## Passos para Migração

1. **Renomear os arquivos de configuração**:
   ```
   ren tsconfig.next.json tsconfig.json
   ren package.next.json package.json
   ren tailwind.config.next.js tailwind.config.js
   ren postcss.config.next.js postcss.config.js
   ```

2. **Instalar as dependências**:
   ```
   npm install
   ```

3. **Adaptar os componentes**:
   - Substituir `react-router-dom` por `next/router` e `next/link`
   - Atualizar os componentes `ProtectedRoute` e `AdminRoute` para usar o middleware do Next.js

4. **Adaptar o AuthContext**:
   - Atualizar para usar cookies ou localStorage para persistência de sessão
   - Integrar com o middleware do Next.js

5. **Executar o projeto**:
   ```
   npm run dev
   ```

## Benefícios da Migração

- **Melhor performance**: Renderização do lado do servidor (SSR) e geração estática
- **Rotas API integradas**: Simplificação da estrutura de backend
- **Melhor SEO**: Renderização do lado do servidor para melhor indexação
- **Melhor experiência de desenvolvimento**: Hot reloading mais rápido
- **Melhor escalabilidade**: Arquitetura mais robusta para crescimento do projeto

## Observações

- Os componentes React existentes foram mantidos e podem ser reutilizados
- A integração com Supabase continua funcionando da mesma forma
- A estrutura de pastas foi adaptada para o padrão do Next.js
- As APIs foram migradas para o formato de API routes do Next.js