import { supabase } from '../lib/supabase';
import { Mensagem } from '../services/cliente';
import { 
  Button, 
  Typography, 
  Box, 
  TextField, 
  CircularProgress
} from '@mui/material';
import ClienteSelector from './ClienteSelector';
import ClienteFinalSelector from './ClienteFinalSelector';
import MensagemGrupo from './MensagemGrupo';
import FormattedText from './FormattedText';
import ControleNotificacoes from './ControleNotificacoes';
import { config } from '../config';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { formatarTelefone } from '../utils';
import { notificacaoService } from '../services/notificacoes';
import { buscarClienteFinalPorId } from '../services/cliente-final';

interface PainelRespostasClienteProps {
  clienteId: string | number;
  mensagens: Mensagem[];
  onAtualizarHistorico: (resetarPaginacao?: boolean, clienteFinalId?: string | number | null) => void;
  onCarregarMais?: () => void;
  totalMensagens?: number;
  isAdmin?: boolean;
  carregandoMais?: boolean;
}

export default function PainelRespostasCliente({ 
  clienteId, 
  mensagens, 
  onAtualizarHistorico,
  onCarregarMais,
  totalMensagens = 0,
  isAdmin = false,
  carregandoMais = false
}: PainelRespostasClienteProps) {
  const [resposta, setResposta] = useState('');
  const [enviandoResposta, setEnviandoResposta] = useState(false);
  const [mensagemSelecionada, setMensagemSelecionada] = useState<string | number | null>(null);
  const [clienteSelecionado, setClienteSelecionado] = useState<string | number | null>(clienteId);
  const [clienteFinalSelecionado, setClienteFinalSelecionado] = useState<string | number | null>(null);
  const [clientesFinaisInfo, setClientesFinaisInfo] = useState<Record<string | number, { modoBotAtivo: boolean }>>({});
  const mensagensAnteriorRef = useRef<Mensagem[]>([]);

  // Função para determinar o número do cliente final
  const getNumeroClienteFinal = (msg: Mensagem): string => {
    // Prioridade 1: numero_destino se não for igual ao whatsapp_cliente
    if (msg.numero_destino && msg.numero_destino !== msg.whatsapp_cliente) {
      const numeroFormatado = formatarTelefone(msg.numero_destino);
      return numeroFormatado;
    }
    
    // Prioridade 2: numero_remetente se não for igual ao whatsapp_cliente
    if (msg.numero_remetente && msg.numero_remetente !== msg.whatsapp_cliente) {
      return msg.numero_remetente;
    }
    
    // Prioridade 3: whatsapp_cliente_final
    if (msg.whatsapp_cliente_final) {
      return msg.whatsapp_cliente_final;
    }
    
    return '';
  };

  // Enviar resposta humana
  const enviarRespostaHumana = async () => {
    if (!mensagemSelecionada || !resposta.trim()) {
      toast.error('Digite uma resposta');
      return;
    }
    
    setEnviandoResposta(true);
    try {
      // Obter a mensagem selecionada para ter acesso aos dados do cliente
      const msgSelecionada = mensagens.find(m => m.id === mensagemSelecionada);
      if (!msgSelecionada) {
        toast.error('Mensagem não encontrada');
        return;
      }
      
      // Atualizar a mensagem no banco de dados
      const { error } = await supabase
        .from('mensagens_enviadas')
        .update({ resposta_humana: resposta.trim() })
        .eq('id', mensagemSelecionada);
      
      if (error) {
        console.error('Erro ao enviar resposta:', error);
        toast.error('Erro ao enviar resposta');
        return;
      }
      
      // Enviar a resposta para o webhook do n8n (se configurado)
      if (config.N8N_WEBHOOK_URL && !config.N8N_WEBHOOK_URL.includes('localhost')) {
        try {
          // Obter o número do cliente final
          const numeroDestino = getNumeroClienteFinal(msgSelecionada);
          const numeroRemetente = msgSelecionada.whatsapp_cliente || '';
          
          // Validar número de destino (deve ser um número válido com pelo menos 8 dígitos)
          if (!numeroDestino || numeroDestino.length < 8) {
            console.log('Número de WhatsApp de destino inválido ou ausente');
            toast.warning('Resposta salva no sistema, mas não enviada por WhatsApp (número inválido)');
            return;
          }
          
          // Formatar número para garantir que esteja no formato correto para o Twilio
          // Twilio espera números no formato internacional (ex: +5511999999999)
          const formatarNumeroInternacional = (numero: string): string => {
            // Remover qualquer caractere não numérico
            const apenasDigitos = numero.replace(/\D/g, '');
            
            // Adicionar o prefixo + se não existir
            return apenasDigitos.startsWith('55') ? `+${apenasDigitos}` : `+55${apenasDigitos}`;
          };
          
          // Preparar os dados para o webhook
          const webhookData = {
            mensagem: resposta.trim(),
            numeroDestino: formatarNumeroInternacional(numeroDestino),
            numeroRemetente: numeroRemetente ? formatarNumeroInternacional(numeroRemetente) : 'sistema',
            tipoMensagem: 'resposta_humana',
            mensagemId: mensagemSelecionada
          };
          
          // Enviar para o webhook do n8n com timeout reduzido
          await axios.post(config.N8N_WEBHOOK_URL, webhookData, {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 3000 // 3 segundos de timeout
          });
          console.log('Resposta enviada para o webhook do n8n');
        } catch (webhookError) {
          console.log('Erro ao enviar para webhook:', webhookError);
          toast.warning('Resposta salva, mas pode não ter sido enviada para o WhatsApp');
        }
      }
      
      toast.success('Resposta enviada com sucesso!');
      setResposta('');
      setMensagemSelecionada(null);
      onAtualizarHistorico(true, clienteFinalSelecionado);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Ocorreu um erro ao enviar a resposta');
    } finally {
      setEnviandoResposta(false);
    }
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const ano = date.getFullYear();
    const hora = date.getHours().toString().padStart(2, '0');
    const minutos = date.getMinutes().toString().padStart(2, '0');
    
    return `${dia}/${mes}/${ano} às ${hora}h${minutos}`;
  };

  // Efeito para atualizar o cliente selecionado quando o clienteId mudar
  useEffect(() => {
    setClienteSelecionado(clienteId);
  }, [clienteId]);
  
  // Efeito para buscar informações dos clientes finais
  useEffect(() => {
    if (!mensagens.length) return;
    
    const carregarClientesFinaisInfo = async () => {
      // Extrair IDs únicos de clientes finais das mensagens
      const clientesFinaisIds = new Set<string | number>();
      mensagens.forEach(msg => {
        if (msg.cliente_final_id) {
          clientesFinaisIds.add(msg.cliente_final_id);
        }
      });
      
      if (clientesFinaisIds.size === 0) return;
      
      // Buscar informações de cada cliente final
      const infoMap: Record<string | number, { modoBotAtivo: boolean }> = {};
      
      for (const id of Array.from(clientesFinaisIds)) {
        const clienteFinal = await buscarClienteFinalPorId(id);
        if (clienteFinal) {
          infoMap[id] = {
            modoBotAtivo: clienteFinal.modo === true // Usar o valor exato do banco de dados
          };
        }
      }
      
      setClientesFinaisInfo(infoMap);
    };
    
    carregarClientesFinaisInfo();
  }, [mensagens]);
  
  // Efeito para verificar novas mensagens e tocar notificação
  useEffect(() => {
    // Se não há mensagens anteriores registradas, apenas armazenar as atuais
    if (mensagensAnteriorRef.current.length === 0) {
      mensagensAnteriorRef.current = [...mensagens];
      return;
    }
    
    // Verificar se há novas mensagens
    const mensagensAnterioresIds = new Set(mensagensAnteriorRef.current.map(m => m.id));
    const novasMensagens = mensagens.filter(m => !mensagensAnterioresIds.has(m.id));
    
    // Se houver novas mensagens, tocar notificação
    if (novasMensagens.length > 0) {
      notificacaoService.tocarNotificacao();
      toast.info(`${novasMensagens.length} nova(s) mensagem(ns) recebida(s)`);
    }
    
    // Atualizar referência de mensagens anteriores
    mensagensAnteriorRef.current = [...mensagens];
  }, [mensagens]);

  // Função para lidar com a mudança de cliente selecionado
  const handleClienteSelecionado = (novoClienteId: string | number | null, tipo?: 'empresa' | 'cliente_final') => {
    if (tipo === 'cliente_final') {
      // Se for um cliente final, definir como cliente final selecionado
      setClienteFinalSelecionado(novoClienteId);
      console.log('Cliente final selecionado:', novoClienteId);
      // Manter o cliente principal atual
    } else {
      // Se for uma empresa ou null, atualizar o cliente selecionado
      setClienteSelecionado(novoClienteId);
      setClienteFinalSelecionado(null); // Resetar o cliente final quando mudar a empresa
    }
    
    setMensagemSelecionada(null);
    setResposta('');
    // Passar o ID do cliente final para a função onAtualizarHistorico
    onAtualizarHistorico(true, tipo === 'cliente_final' ? novoClienteId : null);
  };
  
  // Função para lidar com a mudança de cliente final selecionado
  const handleClienteFinalSelecionado = (novoClienteFinalId: string | number | null) => {
    setClienteFinalSelecionado(novoClienteFinalId);
    setMensagemSelecionada(null);
    setResposta('');
    onAtualizarHistorico(true, novoClienteFinalId);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {isAdmin && (
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f5f5f5' }}>
          <ClienteSelector 
            onClienteSelecionado={handleClienteSelecionado}
            clienteSelecionado={clienteSelecionado}
            empresaId={clienteId}
          />
        </Box>
      )}
      
      {/* Layout estilo WhatsApp */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Lista de contatos (lado esquerdo) */}
        <Box sx={{ width: 300, borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight="medium">Conversas</Typography>
            <ControleNotificacoes />
          </Box>
          
          <Box sx={{ 
            flex: 1, 
            overflowY: 'auto',
            overflowX: 'hidden',
            height: '400px',
            maxHeight: '400px',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0,0,0,0.05)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(0,0,0,0.3)',
            },
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0,0,0,0.2) rgba(0,0,0,0.05)'
          }}>
            {mensagens.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                <Typography>Nenhuma conversa encontrada</Typography>
              </Box>
            ) : (
              <MensagemGrupo 
                mensagens={mensagens}
                clienteId={clienteSelecionado}
                onMensagemSelecionada={setMensagemSelecionada}
                mensagemSelecionada={mensagemSelecionada}
                showBotToggle={true}
              />
            )}
            
            {/* Botão para carregar mais mensagens */}
            {onCarregarMais && mensagens.length < totalMensagens && (
              <Box sx={{ p: 2 }}>
                <Button 
                  variant="text" 
                  onClick={onCarregarMais}
                  disabled={carregandoMais}
                  fullWidth
                  size="small"
                  startIcon={carregandoMais ? <CircularProgress size={16} /> : null}
                >
                  {carregandoMais ? "Carregando..." : `Carregar mais mensagens`}
                </Button>
              </Box>
            )}
          </Box>
        </Box>
        
        {/* Área de conversa (lado direito) */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
          {!mensagemSelecionada ? (
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2, color: 'text.secondary' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <Typography variant="h6">Chat</Typography>
              <Typography variant="body2" align="center" sx={{ maxWidth: 400 }}>
                Selecione uma conversa para ver as mensagens e responder ao cliente.
              </Typography>
            </Box>
          ) : (
            <>
              {/* Cabeçalho da conversa */}
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {(() => {
                  const msgSelecionada = mensagens.find(m => m.id === mensagemSelecionada);
                  if (!msgSelecionada) return null;
                  
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center', mr: 2 }}>
                        <Typography variant="h6" color="primary">{msgSelecionada.nome_cliente_final?.charAt(0) || '?'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle1">{msgSelecionada.nome_cliente_final}</Typography>
                        <Typography variant="caption" color="text.secondary">{getNumeroClienteFinal(msgSelecionada)}</Typography>
                      </Box>
                    </Box>
                  );
                })()}
                
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => setMensagemSelecionada(null)}
                >
                  Voltar
                </Button>
              </Box>
              
              {/* Área de mensagens - Todas as mensagens do cliente */}
              <Box sx={{ 
                flex: 1, 
                p: 2, 
                height: '400px', 
                maxHeight: '400px',
                overflowY: 'auto', 
                overflowX: 'hidden',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(0,0,0,0.05)',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: 'rgba(0,0,0,0.3)',
                },
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(0,0,0,0.2) rgba(0,0,0,0.05)'
              }}>
                {(() => {
                  // Encontrar todas as mensagens do mesmo cliente final
                  const msgSelecionada = mensagens.find(m => m.id === mensagemSelecionada);
                  if (!msgSelecionada) return null;
                  
                  // Filtrar todas as mensagens do mesmo cliente final
                  const clienteFinalId = msgSelecionada.cliente_final_id;
                  const todasMensagensDoCliente = mensagens
                    .filter(m => m.cliente_final_id === clienteFinalId)
                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                  
                  // Agrupar mensagens por data
                  const mensagensPorData: Record<string, Mensagem[]> = {};
                  todasMensagensDoCliente.forEach(msg => {
                    const data = new Date(msg.timestamp).toLocaleDateString();
                    if (!mensagensPorData[data]) {
                      mensagensPorData[data] = [];
                    }
                    mensagensPorData[data].push(msg);
                  });
                  
                  return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, paddingBottom: '20px' }}>
                      {Object.entries(mensagensPorData).map(([data, msgs]) => (
                        <Box key={data} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {/* Data da mensagem */}
                          <Box sx={{ alignSelf: 'center', mb: 1 }}>
                            <Typography variant="caption" sx={{ bgcolor: 'rgba(225, 245, 254, 0.92)', px: 2, py: 0.5, borderRadius: 4 }}>
                              {data}
                            </Typography>
                          </Box>
                          
                          {msgs.map(msg => (
                            <Box key={msg.id} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {/* Mensagem do cliente */}
                              <Box sx={{ alignSelf: 'flex-start', maxWidth: '70%', bgcolor: 'white', p: 2, borderRadius: 2, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                                <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>{msg?.pergunta || 'Mensagem sem conteúdo'}</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'right', mt: 1 }}>
                                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </Typography>
                              </Box>
                              
                              {/* Resposta da IA */}
                              {msg?.resposta && (
                                <Box sx={{ alignSelf: 'flex-end', maxWidth: '70%', bgcolor: '#e3f2fd', p: 2, borderRadius: 2, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                                  <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'primary.main', mb: 1 }}>Resposta Automática</Typography>
                                  <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>{msg.resposta}</Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'right', mt: 1 }}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </Typography>
                                </Box>
                              )}
                              
                              {/* Resposta humana */}
                              {msg?.resposta_humana && (
                                <Box sx={{ alignSelf: 'flex-end', maxWidth: '70%', bgcolor: '#e8f5e9', p: 2, borderRadius: 2, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                                  <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'success.main', mb: 1 }}>Sua Resposta</Typography>
                                  <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>{msg.resposta_humana}</Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'right', mt: 1 }}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </Box>
                      ))}
                    </Box>
                  );
                })()}
              </Box>
              
              {/* Área de digitação */}
              <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e0e0e0', display: 'flex', alignItems: 'flex-start', gap: 1, height: '100px', minHeight: '100px' }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  value={resposta}
                  onChange={(e) => setResposta(e.target.value)}
                  placeholder="Digite sua resposta aqui..."
                  variant="outlined"
                  size="small"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    }
                  }}
                />
                <Button 
                  variant="contained" 
                  color="primary"
                  disabled={enviandoResposta || !resposta.trim()}
                  onClick={enviarRespostaHumana}
                  sx={{ 
                    height: 40,
                    borderRadius: 1
                  }}
                >
                  {enviandoResposta ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Enviar"
                  )}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}