# Configuração de Áudio para WhatsApp IA

## Modificações Necessárias

### 1. Instalar Nós do n8n
```bash
# Instalar nós de IA/LangChain
npm install @n8n/n8n-nodes-langchain
```

### 2. Credenciais Necessárias

#### OpenAI API
- Acesse: https://platform.openai.com/api-keys
- Crie uma chave API
- Configure no n8n: Settings > Credentials > OpenAI

#### Twilio Auth (para baixar áudio)
- Username: Seu Account SID do Twilio
- Password: Seu Auth Token do Twilio

### 3. Fluxo do Áudio

1. **Receber mensagem** → Webhook detecta áudio via `MediaUrl0`
2. **Baixar áudio** → HTTP Request com auth do Twilio
3. **Transcrever** → OpenAI Whisper converte áudio em texto
4. **Processar** → IA processa o texto transcrito
5. **Gerar resposta** → OpenAI TTS converte resposta em áudio
6. **Enviar** → Twilio envia áudio de volta

### 4. Configurações do Twilio

No seu webhook do Twilio, certifique-se que está configurado para receber:
- `MediaUrl0` - URL do arquivo de áudio
- `MediaContentType0` - Tipo do arquivo (audio/ogg, audio/mpeg, etc.)

### 5. Modificações na API

Atualize o endpoint `/api/registrar-mensagem` para incluir:

```typescript
interface RegistrarMensagemRequest {
  // ... campos existentes
  tipoMensagem: 'texto' | 'audio';
}
```

### 6. Vozes Disponíveis (OpenAI TTS)

- `alloy` - Voz neutra
- `echo` - Voz masculina
- `fable` - Voz britânica
- `onyx` - Voz profunda
- `nova` - Voz feminina jovem
- `shimmer` - Voz suave

### 7. Formatos de Áudio Suportados

**Entrada (Whisper):**
- mp3, mp4, mpeg, mpga, m4a, wav, webm

**Saída (TTS):**
- mp3 (padrão)
- opus, aac, flac

### 8. Limitações

- Áudio máximo: 25MB (Whisper)
- Texto máximo: 4096 caracteres (TTS)
- Custo por minuto de áudio processado

### 9. Teste

1. Importe o workflow no n8n
2. Configure as credenciais
3. Ative o workflow
4. Envie um áudio no WhatsApp
5. Verifique se recebe resposta em áudio