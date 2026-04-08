import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";

// Material UI imports
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Container,
  Paper,
  CircularProgress,
} from "@mui/material";

// URL e chave do Supabase hardcoded para garantir funcionamento
const supabaseUrl = "https://sqcedymaeazvrrgrokpv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxY2VkeW1hZWF6dnJyZ3Jva3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5OTc3NTUsImV4cCI6MjA2NDU3Mzc1NX0.D65rBFBiVE1F9mVI15QgJeDepEhQtPj3eS2kXxRCfB8";

export default function LoginAlternativo() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);

    try {
      console.log("Tentando login alternativo");

      // Importar o Supabase dinamicamente para evitar problemas de SSR
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Login direto com Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Resposta do login alternativo:", { data, error });

      if (error) {
        console.error("Erro de login:", error);
        toast.error(
          "Falha no login: " + (error.message || "Credenciais inválidas"),
        );
      } else if (data && data.user) {
        console.log("Login bem-sucedido:", data.user);
        toast.success("Login realizado com sucesso!");

        // Armazenar a sessão no localStorage
        localStorage.setItem(
          "supabase.auth.token",
          JSON.stringify(data.session),
        );

        // Forçar redirecionamento para a página inicial após um pequeno delay
        // para garantir que o toast seja exibido
        setTimeout(() => {
          console.log("Redirecionando para a página inicial...");
          window.location.href = "/";
        }, 1000);
      } else {
        console.error("Login sem erro, mas sem usuário retornado");
        toast.error("Erro desconhecido no login");
      }
    } catch (error: any) {
      console.error("Erro durante o login:", error);
      toast.error(
        "Ocorreu um erro durante o login: " +
          (error?.message || "Erro desconhecido"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
        padding: 2,
      }}
    >
      <ToastContainer position="top-right" autoClose={3000} />
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ borderRadius: 3 }}>
          <Card sx={{ width: "100%" }}>
            <CardContent sx={{ pt: 4, pb: 4 }}>
              <Typography
                variant="h4"
                component="h1"
                align="center"
                gutterBottom
                sx={{ fontWeight: "bold", mb: 3 }}
              >
                Login Alternativo
              </Typography>

              <Box
                component="form"
                onSubmit={handleLogin}
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <TextField
                  type="email"
                  label="Email"
                  variant="outlined"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  inputProps={{ autoComplete: "email" }}
                />
                <TextField
                  type="password"
                  label="Senha"
                  variant="outlined"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  inputProps={{ autoComplete: "current-password" }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{ mt: 1 }}
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                >
                  {loading ? "Entrando..." : "Entrar"}
                </Button>

                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Link href="/login">
                    <Typography
                      component="a"
                      variant="body2"
                      sx={{
                        color: "primary.main",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      Voltar para o login normal
                    </Typography>
                  </Link>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Paper>
      </Container>
    </Box>
  );
}
