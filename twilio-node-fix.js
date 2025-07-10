// Código corrigido para o nó "Buscar Número Twilio"
// Este código corrige o erro "A text message body or media urls must be specified"

// Obter o número do Twilio para envio
// Normalmente seria armazenado em uma configuração ou obtido de algum lugar
const template = {
  contentSid: "HX38750d6132324abf885b19cf849a174a",
  contentVariables: JSON.stringify({ 1: $node["Loop Clientes"].json.nome }),
  from: "whatsapp:+554791950615",
  messagingServiceSid: "MG5a4f738ce460da454c99e80a5df23996",
  to: "whatsapp:" + $node["Loop Clientes"].json.whatsapp,
  // Adicionar o body para evitar o erro
  body: "Olá! Temos novidades para você." // Mensagem padrão de fallback
};

return [{
  json: {
    numeroRemetente: "+554791950615", // Número do Twilio
    mensagemParaEnviar: $node["Debug OpenAI"].json.mensagemGerada,
    payload: template
  }
}];