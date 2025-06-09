# Integração WhatsApp com IA - Guia Rápido

Este guia explica como configurar a integração entre WhatsApp e IA usando o n8n.

## Configuração do Fluxo

### 1. Webhook (Entrada)
- Recebe as mensagens do WhatsApp via Twilio
- Path: `whatsapp-webhook`
- Method: POST

### 2. Extrair Dados (Code)
- Extrai a mensagem e o número do remetente
- Código:
```javascript
// Extrair dados do webhook do WhatsApp
let message = "";
let from = "";
let profileName = "";
let waId = "";

// Verificar estrutura do webhook do Twilio
if ($input.first().json.Body) {
  message = $input.first().json.Body || "";
  from = $input.first().json.From || "";
  profileName = $input.first().json.ProfileName || "";
  waId = $input.first().json.WaId || "";
}
// Verificar estrutura do corpo da requisição
else if ($input.first().json.body && $input.first().json.body.Body) {
  message = $input.first().json.body.Body || "";
  from = $input.first().json.body.From || "";
  profileName = $input.first().json.body.ProfileName || "";
  waId = $input.first().json.body.WaId || "";
}

return [
  {
    json: {
      message: message,
      from: from,
      profileName: profileName,
      waId: waId
    }
  }
];
```

### 3. Consultar IA (HTTP Request)
- Envia a mensagem para a API da OpenAI
- URL: `https://api.openai.com/v1/chat/completions`
- Method: POST
- Body:
```json
{
  "model": "gpt-4.5-preview",
  "messages": [
    {
      "role": "system",
      "content": "Você é uma assistente especializada em automações para Instagram e WhatsApp..."
    },
    {
      "role": "user",
      "content": "{{$json.message.replace('IA:', '').trim()}}"
    }
  ],
  "max_tokens": 500
}
```

### 4. Enviar Resposta (Twilio)
- Envia a resposta da IA de volta para o usuário
- From: seu número do WhatsApp
- To: `{{$node["Extrair Dados"].json.from}}`
- Message: `{{$node["Consultar IA"].json.choices[0].message.content}}`

### 5. Registrar Mensagem (HTTP Request)
- Registra a mensagem no sistema
- URL: `http://localhost:3001/api/registrar-mensagem`
- Method: POST
- Body:
```json
{
  "whatsappNumero": "{{$node["Extrair Dados"].json.from}}".replace("whatsapp:", ""),
  "pergunta": "{{$node["Extrair Dados"].json.message}}",
  "resposta": "{{$node["Consultar IA"].json.choices[0].message.content}}"
}
```

## Importando o Fluxo

1. No n8n, vá para "Workflows"
2. Clique em "Import from File"
3. Selecione o arquivo `n8n-fluxo-otimizado.json`
4. Configure as credenciais:
   - Twilio API
   - OpenAI API (Bearer Token)

## Configuração do Servidor

1. Inicie o servidor:
```
npm run server
```

2. O servidor deve estar rodando na porta 3001 para receber as requisições do n8n

## Estrutura de Dados

### Entrada (Webhook do Twilio)
```json
{
  "Body": "mensagem do usuário",
  "From": "whatsapp:+554791767425",
  "ProfileName": "Nome do Usuário",
  "WaId": "554791767425"
}
```

### Saída (Resposta da API)
```json
{
  "success": true,
  "mensagens_usadas": 10,
  "mensagens_limite": 100,
  "disponivel": 90
}
```