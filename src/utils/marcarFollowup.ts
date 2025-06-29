import { supabase } from '../lib/supabase';

/**
 * Marca um cliente final para follow-up
 * @param clienteFinalId ID do cliente final
 * @param status Status do follow-up (padrão: 'em aberto')
 * @param observacoes Observações opcionais
 * @returns Resultado da operação
 */
export async function marcarClienteParaFollowup(
  clienteFinalId: number | string,
  status: string = 'em aberto',
  observacoes?: string
) {
  try {
    // Verificar se o cliente existe
    const { data: cliente, error: erroConsulta } = await supabase
      .from('clientes_finais')
      .select('*')
      .eq('id', clienteFinalId)
      .single();

    if (erroConsulta || !cliente) {
      console.error('Cliente não encontrado:', erroConsulta);
      return { success: false, error: 'Cliente não encontrado' };
    }

    // Atualizar o cliente para follow-up
    const { data, error } = await supabase
      .from('clientes_finais')
      .update({
        modo: status,
        observacoes: observacoes || 'Aguardando follow-up'
      })
      .eq('id', clienteFinalId);

    if (error) {
      console.error('Erro ao marcar cliente para follow-up:', error);
      return { success: false, error: 'Erro ao marcar cliente para follow-up' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Erro ao processar follow-up:', error);
    return { success: false, error: 'Erro interno' };
  }
}

/**
 * Verifica clientes que precisam de follow-up hoje
 * @returns Lista de clientes que precisam de follow-up
 */
export async function verificarClientesParaFollowup() {
  try {
    const hoje = new Date();
    
    // Buscar clientes em aberto
    const { data: clientesEmAberto, error: errorClientes } = await supabase
      .from('clientes_finais')
      .select('id, nome, whatsapp, email, cliente_id, observacoes')
      .eq('modo', 'em aberto');

    if (errorClientes || !clientesEmAberto) {
      console.error('Erro ao buscar clientes para follow-up:', errorClientes);
      return { success: false, error: errorClientes };
    }

    // Para cada cliente, buscar a última mensagem
    const clientesParaFollowup = [];
    
    for (const cliente of clientesEmAberto) {
      // Buscar a última mensagem deste cliente
      const { data: ultimaMensagem, error: errorMensagem } = await supabase
        .from('mensagens_enviadas')
        .select('*')
        .eq('cliente_final_id', cliente.id)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();
      
      if (errorMensagem || !ultimaMensagem) continue;
      
      // Calcular diferença em dias
      const dataUltimaMensagem = new Date(ultimaMensagem.timestamp);
      const diffTime = Math.abs(hoje.getTime() - dataUltimaMensagem.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Verificar se está no tempo de follow-up (1, 3 ou 7 dias)
      if (diffDays === 1 || diffDays === 3 || diffDays === 7) {
        clientesParaFollowup.push({
          ...cliente,
          diasDesdeUltimaMensagem: diffDays,
          tipoFollowUp: diffDays === 1 ? 'lembrete_leve' : 
                       diffDays === 3 ? 'reforcar_beneficio' : 'encerramento',
          ultimaMensagem: ultimaMensagem
        });
      }
    }

    return { success: true, data: clientesParaFollowup };
  } catch (error) {
    console.error('Erro ao verificar follow-ups:', error);
    return { success: false, error };
  }
}