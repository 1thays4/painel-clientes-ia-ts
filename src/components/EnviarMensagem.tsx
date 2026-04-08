import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { registrarMensagem, verificarLimite } from "../lib/mensagens";
import { toast } from "react-toastify";

interface TestarIAProps {
  clienteId: number;
  limite: number;
  onMensagemEnviada: () => void;
}

export default function TestarIA({
  clienteId,
  limite,
  onMensagemEnviada,
}: TestarIAProps) {
  const [enviando, setEnviando] = useState(false);

  const handleTestar = async () => {
    setEnviando(true);

    try {
      // Verificar se o cliente ainda tem mensagens disponíveis
      await verificarLimite(clienteId, limite);

      // Simular uso da IA no WhatsApp
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Registrar a mensagem enviada
      await registrarMensagem(clienteId);

      toast.success("Teste de IA no WhatsApp realizado com sucesso");

      // Notificar o componente pai para atualizar a contagem
      onMensagemEnviada();
    } catch (error: any) {
      toast.error(error.message || "Limite de mensagens atingido");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Card className="p-4 bg-gray-50">
      <p className="text-sm mb-3">
        Teste o assistente de IA no WhatsApp para ver como funciona. Cada teste
        consumirá uma mensagem do seu plano.
      </p>
      <Button
        onClick={handleTestar}
        disabled={enviando}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {enviando ? "Processando..." : "Testar IA no WhatsApp"}
      </Button>
    </Card>
  );
}
