import { useState } from "react";
import { supabase } from "../lib/supabase";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Container, 
  Paper, 
  Alert, 
  Link,
  useTheme 
} from "@mui/material";

export default function LoginDireto() {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setMessage("Por favor, preencha todos os campos");
      return;
    }
    
    setLoading(true);
    setMessage("Tentando login...");
    
    try {
      console.log('Tentando login direto com:', email);
      
      // Login direto com Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('Resposta do login direto:', { data, error });
      
      if (error) {
        console.error('Erro de login:', error);
        setMessage("Falha no login: " + (error.message || 'Credenciais inválidas'));
      } else if (data && data.user) {
        console.log('Login bem-sucedido:', data.user);
        setMessage("Login realizado com sucesso! Redirecionando...");
        
        // Marcar como autenticado no sessionStorage para evitar loops
        sessionStorage.setItem('autenticado', 'true');
        sessionStorage.setItem('lastRedirect', '/');
        
        // Redirecionar para a página inicial com o painel-clientes-ia
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        console.error('Login sem erro, mas sem usuário retornado');
        setMessage("Erro desconhecido no login");
      }
    } catch (error: any) {
      console.error('Erro durante o login:', error);
      setMessage("Ocorreu um erro durante o login: " + (error?.message || "Erro desconhecido"));
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
            Login Direto
          </Typography>
          
          {message && (
            <Alert 
              severity={message.includes('sucesso') ? "success" : "error"}
              sx={{ mb: 3 }}
            >
              {message}
            </Alert>
          )}
          
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
    </Container>
  );
}