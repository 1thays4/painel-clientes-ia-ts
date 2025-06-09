import { Request, Response } from 'express';
import { consultarIA } from './consultar-ia';

export async function processarWebhookN8N(req: Request, res: Response) {
  try {
    // Extrair dados da requisição do webhook do n8n
    const { body } = req.body;
    
    if (!body || !body.Body || !body.From) {
      return res.status(400).json({ 
        error: 'Dados incompletos',
        message: 'A requisição não contém os dados necessários do WhatsApp'
      });
    }
    
    // Processar a mensagem usando a função consultarIA
    const resposta = await consultarIA({
      Body: body.Body,
      From: body.From,
      ProfileName: body.ProfileName || '',
      WaId: body.WaId
    });
    
    // Retornar resposta formatada para o n8n
    return res.status(200).json({
      content: resposta.response,
      success: resposta.success,
      mensagens_info: {
        usadas: resposta.mensagens_usadas,
        limite: resposta.mensagens_limite
      }
    });
    
  } catch (error) {
    console.error('Erro ao processar webhook do n8n:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: "Desculpe, ocorreu um erro ao processar sua mensagem."
    });
  }
}