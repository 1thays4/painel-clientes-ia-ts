import React, { useState, useEffect, useRef } from 'react';
import { Mensagem } from '../services/cliente';
import { formatarTelefone } from '../utils';
import FormattedText from './FormattedText';
import ModoBotToggle from './ModoBotToggle';
import { supabase } from '../lib/supabase';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Chip, 
  Button
} from '@mui/material';

interface MensagemGrupoProps {
  mensagens: Mensagem[];
  clienteId: string | number | null;
  onMensagemSelecionada: (mensagemId: string | number) => void;
  mensagemSelecionada: string | number | null;
  showBotToggle?: boolean;
}

export default function MensagemGrupo({
  mensagens,
  clienteId,
  onMensagemSelecionada,
  mensagemSelecionada,
  showBotToggle = true
}: MensagemGrupoProps) {
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [novasMensagens, setNovasMensagens] = useState<Record<string | number, boolean>>({});
  const mensagensAnterioresRef = useRef<string[]>([]);
  const [clientesFinaisInfo, setClientesFinaisInfo] = useState<Record<string | number, { id: string | number, nome: string, modo: boolean }>>({});
  
  // Buscar informações dos clientes finais
  useEffect(() => {
    if (!clienteId || !mensagens.length) return;
    
    const buscarClientesFinais = async () => {
      try {
        // Extrair IDs únicos de clientes finais das mensagens
        const clientesFinaisIds = new Set<string | number>();
        mensagens.forEach(msg => {
          if (msg.cliente_final_id) {
            clientesFinaisIds.add(msg.cliente_final_id);
          }
        });
        
        if (clientesFinaisIds.size === 0) return;
        
        // Buscar informações dos clientes finais
        const { data, error } = await supabase
          .from('clientes_finais')
          .select('id, nome, modo')
          .in('id', Array.from(clientesFinaisIds));
        
        if (error) {
          console.error('Erro ao buscar clientes finais:', error);
          return;
        }
        
        // Criar mapa de informações dos clientes finais
        const infoMap: Record<string | number, { id: string | number, nome: string, modo: boolean }> = {};
        data?.forEach((cliente: { id: string | number; nome: any; modo: string; }) => {
          // Usar o valor exato do banco de dados, sem valor padrão
          const modoEfetivo = cliente.modo === "true" || cliente.modo === "encerrado" || cliente.modo === "em aberto";
          
          infoMap[cliente.id] = {
            id: cliente.id,
            nome: cliente.nome,
            modo: modoEfetivo
          };
          console.log(`Cliente final ${cliente.id}: modo original = ${cliente.modo}, modo efetivo = ${modoEfetivo}`);
        });
        
        setClientesFinaisInfo(infoMap);
      } catch (error) {
        console.error('Erro ao buscar clientes finais:', error);
      }
    };
    
    buscarClientesFinais();
  }, [clienteId, mensagens]);
  
  // Detectar novas mensagens para destacar
  useEffect(() => {
    if (mensagens.length === 0) return;
    
    // Obter IDs das mensagens atuais
    const idsAtuais = mensagens.map(m => m.id.toString());
    
    // Encontrar novas mensagens (que não estavam na lista anterior)
    const novasIds: Record<string | number, boolean> = {};
    idsAtuais.forEach(id => {
      if (!mensagensAnterioresRef.current.includes(id)) {
        novasIds[id] = true;
      }
    });
    
    // Atualizar estado se houver novas mensagens
    if (Object.keys(novasIds).length > 0) {
      setNovasMensagens(novasIds);
      
      // Limpar o destaque após alguns segundos
      setTimeout(() => {
        setNovasMensagens({});
      }, 5000);
    }
    
    // Atualizar referência de mensagens anteriores
    mensagensAnterioresRef.current = idsAtuais;
  }, [mensagens]);

  // Agrupar mensagens por cliente final (whatsapp ou id)
  const mensagensPorCliente: Record<string, Mensagem[]> = {};
  
  // Verificar se há mensagens antes de tentar agrupar
  if (mensagens && mensagens.length > 0) {
    // Ordenar mensagens por data (mais recentes primeiro)
    const mensagensOrdenadas = [...mensagens].sort((a, b) => {
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    
    mensagensOrdenadas.forEach(msg => {
      if (!msg) return; // Ignorar mensagens inválidas
      
      // Criar chave de agrupamento mais robusta
      let chave;
      // Priorizar o número de destino se disponível
      if (msg.numero_destino) {
        chave = `destino_${msg.numero_destino}`;
      } else if (msg.cliente_final_id) {
        chave = `cliente_${msg.cliente_final_id}`;
      } else if (msg.whatsapp_cliente_final) {
        chave = `whatsapp_${msg.whatsapp_cliente_final}`;
      } else {
        chave = `msg_${msg.id || Date.now()}`;
      }
      
      if (!mensagensPorCliente[chave]) {
        mensagensPorCliente[chave] = [];
      }
      mensagensPorCliente[chave].push(msg);
    });
  } else {
    console.log('Nenhuma mensagem para agrupar');
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Renderizar a lista de contatos
  const renderContatos = () => {
    return Object.entries(mensagensPorCliente).map(([clienteKey, msgs]) => (
      <div key={clienteKey} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
        {msgs[0] && (
          <Paper 
            variant="outlined"
            sx={{
              p: 2, 
              cursor: 'pointer',
              transition: 'all 0.2s',
              bgcolor: mensagemSelecionada && msgs.some(m => m.id === mensagemSelecionada) ? 'rgba(18, 140, 126, 0.1)' : 'background.paper',
              borderColor: mensagemSelecionada && msgs.some(m => m.id === mensagemSelecionada) ? '#128C7E' : 'divider',
              '&:hover': { bgcolor: mensagemSelecionada && msgs.some(m => m.id === mensagemSelecionada) ? 'rgba(18, 140, 126, 0.1)' : 'rgba(0, 0, 0, 0.04)' },
              ...(msgs.some(m => novasMensagens[m.id]) ? { boxShadow: '0 0 0 2px #128C7E' } : {})
            }}
            onClick={() => onMensagemSelecionada(msgs[0].id)}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* Nome do contato */}
              <Typography variant="subtitle2" sx={{ fontWeight: 'medium', color: mensagemSelecionada && msgs.some(m => m.id === mensagemSelecionada) ? '#128C7E' : 'inherit' }}>
                {msgs[0].nome_cliente_final || 'Cliente'}
              </Typography>
              
              {/* Telefone */}
              <Typography variant="body2" color="text.secondary">
                {formatarTelefone(msgs[0].numero_destino) || msgs[0].whatsapp_cliente_final || 'Sem telefone'}
              </Typography>
              
              {/* Última mensagem e data */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {new Date(msgs[0].timestamp).toLocaleDateString()}
                </Typography>
                
                {/* Indicador de modo bot e toggle */}
                {msgs[0].cliente_final_id && clientesFinaisInfo[msgs[0].cliente_final_id] && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {showBotToggle ? (
                      <ModoBotToggle
                        clienteFinalId={msgs[0].cliente_final_id}
                        modoBotAtivo={clientesFinaisInfo[msgs[0].cliente_final_id].modo}
                        onClick={(e) => {
                          // Impedir que o clique no toggle selecione a mensagem
                          e.stopPropagation();
                        }}
                      />
                    ) : (
                      <Chip 
                        size="small"
                        color={clientesFinaisInfo[msgs[0].cliente_final_id].modo ? "success" : "warning"}
                        label={clientesFinaisInfo[msgs[0].cliente_final_id].modo ? "Bot" : "Manual"}
                        variant="outlined"
                        sx={{ height: 20, '& .MuiChip-label': { px: 1, py: 0, fontSize: '0.625rem' } }}
                      />
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </Paper>
        )}
      </div>
    ));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {renderContatos()}
    </div>
  );
}