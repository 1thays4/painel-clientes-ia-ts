import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";
import { supabase } from "../lib/supabase";

interface CadastrarContatoProps {
  open: boolean;
  onClose: () => void;
  clienteId: string | number;
  onContatoCadastrado: () => void;
}

export default function CadastrarContato({
  open,
  onClose,
  clienteId,
  onContatoCadastrado,
}: CadastrarContatoProps) {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [salvando, setSalvando] = useState(false);

  const formatarWhatsApp = (numero: string) => {
    // Remove tudo que não é número
    const apenasNumeros = numero.replace(/\D/g, "");

    // Adiciona +55 se não tiver
    if (apenasNumeros.length >= 10 && !apenasNumeros.startsWith("55")) {
      return `+55${apenasNumeros}`;
    }

    if (apenasNumeros.startsWith("55")) {
      return `+${apenasNumeros}`;
    }

    return apenasNumeros;
  };

  const handleSalvar = async () => {
    if (!nome.trim() || !whatsapp.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    const whatsappFormatado = formatarWhatsApp(whatsapp);

    if (whatsappFormatado.length < 13) {
      toast.error("Número de WhatsApp inválido");
      return;
    }

    setSalvando(true);
    try {
      // Cadastrar cliente final
      const { data: clienteFinal, error: errorClienteFinal } = await supabase
        .from("clientes_finais")
        .insert({
          cliente_id: clienteId,
          nome: nome.trim(),
          whatsapp: whatsappFormatado,
          modo: false, // Iniciar no modo manual
        })
        .select()
        .single();

      if (errorClienteFinal) {
        console.error("Erro ao cadastrar cliente final:", errorClienteFinal);
        toast.error("Erro ao cadastrar contato");
        return;
      }

      // Criar primeira mensagem para iniciar a conversa
      const { error: errorMensagem } = await supabase
        .from("mensagens_enviadas")
        .insert({
          cliente_id: clienteId,
          cliente_final_id: clienteFinal.id,
          pergunta: "Conversa iniciada no modo manual",
          timestamp: new Date().toISOString(),
        });

      if (errorMensagem) {
        console.error("Erro ao criar mensagem inicial:", errorMensagem);
        toast.error("Contato cadastrado, mas erro ao iniciar conversa");
      } else {
        toast.success("Contato cadastrado e conversa iniciada!");
      }

      setNome("");
      setWhatsapp("");
      onClose();
      onContatoCadastrado();
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao cadastrar contato");
    } finally {
      setSalvando(false);
    }
  };

  const handleClose = () => {
    if (!salvando) {
      setNome("");
      setWhatsapp("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Cadastrar Novo Contato</Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Nome do Contato"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            fullWidth
            disabled={salvando}
            placeholder="Digite o nome do contato"
          />

          <TextField
            label="WhatsApp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            fullWidth
            disabled={salvando}
            placeholder="11999999999"
            helperText="Digite apenas números (DDD + número)"
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={salvando}>
          Cancelar
        </Button>
        <Button
          onClick={handleSalvar}
          variant="contained"
          disabled={salvando || !nome.trim() || !whatsapp.trim()}
          sx={{ bgcolor: "#128C7E", "&:hover": { bgcolor: "#075E54" } }}
        >
          {salvando ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Salvando...
            </>
          ) : (
            "Cadastrar e Iniciar Conversa"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
