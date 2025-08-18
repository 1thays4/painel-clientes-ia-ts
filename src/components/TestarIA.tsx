import { useState } from "react";
import { registrarMensagem } from "../services/mensagens";
import { toast } from "react-toastify";
import { Button, Card, CardContent, Typography, Box, useTheme } from "@mui/material";

interface TestarIAProps {
  clienteId: number;
  limite: number;
  onMensagemEnviada: () => void;
}

export default function TestarIA({ clienteId, limite, onMensagemEnviada }: TestarIAProps) {
  const theme = useTheme();
  const [enviando, setEnviando] = useState(false);

  const handleTestar = async () => {
    setEnviando(true);

    try {
      // Registrar a mensagem e verificar limite
      const resultado = await registrarMensagem(clienteId);
      
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
    <Card variant="outlined" sx={{ bgcolor: theme.palette.background.default }}>
      <CardContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Teste o assistente de IA no WhatsApp para ver como funciona. 
          Cada teste consumirá uma mensagem do seu plano.
        </Typography>
        <Button 
          onClick={handleTestar}
          disabled={enviando}
          variant="contained" 
          color="success"
          fullWidth
        >
          {enviando ? "Processando..." : "Testar IA no WhatsApp"}
        </Button>
      </CardContent>
    </Card>
  );
}