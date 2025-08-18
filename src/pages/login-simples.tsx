import { useState } from "react";
import { supabase } from "../lib/supabase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Container, 
  Paper, 
  Link,
  useTheme 
} from "@mui/material";

export default function LoginSimples() {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert("Por favor, preencha todos os campos");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Tentando login simples com:', email);
      
      // Login direto com Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('Resposta do login simples:', { data, error });
      
      if (error) {
        console.error('Erro de login:', error);
        alert("Falha no login: " + (error.message || 'Credenciais inválidas'));
      } else if (data && data.user) {
        console.log('Login bem-sucedido:', data.user);
        alert("Login realizado com sucesso!");
        
        // Forçar redirecionamento imediato
        window.location.replace('/');
      } else {
        console.error('Login sem erro, mas sem usuário retornado');
        alert("Erro desconhecido no login");
      }
    } catch (error: any) {
      console.error('Erro durante o login:', error);
      alert("Ocorreu um erro durante o login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        py: 4
      }}>
        <Paper sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Login Simples
          </Typography>
          
          <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              fullWidth
              margin="normal"
            />
            
            <TextField
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              fullWidth
              margin="normal"
            />
            
            <Button 
              type="submit" 
              disabled={loading}
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 3 }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </Box>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Link href="/login" underline="hover">
              Voltar para o login normal
            </Link>
          </Box>
        </Paper>
      </Box>
      <ToastContainer position="top-right" autoClose={3000} />
    </Container>
  );
}