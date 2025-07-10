// SOLUÇÃO COMPLETA PARA O ERRO DO TWILIO
// Esta solução modifica tanto o nó "Buscar Número Twilio" quanto o nó "Enviar WhatsApp"

// 1. SUBSTITUA O CÓDIGO DO NÓ "Buscar Número Twilio" POR ESTE:
/*
// Usar mensagem de texto direta em vez de template
return [{
  json: {
    numeroRemetente: "whatsapp:+554791950615",
    whatsappDestino: "whatsapp:" + $node["Filtrar Follow-ups"].json.whatsapp,
    mensagemTexto: `Olá ${$node["Filtrar Follow-ups"].json.nome}! Temos novidades para você.`
  }
}];
*/

// 2. CONFIGURE O NÓ "Enviar WhatsApp" COM ESTES PARÂMETROS:
/*
from: {{$node["Buscar Número Twilio"].json.numeroRemetente}}
to: {{$node["Buscar Número Twilio"].json.whatsappDestino}}
message: {{$node["Buscar Número Twilio"].json.mensagemTexto}}
*/

// 3. CERTIFIQUE-SE DE QUE O PARÂMETRO "toWhatsapp" ESTEJA DESMARCADO
// Já estamos usando números completos com prefixo "whatsapp:"