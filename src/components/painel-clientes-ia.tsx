import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";
import GerenciarSenhaCliente from "./GerenciarSenhaCliente";
import { ToastContainer, toast } from "react-toastify";
import AdicionarCliente from "./AdicionarCliente";
import Dashboard from "./Dashboard";
import { formatarWhatsAppParaExibicao } from "../lib/validacao";
import { verificarLimiteMensagens } from "../lib/validacao";
import { anonymizeName, anonymizePhone, isDemoMode } from "../utils/anonymize";
import "react-toastify/dist/ReactToastify.css";

// Material UI imports
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Alert,
  AlertTitle,
  Chip,
  Divider,
  Paper,
  Skeleton,
} from "@mui/material";
import {
  Add as AddIcon,
  Dashboard as DashboardIcon,
  List as ListIcon,
  ContentCopy as ContentCopyIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

// Import do novo layout
import MuiLayout from "./ui/MuiLayout";

interface Cliente {
  id: string;
  nome: string;
  plano: string;
  whatsapp?: string;
  email?: string;
  data_cadastro: string;
  mensagens_usadas?: number;
  mensagens_limite?: number;
  token_publico?: string;
  user_id?: string;
}

export default function PainelClientesIA() {
  console.log("Renderizando PainelClientesIA");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarDashboard, setMostrarDashboard] = useState(true);
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<
    string | null
  >(null);
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);
  const { user, signOut, isAdmin } = useAuth();

  const buscarClientes = async () => {
    try {
      setCarregando(true);
      let query = supabase.from("clientes").select("*");

      // Se não for admin, filtrar apenas os clientes do usuário atual
      if (!isAdmin && user) {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query.order("data_cadastro", {
        ascending: false,
      });

      if (error) {
        console.error("Erro ao buscar clientes:", error);
        toast.error("Erro ao carregar clientes");
        return;
      }

      setClientes(data || []);
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Ocorreu um erro ao buscar os dados");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarClientes();

    // Configurar assinatura em tempo real para atualizações de clientes
    const channel = supabase
      .channel("clientes-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "clientes",
        },
        () => {
          // Atualizar a lista de clientes quando houver mudanças
          buscarClientes();
        },
      )
      .subscribe();

    return () => {
      // Limpar assinatura quando o componente for desmontado
      channel.unsubscribe();
    };
  }, [user, isAdmin]);

  const handleLogout = async () => {
    await signOut();
  };

  const copiarLinkCliente = (token: string) => {
    const link = `${window.location.origin}/cliente-login/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado para a área de transferência!");
    toast.info(
      "O cliente precisará da senha de acesso para visualizar o painel",
    );
  };

  const handleClienteAdicionado = () => {
    buscarClientes();
    setMostrarFormulario(false);
  };

  const abrirModalSenha = (clienteId: string) => {
    setClienteSelecionadoId(clienteId);
    setModalSenhaAberto(true);
  };

  const fecharModalSenha = () => {
    setModalSenhaAberto(false);
  };

  // Função para renderizar o status de uso de mensagens
  const renderStatusMensagens = (cliente: Cliente) => {
    const mensagensUsadas = cliente.mensagens_usadas || 0;
    const mensagensLimite = cliente.mensagens_limite || 1000;
    const limiteInfo = verificarLimiteMensagens(
      mensagensUsadas,
      mensagensLimite,
    );

    // Determinar a cor da barra de progresso com base no status
    const getProgressColor = () => {
      switch (limiteInfo.status) {
        case "critico":
          return "error";
        case "alerta":
          return "warning";
        default:
          return "success";
      }
    };

    return (
      <Box sx={{ mt: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 0.5,
            alignItems: "center",
          }}
        >
          <Typography variant="caption">
            Uso: {mensagensUsadas}/{mensagensLimite}
          </Typography>
          <Typography variant="caption">
            {Math.round(limiteInfo.percentual)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(limiteInfo.percentual, 100)}
          color={getProgressColor() as "error" | "warning" | "success"}
          sx={{ height: 4, borderRadius: 2 }}
        />
      </Box>
    );
  };

  return (
    <MuiLayout title={isAdmin ? "Painel Administrativo" : "Meu Painel"}>
      <ToastContainer position="top-right" autoClose={3000} />

      {isAdmin && (
        <Alert
          severity="info"
          variant="outlined"
          sx={{ mb: 4, borderRadius: 2 }}
        >
          <AlertTitle>Modo Administrador</AlertTitle>
          Você tem acesso a todos os clientes cadastrados no sistema.
          <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
            >
              {mostrarFormulario ? "Cancelar" : "Adicionar Novo Cliente"}
            </Button>
            <Button
              variant="outlined"
              startIcon={mostrarDashboard ? <ListIcon /> : <DashboardIcon />}
              onClick={() => setMostrarDashboard(!mostrarDashboard)}
            >
              {mostrarDashboard ? "Ver Lista de Clientes" : "Ver Dashboard"}
            </Button>
          </Box>
        </Alert>
      )}

      {/* Formulário de adicionar cliente */}
      {mostrarFormulario && (
        <Box sx={{ mb: 4 }}>
          <AdicionarCliente onClienteAdicionado={handleClienteAdicionado} />
        </Box>
      )}

      {/* Dashboard para administradores */}
      {isAdmin && mostrarDashboard && (
        <Box sx={{ mb: 4 }}>
          <Dashboard isAdmin={true} />
        </Box>
      )}

      {/* Lista de clientes */}
      {(!mostrarDashboard || !isAdmin) && (
        <>
          <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
            {isAdmin ? "Todos os Clientes" : "Meus Dados"}
          </Typography>

          {carregando ? (
            <Box sx={{ py: 4 }}>
              <Grid container spacing={3}>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Grid item xs={12} md={6} lg={4} key={item}>
                    <Skeleton
                      variant="rectangular"
                      height={180}
                      sx={{ borderRadius: 2 }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : clientes.length === 0 ? (
            <Paper
              elevation={0}
              sx={{ py: 8, textAlign: "center", bgcolor: "background.default" }}
            >
              <Typography color="text.secondary">
                Nenhum cliente encontrado
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {clientes.map((cliente) => (
                <Grid item xs={12} md={6} lg={4} key={cliente.id}>
                  <Card
                    elevation={2}
                    sx={{ height: "100%", borderRadius: 2, overflow: "hidden" }}
                  >
                    <CardContent sx={{ pt: 3, pb: 3 }}>
                      {isDemoMode() && (
                        <Alert severity="info" sx={{ mb: 2, py: 1 }}>
                          <AlertTitle sx={{ fontSize: "0.8rem" }}>
                            🔐 MODO DEMO - Dados Anonimizados
                          </AlertTitle>
                        </Alert>
                      )}
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {isDemoMode()
                          ? anonymizeName(cliente.nome, "company")
                          : cliente.nome}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mr: 1 }}
                        >
                          Plano:
                        </Typography>
                        <Chip
                          label={cliente.plano}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ textTransform: "capitalize" }}
                        />
                      </Box>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          WhatsApp:{" "}
                          {cliente.whatsapp
                            ? formatarWhatsAppParaExibicao(
                                isDemoMode()
                                  ? anonymizePhone(cliente.whatsapp)
                                  : cliente.whatsapp,
                              )
                            : "Não informado"}
                        </Typography>
                        <Typography variant="body2">
                          Email: {isDemoMode() ? "contato@empresatest.com.br" : cliente.email || "Não informado"}
                        </Typography>
                        {renderStatusMensagens(cliente)}
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        <Link
                          href={`/cliente-login/${cliente.token_publico || cliente.id}`}
                          passHref
                        >
                          <Button
                            variant="contained"
                            startIcon={<VisibilityIcon />}
                            fullWidth
                          >
                            Ver Painel
                          </Button>
                        </Link>
                        <Button
                          variant="outlined"
                          startIcon={<ContentCopyIcon />}
                          onClick={() =>
                            copiarLinkCliente(
                              cliente.token_publico || cliente.id,
                            )
                          }
                          fullWidth
                        >
                          Copiar Link
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => abrirModalSenha(cliente.id)}
                          fullWidth
                        >
                          Gerenciar Senha
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Modal para gerenciar senha */}
      {clienteSelecionadoId && (
        <GerenciarSenhaCliente
          clienteId={clienteSelecionadoId}
          open={modalSenhaAberto}
          onClose={fecharModalSenha}
        />
      )}
    </MuiLayout>
  );
}
