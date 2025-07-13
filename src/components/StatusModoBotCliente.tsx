import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import ModoBotToggle from './ModoBotToggle';
import { toast } from 'react-toastify';
import { buscarClientesFinais, atualizarModoBotTodosClientesFinais } from '../services/cliente-final';

interface ClienteFinal {
  id: string | number;
  nome: string;
  whatsapp?: string;
  modo: boolean;
}

interface StatusModoBotClienteProps {
  clienteId: string | number;
}

export default function StatusModoBotCliente({ clienteId }: StatusModoBotClienteProps) {
  const [clientesFinais, setClientesFinais] = useState<ClienteFinal[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizandoTodos, setAtualizandoTodos] = useState(false);

  useEffect(() => {
    const carregarClientesFinais = async () => {
      if (!clienteId) return;
      
      try {
        setCarregando(true);
        
        // Usar o serviço para buscar os clientes finais
        const clientes = await buscarClientesFinais(clienteId);
        setClientesFinais(clientes);
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setCarregando(false);
      }
    };
    
    carregarClientesFinais();
  }, [clienteId]);

  const handleToggle = (clienteFinalId: string | number, novoEstado: boolean) => {
    // Atualizar o estado local
    setClientesFinais(clientesFinais.map(cliente => 
      cliente.id === clienteFinalId 
        ? { ...cliente, modo: novoEstado } 
        : cliente
    ));
  };
  
  // Função para ativar/desativar o modo bot para todos os contatos
  const toggleTodosModoBot = async (ativar: boolean) => {
    if (!clienteId || clientesFinais.length === 0) return;
    
    setAtualizandoTodos(true);
    try {
      // Usar o serviço para atualizar todos os clientes finais
      const sucesso = await atualizarModoBotTodosClientesFinais(clienteId, ativar);
      
      if (!sucesso) {
        toast.error('Erro ao atualizar configurações');
        return;
      }
      
      // Atualizar estado local
      setClientesFinais(clientesFinais.map(cliente => ({
        ...cliente,
        modo: ativar
      })));
      
      toast.success(`Modo de resposta automática ${ativar ? 'ativado' : 'desativado'} para todos os contatos`);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Ocorreu um erro ao atualizar as configurações');
    } finally {
      setAtualizandoTodos(false);
    }
  };

  if (carregando) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center py-4">Carregando configurações...</p>
        </CardContent>
      </Card>
    );
  }

  if (clientesFinais.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center py-4">Nenhum contato encontrado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">Configurações de Resposta Automática</h2>
            <p className="text-sm text-gray-600">
              Ative ou desative o modo de resposta automática para cada contato.
            </p>
            <div className="mt-2 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
              <p><strong>Como funciona:</strong> Quando o modo bot está desativado para um contato, as mensagens recebidas desse contato não serão respondidas automaticamente pela IA. Você poderá responder manualmente a essas mensagens através do painel.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => toggleTodosModoBot(false)}
              disabled={atualizandoTodos}
              className="flex items-center gap-1 border-yellow-500 text-yellow-700 hover:bg-yellow-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v4" />
                <line x1="8" y1="16" x2="8" y2="16" />
                <line x1="16" y1="16" x2="16" y2="16" />
                <line x1="3" y1="3" x2="21" y2="21" />
              </svg>
              Desativar Todos os Bots
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => toggleTodosModoBot(true)}
              disabled={atualizandoTodos}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v4" />
                <line x1="8" y1="16" x2="8" y2="16" />
                <line x1="16" y1="16" x2="16" y2="16" />
              </svg>
              Ativar Todos os Bots
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          {clientesFinais.map(cliente => (
            <div 
              key={cliente.id} 
              className={`flex justify-between items-center p-4 border rounded-lg ${cliente.modo ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} hover:shadow-md transition-all duration-200`}
            >
              <div>
                <h3 className="font-medium text-lg">{cliente.nome}</h3>
                {cliente.whatsapp && (
                  <p className="text-sm text-gray-600">{cliente.whatsapp}</p>
                )}
                <p className="text-xs mt-1">
                  {cliente.modo ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      Respostas automáticas ativadas
                    </span>
                  ) : (
                    <span className="text-yellow-600 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      Aguardando resposta manual
                    </span>
                  )}
                </p>
              </div>
              <ModoBotToggle 
                clienteFinalId={cliente.id}
                modoBotAtivo={cliente.modo === false ? false : true}
                onToggle={(novoEstado) => handleToggle(cliente.id, novoEstado)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}