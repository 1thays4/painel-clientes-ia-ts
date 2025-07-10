import React, { useState, useEffect, useRef } from 'react';
import { Mensagem } from '../services/cliente';
import { formatarTelefone } from '../utils';
import FormattedText from './FormattedText';
import ModoBotToggle from './ModoBotToggle';
import { supabase } from '../lib/supabase';

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
        data?.forEach((cliente: { id: string | number; nome: any; modo: boolean; }) => {
          infoMap[cliente.id] = {
            id: cliente.id,
            nome: cliente.nome,
            modo: cliente.modo !== false // true por padrão se não estiver definido
          };
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

  return (
    <div className="space-y-6">
      {Object.entries(mensagensPorCliente).map(([clienteKey, msgs]) => (
        <div key={clienteKey} className="border-t pt-4">
          {/* Cabeçalho do grupo - mostra o cliente final */}
          {msgs[0] && (() => {
            const numeroFormatado = formatarTelefone(msgs[0].numero_destino ?? "");
            return (
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-green-600">
                  {msgs[0].nome_cliente_final && msgs[0].nome_cliente_final !== 'Usuário final' ? (
                    <>
                      {msgs[0].nome_cliente_final}
                      {/* Mostrar número de destino se disponível, senão mostrar whatsapp_cliente_final */}
                      {(numeroFormatado || msgs[0].whatsapp_cliente_final) ?
                        ` ${numeroFormatado || msgs[0].whatsapp_cliente_final}` : ''}
                    </>
                  ) : (
                    <>
                      Cliente: {numeroFormatado ?
                        `${numeroFormatado}` :
                        msgs[0].nome_cliente_final ?
                          `${msgs[0].nome_cliente_final}` :
                          'Não informado'}
                    </>
                  )}
                </h3>
                
                {/* Toggle de modo bot */}
                {showBotToggle && msgs[0].cliente_final_id && clientesFinaisInfo[msgs[0].cliente_final_id] && (
                  <div className="flex items-center gap-2">
                    {!clientesFinaisInfo[msgs[0].cliente_final_id].modo ? (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        Resposta manual
                      </span>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        Bot ativo
                      </span>
                    )}
                    <ModoBotToggle
                      clienteFinalId={msgs[0].cliente_final_id}
                      modoBotAtivo={clientesFinaisInfo[msgs[0].cliente_final_id].modo}
                    />
                  </div>
                )}
              </div>
            );
          })()}
          
          <div className="space-y-3">
            {msgs.map((msg) => (
              <div 
                key={msg.id}
                className={`border p-4 rounded-lg cursor-pointer transition-colors ${
                  mensagemSelecionada === msg.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                } ${novasMensagens[msg.id] ? 'new-message-highlight' : ''}`}
                onClick={() => onMensagemSelecionada(msg.id)}
              >
                <div className="flex flex-col gap-1 mb-2">
                  <div className="flex justify-between items-start">
                    <span className="font-medium">
                      {msg.pergunta ? (
                        msg.pergunta.length > 50 && expandedMessage !== msg.id.toString() ? (
                          <>
                            <FormattedText text={msg.pergunta.substring(0, 50)} />
                            <span>...</span>
                            <button 
                              className="text-blue-500 ml-2 text-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedMessage(msg.id.toString());
                              }}
                            >
                              Ver mais
                            </button>
                          </>
                        ) : (
                          <>
                            <FormattedText text={msg.pergunta} />
                            {expandedMessage === msg.id.toString() && (
                              <button 
                                className="text-blue-500 ml-2 text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedMessage(null);
                                }}
                              >
                                Ver menos
                              </button>
                            )}
                          </>
                        )
                      ) : (
                        "Mensagem recebida"
                      )}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(msg.timestamp)}
                    </span>
                  </div>
                </div>
                
                {msg.resposta && (
                  <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                    <strong>Resposta IA:</strong> {
                      msg.resposta.length > 100 && expandedMessage !== `${msg.id}-resp` ? (
                        <>
                          <FormattedText text={msg.resposta.substring(0, 100)} />
                          <span>...</span>
                          <button 
                            className="text-blue-500 ml-2 text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedMessage(`${msg.id}-resp`);
                            }}
                          >
                            Ver mais
                          </button>
                        </>
                      ) : (
                        <>
                          <FormattedText text={msg.resposta} />
                          {expandedMessage === `${msg.id}-resp` && (
                            <button 
                              className="text-blue-500 ml-2 text-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedMessage(null);
                              }}
                            >
                              Ver menos
                            </button>
                          )}
                        </>
                      )
                    }
                  </div>
                )}
                
                {msg.resposta_humana && (
                  <div className="mt-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                    <strong>Resposta Humana:</strong> {
                      msg.resposta_humana.length > 100 && expandedMessage !== `${msg.id}-human` ? (
                        <>
                          <FormattedText text={msg.resposta_humana.substring(0, 100)} />
                          <span>...</span>
                          <button 
                            className="text-blue-500 ml-2 text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedMessage(`${msg.id}-human`);
                            }}
                          >
                            Ver mais
                          </button>
                        </>
                      ) : (
                        <>
                          <FormattedText text={msg.resposta_humana} />
                          {expandedMessage === `${msg.id}-human` && (
                            <button 
                              className="text-blue-500 ml-2 text-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedMessage(null);
                              }}
                            >
                              Ver menos
                            </button>
                          )}
                        </>
                      )
                    }
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}