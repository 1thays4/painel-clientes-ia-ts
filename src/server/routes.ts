import express from 'express';
import { 
  processarMensagemWhatsApp, 
  processarWebhookN8N, 
  registrarMensagemWhatsApp,
  registrarMensagemSimples,
  marcarFollowup 
} from '../api';
import axios from 'axios';
import { config } from '../config';

const router = express.Router();

// Rota para webhook do WhatsApp
router.post('/whatsapp-webhook', processarMensagemWhatsApp);

// Rota para webhook do n8n
router.post('/n8n-webhook', processarWebhookN8N);

// Rota para registrar mensagens
router.post('/registrar-mensagem', registrarMensagemWhatsApp);

// Rota simplificada para registrar mensagens
router.post('/registrar-simples', registrarMensagemSimples);

// Rota para marcar cliente para follow-up
router.post('/marcar-followup', marcarFollowup);

// Rota para enviar mensagens para o WhatsApp
router.post('/enviar-whatsapp', async (req, res) => {
  try {
    const { whatsappNumero, pergunta, resposta } = req.body;
    
    if (!whatsappNumero || !resposta) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }
    
    console.log('Enviando mensagem para WhatsApp:', { whatsappNumero, resposta });
    
    try {
      // Usar GET para o webhook do n8n conforme indicado pelo erro
      const response = await axios.get(`${config.N8N_WEBHOOK_URL}`, {
        params: {
          whatsappNumero,
          pergunta: pergunta || 'Resposta manual',
          resposta
        }
      });
      console.log('Resposta do webhook n8n:', response.status);
      
      return res.status(200).json({ success: true });
    } catch (webhookError) {
      console.error('Erro ao enviar para o webhook do n8n:', webhookError);
      
      // Tentar enviar diretamente para a API do WhatsApp
      try {
        // Aqui você pode implementar uma chamada direta para a API do WhatsApp
        // se o webhook do n8n falhar
        
        // Registrar a mensagem no banco de dados
        await registrarMensagemWhatsApp({
          body: {
            whatsappNumero,
            pergunta: pergunta || 'Resposta manual',
            resposta
          }
        } as any, res);
        
        return res.status(200).json({ 
          success: true, 
          message: 'Mensagem registrada no banco de dados' 
        });
      } catch (directError) {
        console.error('Erro ao registrar mensagem:', directError);
        return res.status(500).json({ error: 'Falha ao enviar mensagem' });
      }
    }
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;