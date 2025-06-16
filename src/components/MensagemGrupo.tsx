import React, { useState } from 'react';
import { Mensagem } from '../services/cliente';

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

  // Agrupar mensagens por cliente final (whatsapp)
  const mensagensPorCliente: Record<string, Mensagem[]> = {};
  
  // Verificar se há mensagens antes de tentar agrupar
  if (mensagens && mensagens.length > 0) {
    mensagens.forEach(msg => {
      // Agrupar por whatsapp do cliente final
      const chaveWhatsapp = `whatsapp_${msg.whatsapp_cliente_final || 'desconhecido'}`;
      if (!mensagensPorCliente[chaveWhatsapp]) {
        mensagensPorCliente[chaveWhatsapp] = [];
      }
      mensagensPorCliente[chaveWhatsapp].push(msg);
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
          {msgs[0].nome_cliente_final && (
            <h3 className="font-bold text-green-600 mb-2">
              Cliente: {msgs[0].nome_cliente_final} {msgs[0].whatsapp_cliente_final && `(${msgs[0].whatsapp_cliente_final})`}
            </h3>
          )}
          
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