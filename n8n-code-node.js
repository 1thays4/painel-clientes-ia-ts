// Código otimizado para o nó Code do n8n
// Extrai a mensagem do webhook do WhatsApp

// Imprimir a estrutura completa para debug
console.log("Dados recebidos:", JSON.stringify($input.first().json, null, 2));

// Extrair a mensagem corretamente
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

console.log("Mensagem extraída:", message);
console.log("Remetente extraído:", from);

return [
  {
    json: {
      message: message,
      from: from,
      profileName: profileName,
      waId: waId,
      originalData: $input.first().json // Manter os dados originais
    }
  }
];