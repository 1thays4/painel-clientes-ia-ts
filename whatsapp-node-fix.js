// Configuração corrigida para o nó "Enviar WhatsApp"
// Use estas configurações para corrigir o erro do Twilio

/*
Parâmetros do nó:
- from: {{$node["Buscar Número Twilio"].json.numeroRemetente}}
- to: {{$node["Loop Clientes"].json.whatsapp}}
- toWhatsapp: true
- message: {{$node["Buscar Número Twilio"].json.mensagemParaEnviar}}
*/

// Opção alternativa: Usar o objeto de template diretamente
/*
Parâmetros do nó:
- from: whatsapp:+554791950615
- to: {{$node["Loop Clientes"].json.whatsapp}}
- toWhatsapp: true
- message: {{$node["Buscar Número Twilio"].json.payload}}
- options: 
  - body: {{$node["Debug OpenAI"].json.mensagemGerada}}
*/