import { SetStateAction, useState } from "react";
import { supabase } from "../lib/supabase";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import "react-toastify/dist/ReactToastify.css";

// Material UI imports
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  Container,
  Paper,
  CircularProgress,
} from "@mui/material";
import { Email, Lock, Send } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"password" | "magic">(
    "password",
  );
  const { signIn } = useAuth();
  // Usando Supabase diretamente em vez do AuthContext
  //const router = useRouter();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      console.log("Tentando login com AuthContext");
      const { error } = await signIn(email, password);

      if (error) {
        console.error("Erro de login:", error);
        toast.error(
          "Falha no login: " + (error.message || "Credenciais inválidas"),
        );
      } else {
        toast.success("Login realizado com sucesso!");
        // NÃO faça redirecionamento manual aqui!
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

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Por favor, informe seu e-mail");
      return;
    }

    setLoading(true);

    try {
      console.log("Tentando enviar magic link direto com Supabase");

      // Determinar a URL de redirecionamento
      let redirectTo = "";
      if (typeof window !== "undefined") {
        redirectTo = `${window.location.origin}/auth/callback`;
      }

      // Enviar magic link direto com supabase
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        console.error("Erro ao enviar magic link:", error);
        toast.error("Falha ao enviar link de acesso: " + error.message);
      } else {
        setMagicLinkSent(true);
        toast.success("Link de acesso enviado para seu e-mail!");
      }
    } catch (error: any) {
      console.error("Erro ao enviar magic link:", error);
      toast.error("Ocorreu um erro ao enviar o link de acesso");
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
                Login Administrador
              </Typography>

              {/* Opções de login com Tabs do Material UI */}
              <Tabs
                value={loginMethod === "password" ? 0 : 1}
                onChange={(_: any, newValue: number) =>
                  setLoginMethod(newValue === 0 ? "password" : "magic")
                }
                variant="fullWidth"
                sx={{ mb: 4 }}
              >
                <Tab
                  label="E-mail e Senha"
                  icon={<Lock fontSize="small" />}
                  iconPosition="start"
                />
                <Tab
                  label="Link Mágico"
                  icon={<Email fontSize="small" />}
                  iconPosition="start"
                />
              </Tabs>

              {loginMethod === "password" ? (
                <Box
                  component="form"
                  onSubmit={handlePasswordLogin}
                  sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <TextField
                    type="email"
                    label="Email"
                    variant="outlined"
                    fullWidth
                    value={email}
                    onChange={(e: {
                      target: { value: SetStateAction<string> };
                    }) => setEmail(e.target.value)}
                    required
                    inputProps={{ autoComplete: "email" }}
                  />
                  <TextField
                    type="password"
                    label="Senha"
                    variant="outlined"
                    fullWidth
                    value={password}
                    onChange={(e: {
                      target: { value: SetStateAction<string> };
                    }) => setPassword(e.target.value)}
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
                </Box>
              ) : (
                <Box>
                  {magicLinkSent ? (
                    <Box sx={{ textAlign: "center", py: 2 }}>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        ✅ Link de acesso enviado para:
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", mb: 2 }}
                      >
                        {email}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                      >
                        Verifique sua caixa de entrada e clique no link enviado
                        para acessar sua conta.
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={() => setMagicLinkSent(false)}
                      >
                        Enviar novamente
                      </Button>
                    </Box>
                  ) : (
                    <Box
                      component="form"
                      onSubmit={handleMagicLinkLogin}
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      <TextField
                        type="email"
                        label="Email"
                        variant="outlined"
                        fullWidth
                        value={email}
                        onChange={(e: {
                          target: { value: SetStateAction<string> };
                        }) => setEmail(e.target.value)}
                        required
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        disabled={loading}
                        startIcon={
                          loading ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            <Send />
                          )
                        }
                      >
                        {loading ? "Enviando..." : "Enviar link de acesso"}
                      </Button>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        sx={{ mt: 2 }}
                      >
                        Enviaremos um link para seu e-mail que permitirá acesso
                        imediato à sua conta.
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Paper>
      </Container>
    </Box>
  );
}
