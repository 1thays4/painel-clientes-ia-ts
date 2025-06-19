import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { config } from '../config';

interface MensagemRequest {
  whatsappNumero: string;
  pergunta: string;
  resposta: string;
  numeroDestino?: string;
  numeroRemetente?: string;
}

export async function registrarMensagemWhatsApp(req: Request, res: Response) {
  try {
    // Verificar se a configuração da API está completa
    if (!config.IA_API_KEY || config.IA_API_KEY === 'your-openai-api-key-here') {
      console.error('Configuração da API de IA incompleta');
      return res.status(500).json({ error: 'Configuração do sistema incompleta' });
    }

    const { whatsappNumero, pergunta, resposta, numeroRemetente, numeroDestino }: MensagemRequest = req.body;
    
    if (!whatsappNumero || !pergunta || !resposta) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }
    
    // Limpar o número de WhatsApp (remover prefixo "whatsapp:" se existir)
    const numeroLimpo = whatsappNumero.replace('whatsapp:', '');
    
    // Buscar cliente pelo número de WhatsApp
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('id, mensagens_usadas, mensagens_limite')
      .eq('whatsapp', numeroLimpo)
      .single();

    if (clienteError || !cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Formatar números de telefone
    const formatarNumero = (numero?: string): string => {
      if (!numero) return '';
      return numero.replace(/\D/g, '');
    };

    // Registrar a mensagem
    const { error } = await supabase.from('mensagens_enviadas').insert([
      {
        cliente_id: cliente.id,
        pergunta: pergunta,
        resposta: resposta,
        timestamp: new Date().toISOString(),
        numero_remetente: formatarNumero(numeroRemetente || ''),
        numero_destino: formatarNumero(numeroDestino || numeroLimpo)
      },
    ]);

    if (error) {
      console.error('Erro ao registrar mensagem:', error);
      return res.status(500).json({ error: 'Erro ao registrar mensagem' });
    }

    // Atualizar contador de mensagens do cliente
    const novoTotal = cliente.mensagens_usadas + 1;
    
    await supabase
      .from('clientes')
      .update({ mensagens_usadas: novoTotal })
      .eq('id', cliente.id);

    return res.status(200).json({
      success: true,
      mensagens_usadas: novoTotal,
      mensagens_limite: cliente.mensagens_limite,
      disponivel: cliente.mensagens_limite - novoTotal
    });
  } catch (error) {
    console.error('Erro ao registrar mensagem:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}