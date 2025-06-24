import React, { useState } from 'react';
import { Mensagem } from '../services/cliente';
import { formatarTelefone } from '../utils';

interface MensagemGrupoProps {
  mensagens: Mensagem[];
  clienteId: string | number | null;
  onMensagemSelecionada: (mensagemId: string | number) => void;
  mensagemSelecionada: string | number | null;
}

export default function MensagemGrupo({
  mensagens,
  clienteId,
  onMensagemSelecionada,
  mensagemSelecionada
}: MensagemGrupoProps) {
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

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
              <h3 className="font-bold text-green-600 mb-2">
                {msgs[0].nome_cliente_final && msgs[0].nome_cliente_final !== 'Usuário final' ? (
                  <>
                    Cliente: {msgs[0].nome_cliente_final}
                    {/* Mostrar número de destino se disponível, senão mostrar whatsapp_cliente_final */}
                    {(numeroFormatado || msgs[0].whatsapp_cliente_final) ?
                      ` (${numeroFormatado || msgs[0].whatsapp_cliente_final})` : ''}
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
            );
          })()}
          
          <div className="space-y-3">
            {msgs.map((msg) => (
              <div 
                key={msg.id}
                className={`border p-4 rounded-lg cursor-pointer transition-colors ${
                  mensagemSelecionada === msg.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                }`}
                onClick={() => onMensagemSelecionada(msg.id)}
              >
                <div className="flex flex-col gap-1 mb-2">

                  
                  <div className="flex justify-between items-start">
                    <span className="font-medium">
                      {msg.pergunta ? (
                        msg.pergunta.length > 50 && expandedMessage !== msg.id.toString() ? (
                          <>
                            {msg.pergunta.substring(0, 50)}...
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
                            {msg.pergunta}
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
                          {msg.resposta.substring(0, 100)}...
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
                          {msg.resposta}
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
                          {msg.resposta_humana.substring(0, 100)}...
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
                          {msg.resposta_humana}
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