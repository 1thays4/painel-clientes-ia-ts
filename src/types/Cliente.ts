/**
 * Interface para o cliente
 */
export interface Cliente {
  id: string | number;
  nome: string;
  plano: string;
  whatsapp?: string;
  email?: string;
  data_cadastro: string;
  status_pagamento: "em_dia" | "pendente";
  mensagens_usadas: number;
  mensagens_limite: number;
  token_publico?: string;
  user_id?: string;
  senha_acesso?: string;
}