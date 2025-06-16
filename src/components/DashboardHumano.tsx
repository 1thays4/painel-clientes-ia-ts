import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ToastContainer, toast } from 'react-toastify';
import PainelRespostasHumanas from './PainelRespostasHumanas';
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

export default function DashboardHumano() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const { user, signOut, isAdmin } = useAuth();

  const buscarClientes = async () => {
    try {
      setCarregando(true);
      let query = supabase.from('clientes').select('*');
      
      // Se não for admin, filtrar apenas os clientes do usuário atual
      if (!isAdmin && user) {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query.order('nome', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar clientes:', error);
        toast.error('Erro ao carregar clientes');
        return;
      }
      
      setClientes(data || []);
      
      // Se tiver apenas um cliente e não for admin, seleciona automaticamente
      if (data && data.length === 1 && !isAdmin) {
        setClienteSelecionado(data[0].id);
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Ocorreu um erro ao buscar os dados');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarClientes();
  }, [user, isAdmin]);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Dashboard de Atendimento Humano
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user?.email} {isAdmin && '(Admin)'}
          </span>
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
              <Link to="/painel">
                <Button variant="outline">
                  Voltar ao Painel Principal
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Seleção de cliente (apenas para admin) */}
      {isAdmin && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Selecionar Cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {clientes.map((cliente) => (
                <Button 
                  key={cliente.id}
                  variant={clienteSelecionado === cliente.id ? "default" : "outline"}
                  onClick={() => setClienteSelecionado(cliente.id)}
                  className="mb-2"
                >
                  {cliente.nome}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Painel de respostas humanas */}
      {carregando ? (
        <p className="text-center py-8">Carregando dados...</p>
      ) : (
        <PainelRespostasHumanas 
          clienteId={clienteSelecionado || undefined}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}