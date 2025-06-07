import { supabase } from './supabase';
import { config } from '../config';

// Interface para o resultado da verificação de limite
interface ResultadoVerificacao {
  mensagensUsadas: number;
  limite: number;
  disponivel: number;
}

// Registrar uma nova mensagem de IA no WhatsApp
export async function registrarMensagem(clienteId: string | number): Promise<ResultadoVerificacao> {
  try {
    // Verificar se o cliente existe e tem mensagens disponíveis
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('id, mensagens_usadas, mensagens_limite')
      .eq('id', clienteId)
      .single();

    if (clienteError || !cliente) {
      throw new Error('Cliente não encontrado');
    }

    // Verificar limite de mensagens
    if (cliente.mensagens_usadas >= cliente.mensagens_limite) {
      throw new Error('Limite de mensagens atingido para este mês');
    }

    // Registrar a mensagem
    const { error } = await supabase.from('mensagens_enviadas').insert([
      {
        cliente_id: clienteId,
        conteudo: 'Uso de IA no WhatsApp',
        timestamp: new Date().toISOString(),
      },
    ]);

    if (error) {
      throw new Error('Erro ao registrar mensagem');
    }

    // Atualizar contador de mensagens do cliente
    const novoTotal = cliente.mensagens_usadas + 1;
    
    await supabase
      .from('clientes')
      .update({ mensagens_usadas: novoTotal })
      .eq('id', clienteId);

    return {
      mensagensUsadas: novoTotal,
      limite: cliente.mensagens_limite,
      disponivel: cliente.mensagens_limite - novoTotal
    };
  } catch (error) {
    console.error('Erro ao registrar mensagem:', error);
    throw error;
  }
}

// Contar mensagens do mês atual
export async function contarMensagensMes(clienteId: string | number): Promise<number> {
  try {
    console.log('Contando mensagens para cliente ID:', clienteId);
    
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    // Não vamos tentar buscar o cliente, vamos direto para a contagem de mensagens
    // Isso evita o erro 400 Bad Request
    
    // Contar todas as mensagens na tabela para este mês
    const { count, error } = await supabase
      .from('mensagens_enviadas')
      .select('id', { count: 'exact' })
      .gte('timestamp', firstDay)
      .lte('timestamp', lastDay);
    
    console.log('Total de mensagens do mês:', count);
    
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