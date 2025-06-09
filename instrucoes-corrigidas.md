# Correção do Erro JSON no n8n

## Problema
O erro ocorre porque há aspas especiais no JSON que não são válidas. O n8n espera aspas retas simples (`"`) em vez de aspas curvas (`"` ou `"`).

## Solução

### 1. Corrija o JSON no nó "Consultar IA"

Substitua o corpo JSON atual por este (com aspas corrigidas):

```
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

### 2. Verifique o nó Code

Certifique-se de que o nó Code está retornando corretamente os dados:

```javascript
// Extrair dados do webhook do WhatsApp
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

### 3. Teste o fluxo

1. Salve as alterações
2. Execute o fluxo novamente
3. Verifique se o erro foi resolvido