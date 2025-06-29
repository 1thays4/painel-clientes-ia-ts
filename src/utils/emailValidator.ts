// Lista de domínios de email autorizados
const AUTHORIZED_DOMAINS = [
  'empresa.com',
  'cliente.com',
  // Adicione outros domínios autorizados aqui
];

// Lista de emails específicos autorizados
const AUTHORIZED_EMAILS = [
  'admin@example.com',
  'suporte@example.com',
  'thayscosta66@gmail.com'
  // Adicione outros emails autorizados aqui
];

/**
 * Verifica se um email está autorizado a usar o link mágico
 * @param email Email a ser verificado
 * @returns true se o email estiver autorizado, false caso contrário
 */
export const isAuthorizedEmail = (email: string): boolean => {
  if (!email) return false;
  
  // Verificar se o email está na lista de emails autorizados
  if (AUTHORIZED_EMAILS.includes(email.toLowerCase())) {
    return true;
  }
  
  // Verificar se o domínio do email está na lista de domínios autorizados
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && AUTHORIZED_DOMAINS.includes(domain)) {
    return true;
  }
  
  return false;
};