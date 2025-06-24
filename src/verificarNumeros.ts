/**
 * Script para verificar se os números de cliente estão sendo exibidos corretamente
 */

import { Mensagem } from './services/cliente';

/**
 * Determina o número do cliente final com base em uma lógica de prioridade
 */
function getNumeroClienteFinal(msg: any): string {
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

// Exemplo de mensagem
const mensagemExemplo = {
  id: 1,
  cliente_id: 'cliente-123',
  pergunta: 'Como posso usar a IA?',
  resposta: 'Você pode usar a IA enviando uma mensagem com o prefixo IA:',
  timestamp: new Date().toISOString(),
  nome_cliente: 'Empresa ABC',
  whatsapp_cliente: '5511999999999',
  cliente_final_id: 456,
  nome_cliente_final: 'João Silva',
  whatsapp_cliente_final: '5511988888888',
  numero_remetente: '5511977777777',
  numero_destino: '5511966666666'
};

// Verificar qual número será exibido
console.log('Número do cliente final:', getNumeroClienteFinal(mensagemExemplo));

// Caso 1: Quando numero_destino é igual ao whatsapp_cliente
const caso1 = {
  ...mensagemExemplo,
  numero_destino: '5511999999999', // Igual ao whatsapp_cliente
};
console.log('Caso 1 (numero_destino = whatsapp_cliente):', getNumeroClienteFinal(caso1));

// Caso 2: Quando numero_remetente é igual ao whatsapp_cliente
const caso2 = {
  ...mensagemExemplo,
  numero_destino: '', // Sem numero_destino
  numero_remetente: '5511999999999', // Igual ao whatsapp_cliente
};
console.log('Caso 2 (numero_remetente = whatsapp_cliente):', getNumeroClienteFinal(caso2));

// Caso 3: Sem numero_destino e numero_remetente
const caso3 = {
  ...mensagemExemplo,
  numero_destino: '',
  numero_remetente: '',
};
console.log('Caso 3 (sem numero_destino e numero_remetente):', getNumeroClienteFinal(caso3));

// Caso 4: Sem nenhum número
const caso4 = {
  ...mensagemExemplo,
  whatsapp_cliente: '',
  whatsapp_cliente_final: '',
  numero_destino: '',
  numero_remetente: '',
};
console.log('Caso 4 (sem nenhum número):', getNumeroClienteFinal(caso4));