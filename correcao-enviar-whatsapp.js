// Configuração corrigida para o nó "Enviar WhatsApp"

/*
Substitua os parâmetros atuais por estes:

from: {{$node["Buscar Número Twilio"].json.numeroRemetente}}
to: {{$node["Filtrar Follow-ups"].json.whatsapp}}
toWhatsapp: true
message: {{$node["Buscar Número Twilio"].json.mensagemTexto}}
*/