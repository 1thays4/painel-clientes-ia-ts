import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

interface MensagemRequest {
  whatsappNumero: string;
  pergunta: string;
  resposta: string;
}

export async function registrarMensagemWhatsApp(req: Request, res: Response) {
  try {
    const { whatsappNumero, pergunta, resposta }: MensagemRequest = req.body;
    
    if (!whatsappNumero || !pergunta || !resposta) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }
    
    // Buscar cliente pelo número de WhatsApp
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('id, mensagens_usadas, mensagens_limite')
      .eq('whatsapp', whatsappNumero)
      .single();

    if (clienteError || !cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Registrar a mensagem
    const { error } = await supabase.from('mensagens_enviadas').insert([
      {
        cliente_id: cliente.id,
        pergunta: pergunta,
        resposta: resposta,
        timestamp: new Date().toISOString(),
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