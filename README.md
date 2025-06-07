# Painel de Clientes IA - WhatsApp

Sistema de gerenciamento de clientes para serviço de IA no WhatsApp com controle de uso e limites por plano.

## Configuração

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Crie um arquivo `.env` baseado no `.env.example`:
   ```
   cp .env.example .env
   ```
4. Preencha as variáveis de ambiente no arquivo `.env`:
   ```
   SUPABASE_URL=sua_url_do_supabase
   SUPABASE_KEY=sua_chave_do_supabase
   ```

## Estrutura do Projeto

- `/src/components` - Componentes React para o frontend
- `/src/api` - Endpoints da API para integração com WhatsApp
- `/src/lib` - Bibliotecas e utilitários compartilhados
- `/src/contexts` - Contextos React (autenticação, etc.)

## Executando o Projeto

### Frontend
```
npm start
```

### API
```
npm run start:api
```

## Endpoints da API

### Webhook do WhatsApp
```
POST /api/webhook/whatsapp
```
Recebe mensagens do WhatsApp e processa com IA.

### Registrar Mensagem
```
POST /api/registrar-mensagem
```
Registra o uso de IA e atualiza o contador de mensagens do cliente.

### Buscar Cliente por WhatsApp
```
GET /api/cliente/whatsapp?whatsapp=5511999999999
```
Busca um cliente pelo número de WhatsApp.

## Banco de Dados

### Tabela `clientes`
- `id` - ID do cliente
- `nome` - Nome do cliente
- `whatsapp` - Número de WhatsApp
- `plano` - Plano contratado (básico, intermediário, avançado)
- `mensagens_usadas` - Contador de mensagens usadas no mês
- `mensagens_limite` - Limite de mensagens do plano
- `status_pagamento` - Status do pagamento (em_dia, pendente)
- `token_publico` - Token para acesso ao painel do cliente

### Tabela `mensagens_enviadas`
- `id` - ID da mensagem
- `cliente_id` - ID do cliente
- `timestamp` - Data e hora do envio
- `conteudo` - Conteúdo ou descrição da mensagem