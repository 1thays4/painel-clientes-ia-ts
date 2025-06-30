# Campos da Tabela Clientes

## Campos Adicionados

Foram adicionados os seguintes campos à tabela `clientes`:

1. **mensagens_usadas** (INTEGER)
   - Contador de mensagens usadas no mês atual
   - Valor padrão: 0
   - Este contador é resetado no início de cada mês

2. **mensagens_limite** (INTEGER)
   - Limite de mensagens do plano do cliente
   - Valor padrão baseado no plano:
     - Essencial: 1000
     - Profissional: 3000
     - Estratégico: 5000

3. **status_pagamento** (TEXT)
   - Status do pagamento do cliente
   - Valores possíveis: 'em_dia', 'pendente'
   - Valor padrão: 'em_dia'

## Como Implementar

1. Execute o script SQL `supabase/add_client_fields.sql` para adicionar os campos à tabela
2. O script também atualiza os clientes existentes com valores padrão baseados no plano

## Funcionalidades Relacionadas

1. **Resetar Mensagens Usadas**
   - Função `resetarMensagensUsadas()` em `src/services/resetMensagensUsadas.ts`
   - Deve ser executada por um cron job no primeiro dia de cada mês

2. **Atualizar Status de Pagamento**
   - Função `atualizarStatusPagamento()` em `src/services/resetMensagensUsadas.ts`
   - Deve ser executada após verificação de pagamentos

3. **Alerta de Pagamento Pendente**
   - Exibido no painel do cliente quando `status_pagamento` é 'pendente'
   - Implementado no componente `PainelCliente.tsx`

## Exemplo de Uso

```typescript
// Verificar limite de mensagens
if (cliente.mensagens_usadas >= cliente.mensagens_limite) {
  // Limite atingido, exibir alerta
}

// Verificar status de pagamento
if (cliente.status_pagamento === 'pendente') {
  // Exibir alerta de pagamento pendente
}
```