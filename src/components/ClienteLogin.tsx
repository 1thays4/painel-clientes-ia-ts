import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { supabase } from "../lib/supabase";
import "react-toastify/dist/ReactToastify.css";

// Material UI imports
import {
  Box,
  Container,
  Paper,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { Lock } from '@mui/icons-material';

export default function ClienteLogin() {
  const { token } = useParams<{ token: string }>();
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!senha) {
      toast.error("Por favor, informe a senha");
      return;
    }
    
    setLoading(true);
    
    try {
      // Verificar se o token é válido e a senha está correta
      const { data, error } = await supabase
        .from('clientes')
        .select('id, senha_acesso')
        .eq('token_publico', token)
        .single();
      
      if (error || !data) {
        setErro("Cliente não encontrado. Verifique se o link está correto.");
        setLoading(false);
        return;
      }
      
      // Verificar se a senha está correta
      if (data.senha_acesso !== senha) {
        toast.error("Senha incorreta");
        setLoading(false);
        return;
      }
      
      // Armazenar o token de acesso na sessão
      if (token) {
        sessionStorage.setItem('clienteToken', token);
      }
      sessionStorage.setItem('clienteId', data.id);
      
      // Redirecionar para o painel do cliente
      navigate(`/cliente/${token}`);
      
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast.error("Ocorreu um erro ao fazer login");
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 2
    }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ borderRadius: 3 }}>
          <Card sx={{ width: '100%' }}>
            <CardContent sx={{ pt: 4, pb: 4 }}>
              <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Acesso ao Painel do Cliente
              </Typography>
              
              {erro && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {erro}
                </Alert>
              )}
              
              <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  type="password"
                  label="Senha de acesso"
                  variant="outlined"
                  fullWidth
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  autoFocus
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{ mt: 1 }}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Lock />}
                >
                  {loading ? "Entrando..." : "Acessar Painel"}
                </Button>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                  Digite a senha fornecida pela empresa para acessar seu painel.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Paper>
      </Container>
    </Box>
  );
}