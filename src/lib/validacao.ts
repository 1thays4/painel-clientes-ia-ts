/**
 * Funções de validação para o sistema
 */

/**
 * Valida e formata um número de WhatsApp
 * @param numero Número de WhatsApp a ser validado
 * @returns Número formatado ou string vazia se inválido
 */
export function validarWhatsApp(numero: string): string {
  if (!numero) return '';
  
  // Remover todos os caracteres não numéricos
  const apenasDigitos = numero.replace(/\D/g, '');
  
  // Verificar se tem pelo menos 10 dígitos (código de área + número)
  if (apenasDigitos.length < 10) {
    return '';
  }
  
  // Se não começar com código do país, adicionar o código do Brasil (55)
  if (!apenasDigitos.startsWith('55')) {
    return `55${apenasDigitos}`;
  }
  
  return apenasDigitos;
}

/**
 * Formata um número de WhatsApp para exibição
 * @param numero Número de WhatsApp a ser formatado
 * @returns Número formatado para exibição
 */
export function formatarWhatsAppParaExibicao(numero: string): string {
  if (!numero) return 'Não informado';
  
  const numeroLimpo = numero.replace(/\D/g, '');
  
  // Se for um número brasileiro (começando com 55)
  if (numeroLimpo.startsWith('55') && numeroLimpo.length >= 12) {
    // Formato: +55 (XX) XXXXX-XXXX
    const ddd = numeroLimpo.substring(2, 4);
    const parte1 = numeroLimpo.substring(4, 8);
    const parte2 = numeroLimpo.substring(8, numeroLimpo.length);
    return `+55 (${ddd}) ${parte1}-${parte2}`;
  }
  
  // Para outros formatos, apenas adicionar o +
  return `+${numeroLimpo}`;
}

/**
 * Verifica se o cliente está próximo do limite de mensagens
 * @param mensagensUsadas Número de mensagens usadas
 * @param mensagensLimite Limite de mensagens do plano
 * @returns Objeto com status e porcentagem de uso
 */
export function verificarLimiteMensagens(mensagensUsadas: number, mensagensLimite: number): { 
  status: 'ok' | 'alerta' | 'critico', 
  percentual: number,
  mensagem: string
} {
  // Evitar divisão por zero
  if (!mensagensLimite) {
    return {
      status: 'ok',
      percentual: 0,
      mensagem: ''
    };
  }
  
  const percentual = (mensagensUsadas / mensagensLimite) * 100;
  
  if (percentual >= 100) {
    return { 
      status: 'critico', 
      percentual, 
      mensagem: 'Você atingiu o limite de mensagens do seu plano.'
    };
  }
  
  if (percentual >= 80) {
    return { 
      status: 'alerta', 
      percentual, 
      mensagem: `Você está próximo do limite de mensagens (${Math.round(percentual)}%).`
    };
  }
  
  return { 
    status: 'ok', 
    percentual, 
    mensagem: '' 
  };
}