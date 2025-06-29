import { supabase } from './supabase';
import { getClientToken } from './tokenManager';

/**
 * Configura os cabeçalhos de autenticação para as requisições ao Supabase
 * @returns O token do cliente ou null se não estiver autenticado
 */
export function setupAuthHeaders(): string | null {
  const clientToken = getClientToken();
  
  if (clientToken) {
    // Configurar o token do cliente nos cabeçalhos
    supabase.headers = {
      ...supabase.headers,
      'client-token': clientToken
    };
    
    return clientToken;
  }
  
  return null;
}