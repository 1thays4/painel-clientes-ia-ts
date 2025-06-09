# Instruções para Configurar o Fluxo no n8n

## 1. Configurar o Nó Code

1. Adicione um nó "Code" após o nó "Webhook"
2. Cole o código abaixo no editor:

```javascript
// Extrair dados do webhook do WhatsApp
console.log("Dados recebidos:", JSON.stringify($input.first().json, null, 2));

// Extrair a mensagem corretamente
let message = "";
let from = "";

// Verificar estrutura do webhook do Twilio
if ($input.first().json.Body) {
  message = $input.first().json.Body;
  from = $input.first().json.From;
}
// Verificar estrutura do corpo da requisição
else if ($input.first().json.body && $input.first().json.body.Body) {
  message = $input.first().json.body.Body;
  from = $input.first().json.body.From;
}
// Verificar estrutura específica do teste
else if ($input.first().json.body && $input.first().json.body.body) {
  message = $input.first().json.body.body.Body || $input.first().json.body.body.message;
  from = $input.first().json.body.body.From || $input.first().json.body.body.from;
}

return [
  {
    json: {
      message: message,
      from: from
    }
  }
];
```

## 2. Configurar o Nó HTTP Request (Consultar IA)

1. Adicione um nó "HTTP Request" após o nó "Code"
2. Configure com os seguintes parâmetros:
   - Method: POST
   - URL: https://api.openai.com/v1/chat/completions
   - Authentication: Bearer Token (sua chave da OpenAI)
   - Headers: Content-Type: application/json
   - Body: JSON
   - JSON Body:
   
```json
{
  "model": "gpt-4.5-preview",
  "messages": [
    {
      "role": "system",
      "content": "Você é uma assistente especializada em automações para Instagram e WhatsApp. Responda de forma útil, objetiva e com linguagem próxima e acessível, como se estivesse conversando com uma amiga empreendedora. Sempre que possível, oriente a próxima ação ou passo do cliente. Nunca use jargões técnicos sem explicar. Dê preferência a frases curtas. Use emojis moderadamente para tornar o tom leve (1 a 2 por resposta). Sempre proponha um caminho ou ação clara (ex: \"Quer que eu te mostre como?\", \"Posso te mandar um passo a passo?\")."
    },
    {
      "role": "user",
      "content": "{{$json.message.replace('IA:', '').trim()}}"
    }
  ],
  "max_tokens": 500
}
```

## 3. Configurar o Nó Twilio

1. Adicione um nó "Twilio" após o nó "HTTP Request"
2. Configure com os seguintes parâmetros:
   - From: +14155238886 (seu número do Twilio)
   - To: {{$node["Code"].json.from}}
   - Message: {{$node["HTTP Request"].json.choices[0].message.content}}
   - Send as WhatsApp message: Ativado

## 4. Configurar o Nó HTTP Request (Registrar Mensagem)

1. Adicione um nó "HTTP Request" após o nó "Twilio"
2. Configure com os seguintes parâmetros:
   - Method: POST
   - URL: http://localhost:3001/api/registrar-simples
   - Body: JSON
   - JSON Body:
   
```json
{
  "whatsappNumero": "{{$node["Code"].json.from}}".replace("whatsapp:", ""),
  "pergunta": "{{$node["Code"].json.message}}",
  "resposta": "{{$node["HTTP Request"].json.choices[0].message.content}}"
}
```

## 5. Conectar os Nós

Conecte os nós na seguinte ordem:
1. Webhook → Code
2. Code → HTTP Request (Consultar IA)
3. HTTP Request (Consultar IA) → Twilio
4. Twilio → HTTP Request (Registrar Mensagem)

## 6. Ativar o Fluxo

1. Salve o fluxo
2. Ative o fluxo clicando no botão "Active"
3. Teste enviando uma mensagem para o número do WhatsApp configurado no Twilio