# Segurança Avançada do Painel de Clientes

## Visão Geral

Este documento descreve as melhorias de segurança implementadas no painel de clientes, incluindo expiração de tokens, refresh tokens e logs de acesso.

## Funcionalidades Implementadas

### 1. Expiração de Token

- Os tokens de acesso agora expiram após 60 minutos de inatividade
- Implementado no arquivo `src/lib/tokenManager.ts`
- Verificação automática a cada minuto no componente `PainelCliente.tsx`

### 2. Refresh Token

- Tokens podem ser renovados automaticamente por até 24 horas
- Após esse período, o cliente precisa fazer login novamente
- Implementado no arquivo `src/lib/tokenManager.ts`

### 3. Logs de Acesso

- Todas as ações importantes são registradas em logs
- Os logs incluem: timestamp, ação, ID do cliente, user agent e IP
- Implementado no arquivo `src/lib/tokenManager.ts` (cliente) e `supabase/create_access_logs.sql` (servidor)

## Como Funciona

### Ciclo de Vida do Token

1. **Criação**: Quando o cliente faz login, um token é criado com expiração de 60 minutos
2. **Verificação**: A cada minuto, o sistema verifica se o token ainda é válido
3. **Renovação**: Se o token expirou mas está dentro do período de refresh (24 horas), ele é renovado automaticamente
4. **Expiração**: Se o token expirou e está fora do período de refresh, o cliente é redirecionado para a tela de login

### Registro de Logs

1. **Cliente**: Logs são registrados localmente e enviados para o servidor
2. **Servidor**: Os logs são armazenados na tabela `access_logs` no Supabase
3. **Ações Registradas**: login_success, token_refreshed, token_cleared, view_panel, etc.

## Arquivos Principais

- `src/lib/tokenManager.ts`: Gerencia tokens com expiração e refresh
- `src/lib/authHeaders.ts`: Configura cabeçalhos de autenticação para requisições
- `supabase/create_access_logs.sql`: Cria tabela e funções para logs de acesso

## Próximos Passos

1. **Implementar Criptografia**: Adicionar criptografia para os tokens armazenados no cliente
2. **Detecção de Anomalias**: Implementar sistema para detectar padrões suspeitos de acesso
3. **Autenticação de Dois Fatores**: Adicionar opção de 2FA para clientes que desejam maior segurança
4. **Rotação de Tokens**: Implementar rotação periódica de tokens mesmo sem expiração