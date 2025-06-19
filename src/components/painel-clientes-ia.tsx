import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ToastContainer, toast } from 'react-toastify';
import AdicionarCliente from './AdicionarCliente';
import Dashboard from './Dashboard';
import { formatarWhatsAppParaExibicao } from '../lib/validacao';
import { verificarLimiteMensagens } from '../lib/validacao';
import 'react-toastify/dist/ReactToastify.css';

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
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarDashboard, setMostrarDashboard] = useState(true);
  const { user, signOut, isAdmin } = useAuth();

  const buscarClientes = async () => {
    try {
      setCarregando(true);
      let query = supabase.from('clientes').select('*');
      
      // Se não for admin, filtrar apenas os clientes do usuário atual
      if (!isAdmin && user) {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query.order('data_cadastro', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar clientes:', error);
        toast.error('Erro ao carregar clientes');
        return;
      }
      
      setClientes(data || []);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Ocorreu um erro ao buscar os dados');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarClientes();
    
    // Configurar assinatura em tempo real para atualizações de clientes
    const channel = supabase
      .channel('clientes-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'clientes'
        }, 
        () => {
          // Atualizar a lista de clientes quando houver mudanças
          buscarClientes();
        }
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
    const link = `${window.location.origin}/cliente/${token}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado para a área de transferência!');
  };

  const handleClienteAdicionado = () => {
    buscarClientes();
    setMostrarFormulario(false);
  };

  // Função para renderizar o status de uso de mensagens
  const renderStatusMensagens = (cliente: Cliente) => {
    const mensagensUsadas = cliente.mensagens_usadas || 0;
    const mensagensLimite = cliente.mensagens_limite || 1000;
    const limiteInfo = verificarLimiteMensagens(mensagensUsadas, mensagensLimite);
    
    return (
      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span>Uso: {mensagensUsadas}/{mensagensLimite}</span>
          <span>{Math.round(limiteInfo.percentual)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${
              limiteInfo.status === 'critico' ? 'bg-red-600' :
              limiteInfo.status === 'alerta' ? 'bg-yellow-500' : 'bg-green-500'
            }`} 
            style={{ width: `${Math.min(limiteInfo.percentual, 100)}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isAdmin ? 'Painel Administrativo' : 'Meu Painel'}
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user?.email} {isAdmin && '(Admin)'}
          </span>
          <Link to="/atendimento-humano">
            <Button variant="default" className="mr-2">
              Atendimento Humano
            </Button>
          </Link>
          <Button variant="outline" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </div>
      
      {isAdmin && (
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-2">Modo Administrador</h2>
            <p className="text-sm text-gray-700 mb-4">
              Você tem acesso a todos os clientes cadastrados no sistema.
            </p>
            <div className="flex gap-2">
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setMostrarFormulario(!mostrarFormulario)}
              >
                {mostrarFormulario ? "Cancelar" : "Adicionar Novo Cliente"}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setMostrarDashboard(!mostrarDashboard)}
              >
                {mostrarDashboard ? "Ver Lista de Clientes" : "Ver Dashboard"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Formulário de adicionar cliente */}
      {mostrarFormulario && (
        <div className="mb-6">
          <AdicionarCliente onClienteAdicionado={handleClienteAdicionado} />
        </div>
      )}
      
      {/* Dashboard para administradores */}
      {isAdmin && mostrarDashboard && (
        <div className="mb-6">
          <Dashboard isAdmin={true} />
        </div>
      )}
      
      {/* Lista de clientes */}
      {(!mostrarDashboard || !isAdmin) && (
        <>
          <h2 className="text-xl font-semibold mb-4">
            {isAdmin ? 'Todos os Clientes' : 'Meus Dados'}
          </h2>
          
          {carregando ? (
            <p className="text-center py-8">Carregando clientes...</p>
          ) : clientes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500">Nenhum cliente encontrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientes.map((cliente) => (
                <Card key={cliente.id} className="overflow-hidden">
                  <CardContent className="pt-6">
                    <h3 className="font-bold text-lg mb-1">{cliente.nome}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      Plano: <span className="font-medium capitalize">{cliente.plano}</span>
                    </p>
                    <div className="text-sm mb-4">
                      <p>WhatsApp: {cliente.whatsapp ? formatarWhatsAppParaExibicao(cliente.whatsapp) : 'Não informado'}</p>
                      <p>Email: {cliente.email || 'Não informado'}</p>
                      {renderStatusMensagens(cliente)}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link to={`/cliente/${cliente.token_publico || cliente.id}`}>
                        <Button className="w-full">Ver Painel</Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => copiarLinkCliente(cliente.token_publico || cliente.id)}
                      >
                        Copiar Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}