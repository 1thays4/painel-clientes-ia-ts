# Implementação de Envio de Vídeos via WhatsApp

Este documento descreve como implementar a funcionalidade de envio de vídeos via WhatsApp quando solicitado pelo cliente.

## Visão Geral

A implementação consiste em:
1. Um endpoint de API para processar solicitações de vídeo
2. Um fluxo n8n atualizado para detectar quando um cliente solicita um vídeo e enviá-lo

## Arquivos Implementados

1. `src/api/enviar-video-whatsapp.ts` - Endpoint da API para enviar vídeos
2. `n8n-fluxo-com-video.json` - Fluxo n8n atualizado com suporte a vídeos
3. `n8n-enviar-video.js` - Código de referência para implementação no n8n

## Configuração do Endpoint da API

O endpoint da API foi adicionado em:
- `src/api/enviar-video-whatsapp.ts` - Implementação do endpoint
- `src/api/index.ts` - Exportação do endpoint
- `src/server/routes.ts` - Rota para o endpoint

## Configuração do n8n

Para implementar o envio de vídeos no n8n:

1. Importe o arquivo `n8n-fluxo-com-video.json` no seu n8n
   - Ou siga as instruções abaixo para atualizar seu fluxo existente

2. Para atualizar manualmente seu fluxo existente:
   - Adicione um nó "Code" após o nó "Extrair Dados" para detectar solicitações de vídeo
   - Adicione um nó "IF" para verificar se é uma solicitação de vídeo
   - Adicione um fluxo para envio de vídeo quando for uma solicitação de vídeo
   - Mantenha o fluxo existente para mensagens normais

### Código para Detectar Solicitações de Vídeo

```javascript
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
```

## Configuração dos Vídeos

Para configurar os vídeos que serão enviados:

1. Hospede seus vídeos em um servidor acessível publicamente (ex: AWS S3, Google Cloud Storage)
2. Atualize a URL do vídeo no nó "Detectar Vídeo" do n8n
3. Certifique-se de que os vídeos estão em um formato compatível com o WhatsApp (MP4 é recomendado)

## Personalização

Você pode personalizar a detecção de solicitações de vídeo adicionando mais palavras-chave ao array `palavrasChaveVideo`.

Também é possível implementar uma lógica mais avançada para enviar diferentes vídeos com base no contexto da solicitação do cliente.

## Testando

Para testar a funcionalidade:

1. Inicie o servidor da API:
   ```
   npm run start:api
   ```

2. Certifique-se de que o n8n está em execução com o fluxo atualizado

3. Envie uma mensagem para o número do WhatsApp configurado com uma solicitação de vídeo, como "Quero ver o vídeo" ou "Envie o vídeo"

4. O sistema deve detectar a solicitação e enviar o vídeo configurado