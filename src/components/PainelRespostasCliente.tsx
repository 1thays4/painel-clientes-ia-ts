import { supabase } from '../lib/supabase';
import { Mensagem } from '../services/cliente';
import { 
  Card, 
  CardContent, 
  Button, 
  Typography, 
  Box, 
  Grid, 
  TextField, 
  Paper, 
  Chip,
  CircularProgress,
  Divider
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
            modoBotAtivo: clienteFinal.modo !== false // true por padrão se não estiver definido
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
        <ControleNotificacoes />
      </Box>
      
      {isAdmin && (
        <Box sx={{ mb: 3 }}>
          <ClienteSelector 
            onClienteSelecionado={handleClienteSelecionado}
            clienteSelecionado={clienteSelecionado}
            empresaId={clienteId} // Passar o ID da empresa atual
          />
        </Box>
      )}
      
      <Grid container spacing={3}>
        {/* Lista de mensagens */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ pt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Mensagens</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'warning.main' }}></Box>
                    <Typography variant="caption">Resposta manual</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main' }}></Box>
                    <Typography variant="caption">Resposta automática</Typography>
                  </Box>
                </Box>
              </Box>
            
              {mensagens.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 2 }}>Nenhuma mensagem encontrada</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
                    <Paper variant="outlined" sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderColor: 'info.main' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <Typography variant="subtitle2" color="info.dark">Como usar o modo bot</Typography>
                      </Box>
                      <Typography variant="body2" color="info.dark">
                        Você pode ativar ou desativar o modo bot para cada contato usando o botão de toggle. 
                        Quando o modo bot está desativado, as mensagens desse contato não serão respondidas automaticamente pela IA.
                      </Typography>
                    </Paper>
                    <MensagemGrupo 
                      mensagens={mensagens}
                      clienteId={clienteSelecionado}
                      onMensagemSelecionada={setMensagemSelecionada}
                      mensagemSelecionada={mensagemSelecionada}
                      showBotToggle={true}
                    />
                  </Box>
                  
                  {/* Botão para carregar mais mensagens */}
                  {onCarregarMais && mensagens.length < totalMensagens && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Button 
                        variant="outlined" 
                        onClick={onCarregarMais}
                        disabled={carregandoMais}
                        fullWidth
                        startIcon={carregandoMais ? <CircularProgress size={16} /> : null}
                      >
                        {carregandoMais ? "Carregando..." : `Carregar mais (${mensagens.length} de ${totalMensagens})`}
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Área de resposta */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ pt: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 2 }}>Responder ao Cliente</Typography>
              
              {!mensagemSelecionada ? (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>Selecione uma mensagem para responder</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                    {(() => {
                      const msgSelecionada = mensagens.find(m => m.id === mensagemSelecionada);
                      if (!msgSelecionada) return null;
                      
                      const numeroClienteFinal = getNumeroClienteFinal(msgSelecionada);
                      
                      return (
                        <>
                          <Box sx={{ mb: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                            {/* Informações do cliente final */}
                            <Box>
                              <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 'medium' }}>
                                {msgSelecionada.nome_cliente_final}
                              </Typography>
                              {numeroClienteFinal && (
                                <Typography variant="body2" color="text.secondary">
                                  WhatsApp: {numeroClienteFinal}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>Mensagem:</Typography>
                          <FormattedText 
                            text={msgSelecionada?.pergunta || 'Mensagem sem conteúdo'}
                            type="received"
                            component="div"
                          />
                          
                          {msgSelecionada?.resposta && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" sx={{ mb: 1 }}>Resposta da IA:</Typography>
                              <FormattedText 
                                text={msgSelecionada.resposta}
                                type="ai"
                                component="div"
                              />
                            </Box>
                          )}
                        </>
                      );
                    })()}
                  </Paper>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Sua resposta:
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      value={resposta}
                      onChange={(e) => setResposta(e.target.value)}
                      placeholder="Digite sua resposta aqui..."
                      variant="outlined"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => {
                        setMensagemSelecionada(null);
                        setResposta('');
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      variant="contained"
                      color="primary"
                      onClick={enviarRespostaHumana}
                      disabled={enviandoResposta || !resposta.trim()}
                      startIcon={enviandoResposta ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                      {enviandoResposta ? 'Enviando...' : 'Enviar Resposta'}
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}