import React from "react";
import { Mensagem } from "../services/cliente";

interface ClienteInfoProps {
  mensagem: Mensagem;
}

export default function ClienteInfo({ mensagem }: ClienteInfoProps) {
  // Determinar qual número mostrar para o cliente final
  const getNumeroClienteFinal = (): string => {
    // Prioridade 1: numero_destino se não for igual ao whatsapp_cliente
    if (
      mensagem.numero_destino &&
      mensagem.numero_destino !== mensagem.whatsapp_cliente
    ) {
      return mensagem.numero_destino;
    }

    // Prioridade 2: numero_remetente se não for igual ao whatsapp_cliente
    if (
      mensagem.numero_remetente &&
      mensagem.numero_remetente !== mensagem.whatsapp_cliente
    ) {
      return mensagem.numero_remetente;
    }

    // Prioridade 3: whatsapp_cliente_final
    if (mensagem.whatsapp_cliente_final) {
      return mensagem.whatsapp_cliente_final;
    }

    return "";
  };

  const numeroClienteFinal = getNumeroClienteFinal();

  return (
    <div className="mb-3 pb-2 border-b border-gray-200">
      {/* Informações da empresa */}
      {mensagem.nome_cliente && (
        <div className="mb-2">
          <h4 className="font-medium text-blue-600">
            Empresa: {mensagem.nome_cliente}
          </h4>
        </div>
      )}

      {/* Informações do cliente final */}
      <div>
        <h4 className="font-medium text-green-600">Cliente</h4>
        {numeroClienteFinal && (
          <p className="text-sm text-gray-600">
            WhatsApp: {numeroClienteFinal}
          </p>
        )}
      </div>
    </div>
  );
}
