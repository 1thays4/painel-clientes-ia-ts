import { supabase } from '../lib/supabase';

export interface ClienteFinal {
  id: string | number;
  cliente_id: string | number;
  nome: string;
  whatsapp: string;
  modo: boolean;
  created_at?: string;
  updated_at?: string;
}

export const buscarClienteFinalPorId = async (id: string | number): Promise<ClienteFinal | null> => {
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

    return {
      ...data,
      modo: data.modo === true || data.modo === 'true'
    };
  } catch (error) {
    console.error('Erro ao buscar cliente final:', error);
    return null;
  }
};

export const buscarClientesFinais = async (clienteId: string | number): Promise<ClienteFinal[]> => {
  try {
    const { data, error } = await supabase
      .from('clientes_finais')
      .select('*')
      .eq('cliente_id', clienteId);

    if (error) {
      console.error('Erro ao buscar clientes finais:', error);
      return [];
    }

    return data.map((item: any) => ({
      ...item,
      modo: item.modo === true || item.modo === 'true'
    }));
  } catch (error) {
    console.error('Erro ao buscar clientes finais:', error);
    return [];
  }
};

export const atualizarModoBotClienteFinal = async (
  clienteFinalId: string | number, 
  novoModo: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('clientes_finais')
      .update({ modo: novoModo })
      .eq('id', clienteFinalId);

    if (error) {
      console.error('Erro ao atualizar modo bot:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao atualizar modo bot:', error);
    return false;
  }
};

export const atualizarModoBotTodosClientesFinais = async (
  clienteId: string | number,
  novoModo: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('clientes_finais')
      .update({ modo: novoModo })
      .eq('cliente_id', clienteId);

    if (error) {
      console.error('Erro ao atualizar modo bot para todos os clientes finais:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao atualizar modo bot para todos os clientes finais:', error);
    return false;
  }
};

export const cadastrarClienteFinal = async (
  clienteId: string | number,
  nome: string,
  whatsapp: string,
  modo: boolean = false
): Promise<ClienteFinal | null> => {
  try {
    const { data, error } = await supabase
      .from('clientes_finais')
      .insert({
        cliente_id: clienteId,
        nome: nome.trim(),
        whatsapp: whatsapp,
        modo: modo
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao cadastrar cliente final:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao cadastrar cliente final:', error);
    return null;
  }
};