import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { verificarLimiteMensagens } from '../lib/validacao';

// Material UI imports
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Box, 
  LinearProgress, 
  Divider, 
  Skeleton,
  Paper,
  Alert
} from '@mui/material';

interface DashboardProps {
  clienteId?: string | number;
  isAdmin?: boolean;
  cliente?: any; // Cliente completo com todas as informações
}

interface EstatisticasGerais {
  totalMensagens: number;
  mensagensHoje: number;
  mensagensSemana: number;
  mensagensMes: number;
  clientesAtivos: number;
  clientesTotal: number;
}

interface EstatisticasCliente {
  mensagensUsadas: number;
  mensagensLimite: number;
  mensagensHoje: number;
  mensagensSemana: number;
  ultimaAtividade: string;
}

const Dashboard: React.FC<DashboardProps> = ({ clienteId, isAdmin = false, cliente }) => {
  const [estatisticasGerais, setEstatisticasGerais] = useState<EstatisticasGerais>({
    totalMensagens: 0,
    mensagensHoje: 0,
    mensagensSemana: 0,
    mensagensMes: 0,
    clientesAtivos: 0,
    clientesTotal: 0
  });
  
  const [estatisticasCliente, setEstatisticasCliente] = useState<EstatisticasCliente>({
    mensagensUsadas: 0,
    mensagensLimite: 1000,
    mensagensHoje: 0,
    mensagensSemana: 0,
    ultimaAtividade: ''
  });
  
  const [carregando, setCarregando] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const carregarEstatisticas = async () => {
      setCarregando(true);
      
      try {
        // Se for admin e não tiver clienteId específico, carregar estatísticas gerais
        if (isAdmin && !clienteId) {
          await carregarEstatisticasGerais();
        } 
        // Se tiver clienteId, carregar estatísticas específicas do cliente
        else if (clienteId) {
          await carregarEstatisticasCliente(clienteId);
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setCarregando(false);
      }
    };
    
    carregarEstatisticas();
  }, [clienteId, isAdmin, user]);
  
  const carregarEstatisticasGerais = async () => {
    // Data de hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // Data de uma semana atrás
    const umaSemanaAtras = new Date();
    umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
    
    // Data de um mês atrás
    const umMesAtras = new Date();
    umMesAtras.setMonth(umMesAtras.getMonth() - 1);
    
    // Buscar total de mensagens
    const { count: totalMensagens } = await supabase
      .from('mensagens_enviadas')
      .select('*', { count: 'exact' });
    
    // Buscar mensagens de hoje
    const { count: mensagensHoje } = await supabase
      .from('mensagens_enviadas')
      .select('*', { count: 'exact' })
      .gte('timestamp', hoje.toISOString());
    
    // Buscar mensagens da última semana
    const { count: mensagensSemana } = await supabase
      .from('mensagens_enviadas')
      .select('*', { count: 'exact' })
      .gte('timestamp', umaSemanaAtras.toISOString());
    
    // Buscar mensagens do último mês
    const { count: mensagensMes } = await supabase
      .from('mensagens_enviadas')
      .select('*', { count: 'exact' })
      .gte('timestamp', umMesAtras.toISOString());
    
    // Buscar total de clientes
    const { count: clientesTotal } = await supabase
      .from('clientes')
      .select('*', { count: 'exact' });
    
    // Buscar clientes ativos (com mensagens no último mês)
    const { data: clientesAtivosData } = await supabase
      .from('mensagens_enviadas')
      .select('cliente_id')
      .gte('timestamp', umMesAtras.toISOString())
      .order('cliente_id');
    
    // Contar clientes únicos
    const clientesAtivosUnicos = new Set();
    clientesAtivosData?.forEach((msg: { cliente_id?: string | number }) => {
      if (msg.cliente_id) {
        clientesAtivosUnicos.add(msg.cliente_id);
      }
    });
    
    setEstatisticasGerais({
      totalMensagens: totalMensagens || 0,
      mensagensHoje: mensagensHoje || 0,
      mensagensSemana: mensagensSemana || 0,
      mensagensMes: mensagensMes || 0,
      clientesAtivos: clientesAtivosUnicos.size,
      clientesTotal: clientesTotal || 0
    });
  };
  
  const carregarEstatisticasCliente = async (clienteId: string | number) => {
    // Data de hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // Data de uma semana atrás
    const umaSemanaAtras = new Date();
    umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
    
    // Buscar dados do cliente
    const { data: clienteData } = await supabase
      .from('clientes')
      .select('mensagens_usadas, mensagens_limite')
      .eq('id', clienteId)
      .single();
    
    // Buscar mensagens de hoje
    const { count: mensagensHoje } = await supabase
      .from('mensagens_enviadas')
      .select('*', { count: 'exact' })
      .eq('cliente_id', clienteId)
      .gte('timestamp', hoje.toISOString());
    
    // Buscar mensagens da última semana
    const { count: mensagensSemana } = await supabase
      .from('mensagens_enviadas')
      .select('*', { count: 'exact' })
      .eq('cliente_id', clienteId)
      .gte('timestamp', umaSemanaAtras.toISOString());
    
    // Buscar última atividade
    const { data: ultimaAtividadeData } = await supabase
      .from('mensagens_enviadas')
      .select('timestamp')
      .eq('cliente_id', clienteId)
      .order('timestamp', { ascending: false })
      .limit(1);
    
    const ultimaAtividade = ultimaAtividadeData && ultimaAtividadeData.length > 0
      ? ultimaAtividadeData[0].timestamp
      : '';
    
    setEstatisticasCliente({
      mensagensUsadas: clienteData?.mensagens_usadas || 0,
      mensagensLimite: clienteData?.mensagens_limite || 1000,
      mensagensHoje: mensagensHoje || 0,
      mensagensSemana: mensagensSemana || 0,
      ultimaAtividade
    });
  };
  
  const renderEstatisticasGerais = () => {
    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent sx={{ pt: 3, pb: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>Mensagens</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Total</Typography>
                  <Typography variant="h4" fontWeight="700">{estatisticasGerais.totalMensagens}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Hoje</Typography>
                  <Typography variant="h4" fontWeight="700">{estatisticasGerais.mensagensHoje}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Semana</Typography>
                  <Typography variant="h4" fontWeight="700">{estatisticasGerais.mensagensSemana}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Mês</Typography>
                  <Typography variant="h4" fontWeight="700">{estatisticasGerais.mensagensMes}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent sx={{ pt: 3, pb: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>Clientes</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Total</Typography>
                  <Typography variant="h4" fontWeight="700">{estatisticasGerais.clientesTotal}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Ativos (mês)</Typography>
                  <Typography variant="h4" fontWeight="700">{estatisticasGerais.clientesAtivos}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Taxa de Atividade</Typography>
                  <Typography variant="h4" fontWeight="700">
                    {estatisticasGerais.clientesTotal > 0
                      ? `${Math.round((estatisticasGerais.clientesAtivos / estatisticasGerais.clientesTotal) * 100)}%`
                      : '0%'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent sx={{ pt: 3, pb: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>Média por Cliente</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Mensagens/Cliente</Typography>
                  <Typography variant="h4" fontWeight="700">
                    {estatisticasGerais.clientesTotal > 0
                      ? Math.round(estatisticasGerais.totalMensagens / estatisticasGerais.clientesTotal)
                      : 0}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Mensagens/Mês</Typography>
                  <Typography variant="h4" fontWeight="700">
                    {estatisticasGerais.clientesAtivos > 0
                      ? Math.round(estatisticasGerais.mensagensMes / estatisticasGerais.clientesAtivos)
                      : 0}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };
  
  const renderEstatisticasCliente = () => {
    const limiteInfo = verificarLimiteMensagens(
      estatisticasCliente.mensagensUsadas,
      estatisticasCliente.mensagensLimite
    );
    
    const formatarData = (dataString: string) => {
      if (!dataString) return 'Nunca';
      
      const data = new Date(dataString);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(data);
    };
    
    // Determinar a cor da barra de progresso com base no status
    const getProgressColor = () => {
      switch (limiteInfo.status) {
        case 'critico':
          return 'error';
        case 'alerta':
          return 'warning';
        default:
          return 'success';
      }
    };
    
    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent sx={{ pt: 3, pb: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>Uso de Mensagens</Typography>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                  <Typography variant="body2">Este mês</Typography>
                  <Typography variant="body1" fontWeight="500">
                    {estatisticasCliente.mensagensUsadas} / {estatisticasCliente.mensagensLimite}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(limiteInfo.percentual, 100)} 
                  color={getProgressColor() as "error" | "warning" | "success"}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                {limiteInfo.mensagem && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      mt: 1, 
                      display: 'block',
                      color: limiteInfo.status === 'critico' ? 'error.main' : 
                             limiteInfo.status === 'alerta' ? 'warning.main' : 'inherit'
                    }}
                  >
                    {limiteInfo.mensagem}
                  </Typography>
                )}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Hoje</Typography>
                  <Typography variant="h4" fontWeight="700">{estatisticasCliente.mensagensHoje}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Semana</Typography>
                  <Typography variant="h4" fontWeight="700">{estatisticasCliente.mensagensSemana}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent sx={{ pt: 3, pb: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>Atividade</Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">Última mensagem</Typography>
                <Typography variant="h5" fontWeight="600">{formatarData(estatisticasCliente.ultimaAtividade)}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">Média diária (semana)</Typography>
                <Typography variant="h5" fontWeight="600">
                  {Math.round(estatisticasCliente.mensagensSemana / 7)} mensagens/dia
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };
  
  if (carregando) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} md={4} key={item}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }
  
  // Renderizar detalhes do plano
  const renderDetalhesDoPlanoPara = (cliente: any) => {
    return (
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
            Seu Plano: {cliente?.plano || "Básico"}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" fontWeight="medium" color={cliente?.mensagens_usadas && cliente?.mensagens_limite && cliente?.mensagens_usadas >= cliente?.mensagens_limite * 0.8 ? "warning.main" : "inherit"}>
              {cliente?.mensagens_usadas || 0} / {cliente?.mensagens_limite || 1000}
            </Typography>
          </Box>
        </Box>
        
        {/* Barra de progresso */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Uso de mensagens este mês</Typography>
            <Typography variant="body2" fontWeight="medium">
              {Math.round(((cliente?.mensagens_usadas || 0) / (cliente?.mensagens_limite || 1000)) * 100)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(((cliente?.mensagens_usadas || 0) / (cliente?.mensagens_limite || 1000)) * 100, 100)} 
            color={cliente?.mensagens_usadas && cliente?.mensagens_limite && cliente?.mensagens_usadas >= cliente?.mensagens_limite * 0.8 ? "warning" : "primary"}
            sx={{ height: 8, borderRadius: 1 }}
          />
          
          {cliente?.mensagens_usadas && cliente?.mensagens_limite && cliente?.mensagens_usadas >= cliente?.mensagens_limite * 0.8 && (
            <Alert severity="warning" sx={{ mt: 2, py: 0 }}>
              {cliente?.mensagens_usadas >= cliente?.mensagens_limite 
                ? "Você atingiu o limite de mensagens do seu plano." 
                : `Você está próximo do limite de mensagens (${Math.round(((cliente?.mensagens_usadas) / (cliente?.mensagens_limite)) * 100)}%).`
              }
            </Alert>
          )}
        </Box>
        
        {/* Detalhes do plano */}
        <Box>
          <Typography variant="subtitle1" gutterBottom>Detalhes do Plano:</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="primary">Recursos Incluídos:</Typography>
                <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                  <Typography component="li" variant="body2">
                    Limite mensal: {cliente?.mensagens_limite || 1000} mensagens
                  </Typography>
                  <Typography component="li" variant="body2">
                    Acesso ao painel de controle
                  </Typography>
                  <Typography component="li" variant="body2">
                    Suporte por WhatsApp
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="primary">Informações Adicionais:</Typography>
                <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                  <Typography component="li" variant="body2">
                    Renovação automática mensal
                  </Typography>
                  <Typography component="li" variant="body2">
                    Suporte prioritário
                  </Typography>
                  <Typography component="li" variant="body2">
                    Personalização de respostas
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    );
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
        {isAdmin && !clienteId ? 'Estatísticas Gerais' : 'Estatísticas de Uso'}
      </Typography>
      
      {/* Mostrar detalhes do plano apenas para clientes específicos, não para admin */}
      {!isAdmin && clienteId && renderDetalhesDoPlanoPara(cliente || {
        plano: estatisticasCliente?.mensagensLimite === 1000 ? "Básico" : 
               estatisticasCliente?.mensagensLimite === 3000 ? "Intermediário" : "Avançado",
        mensagens_usadas: estatisticasCliente.mensagensUsadas,
        mensagens_limite: estatisticasCliente.mensagensLimite
      })}
      
      {isAdmin && !clienteId ? renderEstatisticasGerais() : renderEstatisticasCliente()}
    </Box>
  );
};

export default Dashboard;