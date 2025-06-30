import { supabase } from '../lib/supabase';

/**
 * Função para resetar o contador de mensagens usadas no início de cada mês
 * Esta função deve ser executada por um cron job no primeiro dia de cada mês
 */
export async function resetarMensagensUsadas(): Promise<{ success: boolean; count: number }> {
  try {
    // Resetar o contador de mensagens usadas para todos os clientes
    const { data, error, count } = await supabase
      .from('clientes')
      .update({ mensagens_usadas: 0 })
      .neq('mensagens_usadas', 0);
    
    if (error) {
      console.error('Erro ao resetar mensagens usadas:', error);
      return { success: false, count: 0 };
    }
    
    console.log(`Resetado contador de mensagens para ${count} clientes`);
    return { success: true, count: count || 0 };
  } catch (error) {
    console.error('Erro ao resetar mensagens usadas:', error);
    return { success: false, count: 0 };
  }
}

/**
 * Função para atualizar o status de pagamento dos clientes
 * Esta função deve ser executada após verificação de pagamentos
 */
export async function atualizarStatusPagamento(
  clienteId: string | number, 
  status: 'em_dia' | 'pendente'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('clientes')
      .update({ status_pagamento: status })
      .eq('id', clienteId);
    
    if (error) {
      console.error('Erro ao atualizar status de pagamento:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar status de pagamento:', error);
    return false;
  }
}