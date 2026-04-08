import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { contarMensagensMes } from "../services/mensagens";
import { ToastContainer, toast } from "react-toastify";
import { autenticarCliente } from "../services/authService";
import {
  buscarClientePorToken,
  buscarHistoricoMensagens,
  atualizarCliente,
  contarTotalMensagens,
} from "../services/cliente";
import { Mensagem } from "../services/cliente";
import { Cliente } from "../types/Cliente";
import { supabase } from "../lib/supabase";
import {
  isTokenValid,
  getClientToken,
  logAccess,
  refreshToken,
} from "../lib/tokenManager";
import PainelRespostasCliente from "./PainelRespostasCliente";
import Dashboard from "./Dashboard";
// AlertaLimiteMensagens não é mais necessário, pois o alerta está integrado no card de plano
// StatusModoBotCliente removido pois não faz sentido nas informações do cliente
import {
  formatarWhatsAppParaExibicao,
  validarWhatsApp,
} from "../lib/validacao";
import { config } from "../config";
import "react-toastify/dist/ReactToastify.css";

// Material UI imports
import {
  Card,
  CardContent,
  Button,
  TextField,
  Typography,
  Box,
  Container,
  Grid,
  LinearProgress,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  AlertTitle,
  Chip,
  useTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Dashboard as DashboardIcon,
  History as HistoryIcon,
  Check as CheckIcon,
  ArrowUpward as ArrowUpwardIcon,
} from "@mui/icons-material";

export default function PainelCliente({ token }: { token?: string }) {
  const theme = useTheme();
  const router = useRouter();
  const tokenFromRouter = (router.query.token as string) || token;

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [dadosEditados, setDadosEditados] = useState({
    nome: "",
    whatsapp: "",
  });
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalMensagens, setTotalMensagens] = useState(0);
  const [mostrarDashboard, setMostrarDashboard] = useState(true);
  const limitePorPagina = 100;

  // Verificar token a cada minuto
  useEffect(() => {
    const checkTokenInterval = setInterval(() => {
      if (!isTokenValid()) {
        // Tentar renovar o token
        if (!refreshToken()) {
          // Redirecionar para login se não conseguir renovar
          router.push(`/cliente-login/${tokenFromRouter}`);
        }
      }
    }, 60000); // Verificar a cada minuto

    return () => clearInterval(checkTokenInterval);
  }, [tokenFromRouter, router]);

  // Referências para os canais de assinatura
  const mensagensChannelRef = useRef<any>(null);
  const clienteChannelRef = useRef<any>(null);

  // Função para limpar assinaturas existentes
  const limparAssinaturas = () => {
    if (mensagensChannelRef.current) {
      mensagensChannelRef.current.unsubscribe();
      mensagensChannelRef.current = null;
    }
    if (clienteChannelRef.current) {
      clienteChannelRef.current.unsubscribe();
      clienteChannelRef.current = null;
    }
  };

  useEffect(() => {
    // Limpar assinaturas anteriores
    limparAssinaturas();

    const carregarDados = async () => {
      if (!tokenFromRouter) {
        setErro("Token inválido");
        setCarregando(false);
        return;
      }

      // Verificar se o cliente está autenticado
      const clienteToken = getClientToken();

      if (
        !clienteToken ||
        clienteToken !== tokenFromRouter ||
        !isTokenValid()
      ) {
        // Redirecionar para a página de login do cliente
        router.push(`/cliente-login/${tokenFromRouter}`);
        return;
      }

      // Registrar acesso ao painel
      if (cliente?.id) {
        logAccess("view_panel", cliente?.id.toString());
      }

      try {
        console.log("Carregando dados para token:", tokenFromRouter);

        // Buscar cliente pelo token
        const clienteData = await buscarClientePorToken(tokenFromRouter);

        if (!clienteData) {
          setErro("Cliente não encontrado. Verifique se o link está correto.");
          setCarregando(false);
          return;
        }

        console.log("Cliente encontrado:", clienteData);

        // Definir valores padrão para mensagens_limite se não existir
        if (!clienteData.mensagens_limite) {
          // Usar o limite do plano conforme configuração
          const planoConfig =
            config.planos[clienteData.plano as keyof typeof config.planos];
          clienteData.mensagens_limite = planoConfig?.limite || 1000;
        }

        // Buscar contagem de mensagens do mês atual
        const mensagensUsadas = await contarMensagensMes(clienteData.id);
        console.log("Mensagens usadas:", mensagensUsadas);

        // Atualizar o cliente com a contagem de mensagens
        setCliente({
          ...clienteData,
          mensagens_usadas: mensagensUsadas,
        });

        // Inicializar dados para edição
        setDadosEditados({
          nome: clienteData.nome || "",
          whatsapp: clienteData.whatsapp || "",
        });

        // Buscar histórico de mensagens específicas deste cliente
        console.log("Buscando histórico para cliente ID:", clienteData.id);
        const historico = await buscarHistoricoMensagens(
          clienteData.id,
          limitePorPagina,
          0,
        );
        console.log(
          "Histórico de mensagens do cliente:",
          historico.length,
          "mensagens encontradas",
        );

        // Contar total de mensagens disponíveis
        const total = await contarTotalMensagens(clienteData.id);
        setTotalMensagens(total);
        console.log("Total de mensagens disponíveis:", total);

        // Definir as mensagens no estado
        setMensagens(historico || []);
        setPaginaAtual(0);

        if (!historico || historico.length === 0) {
          console.log("Nenhuma mensagem encontrada para o cliente");
        }

        // Configurar assinatura em tempo real para novas mensagens
        const channelId = `mensagens-${clienteData.id}-${Date.now()}`;
        mensagensChannelRef.current = supabase
          .channel(channelId)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "mensagens_enviadas",
              filter: `cliente_id=eq.${clienteData.id}`,
            },
            async (payload: { new: Mensagem }) => {
              console.log("Nova mensagem recebida:", payload);

              // Adicionar a nova mensagem ao estado
              setMensagens((mensagensAtuais) => [
                payload.new as Mensagem,
                ...mensagensAtuais,
              ]);

              // Buscar contagem atualizada de mensagens
              const mensagensAtualizadas = await contarMensagensMes(
                clienteData.id,
              );

              // Atualizar o cliente com a contagem atualizada
              setCliente((clienteAtual) => {
                if (!clienteAtual) return null;
                return {
                  ...clienteAtual,
                  mensagens_usadas: mensagensAtualizadas,
                };
              });

              toast.info("Nova mensagem recebida!");
            },
          )
          .subscribe();

        // Configurar assinatura para atualizações do cliente
        const clienteChannelId = `cliente-${clienteData.id}-${Date.now()}`;
        clienteChannelRef.current = supabase
          .channel(clienteChannelId)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "clientes",
              filter: `id=eq.${clienteData.id}`,
            },
            (payload: { new: Cliente | null }) => {
              console.log("Dados do cliente atualizados:", payload);
              // Atualizar os dados do cliente
              setCliente((clienteAtual) => {
                if (!clienteAtual) return null;
                return {
                  ...clienteAtual,
                  ...payload.new,
                };
              });
            },
          )
          .subscribe();
      } catch (error) {
        console.error("Erro:", error);
        setErro("Ocorreu um erro ao buscar os dados");
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();

    // Limpar assinaturas quando o componente for desmontado
    return limparAssinaturas;
  }, [tokenFromRouter]);

  // Função para alternar entre dashboard e histórico
  const alternarVisualizacao = () => {
    setMostrarDashboard(!mostrarDashboard);
  };

  // Função para salvar os dados editados
  const salvarDadosEditados = async () => {
    if (!cliente) return;

    // Validar WhatsApp
    const whatsappFormatado = validarWhatsApp(dadosEditados.whatsapp);
    if (dadosEditados.whatsapp && !whatsappFormatado) {
      toast.error(
        "Número de WhatsApp inválido. Use o formato: +55 (11) 99999-9999",
      );
      return;
    }

    // Usar o número formatado
    const dadosParaSalvar = {
      nome: dadosEditados.nome,
      whatsapp: whatsappFormatado || dadosEditados.whatsapp,
    };

    try {
      const sucesso = await atualizarCliente(cliente.id, dadosParaSalvar);

      if (sucesso) {
        // Atualizar o cliente no estado
        setCliente((clienteAtual) => {
          if (!clienteAtual) return null;
          return {
            ...clienteAtual,
            nome: dadosParaSalvar.nome,
            whatsapp: dadosParaSalvar.whatsapp,
          };
        });

        toast.success("Dados atualizados com sucesso!");
        setEditando(false);
      } else {
        toast.error("Erro ao atualizar dados. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      toast.error("Ocorreu um erro ao atualizar os dados");
    }
  };

  // Função para carregar mais mensagens
  const carregarMaisMensagens = async () => {
    if (!cliente || carregandoMais) return;

    try {
      setCarregandoMais(true);
      const proximaPagina = paginaAtual + 1;
      const offset = proximaPagina * limitePorPagina;

      const novasMensagens = await buscarHistoricoMensagens(
        cliente.id,
        limitePorPagina,
        offset,
      );

      if (novasMensagens && novasMensagens.length > 0) {
        setMensagens((mensagensAtuais) => [
          ...mensagensAtuais,
          ...novasMensagens,
        ]);
        setPaginaAtual(proximaPagina);
      } else {
        toast.info("Não há mais mensagens para carregar");
      }
    } catch (error) {
      console.error("Erro ao carregar mais mensagens:", error);
      toast.error("Erro ao carregar mais mensagens");
    } finally {
      setCarregandoMais(false);
    }
  };

  // Renderizar o componente
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <ToastContainer position="top-right" autoClose={3000} />

      {carregando ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Carregando dados...
          </Typography>
        </Box>
      ) : erro ? (
        <Alert severity="error">
          <AlertTitle>Erro</AlertTitle>
          {erro}
        </Alert>
      ) : cliente ? (
        <>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: 600, color: "primary.main" }}
              >
                Painel do Cliente
              </Typography>
              <Box
                sx={{
                  ml: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Chip
                  label={cliente.plano || "Básico"}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>

            <Paper
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      borderBottom: "2px solid",
                      borderColor: "primary.light",
                      pb: 1,
                      display: "inline-block",
                    }}
                  >
                    Informações do Cliente
                  </Typography>

                  {!editando ? (
                    <>
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Nome"
                            secondary={cliente.nome || "Não informado"}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="WhatsApp"
                            secondary={
                              cliente.whatsapp
                                ? formatarWhatsAppParaExibicao(cliente.whatsapp)
                                : "Não informado"
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Plano"
                            secondary={cliente.plano || "Básico"}
                          />
                        </ListItem>
                      </List>
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => setEditando(true)}
                        sx={{ mt: 2, borderRadius: 2 }}
                        color="primary"
                      >
                        Editar Dados
                      </Button>
                    </>
                  ) : (
                    <Box component="form" sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        label="Nome"
                        value={dadosEditados.nome}
                        onChange={(e) =>
                          setDadosEditados({
                            ...dadosEditados,
                            nome: e.target.value,
                          })
                        }
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        label="WhatsApp"
                        value={dadosEditados.whatsapp}
                        onChange={(e) =>
                          setDadosEditados({
                            ...dadosEditados,
                            whatsapp: e.target.value,
                          })
                        }
                        margin="normal"
                        helperText="Formato: +55 (11) 99999-9999"
                      />
                      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<SaveIcon />}
                          onClick={salvarDadosEditados}
                          sx={{ borderRadius: 2 }}
                        >
                          Salvar
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          sx={{ borderRadius: 2 }}
                          onClick={() => {
                            setEditando(false);
                            setDadosEditados({
                              nome: cliente.nome || "",
                              whatsapp: cliente.whatsapp || "",
                            });
                          }}
                        >
                          Cancelar
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      borderBottom: "2px solid",
                      borderColor: "primary.light",
                      pb: 1,
                      display: "inline-block",
                    }}
                  >
                    Resumo de Uso
                  </Typography>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Plano Atual
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {cliente.plano || "Básico"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Mensagens Utilizadas
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="body1" fontWeight="medium">
                          {cliente.mensagens_usadas || 0} de{" "}
                          {cliente.mensagens_limite || 1000}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(
                            ((cliente.mensagens_usadas || 0) /
                              (cliente.mensagens_limite || 1000)) *
                              100,
                            100,
                          )}
                          color={
                            cliente.mensagens_usadas &&
                            cliente.mensagens_limite &&
                            cliente.mensagens_usadas >=
                              cliente.mensagens_limite * 0.8
                              ? "warning"
                              : "primary"
                          }
                          sx={{ width: 100, height: 8, borderRadius: 1 }}
                        />
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Status da Conta
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor:
                              cliente.status_pagamento === "pendente"
                                ? "warning.main"
                                : "success.main",
                          }}
                        />
                        <Typography variant="body1">
                          {cliente.status_pagamento === "pendente"
                            ? "Pagamento Pendente"
                            : "Ativo"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Box sx={{ mb: 3 }}>
              <Paper
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <Tabs
                  value={mostrarDashboard ? 0 : 1}
                  onChange={(e, newValue) =>
                    setMostrarDashboard(newValue === 0)
                  }
                  variant="fullWidth"
                  sx={{
                    bgcolor: "background.paper",
                    "& .MuiTab-root": { py: 1.5 },
                    "& .Mui-selected": { fontWeight: "bold" },
                  }}
                >
                  <Tab
                    icon={<DashboardIcon />}
                    label="Dashboard"
                    iconPosition="start"
                  />
                  <Tab
                    icon={<HistoryIcon />}
                    label="Histórico de Mensagens"
                    iconPosition="start"
                  />
                </Tabs>
              </Paper>
            </Box>

            {/* Card de detalhes do plano foi movido para o Dashboard */}

            {mostrarDashboard ? (
              <Dashboard cliente={cliente} clienteId={cliente.id} />
            ) : (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      const carregarHistorico = async () => {
                        setCarregandoHistorico(true);
                        try {
                          setPaginaAtual(0);
                          const historico = await buscarHistoricoMensagens(
                            cliente.id,
                            limitePorPagina,
                            0,
                          );
                          setMensagens(historico || []);
                        } catch (error) {
                          console.error("Erro ao atualizar histórico:", error);
                          toast.error("Erro ao atualizar histórico");
                        } finally {
                          setCarregandoHistorico(false);
                        }
                      };
                      carregarHistorico();
                    }}
                    disabled={carregandoHistorico}
                    sx={{
                      borderRadius: 2,
                      bgcolor: theme.palette.primary.main,
                      "&:hover": { bgcolor: theme.palette.primary.dark },
                    }}
                    title="Atualizar histórico"
                  >
                    {carregandoHistorico ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Atualizar Conversas"
                    )}
                  </Button>
                </Box>

                {carregandoHistorico ? (
                  <CircularProgress size={24} />
                ) : mensagens.length > 0 ? (
                  <>
                    <PainelRespostasCliente
                      mensagens={mensagens}
                      clienteId={cliente.id}
                      onAtualizarHistorico={(
                        resetarPaginacao,
                        clienteFinalId,
                      ) => {
                        const carregarHistorico = async () => {
                          setCarregandoHistorico(true);
                          try {
                            if (resetarPaginacao) {
                              setPaginaAtual(0);
                              const historico = await buscarHistoricoMensagens(
                                cliente.id,
                                limitePorPagina,
                                0,
                                clienteFinalId,
                              );
                              setMensagens(historico || []);
                            } else {
                              const historico = await buscarHistoricoMensagens(
                                cliente.id,
                                limitePorPagina,
                                paginaAtual * limitePorPagina,
                                clienteFinalId,
                              );
                              setMensagens(historico || []);
                            }
                          } catch (error) {
                            console.error(
                              "Erro ao atualizar histórico:",
                              error,
                            );
                            toast.error("Erro ao atualizar histórico");
                          } finally {
                            setCarregandoHistorico(false);
                          }
                        };
                        carregarHistorico();
                      }}
                      onCarregarMais={carregarMaisMensagens}
                      totalMensagens={totalMensagens}
                      carregandoMais={carregandoMais}
                      isAdmin={true}
                    />

                    {(paginaAtual + 1) * limitePorPagina < totalMensagens && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mt: 2,
                        }}
                      >
                        <Button
                          variant="outlined"
                          onClick={carregarMaisMensagens}
                          disabled={carregandoMais}
                          startIcon={
                            carregandoMais ? (
                              <CircularProgress size={20} />
                            ) : (
                              <ArrowUpwardIcon />
                            )
                          }
                          sx={{ borderRadius: 2, px: 3 }}
                          color="primary"
                        >
                          {carregandoMais
                            ? "Carregando..."
                            : "Carregar mais mensagens"}
                        </Button>
                      </Box>
                    )}
                  </>
                ) : (
                  <Typography variant="body1">
                    Nenhuma mensagem encontrada para este cliente.
                  </Typography>
                )}
              </>
            )}
          </Box>
        </>
      ) : null}
    </Container>
  );
}
