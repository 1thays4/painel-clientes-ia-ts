import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { contarMensagensMes } from "../services/mensagens";
import { ToastContainer, toast } from "react-toastify";
import { autenticarCliente } from "../services/authService";
import { buscarClientePorToken, buscarHistoricoMensagens, atualizarCliente, contarTotalMensagens } from "../services/cliente";
import { Mensagem } from "../services/cliente";
import { Cliente } from "../types/Cliente";
import { supabase } from "../lib/supabase";
import { isTokenValid, getClientToken, logAccess, refreshToken } from "../lib/tokenManager";
import PainelRespostasCliente from "./PainelRespostasCliente";
import Dashboard from "./Dashboard";
import AlertaLimiteMensagens from "./AlertaLimiteMensagens";
import StatusModoBotCliente from "./StatusModoBotCliente";
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

export default function PainelCliente({ token }: { token?: string }) {
  const router = useRouter();
  const tokenFromRouter = router.query.token as string || token;
  
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
      
      if (!clienteToken || clienteToken !== tokenFromRouter || !isTokenValid()) {
        // Redirecionar para a página de login do cliente
        router.push(`/cliente-login/${tokenFromRouter}`);
        return;
      }
      
      // Registrar acesso ao painel
      if(cliente?.id) {
      logAccess('view_panel', cliente?.id.toString());
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
  }, [tokenFromRouter]);

  // Resto do componente...
}