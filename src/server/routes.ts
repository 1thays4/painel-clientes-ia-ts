import express from 'express';
import { 
  processarMensagemWhatsApp, 
  processarWebhookN8N, 
  registrarMensagemWhatsApp,
  registrarMensagemSimples 
} from '../api';

const router = express.Router();

// Rota para webhook do WhatsApp
router.post('/whatsapp-webhook', processarMensagemWhatsApp);

// Rota para webhook do n8n
router.post('/n8n-webhook', processarWebhookN8N);

// Rota para registrar mensagens
router.post('/registrar-mensagem', registrarMensagemWhatsApp);

// Rota simplificada para registrar mensagens
router.post('/registrar-simples', registrarMensagemSimples);

export default router;