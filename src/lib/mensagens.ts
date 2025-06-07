// Este arquivo foi substituído por src/services/mensagens.ts
// Mantido apenas para compatibilidade com código existente
import { registrarMensagem as registrar, contarMensagensMes as contar } from '../services/mensagens';

export const registrarMensagem = registrar;
export const contarMensagensMes = contar;

// Verificar se o cliente atingiu o limite de mensagens
export async function verificarLimite(clienteId: number, limite: number) {
  const mensagensUsadas = await contarMensagensMes(clienteId);
  
  if (mensagensUsadas >= limite) {
    throw new Error("Limite de mensagens atingido neste mês.");
  }
  
  return {
    mensagensUsadas,
    limite,
    disponivel: limite - mensagensUsadas
  };
}