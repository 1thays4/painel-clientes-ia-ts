import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function marcarFollowup(req: Request, res: Response) {
  try {
    const { clienteFinalId, status, observacoes } = req.body;

    if (!clienteFinalId) {
      return res.status(400).json({ error: 'ID do cliente final é obrigatório' });
    }

    // Status padrão é "em aberto" se não for fornecido
    const statusFollowup = status || 'em aberto';
    
    // Atualizar o cliente final com o status para follow-up
    const { data, error } = await supabase
      .from('clientes_finais')
      .update({ 
        modo: statusFollowup,
        observacoes: observacoes || 'Aguardando follow-up'
      })
      .eq('id', clienteFinalId);

    if (error) {
      console.error('Erro ao marcar cliente para follow-up:', error);
      return res.status(500).json({ error: 'Erro ao marcar cliente para follow-up' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Cliente marcado para follow-up',
      data
    });
  } catch (error) {
    console.error('Erro ao processar requisição de follow-up:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}