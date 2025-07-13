import React, { useState, useEffect } from 'react';
import ModoBotToggle from './ModoBotToggle';
import { toast } from 'react-toastify';
import { buscarClientesFinais, atualizarModoBotTodosClientesFinais } from '../services/cliente-final';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button, 
  Stack, 
  Paper, 
  Grid, 
  Divider, 
  Alert, 
  CircularProgress 
} from '@mui/material';

interface ClienteFinal {
  id: string | number;
  nome: string;
  whatsapp?: string;
  modo: boolean;
}

interface StatusModoBotClienteProps {
  clienteId: string | number;
  modoBotAtivo?: boolean;
}

export default function StatusModoBotCliente({ clienteId, modoBotAtivo }: StatusModoBotClienteProps) {
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
        <CardContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            <Typography>Carregando configurações...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (clientesFinais.length === 0) {
    return (
      <Card>
        <CardContent sx={{ pt: 2 }}>
          <Typography align="center" sx={{ py: 2 }}>Nenhum contato encontrado.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>Configurações de Resposta Automática</Typography>
            <Typography variant="body2" color="text.secondary">
              Ative ou desative o modo de resposta automática para cada contato.
            </Typography>
            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>Como funciona:</strong> Quando o modo bot está desativado para um contato, as mensagens recebidas desse contato não serão respondidas automaticamente pela IA. Você poderá responder manualmente a essas mensagens através do painel.
              </Typography>
            </Alert>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              color="warning"
              onClick={() => toggleTodosModoBot(false)}
              disabled={atualizandoTodos}
              startIcon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <circle cx="12" cy="5" r="2" />
                  <path d="M12 7v4" />
                  <line x1="8" y1="16" x2="8" y2="16" />
                  <line x1="16" y1="16" x2="16" y2="16" />
                  <line x1="3" y1="3" x2="21" y2="21" />
                </svg>
              }
            >
              Desativar Todos
            </Button>
            <Button 
              variant="contained" 
              color="success"
              onClick={() => toggleTodosModoBot(true)}
              disabled={atualizandoTodos}
              startIcon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <circle cx="12" cy="5" r="2" />
                  <path d="M12 7v4" />
                  <line x1="8" y1="16" x2="8" y2="16" />
                  <line x1="16" y1="16" x2="16" y2="16" />
                </svg>
              }
            >
              Ativar Todos
            </Button>
          </Box>
        </Box>
        
        <Stack spacing={2}>
          {clientesFinais.map(cliente => (
            <Paper 
              key={cliente.id} 
              variant="outlined"
              sx={{ 
                p: 2, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                bgcolor: cliente.modo ? 'success.light' : 'warning.light',
                borderColor: cliente.modo ? 'success.main' : 'warning.main',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: 2 }
              }}
            >
              <Box>
                <Typography variant="subtitle1">{cliente.nome}</Typography>
                {cliente.whatsapp && (
                  <Typography variant="body2" color="text.secondary">{cliente.whatsapp}</Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  {cliente.modo ? (
                    <Typography variant="caption" color="success.dark" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      Respostas automáticas ativadas
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="warning.dark" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      Aguardando resposta manual
                    </Typography>
                  )}
                </Box>
              </Box>
              <ModoBotToggle 
                clienteFinalId={cliente.id}
                modoBotAtivo={cliente.modo === false ? false : true}
                onToggle={(novoEstado) => handleToggle(cliente.id, novoEstado)}
              />
            </Paper>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}