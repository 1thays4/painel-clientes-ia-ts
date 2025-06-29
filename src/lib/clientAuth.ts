import { supabase } from './supabase';

/**
 * Configura o cliente Supabase para incluir o token do cliente nos cabeçalhos de todas as requisições
 * @param token Token do cliente
 */
export function setupClientAuth(token: string) {
  // Configurar o cliente Supabase para incluir o token do cliente nos cabeçalhos
  supabase.headers = {
    ...supabase.headers,
    'client-token': token
  };
}

/**
 * Verifica se o cliente tem permissão para acessar os dados
 * @param clienteId ID do cliente
 * @param token Token do cliente
 * @returns Promise<boolean> true se o cliente tem permissão, false caso contrário
 */
export async function verificarPermissao(clienteId: string, token: string): Promise<boolean> {
  try {
    // Verificar se o token corresponde ao cliente
    const { data, error } = await supabase
      .from('clientes')
      .select('id')
      .eq('id', clienteId)
      .eq('token_publico', token)
      .single();
    
    if (error || !data) {
      console.error('Erro ao verificar permissão:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar permissão:', error);
    return false;
  }
}