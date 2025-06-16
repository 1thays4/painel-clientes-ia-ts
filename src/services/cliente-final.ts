import { supabase } from './supabase';

// Interface para o cliente final
export interface ClienteFinal {
  id: number;
  nome: string;
  whatsapp?: string;
  email?: string;
  cliente_id: string; // UUID da empresa
  data_cadastro: string;
  observacoes?: string;
}

// Buscar clientes finais por empresa
export async function buscarClientesFinaisPorEmpresa(empresaId: string): Promise<ClienteFinal[]> {
  try {
    const { data, error } = await supabase
      .from('clientes_finais')
      .select('*')
      .eq('cliente_id', empresaId)
      .order('nome');
    
    if (error) {
      console.error('Erro ao buscar clientes finais:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar clientes finais:', error);
    return [];
  }
}

// Criar um novo cliente final
export async function criarClienteFinal(
  clienteFinalData: {
    nome: string;
    whatsapp?: string;
    email?: string;
    cliente_id: string;
    observacoes?: string;
  }
): Promise<ClienteFinal | null> {
  try {
    const { data, error } = await supabase
      .from('clientes_finais')
      .insert([{
        ...clienteFinalData,
        data_cadastro: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar cliente final:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao criar cliente final:', error);
    return null;
  }
}

// Atualizar dados do cliente final
export async function atualizarClienteFinal(
  id: number,
  dados: {
    nome?: string;
    whatsapp?: string;
    email?: string;
    observacoes?: string;
  }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('clientes_finais')
      .update(dados)
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao atualizar cliente final:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar cliente final:', error);
    return false;
  }
}

// Buscar cliente final por ID
export async function buscarClienteFinalPorId(id: number): Promise<ClienteFinal | null> {
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
    console.error('Erro ao buscar cliente final:', error);
    return null;
  }
}