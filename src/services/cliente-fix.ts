// Função para corrigir o problema com clientes finais
export function fixClienteFinal(
  msg: any,
  whatsappCliente: string,
): {
  whatsapp_cliente_final: string;
  nome_cliente_final: string;
} {
  // Se o número de destino estiver disponível, usá-lo como número do cliente final
  if (msg.numero_destino) {
    return {
      whatsapp_cliente_final: msg.numero_destino,
      nome_cliente_final: "Cliente",
    };
  }

  // Se o número de remetente estiver disponível e for diferente do número da empresa
  if (msg.numero_remetente && msg.numero_remetente !== whatsappCliente) {
    return {
      whatsapp_cliente_final: msg.numero_remetente,
      nome_cliente_final: "Cliente",
    };
  }

  // Caso contrário, usar o número do cliente final se disponível
  return {
    whatsapp_cliente_final: msg.whatsapp_cliente_final || "",
    nome_cliente_final: msg.nome_cliente_final || "Cliente",
  };
}
