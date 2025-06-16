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

interface PainelRespostasClienteProps {
  clienteId: string | number;
  mensagens: Mensagem[];
  onAtualizarHistorico: () => void;
  isAdmin?: boolean;
}

export default function PainelRespostasCliente({ 
  clienteId, 
  mensagens, 
  onAtualizarHistorico,
  isAdmin = false
}: PainelRespostasClienteProps) {
  const [resposta, setResposta] = useState('');
  const [enviandoResposta, setEnviandoResposta] = useState(false);
  const [mensagemSelecionada, setMensagemSelecionada] = useState<string | number | null>(null);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [clienteSelecionado, setClienteSelecionado] = useState<string | number | null>(clienteId);
  const [clienteFinalSelecionado, setClienteFinalSelecionado] = useState<string | number | null>(null);

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
      
      // Enviar a resposta para o webhook do n8n
      try {
        // Preparar os dados para o webhook
        const webhookData = {
           
            mensagem: resposta.trim(),
            numeroDestino: msgSelecionada.whatsapp_cliente_final,
            numeroRemetente: msgSelecionada.whatsapp_cliente || config.N8N_WEBHOOK_URL.split('/').pop(),
            tipoMensagem: 'resposta_humana',
            mensagemId: mensagemSelecionada
          
        };
        
        // Enviar para o webhook do n8n
        await axios.post(config.N8N_WEBHOOK_URL, /* {
          whatsappNumero: msgSelecionada.whatsapp_cliente_final || "5547991950615",
          pergunta: msgSelecionada.pergunta || "Pergunta original",
          resposta: resposta.trim()
        } */ webhookData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log('Resposta enviada para o webhook do n8n');
      } catch (webhookError) {
        console.error('Erro ao enviar para o webhook:', webhookError);
        // Não falhar o processo principal se o webhook falhar
        toast.warning('Resposta salva, mas pode não ter sido enviada para o WhatsApp');
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
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
        <h2 className="text-xl font-bold">Histórico de Mensagens</h2>
        <Button 
          variant="outline" 
          onClick={onAtualizarHistorico}
          disabled={enviandoResposta}
        >
          {enviandoResposta ? "Atualizando..." : "Atualizar"}
        </Button>
      </div>
      
      {isAdmin && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Filtrar por:</h3>
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
            )}
          </CardContent>
        </Card>
        
        {/* Área de resposta */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">Responder Manualmente</h3>
            
            {!mensagemSelecionada ? (
              <p className="text-center py-8 text-gray-500">Selecione uma mensagem para responder</p>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  {(() => {
                    const msgSelecionada = mensagens.find(m => m.id === mensagemSelecionada);
                    return (
                      <>
                        <div className="mb-3 pb-2 border-b border-gray-200">
                          {/* Informações da empresa */}
                          {msgSelecionada?.nome_cliente && (
                            <div className="mb-2">
                              <h4 className="font-medium text-blue-600">Empresa: {msgSelecionada.nome_cliente}</h4>
                              {msgSelecionada.whatsapp_cliente && (
                                <p className="text-sm text-gray-600">WhatsApp: {msgSelecionada.whatsapp_cliente}</p>
                              )}
                            </div>
                          )}
                          
                          {/* Informações do cliente final */}
                          {msgSelecionada?.nome_cliente_final && (
                            <div>
                              <h4 className="font-medium text-green-600">Cliente: {msgSelecionada.nome_cliente_final}</h4>
                              {msgSelecionada.whatsapp_cliente_final && (
                                <p className="text-sm text-gray-600">WhatsApp: {msgSelecionada.whatsapp_cliente_final}</p>
                              )}
                            </div>
                          )}
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