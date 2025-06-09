// Código otimizado para o nó Code do n8n
// Extrair dados do webhook do WhatsApp

// Imprimir a estrutura para debug
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

console.log("Mensagem extraída:", message);
console.log("Remetente extraído:", from);

return [
  {
    json: {
      message: message,
      from: from
    }
  }
];