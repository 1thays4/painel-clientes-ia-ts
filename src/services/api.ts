import axios from 'axios';

// Criar uma instância do axios com a URL base
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:3000/api'
});

// Função para buscar cliente por WhatsApp
export async function buscarClientePorWhatsApp(whatsapp: string) {
  try {
    const response = await api.get(`/cliente/whatsapp?whatsapp=${whatsapp}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar cliente por WhatsApp:', error);
    throw error;
  }
}

// Função para registrar mensagem
export async function registrarMensagem(dados: {
  whatsappNumero: string;
  pergunta: string;
  resposta: string;
  numeroDestino?: string;
  numeroRemetente?: string;
}) {
  try {
    const response = await api.post('/registrar-mensagem', dados);
    return response.data;
  } catch (error) {
    console.error('Erro ao registrar mensagem:', error);
    throw error;
  }
}

// Função para processar webhook do WhatsApp
export async function processarWebhookWhatsApp(dados: {
  message: string;
  sender: string;
  cliente_id: string | number;
  recipient?: string;
}) {
  try {
    const response = await api.post('/webhook/whatsapp', dados);
    return response.data;
  } catch (error) {
    console.error('Erro ao processar webhook do WhatsApp:', error);
    throw error;
  }
}

export default api;