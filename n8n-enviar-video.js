// Código para adicionar ao n8n para enviar vídeos via WhatsApp
// Este código deve ser adicionado como um nó "Code" após o nó "Extrair Dados"

// Detectar solicitações de vídeo
function detectarSolicitacaoVideo(mensagem) {
  // Converter para minúsculas para facilitar a comparação
  const mensagemLower = mensagem.toLowerCase();
  
  // Palavras-chave que indicam solicitação de vídeo
  const palavrasChaveVideo = [
    'envie o vídeo', 'enviar vídeo', 'quero ver o vídeo', 
    'manda o vídeo', 'mandar vídeo', 'envie um vídeo',
    'enviar um vídeo', 'me manda o vídeo', 'me envie o vídeo',
    'video', 'vídeo'
  ];
  
  // Verificar se alguma palavra-chave está presente na mensagem
  return palavrasChaveVideo.some(keyword => mensagemLower.includes(keyword));
}

// Código para o nó "Code" no n8n
// Adicione este código em um novo nó "Code" após o nó "Extrair Dados"
const message = $input.first().json.message || '';
const from = $input.first().json.from || '';
const waId = $input.first().json.waId || '';

// Verificar se é uma solicitação de vídeo
const isSolicitacaoVideo = detectarSolicitacaoVideo(message);

if (isSolicitacaoVideo) {
  // URL do vídeo a ser enviado
  const videoUrl = 'https://sua-url-de-video.mp4'; // Substitua pela URL real do vídeo
  
  // Preparar dados para envio de vídeo
  return [{
    json: {
      solicitacaoVideo: true,
      videoUrl: videoUrl,
      waId: waId,
      from: from,
      message: message
    }
  }];
} else {
  // Continuar com o fluxo normal para mensagens de texto
  return [{
    json: {
      ...$input.first().json,
      solicitacaoVideo: false
    }
  }];
}

// Adicione um nó "IF" após este nó "Code" para verificar se solicitacaoVideo é true
// Se for true, envie para o fluxo de envio de vídeo
// Se for false, continue com o fluxo normal de processamento de mensagens

// Para o fluxo de envio de vídeo, adicione um nó "HTTP Request" com estas configurações:
/*
Método: POST
URL: http://localhost:3001/api/enviar-video-whatsapp (ajuste conforme seu ambiente)
Corpo: JSON
{
  "whatsappNumero": "{{$node["Detectar Vídeo"].json.waId}}",
  "videoUrl": "{{$node["Detectar Vídeo"].json.videoUrl}}",
  "mensagem": "Aqui está o vídeo que você solicitou!"
}
*/

// Após o nó HTTP Request, adicione um nó Twilio para enviar o vídeo:
/*
Account: Sua conta Twilio
Operation: Send Message
From: {{$node["HTTP Request"].json.dados.numeroRemetente}}
To: {{$node["HTTP Request"].json.dados.numeroDestino}}
Message: {{$node["HTTP Request"].json.dados.mensagem}}
Media URL: {{$node["HTTP Request"].json.dados.videoUrl}}
*/