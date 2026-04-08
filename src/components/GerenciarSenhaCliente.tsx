import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { Key as KeyIcon } from "@mui/icons-material";

interface GerenciarSenhaClienteProps {
  clienteId: string;
  open: boolean;
  onClose: () => void;
}

export default function GerenciarSenhaCliente({
  clienteId,
  open,
  onClose,
}: GerenciarSenhaClienteProps) {
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleSalvarSenha = async () => {
    // Validar senha
    if (!senha) {
      setErro("A senha não pode estar vazia");
      return;
    }

    if (senha !== confirmacaoSenha) {
      setErro("As senhas não coincidem");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      // Atualizar a senha do cliente
      const { error } = await supabase
        .from("clientes")
        .update({ senha_acesso: senha })
        .eq("id", clienteId);

      if (error) {
        throw error;
      }

      toast.success("Senha atualizada com sucesso");
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      setErro("Ocorreu um erro ao atualizar a senha");
    } finally {
      setLoading(false);
    }
  };

  const gerarSenhaAleatoria = () => {
    // Gerar senha aleatória de 6 dígitos
    const novaSenha = Math.floor(100000 + Math.random() * 900000).toString();
    setSenha(novaSenha);
    setConfirmacaoSenha(novaSenha);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Gerenciar Senha de Acesso</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2, mt: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Esta senha será usada pelo cliente para acessar seu painel. Informe
            ao cliente esta senha.
          </Typography>
        </Box>

        {erro && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {erro}
          </Typography>
        )}

        <TextField
          label="Nova senha"
          type="text"
          fullWidth
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          margin="normal"
          variant="outlined"
        />

        <TextField
          label="Confirmar senha"
          type="text"
          fullWidth
          value={confirmacaoSenha}
          onChange={(e) => setConfirmacaoSenha(e.target.value)}
          margin="normal"
          variant="outlined"
        />

        <Button
          variant="outlined"
          color="primary"
          onClick={gerarSenhaAleatoria}
          startIcon={<KeyIcon />}
          sx={{ mt: 2 }}
        >
          Gerar Senha Aleatória
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSalvarSenha}
          color="primary"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Salvando..." : "Salvar Senha"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
