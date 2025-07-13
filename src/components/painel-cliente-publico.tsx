import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import TestarIA from "./TestarIA";
import { contarMensagensMes } from "../services/mensagens";
import { ToastContainer } from "react-toastify";
import { supabase } from "../lib/supabase";
import "react-toastify/dist/ReactToastify.css";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Container,
  CircularProgress,
  Alert,
  AlertTitle,
  Divider,
  Button,
  LinearProgress,
  Paper,
  Grid,
  Chip
} from '@mui/material';

// Usando o cliente supabase importado de lib/supabase

interface Cliente {
  id: number;
  nome: string;
  plano: string;
  status_pagamento?: "em_dia" | "pendente";
  mensagens_usadas?: number;
  mensagens_limite?: number;
}

export default function PainelClientePublico() {
  const router = useRouter();
  const { token } = router.query;
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  
  console.log("Componente PainelClientePublico renderizado com token:", token);

  useEffect(() => {
    const buscarCliente = async () => {
      if (!token) {
        setErro("Token inválido");
        setCarregando(false);
        return;
      }

      console.log("Buscando cliente com token:", token);

      try {
        // Busca direta dos dados do cliente pelo token
        const { data, error } = await supabase
          .from("clientes")
          .select("*")
          .eq("token_publico", token);
          
        console.log("Resultado da busca:", { data, error });
        
        if (error) {
          console.error("Erro ao buscar cliente:", error);
          setErro("Erro ao carregar dados do cliente");
          setCarregando(false);
          return;
        }
        
        if (!data || data.length === 0) {
          console.log("Nenhum cliente encontrado com este token");
          
          // Vamos listar todos os tokens para depuração
          const { data: allTokens } = await supabase
            .from("clientes")
            .select("id, token_publico");
            
          console.log("Tokens disponíveis no banco:", allTokens);
          
          setErro("Cliente não encontrado. Verifique se o link está correto.");
          setCarregando(false);
          return;
        }

        // Cliente encontrado
        const clienteData = data[0];
        console.log("Cliente encontrado:", clienteData);
        
        // Buscar contagem de mensagens do mês atual
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

        const { data: mensagensData, count } = await supabase
          .from('mensagens_enviadas')
          .select('id', { count: 'exact' })
          .eq('cliente_id', clienteData.id)
          .gte('timestamp', firstDay)
          .lte('timestamp', lastDay);
          
        // Atualizar o cliente com a contagem de mensagens
        setCliente({
          ...clienteData,
          mensagens_usadas: count || 0
        });
      } catch (error) {
        console.error("Erro:", error);
        setErro("Ocorreu um erro ao buscar os dados");
      } finally {
        setCarregando(false);
      }
    };

    buscarCliente();
  }, [token]);

  // Removemos a função renderPlanoDetalhes pois já incluímos uma versão simplificada no componente principal

  if (carregando) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>Carregando informações...</Typography>
        </Box>
      </Container>
    );
  }

  if (erro) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Card>
          <CardContent sx={{ pt: 3 }}>
            <Alert severity="error">
              <AlertTitle>Erro</AlertTitle>
              {erro}
            </Alert>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Função para atualizar a contagem de mensagens
  const atualizarContagemMensagens = async () => {
    if (cliente) {
      const mensagensUsadas = await contarMensagensMes(cliente.id);
      setCliente({
        ...cliente,
        mensagens_usadas: mensagensUsadas
      });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Card sx={{ overflow: 'hidden' }}>
        <CardContent sx={{ pt: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Seu Plano de Assistente IA
          </Typography>
          {cliente && (
            <>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <Box component="span" sx={{ fontWeight: 'bold' }}>Olá, {cliente.nome}!</Box>
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Bem-vindo ao seu painel de cliente. Aqui você pode ver os detalhes do seu plano atual.
              </Typography>
              
              {/* Status de pagamento */}
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 1 }}>
                  Status da Conta
                </Typography>
                {cliente.status_pagamento === "em_dia" ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                    <Box sx={{ mr: 1 }}>✓</Box>
                    <Typography>Pagamento em dia</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'warning.main' }}>
                    <Box sx={{ mr: 1 }}>⚠️</Box>
                    <Typography>Pagamento pendente</Typography>
                  </Box>
                )}
              </Paper>
              
              {/* Progresso de uso do plano */}
              {cliente.mensagens_usadas !== undefined && cliente.mensagens_limite !== undefined && (
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 1 }}>
                    Uso do Plano
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Você usou {cliente.mensagens_usadas} de {cliente.mensagens_limite} interações com IA no WhatsApp este mês.
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(100, (cliente.mensagens_usadas / cliente.mensagens_limite) * 100)} 
                    sx={{ mb: 1 }}
                  />
                  {cliente.mensagens_usadas >= cliente.mensagens_limite ? (
                    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                      Você atingiu o limite de interações deste mês. Considere fazer um upgrade de plano.
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Restam {cliente.mensagens_limite - cliente.mensagens_usadas} interações com IA neste mês.
                    </Typography>
                  )}
                </Paper>
              )}
              
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 2 }}>
                  Detalhes do Plano: {cliente.plano || "Básico"}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={cliente.plano === "Estratégico" ? "Mensagens ilimitadas" : "Plano mensal"} 
                    color="primary" 
                    variant="outlined" 
                    size="small" 
                    sx={{ mr: 1 }} 
                  />
                </Box>
              </Paper>
              
              {/* Componente para testar IA no WhatsApp */}
              <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 2 }}>
                  Assistente IA no WhatsApp
                </Typography>
                {cliente && (
                  <TestarIA 
                    clienteId={cliente.id} 
                    limite={cliente.mensagens_limite || 100}
                    onMensagemEnviada={atualizarContagemMensagens}
                  />
                )}
              </Box>
              
              {/* Botões para gerenciar plano e ver histórico */}
              <Box sx={{ mt: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => alert("Funcionalidade em desenvolvimento")}
                >
                  Gerenciar Plano
                </Button>
                <Button 
                  variant="outlined"
                  onClick={() => alert("Funcionalidade em desenvolvimento")}
                >
                  Ver Histórico
                </Button>
              </Box>
              
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Precisa de ajuda? Entre em contato pelo nosso suporte.
                </Typography>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}