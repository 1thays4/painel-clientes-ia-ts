import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ToastContainer, toast } from 'react-toastify';
import { Mensagem } from '../services/cliente';
import 'react-toastify/dist/ReactToastify.css';
import { Cliente } from '../types/Cliente';

interface PainelRespostasHumanasProps {
  clienteId?: string | number;
  isAdmin?: boolean;
}

export default function PainelRespostasHumanas({ clienteId, isAdmin = false }: PainelRespostasHumanasProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<string | number | null>(clienteId || null);
  const [carregando, setCarregando] = useState(true);
  const [resposta, setResposta] = useState('');
  const [enviandoResposta, setEnviandoResposta] = useState(false);
  const [mensagemSelecionada, setMensagemSelecionada] = useState<string | number | null>(null);

  // Buscar clientes (apenas para admins)
  useEffect(() => {
    if (isAdmin) {
      const buscarClientes = async () => {
        try {
          const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .order('nome');
          
          if (error) {
            console.error('Erro ao buscar clientes:', error);
            toast.error('Erro ao carregar clientes');
            return;
          }
          
          setClientes(data || []);
        } catch (error) {
          console.error('Erro:', error);
        }
      };
      
      buscarClientes();
    }
  }, [isAdmin]);

  // Buscar mensagens pendentes de resposta
  useEffect(() => {
    if (!clienteSelecionado && !isAdmin) return;
    
    const buscarMensagensPendentes = async () => {
      setCarregando(true);
      try {
        let query = supabase
          .from('mensagens_enviadas')
          .select('*')
          .is('resposta_humana', null)
          .order('timestamp', { ascending: false });
        
        // Se não for admin ou se um cliente específico foi selecionado
        if (!isAdmin || clienteSelecionado) {
          query = query.eq('cliente_id', clienteSelecionado);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Erro ao buscar mensagens:', error);
          toast.error('Erro ao carregar mensagens');
          return;
        }
        
        setMensagens(data || []);
      } catch (error) {
        console.error('Erro:', error);
        toast.error('Ocorreu um erro ao buscar as mensagens');
      } finally {
        setCarregando(false);
      }
    };
    
    buscarMensagensPendentes();
    
    // Configurar assinatura em tempo real para novas mensagens
    const channel = supabase
      .channel('mensagens-pendentes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'mensagens_enviadas',
          filter: isAdmin ? undefined : `cliente_id=eq.${clienteSelecionado}`
        }, 
        (payload: { new: Mensagem; }) => {
          console.log('Nova mensagem recebida:', payload);
          // Adicionar apenas se não tiver resposta_humana
          if (!payload.new.resposta_humana) {
            setMensagens(mensagensAtuais => [payload.new as Mensagem, ...mensagensAtuais]);
            toast.info('Nova mensagem recebida!');
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [clienteSelecionado, isAdmin]);

  // Enviar resposta humana
  const enviarRespostaHumana = async () => {
    if (!mensagemSelecionada || !resposta.trim()) {
      toast.error('Selecione uma mensagem e digite uma resposta');
      return;
    }
    
    setEnviandoResposta(true);
    try {
      const { error } = await supabase
        .from('mensagens_enviadas')
        .update({ resposta_humana: resposta.trim() })
        .eq('id', mensagemSelecionada);
      
      if (error) {
        console.error('Erro ao enviar resposta:', error);
        toast.error('Erro ao enviar resposta');
        return;
      }
      
      toast.success('Resposta enviada com sucesso!');
      
      // Atualizar a lista de mensagens
      setMensagens(mensagens.filter(msg => msg.id !== mensagemSelecionada));
      setResposta('');
      setMensagemSelecionada(null);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Ocorreu um erro ao enviar a resposta');
    } finally {
      setEnviandoResposta(false);
    }
  };

  // Formatar data
  const formatarData = (dataString: string) => {
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
    <div className="p-4 max-w-6xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <h1 className="text-2xl font-bold mb-6">Painel de Respostas Humanas</h1>
      
      {isAdmin && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Selecionar Cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button 
                variant={clienteSelecionado === null ? "default" : "outline"}
                onClick={() => setClienteSelecionado(null)}
                className="mb-2"
              >
                Todos os Clientes
              </Button>
              
              {clientes.map(cliente => (
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lista de mensagens pendentes */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Mensagens Pendentes</h2>
            
            {carregando ? (
              <p className="text-center py-8">Carregando mensagens...</p>
            ) : mensagens.length === 0 ? (
              <p className="text-center py-8 text-gray-500">Nenhuma mensagem pendente</p>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {mensagens.map(msg => (
                  <div 
                    key={msg.id}
                    className={`border p-4 rounded-lg cursor-pointer transition-colors ${
                      mensagemSelecionada === msg.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setMensagemSelecionada(msg.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">
                        {msg.pergunta || 'Mensagem recebida'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatarData(msg.timestamp)}
                      </span>
                    </div>
                    
                    {msg.resposta && (
                      <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        <strong>Resposta IA:</strong> {msg.resposta}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Área de resposta */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Responder Manualmente</h2>
            
            {!mensagemSelecionada ? (
              <p className="text-center py-8 text-gray-500">Selecione uma mensagem para responder</p>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Mensagem selecionada:</h3>
                  <p>
                    {mensagens.find(m => m.id === mensagemSelecionada)?.pergunta || 'Mensagem sem conteúdo'}
                  </p>
                  
                  {mensagens.find(m => m.id === mensagemSelecionada)?.resposta && (
                    <div className="mt-4 text-sm">
                      <h4 className="font-medium">Resposta da IA:</h4>
                      <p className="mt-1 text-gray-700">
                        {mensagens.find(m => m.id === mensagemSelecionada)?.resposta}
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Sua resposta:
                  </label>
                  <textarea
                    className="w-full border rounded-md p-2 min-h-[150px]"
                    value={resposta}
                    onChange={(e) => setResposta(e.target.value)}
                    placeholder="Digite sua resposta aqui..."
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setMensagemSelecionada(null);
                      setResposta('');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={enviarRespostaHumana}
                    disabled={enviandoResposta || !resposta.trim()}
                  >
                    {enviandoResposta ? 'Enviando...' : 'Enviar Resposta'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}