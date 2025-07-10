import { supabase } from '../lib/supabase';

interface ClienteFinal {
  id: string | number;
  nome: string;
  whatsapp?: string;
  email?: string;
  cliente_id: string | number;
  data_cadastro: string;
  observacoes?: string;
  modo: boolean;
}

// Buscar cliente final pelo ID
export async function buscarClienteFinalPorId(id: string | number): Promise<ClienteFinal | null> {
  try {
    const { data, error } = await supabase
      .from('clientes_finais')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Erro ao buscar cliente final:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erro:', error);
    return null;
  }
}

// Buscar cliente final pelo número de WhatsApp
export async function buscarClienteFinalPorWhatsApp(
  clienteId: string | number,
  whatsapp: string
): Promise<ClienteFinal | null> {
  try {
    const { data, error } = await supabase
      .from('clientes_finais')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('whatsapp', whatsapp)
      .single();
    
    if (error) {
      console.error('Erro ao buscar cliente final por WhatsApp:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erro:', error);
    return null;
  }
}

// Atualizar modo bot para um cliente final
export async function atualizarModoBotClienteFinal(
  clienteFinalId: string | number,
  modoBotAtivo: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('clientes_finais')
      .update({ modo: modoBotAtivo })
      .eq('id', clienteFinalId);
    
    if (error) {
      console.error('Erro ao atualizar modo bot:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro:', error);
    return false;
  }
}

// Atualizar modo bot para todos os clientes finais de um cliente
export async function atualizarModoBotTodosClientesFinais(
  clienteId: string | number,
  modoBotAtivo: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('clientes_finais')
      .update({ modo: modoBotAtivo })
      .eq('cliente_id', clienteId);
    
    if (error) {
      console.error('Erro ao atualizar modo bot para todos os clientes finais:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro:', error);
    return false;
  }
}

// Buscar todos os clientes finais de um cliente
export async function buscarClientesFinais(clienteId: string | number): Promise<ClienteFinal[]> {
  try {
    const { data, error } = await supabase
      .from('clientes_finais')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('nome');
    
    if (error) {
      console.error('Erro ao buscar clientes finais:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro:', error);
    return [];
  }
}