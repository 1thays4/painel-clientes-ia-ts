import { supabase } from '../lib/supabase';

/**
 * Autentica o cliente usando seu token e ID
 * @param token Token do cliente
 * @param clienteId ID do cliente
 * @returns Promise<boolean> true se autenticado com sucesso
 */
export async function autenticarCliente(token: string, clienteId: string | number): Promise<boolean> {
  try {
    // Verificar se o token corresponde ao cliente
    const { data, error } = await supabase
      .from('clientes')
      .select('id')
      .eq('id', clienteId)
      .eq('token_publico', token)
      .single();
    
    if (error || !data) {
      console.error('Erro ao verificar cliente:', error);
      return false;
    }
    
    // Definir cabeçalhos personalizados para todas as requisições futuras
    supabase.headers = {
      ...supabase.headers,
      'client-token': token,
      'client-id': clienteId.toString()
    };
    
    return true;
  } catch (error) {
    console.error('Erro ao autenticar cliente:', error);
    return false;
  }
}