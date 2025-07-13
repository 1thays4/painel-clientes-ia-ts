import { supabase } from '../lib/supabase';
import { config } from '../config';
import { setupAuthHeaders } from '../lib/authHeaders';
import api from './api';

// Interface para o resultado da verificação de limite
interface ResultadoVerificacao {
  mensagensUsadas: number;
  limite: number;
  disponivel: number;
}

// Registrar uma nova mensagem de IA no WhatsApp
export async function registrarMensagem(
  clienteId: string | number, 
  pergunta?: string,
  numeroRemetente?: string,
  numeroDestino?: string
): Promise<ResultadoVerificacao> {
  try {
    // Buscar o cliente para obter o número de WhatsApp
    const { data: cliente } = await supabase
      .from('clientes')
      .select('whatsapp')
      .eq('id', clienteId)
      .single();

    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }

    // Usar a nova API route para registrar a mensagem
    const response = await api.post('/registrar-mensagem', {
      whatsappNumero: cliente.whatsapp,
      pergunta: pergunta || 'Uso de IA no WhatsApp',
      resposta: 'Resposta da IA',
      numeroRemetente,
      numeroDestino
    });

    return {
      mensagensUsadas: response.data.mensagens_usadas,
      limite: response.data.mensagens_limite,
      disponivel: response.data.disponivel
    };
  } catch (error) {
    console.error('Erro ao registrar mensagem:', error);
    throw error;
  }
}

// Contar mensagens do mês atual
export async function contarMensagensMes(clienteId: string | number): Promise<number> {
  // Configurar o token do cliente nos cabeçalhos
  setupAuthHeaders();
  try {
    console.log('Contando mensagens para cliente ID:', clienteId);
    
    // Se for um cliente de demonstração, retornar um valor fixo
    if (typeof clienteId === 'string' && clienteId.startsWith('demo-')) {
      return 5; // Valor fixo para demonstração
    }
    
    const now = new Date();
    // Definir hora para 00:00:00 para o primeiro dia e 23:59:59 para o último dia
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0).toISOString();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    // Contar mensagens pelo cliente_id
    const { count, error } = await supabase
      .from('mensagens_enviadas')
      .select('id', { count: 'exact' })
      .eq('cliente_id', clienteId)
      .gte('timestamp', firstDay)
      .lte('timestamp', lastDay);
    
    console.log('Mensagens do cliente neste mês:', count);
    
    if (error) {
      console.error('Erro ao contar mensagens:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Erro ao contar mensagens:', error);
    return 0;
  }
}

// Responder manualmente a uma mensagem
export async function responderManualmente(
  mensagemId: string | number,
  resposta: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('mensagens_enviadas')
      .update({ resposta_humana: resposta })
      .eq('id', mensagemId);
    
    if (error) {
      console.error('Erro ao responder mensagem:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao responder mensagem:', error);
    return false;
  }
}

// Buscar mensagens pendentes de resposta humana
export async function buscarMensagensPendentes(clienteId?: string | number): Promise<any[]> {
  try {
    let query = supabase
      .from('mensagens_enviadas')
      .select('*')
      .is('resposta_humana', null)
      .order('timestamp', { ascending: false });
    
    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar mensagens pendentes:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar mensagens pendentes:', error);
    return [];
  }
}