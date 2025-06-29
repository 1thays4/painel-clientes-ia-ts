import { processarMensagemWhatsApp } from './whatsapp-webhook';
import { processarWebhookN8N } from './whatsapp-n8n';
import { consultarIA } from './consultar-ia';
import { registrarMensagemWhatsApp } from './registrar-mensagem';
import { registrarMensagemSimples } from './registrar-mensagem-simples';
import marcarFollowup from './marcar-followup';

export {
  processarMensagemWhatsApp,
  processarWebhookN8N,
  consultarIA,
  registrarMensagemWhatsApp,
  registrarMensagemSimples,
  marcarFollowup
};