# Integração WhatsApp com IA usando n8n

Este guia explica como configurar a integração entre WhatsApp e IA usando o n8n como plataforma de automação.

## Pré-requisitos

1. Conta no Twilio com WhatsApp Business API configurado
2. Servidor n8n rodando (local ou hospedado)
3. API de IA configurada (OpenAI, Claude, etc.)
4. Servidor da aplicação rodando

## Configuração do Fluxo no n8n

### 1. Webhook (Entrada)

Este nó recebe as mensagens do WhatsApp via Twilio:

- **Path**: `whatsapp-webhook`
- **Method**: POST
- **Response Mode**: Respond using 'Respond to Webhook' node

### 2. Consultar IA (HTTP Request)

Este nó envia a mensagem para o servidor da aplicação processar com a IA:

- **URL**: `http://localhost:3001/api/n8n-webhook` (ajuste para seu servidor)
- **Method**: POST
- **Body**: Enviar o JSON completo recebido do webhook
- **Response Format**: JSON

### 3. Twilio (Enviar Resposta)

Este nó envia a resposta da IA de volta para o usuário no WhatsApp:

- **Operation**: Send Message
- **From**: seu número do WhatsApp no Twilio (formato: `whatsapp:+14155238886`)
- **To**: `={{ $node["Webhook"].json["From"] }}`
- **Message**: `={{ $node["Consultar IA"].json["content"] }}`

### 4. Responder Webhook

Este nó finaliza o fluxo respondendo ao webhook inicial:

- **Response Code**: 200
- **Response Body**: `={{ {success: true} }}`

## Formato dos Dados

### Entrada (Webhook do Twilio)
```json
{
  "SmsMessageSid": "SM56adb1fbf464c39e1607f81585cf0d1b",
  "NumMedia": "0",
  "ProfileName": "Nome do Usuário",
  "MessageType": "text",
  "SmsSid": "SM56adb1fbf464c39e1607f81585cf0d1b",
  "WaId": "554791767425",
  "SmsStatus": "received",
  "Body": "mensagem do usuário",
  "To": "whatsapp:+14155238886",
  "NumSegments": "1",
  "ReferralNumMedia": "0",
  "MessageSid": "SM56adb1fbf464c39e1607f81585cf0d1b",
  "AccountSid": "AC9ddc9eb04428f5db8f94b8c8b22edf76",
  "From": "whatsapp:+554791767425",
  "ApiVersion": "2010-04-01"
}
```

### Saída (Resposta da API)
```json
{
  "content": "Resposta da IA para o usuário",
  "success": true,
  "mensagens_info": {
    "usadas": 10,
    "limite": 100
  }
}
```

## Configuração no Servidor

1. Configure as variáveis de ambiente:
   - `IA_API_URL`: URL da API de IA
   - `IA_API_KEY`: Chave da API de IA
   - `IA_MODEL`: Modelo de IA a ser usado

2. Inicie o servidor:
   ```
   npm run server
   ```

3. Configure o webhook do Twilio para apontar para a URL do seu fluxo n8n:
   ```
   https://seu-n8n.exemplo.com/webhook/whatsapp-webhook
   ```

## Importando o Fluxo

Você pode importar o fluxo de exemplo usando o arquivo `n8n-fluxo-exemplo.json` incluído neste projeto.

1. No n8n, vá para "Workflows"
2. Clique em "Import from File"
3. Selecione o arquivo `n8n-fluxo-exemplo.json`
4. Ajuste as credenciais e URLs conforme necessário