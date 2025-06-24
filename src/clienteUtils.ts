import { Mensagem } from './services/cliente';

/**
 * Determina o número do cliente final com base em uma lógica de prioridade
 * @param msg A mensagem contendo os dados do cliente
 * @returns O número do cliente final
 */
export function getNumeroClienteFinal(msg: Mensagem): string {
  // Prioridade 1: numero_destino se não for igual ao whatsapp_cliente
  if (msg.numero_destino && msg.numero_destino !== msg.whatsapp_cliente) {
    return msg.numero_destino;
  }
  
  // Prioridade 2: numero_remetente se não for igual ao whatsapp_cliente
  if (msg.numero_remetente && msg.numero_remetente !== msg.whatsapp_cliente) {
    return msg.numero_remetente;
  }
  
  // Prioridade 3: whatsapp_cliente_final
  if (msg.whatsapp_cliente_final) {
    return msg.whatsapp_cliente_final;
  }
  
  return '';
}

/**
 * Formata um número de telefone para o formato internacional
 * @param numero O número de telefone a ser formatado
 * @returns O número formatado no padrão internacional
 */
export function formatarNumeroInternacional(numero: string): string {
  if (!numero) return '';
  
  // Remover qualquer caractere não numérico
  const apenasDigitos = numero.replace(/\D/g, '');
  
  // Adicionar o prefixo + se não existir
  return apenasDigitos.startsWith('55') ? `+${apenasDigitos}` : `+55${apenasDigitos}`;
}