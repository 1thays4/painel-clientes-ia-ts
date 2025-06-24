import { supabase } from '../lib/supabase';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Mensagem } from '../services/cliente';
import ClienteSelector from './ClienteSelector';
import ClienteFinalSelector from './ClienteFinalSelector';
import MensagemGrupo from './MensagemGrupo';
import { config } from '../config';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { formatarTelefone } from '../utils';

interface PainelRespostasClienteProps {
  clienteId: string | number;
  mensagens: Mensagem[];
  onAtualizarHistorico: (resetarPaginacao?: boolean) => void;
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
      onAtualizarHistorico();
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

  // Função para lidar com a mudança de cliente selecionado
  const handleClienteSelecionado = (novoClienteId: string | number | null) => {
    setClienteSelecionado(novoClienteId);
    setClienteFinalSelecionado(null); // Resetar o cliente final quando mudar a empresa
    setMensagemSelecionada(null);
    setResposta('');
    onAtualizarHistorico();
  };
  
  // Função para lidar com a mudança de cliente final selecionado
  const handleClienteFinalSelecionado = (novoClienteFinalId: string | number | null) => {
    setClienteFinalSelecionado(novoClienteFinalId);
    setMensagemSelecionada(null);
    setResposta('');
    onAtualizarHistorico();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className="text-xl font-bold">
            Histórico de Mensagens ({mensagens.length}{totalMensagens > 0 ? ` de ${totalMensagens}` : ''})
          </h2>
          <Button 
            variant="ghost" 
            onClick={() => onAtualizarHistorico(true)}
            disabled={enviandoResposta}
            className="ml-2 p-1 h-8"
            title="Atualizar histórico"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
          </Button>
        </div>
      </div>
      
      {isAdmin && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Filtros:</h3>
          <ClienteSelector 
            onClienteSelecionado={handleClienteSelecionado}
            clienteSelecionado={clienteSelecionado}
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lista de mensagens */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">Mensagens</h3>
            
            {mensagens.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma mensagem encontrada</p>
            ) : (
              <div className="flex flex-col">
                <div className="max-h-[500px] overflow-y-auto">
                  <MensagemGrupo 
                    mensagens={clienteFinalSelecionado 
                      ? mensagens.filter(msg => msg.cliente_final_id === clienteFinalSelecionado)
                      : mensagens
                    }
                    clienteId={clienteSelecionado}
                    onMensagemSelecionada={setMensagemSelecionada}
                    mensagemSelecionada={mensagemSelecionada}
                  />
                </div>
                
                {/* Botão para carregar mais mensagens */}
                {onCarregarMais && mensagens.length < totalMensagens && (
                  <div className="mt-4 text-center">
                    <Button 
                      variant="outline" 
                      onClick={onCarregarMais}
                      disabled={carregandoMais}
                      className="w-full"
                    >
                      {carregandoMais ? "Carregando..." : `Carregar mais (${mensagens.length} de ${totalMensagens})`}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Área de resposta */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">Responder ao Cliente</h3>
            
            {!mensagemSelecionada ? (
              <p className="text-center py-8 text-gray-500">Selecione uma mensagem para responder</p>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  {(() => {
                    const msgSelecionada = mensagens.find(m => m.id === mensagemSelecionada);
                    if (!msgSelecionada) return null;
                    
                    const numeroClienteFinal = getNumeroClienteFinal(msgSelecionada);
                    
                    return (
                      <>
                        <div className="mb-3 pb-2 border-b border-gray-200">
                          {/* Informações do cliente final */}
                          <div>
                            <h4 className="font-medium text-green-600">
                              Cliente
                            </h4>
                            {numeroClienteFinal && (
                              <p className="text-sm text-gray-600">
                                WhatsApp: {numeroClienteFinal}
                              </p>
                            )}
                          </div>
                        </div>
                        <h4 className="font-medium mb-2">Mensagem:</h4>
                        <p>
                          {msgSelecionada?.pergunta || 'Mensagem sem conteúdo'}
                        </p>
                        
                        {msgSelecionada?.resposta && (
                          <div className="mt-4 text-sm">
                            <h4 className="font-medium">Resposta da IA:</h4>
                            <p className="mt-1 text-gray-700">
                              {msgSelecionada.resposta}
                            </p>
                          </div>
                        )}
                      </>
                    );
                  })()}
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