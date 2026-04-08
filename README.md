# Painel de Clientes IA — WhatsApp

Sistema de gerenciamento de clientes para serviço de IA no WhatsApp com controle de uso, limites por plano, atendimento humano e follow-up automatizado.

## Stack

- **Frontend**: Next.js 15, TypeScript, Material UI, Tailwind CSS
- **Backend**: Next.js API Routes + servidor Express separado
- **Banco de dados**: Supabase (PostgreSQL)
- **Automação**: n8n + Twilio (WhatsApp Business API)
- **IA**: OpenAI GPT-4

## Funcionalidades

- Painel administrativo com gestão de clientes e planos
- Painel individual por cliente com histórico de mensagens
- Controle de uso mensal com alertas de limite
- Atendimento humano: visualização e resposta manual às mensagens
- Sistema de follow-up automatizado via n8n
- Autenticação por token + senha de acesso para clientes
- Webhook para receber e processar mensagens do WhatsApp
- Envio de vídeos via WhatsApp por palavra-chave

## Estrutura

```
src/
├── pages/          # Rotas Next.js (admin, painel, cliente, auth)
├── pages/api/      # Endpoints da API (webhook, registrar-mensagem, cliente)
├── components/     # Componentes React
├── services/       # Lógica de acesso ao banco de dados
├── lib/            # Utilitários (auth, supabase, tokenManager)
├── server/         # Servidor Express separado (cron, routes)
└── utils/          # Helpers (formatação, follow-up, diagnóstico)
supabase/           # Scripts SQL de migração
workflows/          # Fluxos n8n exportados
```

## Configuração

```bash
npm install
cp .env.example .env
```

Preencha o `.env`:
```
SUPABASE_URL=sua_url_do_supabase
SUPABASE_KEY=sua_chave_do_supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

## Executando

```bash
# Frontend (Next.js)
npm run dev

# Servidor API separado
npm run start:api
```

## API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/webhook/whatsapp` | Recebe mensagens do WhatsApp via Twilio |
| `POST` | `/api/registrar-mensagem` | Registra uso de IA e atualiza contador |
| `GET`  | `/api/cliente/whatsapp?whatsapp=55...` | Busca cliente pelo número |
| `POST` | `/api/marcar-followup` | Marca cliente para follow-up |
| `POST` | `/api/processar-followups` | Processa follow-ups pendentes |

## Banco de Dados

### `clientes`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID do cliente |
| `nome` | TEXT | Nome |
| `whatsapp` | TEXT | Número de WhatsApp |
| `plano` | TEXT | essencial / profissional / estratégico |
| `mensagens_usadas` | INT | Contador mensal |
| `mensagens_limite` | INT | Limite do plano |
| `status_pagamento` | TEXT | em_dia / pendente |
| `token_publico` | TEXT | Token de acesso ao painel |
| `senha_acesso` | TEXT | Senha do painel do cliente |

### `clientes_finais`
Clientes dos seus clientes (usuários finais que interagem via WhatsApp).

### `mensagens_enviadas`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `cliente_id` | UUID | Referência ao cliente |
| `cliente_final_id` | INT | Referência ao cliente final |
| `pergunta` | TEXT | Mensagem do usuário |
| `resposta_ia` | TEXT | Resposta gerada pela IA |
| `resposta_humana` | TEXT | Resposta manual do atendente |
| `timestamp` | TIMESTAMPTZ | Data/hora |

## Integração n8n

Os fluxos prontos estão em `/workflows/`. Importe o `n8n-fluxo-otimizado.json` e configure:
- Credenciais Twilio
- Credenciais OpenAI
- URL do servidor: `http://seu-servidor:3001`

## Follow-up Automatizado

O sistema envia mensagens automáticas para clientes que não converteram:
- **1 dia** após última mensagem: lembrete leve
- **3 dias**: reforço dos benefícios
- **7 dias**: encerramento do atendimento

Configure o cron no n8n usando `n8n-follow-up-workflow-fixed.json`.

## Segurança

- Tokens de acesso com expiração de 60 minutos e refresh de 24h
- Row Level Security (RLS) configurado no Supabase
- Logs de acesso registrados na tabela `access_logs`
- Variáveis sensíveis exclusivamente via `.env`
