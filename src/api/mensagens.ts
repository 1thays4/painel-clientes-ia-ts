import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

export async function registrarMensagem(req: Request, res: Response) {
  const { cliente_id, conteudo } = req.body;

  if (!cliente_id) {
    return res.status(400).json({ error: 'cliente_id é obrigatório' });
  }

  try {
    // Verificar se o cliente existe e tem mensagens disponíveis
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('id, mensagens_usadas, mensagens_limite')
      .eq('id', cliente_id)
      .single();

    if (clienteError || !cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Verificar limite de mensagens
    if (cliente.mensagens_usadas >= cliente.mensagens_limite) {
      return res.status(403).json({ error: 'Limite de mensagens atingido para este mês' });
    }

    // Registrar a mensagem
    const { error } = await supabase.from('mensagens_enviadas').insert([
      {
        cliente_id,
        conteudo: conteudo || 'Uso de IA no WhatsApp',
        timestamp: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('Erro ao registrar mensagem:', error);
      return res.status(500).json({ error: 'Erro ao registrar mensagem' });
    }

    // Atualizar contador de mensagens do cliente
    await supabase
      .from('clientes')
      .update({ mensagens_usadas: cliente.mensagens_usadas + 1 })
      .eq('id', cliente_id);

    return res.status(200).json({ 
      success: true,
      mensagens_usadas: cliente.mensagens_usadas + 1,
      mensagens_limite: cliente.mensagens_limite
    });
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
