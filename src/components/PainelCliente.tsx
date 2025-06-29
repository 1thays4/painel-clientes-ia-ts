import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { contarMensagensMes } from "../services/mensagens";
import { ToastContainer, toast } from "react-toastify";
import { buscarClientePorToken, buscarHistoricoMensagens, atualizarCliente, contarTotalMensagens } from "../services/cliente";
import { Cliente, Mensagem } from "../services/cliente";
import { supabase } from "../lib/supabase";
import { isTokenValid, getClientToken, logAccess, refreshToken } from "../lib/tokenManager";
import PainelRespostasCliente from "./PainelRespostasCliente";
import Dashboard from "./Dashboard";
import AlertaLimiteMensagens from "./AlertaLimiteMensagens";
import { formatarWhatsAppParaExibicao, validarWhatsApp } from "../lib/validacao";
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
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Dashboard as DashboardIcon,
  History as HistoryIcon,
  Check as CheckIcon,
  ArrowUpward as ArrowUpwardIcon
} from '@mui/icons-material';

export default function PainelCliente() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [dadosEditados, setDadosEditados] = useState({ nome: "", whatsapp: "" });
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
          navigate(`/cliente-login/${token}`);
        }
      }
    }, 60000); // Verificar a cada minuto
    
    return () => clearInterval(checkTokenInterval);
  }, [token, navigate]);

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
      if (!token) {
        setErro("Token inválido");
        setCarregando(false);
        return;
      }
      
      // Verificar se o cliente está autenticado
      const clienteToken = getClientToken();
      
      if (!clienteToken || clienteToken !== token || !isTokenValid()) {
        // Redirecionar para a página de login do cliente
        navigate(`/cliente-login/${token}`);
        return;
      }
      
      // Registrar acesso ao painel
      if(cliente?.id) {
      logAccess('view_panel', cliente?.id.toString());
      }

      try {
        console.log("Carregando dados para token:", token);
        
        // Buscar cliente pelo token
        const clienteData = await buscarClientePorToken(token);
        
        if (!clienteData) {
          setErro("Cliente não encontrado. Verifique se o link está correto.");
          setCarregando(false);
          return;
        }

        console.log("Cliente encontrado:", clienteData);
        
        // Definir valores padrão para mensagens_limite se não existir
        if (!clienteData.mensagens_limite) {
          // Usar o limite do plano conforme configuração
          const planoConfig = config.planos[clienteData.plano as keyof typeof config.planos];
          clienteData.mensagens_limite = planoConfig?.limite || 1000;
        }
        
        // Buscar contagem de mensagens do mês atual
        const mensagensUsadas = await contarMensagensMes(clienteData.id);
        console.log("Mensagens usadas:", mensagensUsadas);
          
        // Atualizar o cliente com a contagem de mensagens
        setCliente({
          ...clienteData,
          mensagens_usadas: mensagensUsadas
        });

        // Inicializar dados para edição
        setDadosEditados({
          nome: clienteData.nome || "",
          whatsapp: clienteData.whatsapp || ""
        });

        // Buscar histórico de mensagens específicas deste cliente
        console.log("Buscando histórico para cliente ID:", clienteData.id);
        const historico = await buscarHistoricoMensagens(clienteData.id, limitePorPagina, 0);
        console.log("Histórico de mensagens do cliente:", historico.length, "mensagens encontradas");
        
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
          .on('postgres_changes', 
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'mensagens_enviadas',
              filter: `cliente_id=eq.${clienteData.id}`
            }, 
            async (payload: { new: Mensagem; }) => {
              console.log('Nova mensagem recebida:', payload);
              
              // Adicionar a nova mensagem ao estado
              setMensagens(mensagensAtuais => [payload.new as Mensagem, ...mensagensAtuais]);
              
              // Buscar contagem atualizada de mensagens
              const mensagensAtualizadas = await contarMensagensMes(clienteData.id);
              
              // Atualizar o cliente com a contagem atualizada
              setCliente(clienteAtual => {
                if (!clienteAtual) return null;
                return {
                  ...clienteAtual,
                  mensagens_usadas: mensagensAtualizadas
                };
              });
              
              toast.info("Nova mensagem recebida!");
            }
          )
          .subscribe();

        // Configurar assinatura para atualizações do cliente
        const clienteChannelId = `cliente-${clienteData.id}-${Date.now()}`;
        clienteChannelRef.current = supabase
          .channel(clienteChannelId)
          .on('postgres_changes', 
            { 
              event: 'UPDATE', 
              schema: 'public', 
              table: 'clientes',
              filter: `id=eq.${clienteData.id}`
            }, 
            (payload: { new: Cliente | null; }) => {
              console.log('Dados do cliente atualizados:', payload);
              // Atualizar os dados do cliente
              setCliente(clienteAtual => {
                if (!clienteAtual) return null;
                return {
                  ...clienteAtual,
                  ...payload.new
                };
              });
            }
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
  }, [token]);

  const atualizarHistorico = async (clienteId: number | null = null, resetarPaginacao: boolean = true) => {
    setCarregandoHistorico(true);
    try {
      // Se resetar paginação, começar do zero
      const novaPagina = resetarPaginacao ? 0 : paginaAtual;
      const offset = novaPagina * limitePorPagina;
      
      console.log("Atualizando histórico para cliente:", clienteId, "com offset:", offset, "e limite:", limitePorPagina);
      const historico = await buscarHistoricoMensagens(clienteId, limitePorPagina, offset);
      console.log("Histórico carregado:", historico.length, "mensagens");
      
      // Contar total de mensagens disponíveis
      const total = await contarTotalMensagens(clienteId);
      setTotalMensagens(total);
      console.log("Total de mensagens disponíveis:", total);
      
      // Atualizar mensagens
      if (resetarPaginacao) {
        setMensagens(historico);
        setPaginaAtual(0);
      } else {
        setMensagens(mensagensAtuais => [...mensagensAtuais, ...historico]);
      }
      
      // Atualizar também a contagem de mensagens se tiver um cliente específico
      if (clienteId) {
        const mensagensAtualizadas = await contarMensagensMes(clienteId);
        setCliente(clienteAtual => {
          if (!clienteAtual) return null;
          return {
            ...clienteAtual,
            mensagens_usadas: mensagensAtualizadas
          };
        });
      }
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      toast.error("Erro ao carregar mensagens");
    } finally {
      setCarregandoHistorico(false);
    }
  };
  
  // Função para carregar mais mensagens (paginação)
  const carregarMaisMensagens = async () => {
    if (!cliente || carregandoMais) return;
    
    setCarregandoMais(true);
    try {
      const proximaPagina = paginaAtual + 1;
      const offset = proximaPagina * limitePorPagina;
      
      console.log("Carregando mais mensagens com offset:", offset);
      const novasMensagens = await buscarHistoricoMensagens(cliente.id, limitePorPagina, offset);
      
      if (novasMensagens && novasMensagens.length > 0) {
        console.log("Carregadas mais", novasMensagens.length, "mensagens");
        setMensagens(mensagensAtuais => [...mensagensAtuais, ...novasMensagens]);
        setPaginaAtual(proximaPagina);
      } else {
        console.log("Não há mais mensagens para carregar");
        toast.info("Não há mais mensagens para carregar");
      }
    } catch (error) {
      console.error("Erro ao carregar mais mensagens:", error);
      toast.error("Erro ao carregar mais mensagens");
    } finally {
      setCarregandoMais(false);
    }
  };

  const handleSalvarDados = async () => {
    if (!cliente) return;

    try {
      // Validar número de WhatsApp
      const whatsappValidado = validarWhatsApp(dadosEditados.whatsapp);
      
      if (dadosEditados.whatsapp && !whatsappValidado) {
        toast.error("Número de WhatsApp inválido");
        return;
      }
      
      const sucesso = await atualizarCliente(cliente.id, {
        nome: dadosEditados.nome,
        whatsapp: whatsappValidado
      });

      if (!sucesso) {
        toast.error("Erro ao salvar dados");
        return;
      }

      setCliente({
        ...cliente,
        nome: dadosEditados.nome,
        whatsapp: whatsappValidado
      });

      setEditando(false);
      toast.success("Dados atualizados com sucesso");
    } catch (error) {
      toast.error("Erro ao salvar dados");
    }
  };

  const handleUpgradePlano = () => {
    // Abrir modal ou redirecionar para página de upgrade
    toast.info("Entre em contato com o suporte para fazer upgrade do seu plano");
    // Aqui poderia abrir um modal com opções de plano ou redirecionar para uma página
  };

  const renderPlanoDetalhes = () => {
    if (!cliente) return null;

    // Usar os valores da configuração para garantir consistência
    const planoConfig = config.planos[cliente.plano as keyof typeof config.planos] || config.planos.essencial;

    const getPlanoColor = () => {
      switch (cliente?.plano) {
        case "essencial": return "success";
        case "Profissional": return "primary";
        case "Estratégico": return "secondary";
        default: return "primary";
      }
    };

    const getPlanoBackgroundColor = () => {
      switch (cliente?.plano) {
        case "essencial": return "linear-gradient(135deg, #43a047 0%, #66bb6a 100%)";
        case "Profissional": return "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)";
        case "Estratégico": return "linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)";
        default: return "#f5f5f5";
      }
    };

    const renderListItem = (text: string) => (
      <ListItem sx={{ py: 0.5 }}>
        <ListItemIcon sx={{ minWidth: 36 }}>
          <CheckIcon color="inherit" />
        </ListItemIcon>
        <ListItemText primary={text} />
      </ListItem>
    );

    switch (cliente.plano) {
      case "essencial":
        return (
          <Paper 
            elevation={3} 
            sx={{ 
              mt: 3, 
              p: 3, 
              background: getPlanoBackgroundColor(),
              borderRadius: 2,
              color: 'white'
            }}
          >
            <Typography variant="h6" fontWeight="600" gutterBottom>Plano Essencial</Typography>
            <Typography variant="h4" fontWeight="700" sx={{ mb: 2 }}>
              R$ {planoConfig.preco}/mês
            </Typography>
            <List dense disablePadding>
              {renderListItem("Acesso ao assistente IA")}
              {renderListItem(`${planoConfig.limite} mensagens por mês`)}
              {renderListItem("Suporte por email")}
            </List>
            <Button 
              variant="contained" 
              color="inherit"
              fullWidth
              sx={{ mt: 3, color: '#43a047', bgcolor: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
              onClick={handleUpgradePlano}
              startIcon={<ArrowUpwardIcon />}
            >
              Fazer Upgrade
            </Button>
          </Paper>
        );
      case "Profissional":
        return (
          <Paper 
            elevation={3} 
            sx={{ 
              mt: 3, 
              p: 3, 
              background: getPlanoBackgroundColor(),
              borderRadius: 2,
              color: 'white'
            }}
          >
            <Typography variant="h6" fontWeight="600" gutterBottom>Plano Profissional</Typography>
            <Typography variant="h4" fontWeight="700" sx={{ mb: 2 }}>
              R$ {planoConfig.preco}/mês
            </Typography>
            <List dense disablePadding>
              {renderListItem("Acesso ao assistente IA")}
              {renderListItem(`${planoConfig.limite} mensagens por mês`)}
              {renderListItem("Suporte por WhatsApp")}
              {renderListItem("Acesso a modelos avançados")}
            </List>
            <Button 
              variant="contained" 
              color="inherit"
              fullWidth
              sx={{ mt: 3, color: '#1976d2', bgcolor: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
              onClick={handleUpgradePlano}
              startIcon={<ArrowUpwardIcon />}
            >
              Fazer Upgrade para Avançado
            </Button>
          </Paper>
        );
      case "Estratégico":
        return (
          <Paper 
            elevation={3} 
            sx={{ 
              mt: 3, 
              p: 3, 
              background: getPlanoBackgroundColor(),
              borderRadius: 2,
              color: 'white'
            }}
          >
            <Typography variant="h6" fontWeight="600" gutterBottom>Plano Estratégico</Typography>
            <Typography variant="h4" fontWeight="700" sx={{ mb: 2 }}>
              R$ {planoConfig.preco}/mês
            </Typography>
            <List dense disablePadding>
              {renderListItem("Acesso ao assistente IA")}
              {renderListItem(`${planoConfig.limite} mensagens por mês`)}
              {renderListItem("Suporte prioritário 24/7")}
              {renderListItem("Acesso a todos os modelos")}
              {renderListItem("Personalização avançada")}
            </List>
          </Paper>
        );
      default:
        return <Typography>Detalhes do plano não disponíveis</Typography>;
    }
  };

  const getProgressBarColor = () => {
    if (!cliente) {
      return "primary";
    }
    
    const mensagensUsadas = cliente.mensagens_usadas || 0;
    const mensagensLimite = cliente.mensagens_limite || 1000;
    
    const percentUsed = (mensagensUsadas / mensagensLimite) * 100;
    
    if (percentUsed >= 100) return "error";
    if (percentUsed >= 75) return "warning";
    return "success";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const ano = date.getFullYear();
    const hora = date.getHours().toString().padStart(2, '0');
    const minutos = date.getMinutes().toString().padStart(2, '0');
    
    return `${dia}/${mes}/${ano} às ${hora}h${minutos}`;
  };

  if (carregando) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>Carregando informações...</Typography>
      </Container>
    );
  }

  if (erro) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Erro</AlertTitle>
            {erro}
          </Alert>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => window.location.href = '/'}
            >
              Voltar ao Painel Principal
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
      minHeight: '100vh',
      pt: 4,
      pb: 6
    }}>
    <Container maxWidth="lg">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Cabeçalho */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2, background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)', color: 'white' }}>
        <Box sx={{ mb: 3 }}>
          {editando ? (
            <TextField
              fullWidth
              variant="outlined"
              label="Nome do cliente"
              value={dadosEditados.nome} 
              onChange={(e) => setDadosEditados({...dadosEditados, nome: e.target.value})}
              placeholder="Nome do cliente"
              sx={{ mb: 2 }}
            />
          ) : (
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Olá, {cliente?.nome && !cliente.nome.includes('+') ? 
                cliente.nome : 
                (cliente?.nome?.includes('+') ? 'Empresa sem nome cadastrado' : 'Cliente')}!
            </Typography>
          )}
          
          {editando ? (
            <TextField
              fullWidth
              variant="outlined"
              label="Número do WhatsApp"
              value={dadosEditados.whatsapp} 
              onChange={(e) => setDadosEditados({...dadosEditados, whatsapp: e.target.value})}
              placeholder="Número do WhatsApp"
              sx={{ mb: 2 }}
            />
          ) : (
            <Typography variant="body1" color="rgba(255, 255, 255, 0.8)">
              WhatsApp: {cliente?.whatsapp ? formatarWhatsAppParaExibicao(cliente.whatsapp) : "Não informado"}
            </Typography>
          )}
          
          {editando ? (
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                color="success" 
                onClick={handleSalvarDados}
                startIcon={<SaveIcon />}
              >
                Salvar
              </Button>
              <Button 
                variant="outlined" 
                color="inherit"
                onClick={() => setEditando(false)}
                startIcon={<CancelIcon />}
                sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}
              >
                Cancelar
              </Button>
            </Box>
          ) : (
            <Button 
              variant="contained" 
              color="secondary"
              startIcon={<EditIcon />}
              onClick={() => setEditando(true)}
              sx={{ mt: 2 }}
            >
              Editar dados
            </Button>
          )}
        </Box>
      </Paper>
      
      {/* Alerta de limite de mensagens */}
      {cliente && (
        <Box sx={{ mb: 3 }}>
          <AlertaLimiteMensagens 
            mensagensUsadas={cliente.mensagens_usadas || 0}
            mensagensLimite={cliente.mensagens_limite || 1000}
            onUpgrade={handleUpgradePlano}
          />
        </Box>
      )}
      
      {/* Tabs de navegação */}
      <Paper elevation={1} sx={{ mb: 4, borderRadius: 2 }}>
        <Tabs 
          value={mostrarDashboard ? 0 : 1}
          onChange={(_, newValue) => setMostrarDashboard(newValue === 0)}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            icon={<DashboardIcon />} 
            iconPosition="start" 
            label="Dashboard" 
          />
          <Tab 
            icon={<HistoryIcon />} 
            iconPosition="start" 
            label="Histórico de Mensagens" 
          />
        </Tabs>
      </Paper>
      
      {/* Dashboard ou Histórico */}
      {mostrarDashboard ? (
        <>
          {/* Dashboard */}
          {cliente && <Dashboard clienteId={cliente.id} />}
          
          {/* Informações do plano */}
          <Card elevation={3} sx={{ mb: 4, mt: 4, borderRadius: 2, background: 'linear-gradient(135deg, #f6f9fc 0%, #f1f4f8 100%)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                  Seu Plano: 
                </Typography>
                <Chip 
                  label={cliente?.plano || "Básico"} 
                  color="primary" 
                  variant="outlined" 
                  sx={{ ml: 2, textTransform: 'capitalize' }} 
                />
              </Box>
              
              {/* Barra de progresso */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                  <Typography variant="body2">Uso de mensagens este mês</Typography>
                  <Typography variant="body1" fontWeight="500">
                    {cliente?.mensagens_usadas || 0} / {cliente?.mensagens_limite || 1000}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(
                    ((cliente?.mensagens_usadas || 0) / (cliente?.mensagens_limite || 1000)) * 100, 
                    100
                  )}
                  color={getProgressBarColor() as "error" | "warning" | "success"}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              {renderPlanoDetalhes()}
            </CardContent>
          </Card>
        </>
      ) : (
        /* Painel de respostas */
        cliente && (
          <PainelRespostasCliente 
            clienteId={cliente.id}
            mensagens={mensagens}
            onAtualizarHistorico={(resetar = true) => cliente && atualizarHistorico(cliente.id as number, resetar)}
            onCarregarMais={carregarMaisMensagens}
            totalMensagens={totalMensagens}
            carregandoMais={carregandoMais}
            isAdmin={true}
          />
        )
      )}
    </Container>
    </Box>
  );
}