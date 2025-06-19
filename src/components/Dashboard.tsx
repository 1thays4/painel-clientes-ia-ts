import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { verificarLimiteMensagens } from '../lib/validacao';

interface DashboardProps {
  clienteId?: string | number;
  isAdmin?: boolean;
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

const Dashboard: React.FC<DashboardProps> = ({ clienteId, isAdmin = false }) => {
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Mensagens</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{estatisticasGerais.totalMensagens}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Hoje</p>
                <p className="text-2xl font-bold">{estatisticasGerais.mensagensHoje}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Semana</p>
                <p className="text-2xl font-bold">{estatisticasGerais.mensagensSemana}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mês</p>
                <p className="text-2xl font-bold">{estatisticasGerais.mensagensMes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Clientes</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{estatisticasGerais.clientesTotal}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ativos (mês)</p>
                <p className="text-2xl font-bold">{estatisticasGerais.clientesAtivos}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Taxa de Atividade</p>
                <p className="text-2xl font-bold">
                  {estatisticasGerais.clientesTotal > 0
                    ? `${Math.round((estatisticasGerais.clientesAtivos / estatisticasGerais.clientesTotal) * 100)}%`
                    : '0%'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Média por Cliente</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-gray-500">Mensagens/Cliente</p>
                <p className="text-2xl font-bold">
                  {estatisticasGerais.clientesTotal > 0
                    ? Math.round(estatisticasGerais.totalMensagens / estatisticasGerais.clientesTotal)
                    : 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mensagens/Mês</p>
                <p className="text-2xl font-bold">
                  {estatisticasGerais.clientesAtivos > 0
                    ? Math.round(estatisticasGerais.mensagensMes / estatisticasGerais.clientesAtivos)
                    : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
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
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Uso de Mensagens</h3>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span>Este mês</span>
                <span className="font-medium">
                  {estatisticasCliente.mensagensUsadas} / {estatisticasCliente.mensagensLimite}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    limiteInfo.status === 'critico' ? 'bg-red-600' :
                    limiteInfo.status === 'alerta' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} 
                  style={{ width: `${Math.min(limiteInfo.percentual, 100)}%` }}
                ></div>
              </div>
              {limiteInfo.mensagem && (
                <p className={`mt-1 text-sm ${
                  limiteInfo.status === 'critico' ? 'text-red-600' :
                  limiteInfo.status === 'alerta' ? 'text-yellow-600' : ''
                }`}>
                  {limiteInfo.mensagem}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div>
                <p className="text-sm text-gray-500">Hoje</p>
                <p className="text-2xl font-bold">{estatisticasCliente.mensagensHoje}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Semana</p>
                <p className="text-2xl font-bold">{estatisticasCliente.mensagensSemana}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Atividade</h3>
            <div>
              <p className="text-sm text-gray-500">Última mensagem</p>
              <p className="text-xl font-bold">{formatarData(estatisticasCliente.ultimaAtividade)}</p>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Média diária (semana)</p>
              <p className="text-xl font-bold">
                {Math.round(estatisticasCliente.mensagensSemana / 7)} mensagens/dia
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  if (carregando) {
    return (
      <div className="p-4 text-center">
        <p>Carregando estatísticas...</p>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        {isAdmin && !clienteId ? 'Estatísticas Gerais' : 'Estatísticas de Uso'}
      </h2>
      
      {isAdmin && !clienteId ? renderEstatisticasGerais() : renderEstatisticasCliente()}
    </div>
  );
};

export default Dashboard;