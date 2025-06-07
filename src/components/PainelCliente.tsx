import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { contarMensagensMes } from "../services/mensagens";
import { ToastContainer, toast } from "react-toastify";
import { buscarClientePorToken, buscarHistoricoMensagens, atualizarCliente } from "../services/cliente";
import { Cliente, Mensagem } from "../services/cliente";
import "react-toastify/dist/ReactToastify.css";

export default function PainelCliente() {
  const { token } = useParams<{ token: string }>();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [dadosEditados, setDadosEditados] = useState({ nome: "", whatsapp: "" });
  const [expandedMessage, setExpandedMessage] = useState<number | null>(null);

  useEffect(() => {
    const carregarDados = async () => {
      if (!token) {
        setErro("Token inválido");
        setCarregando(false);
        return;
      }

      try {
        // Buscar cliente pelo token
        const clienteData = await buscarClientePorToken(token);
        
        if (!clienteData) {
          setErro("Cliente não encontrado. Verifique se o link está correto.");
          setCarregando(false);
          return;
        }

        // Buscar contagem de mensagens do mês atual
        const mensagensUsadas = await contarMensagensMes(clienteData.id);
          
        // Atualizar o cliente com a contagem de mensagens
        setCliente({
          ...clienteData,
          mensagens_usadas: mensagensUsadas
        });

        // Inicializar dados para edição
        setDadosEditados({
          nome: clienteData.nome || "",
          whatsapp: clienteData.whatsapp || ""
        });

        // Buscar histórico de mensagens
        const historico = await buscarHistoricoMensagens(clienteData.id);
        setMensagens(historico);
      } catch (error) {
        console.error("Erro:", error);
        setErro("Ocorreu um erro ao buscar os dados");
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, [token]);

  const atualizarHistorico = async (clienteId: number) => {
    setCarregandoHistorico(true);
    try {
      const historico = await buscarHistoricoMensagens(clienteId);
      setMensagens(historico);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    } finally {
      setCarregandoHistorico(false);
    }
  };

  const handleSalvarDados = async () => {
    if (!cliente) return;

    try {
      const sucesso = await atualizarCliente(cliente.id, {
        nome: dadosEditados.nome,
        whatsapp: dadosEditados.whatsapp
      });

      if (!sucesso) {
        toast.error("Erro ao salvar dados");
        return;
      }

      setCliente({
        ...cliente,
        nome: dadosEditados.nome,
        whatsapp: dadosEditados.whatsapp
      });

      setEditando(false);
      toast.success("Dados atualizados com sucesso");
    } catch (error) {
      toast.error("Erro ao salvar dados");
    }
  };

  const renderPlanoDetalhes = () => {
    if (!cliente) return null;

    switch (cliente.plano) {
      case "basico":
        return (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Plano Básico</h3>
            <p className="text-2xl font-bold text-green-600 mb-4">R$ 49/mês</p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span> Acesso ao assistente IA
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span> 100 mensagens por mês
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span> Suporte por email
              </li>
            </ul>
            <Button 
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
              onClick={() => toast.info("Entre em contato para fazer upgrade do plano")}
            >
              Fazer Upgrade
            </Button>
          </div>
        );
      case "intermediario":
        return (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Plano Intermediário</h3>
            <p className="text-2xl font-bold text-blue-600 mb-4">R$ 99/mês</p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">✓</span> Acesso ao assistente IA
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">✓</span> 300 mensagens por mês
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">✓</span> Suporte por WhatsApp
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">✓</span> Acesso a modelos avançados
              </li>
            </ul>
            <Button 
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
              onClick={() => toast.info("Entre em contato para fazer upgrade do plano")}
            >
              Fazer Upgrade para Avançado
            </Button>
          </div>
        );
      case "avancado":
        return (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Plano Avançado</h3>
            <p className="text-2xl font-bold text-purple-600 mb-4">R$ 149/mês</p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="text-purple-500 mr-2">✓</span> Acesso ao assistente IA
              </li>
              <li className="flex items-center">
                <span className="text-purple-500 mr-2">✓</span> Mensagens ilimitadas
              </li>
              <li className="flex items-center">
                <span className="text-purple-500 mr-2">✓</span> Suporte prioritário 24/7
              </li>
              <li className="flex items-center">
                <span className="text-purple-500 mr-2">✓</span> Acesso a todos os modelos
              </li>
              <li className="flex items-center">
                <span className="text-purple-500 mr-2">✓</span> Personalização avançada
              </li>
            </ul>
          </div>
        );
      default:
        return <p>Detalhes do plano não disponíveis</p>;
    }
  };

  const getProgressBarColor = () => {
    if (!cliente || cliente.mensagens_limite === undefined || cliente.mensagens_usadas === undefined) {
      return "bg-blue-600";
    }
    
    const percentUsed = (cliente.mensagens_usadas / cliente.mensagens_limite) * 100;
    
    if (percentUsed >= 100) return "bg-red-600";
    if (percentUsed >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

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

  if (carregando) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <p>Carregando informações...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-red-600 mb-2">Erro</h2>
            <p>{erro}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Painel do Cliente - {cliente?.nome}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna 1: Informações da Conta */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Informações da Conta</h2>
              
              {editando ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome</label>
                    <Input 
                      value={dadosEditados.nome} 
                      onChange={(e) => setDadosEditados({...dadosEditados, nome: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">WhatsApp</label>
                    <Input 
                      value={dadosEditados.whatsapp} 
                      onChange={(e) => setDadosEditados({...dadosEditados, whatsapp: e.target.value})}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleSalvarDados} className="bg-green-600 hover:bg-green-700">
                      Salvar
                    </Button>
                    <Button onClick={() => setEditando(false)} className="border border-gray-300 bg-transparent text-gray-800 hover:bg-gray-100">
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Nome</p>
                      <p className="font-medium">{cliente?.nome}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Plano Atual</p>
                      <p className="font-medium capitalize">{cliente?.plano}</p>
                    </div>
                    {cliente?.whatsapp && (
                      <div>
                        <p className="text-sm text-gray-500">WhatsApp</p>
                        <p className="font-medium">{cliente.whatsapp}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Data de Cadastro</p>
                      <p className="font-medium">{cliente?.data_cadastro ? formatDate(cliente.data_cadastro) : "N/A"}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setEditando(true)} 
                    className="mt-4 w-full border border-gray-300 bg-transparent text-gray-800 hover:bg-gray-100"
                  >
                    Editar Dados
                  </Button>
                </>
              )}
              
              {renderPlanoDetalhes()}
            </CardContent>
          </Card>
        </div>
        
        {/* Coluna 2-3: Uso do Assistente e Histórico */}
        <div className="md:col-span-2">
          {/* Uso do Assistente */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Uso do Assistente</h2>
              
              {cliente?.mensagens_usadas !== undefined && cliente?.mensagens_limite !== undefined ? (
                <>
                  <div className="flex justify-between mb-2">
                    <span>Mensagens usadas no mês</span>
                    <span className="font-medium">{cliente.mensagens_usadas} de {cliente.mensagens_limite}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                      className={`${getProgressBarColor()} h-2.5 rounded-full`}
                      style={{ width: `${Math.min(100, (cliente.mensagens_usadas / cliente.mensagens_limite) * 100)}%` }}
                    ></div>
                  </div>
                  
                  {cliente.mensagens_usadas >= cliente.mensagens_limite ? (
                    <p className="text-sm text-red-600 mt-2">
                      Você atingiu o limite de mensagens do seu plano. Considere fazer um upgrade.
                    </p>
                  ) : cliente.mensagens_usadas >= cliente.mensagens_limite * 0.75 ? (
                    <p className="text-sm text-yellow-600 mt-2">
                      Você está se aproximando do limite de mensagens do seu plano.
                    </p>
                  ) : (
                    <p className="text-sm text-green-600 mt-2">
                      Você tem {cliente.mensagens_limite - cliente.mensagens_usadas} mensagens disponíveis neste mês.
                    </p>
                  )}
                </>
              ) : (
                <p>Informações de uso não disponíveis</p>
              )}
            </CardContent>
          </Card>
          
          {/* Histórico de Conversas */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Histórico de Conversas</h2>
              
              {carregandoHistorico ? (
                <p className="text-center py-4">Carregando histórico...</p>
              ) : mensagens.length > 0 ? (
                <div className="space-y-4">
                  {mensagens.map((mensagem) => (
                    <div key={mensagem.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">{formatDate(mensagem.timestamp)}</span>
                        <Button 
                          className="bg-transparent text-gray-800 hover:bg-gray-100 px-2 py-1 text-sm"
                          onClick={() => setExpandedMessage(expandedMessage === mensagem.id ? null : mensagem.id)}
                        >
                          {expandedMessage === mensagem.id ? "Ocultar" : "Expandir"}
                        </Button>
                      </div>
                      
                      <div>
                        <p className="font-medium">🗣️ Você: {mensagem.pergunta}</p>
                        
                        {expandedMessage === mensagem.id && (
                          <p className="mt-2 text-gray-700">🤖 IA: {mensagem.resposta}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4">Nenhuma conversa encontrada</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <Button 
          className="border border-gray-300 bg-transparent text-gray-800 hover:bg-gray-100"
          onClick={() => window.history.back()}
        >
          Sair
        </Button>
      </div>
    </div>
  );
}