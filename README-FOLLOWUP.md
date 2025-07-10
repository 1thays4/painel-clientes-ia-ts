# Sistema de Follow-up Automatizado

Este sistema permite enviar mensagens de follow-up automatizadas para clientes em potencial que não completaram a conversão.

## Como funciona

1. Quando uma conversa termina sem conversão, o cliente é marcado com status "em aberto" no banco de dados.
2. O sistema de follow-up verifica diariamente os clientes que precisam de contato baseado no tempo desde a última mensagem enviada (timestamp da tabela mensagens_enviadas).
3. A IA gera mensagens personalizadas de acordo com o estágio do follow-up:
   - **1 dia após a última mensagem**: Lembrete leve e simpático
   - **3 dias após a última mensagem**: Reforço dos benefícios do serviço
   - **7 dias após a última mensagem**: Mensagem de encerramento do atendimento

## Configuração no n8n

1. Importe o arquivo `n8n-follow-up-workflow.json` no seu n8n
2. Configure as credenciais do Supabase e Twilio
3. Ajuste o agendador (Cron) para o horário desejado (padrão: uma vez por dia às 10h)

## Estrutura do banco de dados

O sistema utiliza a tabela `clientes_finais` com os seguintes campos adicionais:
- `ultimo_followup`: Data do último follow-up enviado
- `proximo_followup`: Data programada para o próximo follow-up
- `tentativas_followup`: Contador de tentativas de follow-up
- `modo`: Status do cliente ('bot', 'humano', 'em aberto', 'encerrado')

## API de Follow-up

### Marcar cliente para follow-up

```
POST /api/marcar-followup
```

Corpo da requisição:
```json
{
  "clienteFinalId": 123,
  "status": "em aberto",
  "observacoes": "Cliente interessado no plano básico"
}
```

## Funções utilitárias e como são chamadas

O módulo `src/utils/marcarFollowup.ts` contém funções para:
- Marcar um cliente para follow-up
- Verificar clientes que precisam de follow-up hoje

Estas funções são chamadas de três formas diferentes:

### 1. Automaticamente via Cron Job

O servidor executa um cron job diariamente às 10:00 que chama o endpoint `/api/verificar-followups`, que por sua vez executa a função `verificarClientesParaFollowup()` para identificar clientes que precisam de follow-up.

### 2. Manualmente via API

Você pode chamar os endpoints:
- `POST /api/processar-followups` - Para verificar e processar follow-ups
- `GET /api/verificar-followups` - Para apenas verificar quais clientes precisam de follow-up
- `POST /api/marcar-followup` - Para marcar um cliente específico para follow-up

### 3. No código, quando uma conversa termina sem conversão

```typescript
import { marcarClienteParaFollowup } from '../utils';

// Marcar cliente para follow-up
await marcarClienteParaFollowup(clienteId, 'em aberto', 'Aguardando decisão');
```

## Personalização das mensagens

As mensagens de follow-up são geradas pelo OpenAI Assistant com base no tipo de follow-up e nos dados do cliente. Você pode personalizar o prompt no nó "Gerar Mensagem Follow-up" do workflow n8n.

## Integração com o fluxo existente

Quando uma conversa termina sem conversão, você pode adicionar um passo para marcar o cliente para follow-up:

```typescript
// No final da conversa sem conversão
const { data: clienteFinal } = await supabase
  .from('clientes_finais')
  .select('*')
  .eq('whatsapp', numeroWhatsApp)
  .single();

if (clienteFinal) {
  await marcarClienteParaFollowup(clienteFinal.id, 'em aberto', 'Conversa encerrada sem conversão');
}
```