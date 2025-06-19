import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { contarMensagensMes } from "../services/mensagens";
import { ToastContainer, toast } from "react-toastify";
import { buscarClientePorToken, buscarHistoricoMensagens, atualizarCliente, contarTotalMensagens } from "../services/cliente";
import { Cliente, Mensagem } from "../services/cliente";
import { supabase } from "../lib/supabase";
import PainelRespostasCliente from "./PainelRespostasCliente";
import Dashboard from "./Dashboard";
import AlertaLimiteMensagens from "./AlertaLimiteMensagens";
import { formatarWhatsAppParaExibicao, validarWhatsApp } from "../lib/validacao";
import { config } from "../config";
import "react-toastify/dist/ReactToastify.css";

export default function PainelCliente() {
  const { token } = useParams<{ token: string }>();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [dadosEditados, setDadosEditados] = useState({ nome: "", whatsapp: "" });
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalMensagens, setTotalMensagens] = useState(0);
  const [mostrarDashboard, setMostrarDashboard] = useState(true);
  const limitePorPagina = 100;

  // Referências para os canais de assinatura
  const mensagensChannelRef = useRef<any>(null);
  const clienteChannelRef = useRef<any>(null);

  // Função para limpar assinaturas existentes
  const limparAssinaturas = () => {
    if (mensagensChannelRef.current) {
      mensagensChannelRef.current.unsubscribe();
      mensagensChannelRef.current = null;
    }
    if (clienteChannelRef.current) {
      clienteChannelRef.current.unsubscribe();
      clienteChannelRef.current = null;
    }
  };

  useEffect(() => {
    // Limpar assinaturas anteriores
    limparAssinaturas();

    const carregarDados = async () => {
      if (!token) {
        setErro("Token inválido");
        setCarregando(false);
        return;
      }

      try {
        console.log("Carregando dados para token:", token);
        
        // Buscar cliente pelo token
        const clienteData = await buscarClientePorToken(token);
        
        if (!clienteData) {
          setErro("Cliente não encontrado. Verifique se o link está correto.");
          setCarregando(false);
          return;
        }

        console.log("Cliente encontrado:", clienteData);
        
        // Definir valores padrão para mensagens_limite se não existir
        if (!clienteData.mensagens_limite) {
          // Usar o limite do plano conforme configuração
          const planoConfig = config.planos[clienteData.plano as keyof typeof config.planos];
          clienteData.mensagens_limite = planoConfig?.limite || 1000;
        }
        
        // Buscar contagem de mensagens do mês atual
        const mensagensUsadas = await contarMensagensMes(clienteData.id);
        console.log("Mensagens usadas:", mensagensUsadas);
          
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

        // Buscar histórico de mensagens específicas deste cliente
        console.log("Buscando histórico para cliente ID:", clienteData.id);
        const historico = await buscarHistoricoMensagens(clienteData.id, limitePorPagina, 0);
        console.log("Histórico de mensagens do cliente:", historico.length, "mensagens encontradas");
        
        // Contar total de mensagens disponíveis
        const total = await contarTotalMensagens(clienteData.id);
        setTotalMensagens(total);
        console.log("Total de mensagens disponíveis:", total);
        
        // Definir as mensagens no estado
        setMensagens(historico || []);
        setPaginaAtual(0);
        
        if (!historico || historico.length === 0) {
          console.log("Nenhuma mensagem encontrada para o cliente");
        }

        // Configurar assinatura em tempo real para novas mensagens
        const channelId = `mensagens-${clienteData.id}-${Date.now()}`;
        mensagensChannelRef.current = supabase
          .channel(channelId)
          .on('postgres_changes', 
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'mensagens_enviadas',
              filter: `cliente_id=eq.${clienteData.id}`
            }, 
            async (payload: { new: Mensagem; }) => {
              console.log('Nova mensagem recebida:', payload);
              
              // Adicionar a nova mensagem ao estado
              setMensagens(mensagensAtuais => [payload.new as Mensagem, ...mensagensAtuais]);
              
              // Buscar contagem atualizada de mensagens
              const mensagensAtualizadas = await contarMensagensMes(clienteData.id);
              
              // Atualizar o cliente com a contagem atualizada
              setCliente(clienteAtual => {
                if (!clienteAtual) return null;
                return {
                  ...clienteAtual,
                  mensagens_usadas: mensagensAtualizadas
                };
              });
              
              toast.info("Nova mensagem recebida!");
            }
          )
          .subscribe();

        // Configurar assinatura para atualizações do cliente
        const clienteChannelId = `cliente-${clienteData.id}-${Date.now()}`;
        clienteChannelRef.current = supabase
          .channel(clienteChannelId)
          .on('postgres_changes', 
            { 
              event: 'UPDATE', 
              schema: 'public', 
              table: 'clientes',
              filter: `id=eq.${clienteData.id}`
            }, 
            (payload: { new: Cliente | null; }) => {
              console.log('Dados do cliente atualizados:', payload);
              // Atualizar os dados do cliente
              setCliente(clienteAtual => {
                if (!clienteAtual) return null;
                return {
                  ...clienteAtual,
                  ...payload.new
                };
              });
            }
          )
          .subscribe();
      } catch (error) {
        console.error("Erro:", error);
        setErro("Ocorreu um erro ao buscar os dados");
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();

    // Limpar assinaturas quando o componente for desmontado
    return limparAssinaturas;
  }, [token]);

  const atualizarHistorico = async (clienteId: number | null = null, resetarPaginacao: boolean = true) => {
    setCarregandoHistorico(true);
    try {
      // Se resetar paginação, começar do zero
      const novaPagina = resetarPaginacao ? 0 : paginaAtual;
      const offset = novaPagina * limitePorPagina;
      
      console.log("Atualizando histórico para cliente:", clienteId, "com offset:", offset, "e limite:", limitePorPagina);
      const historico = await buscarHistoricoMensagens(clienteId, limitePorPagina, offset);
      console.log("Histórico carregado:", historico.length, "mensagens");
      
      // Contar total de mensagens disponíveis
      const total = await contarTotalMensagens(clienteId);
      setTotalMensagens(total);
      console.log("Total de mensagens disponíveis:", total);
      
      // Atualizar mensagens
      if (resetarPaginacao) {
        setMensagens(historico);
        setPaginaAtual(0);
      } else {
        setMensagens(mensagensAtuais => [...mensagensAtuais, ...historico]);
      }
      
      // Atualizar também a contagem de mensagens se tiver um cliente específico
      if (clienteId) {
        const mensagensAtualizadas = await contarMensagensMes(clienteId);
        setCliente(clienteAtual => {
          if (!clienteAtual) return null;
          return {
            ...clienteAtual,
            mensagens_usadas: mensagensAtualizadas
          };
        });
      }
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      toast.error("Erro ao carregar mensagens");
    } finally {
      setCarregandoHistorico(false);
    }
  };
  
  // Função para carregar mais mensagens (paginação)
  const carregarMaisMensagens = async () => {
    if (!cliente || carregandoMais) return;
    
    setCarregandoMais(true);
    try {
      const proximaPagina = paginaAtual + 1;
      const offset = proximaPagina * limitePorPagina;
      
      console.log("Carregando mais mensagens com offset:", offset);
      const novasMensagens = await buscarHistoricoMensagens(cliente.id, limitePorPagina, offset);
      
      if (novasMensagens && novasMensagens.length > 0) {
        console.log("Carregadas mais", novasMensagens.length, "mensagens");
        setMensagens(mensagensAtuais => [...mensagensAtuais, ...novasMensagens]);
        setPaginaAtual(proximaPagina);
      } else {
        console.log("Não há mais mensagens para carregar");
        toast.info("Não há mais mensagens para carregar");
      }
    } catch (error) {
      console.error("Erro ao carregar mais mensagens:", error);
      toast.error("Erro ao carregar mais mensagens");
    } finally {
      setCarregandoMais(false);
    }
  };

  const handleSalvarDados = async () => {
    if (!cliente) return;

    try {
      // Validar número de WhatsApp
      const whatsappValidado = validarWhatsApp(dadosEditados.whatsapp);
      
      if (dadosEditados.whatsapp && !whatsappValidado) {
        toast.error("Número de WhatsApp inválido");
        return;
      }
      
      const sucesso = await atualizarCliente(cliente.id, {
        nome: dadosEditados.nome,
        whatsapp: whatsappValidado
      });

      if (!sucesso) {
        toast.error("Erro ao salvar dados");
        return;
      }

      setCliente({
        ...cliente,
        nome: dadosEditados.nome,
        whatsapp: whatsappValidado
      });

      setEditando(false);
      toast.success("Dados atualizados com sucesso");
    } catch (error) {
      toast.error("Erro ao salvar dados");
    }
  };

  const handleUpgradePlano = () => {
    // Abrir modal ou redirecionar para página de upgrade
    toast.info("Entre em contato com o suporte para fazer upgrade do seu plano");
    // Aqui poderia abrir um modal com opções de plano ou redirecionar para uma página
  };

  const renderPlanoDetalhes = () => {
    if (!cliente) return null;

    // Usar os valores da configuração para garantir consistência
    const planoConfig = config.planos[cliente.plano as keyof typeof config.planos] || config.planos.basico;

    switch (cliente.plano) {
      case "basico":
        return (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Plano Básico</h3>
            <p className="text-2xl font-bold text-green-600 mb-4">R$ {planoConfig.preco}/mês</p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span> Acesso ao assistente IA
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span> {planoConfig.limite} mensagens por mês
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span> Suporte por email
              </li>
            </ul>
            <Button 
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
              onClick={handleUpgradePlano}
            >
              Fazer Upgrade
            </Button>
          </div>
        );
      case "intermediario":
        return (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Plano Intermediário</h3>
            <p className="text-2xl font-bold text-blue-600 mb-4">R$ {planoConfig.preco}/mês</p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">✓</span> Acesso ao assistente IA
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">✓</span> {planoConfig.limite} mensagens por mês
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
              onClick={handleUpgradePlano}
            >
              Fazer Upgrade para Avançado
            </Button>
          </div>
        );
      case "avancado":
        return (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Plano Avançado</h3>
            <p className="text-2xl font-bold text-purple-600 mb-4">R$ {planoConfig.preco}/mês</p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="text-purple-500 mr-2">✓</span> Acesso ao assistente IA
              </li>
              <li className="flex items-center">
                <span className="text-purple-500 mr-2">✓</span> {planoConfig.limite} mensagens por mês
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
    if (!cliente) {
      return "bg-blue-600";
    }
    
    const mensagensUsadas = cliente.mensagens_usadas || 0;
    const mensagensLimite = cliente.mensagens_limite || 1000;
    
    const percentUsed = (mensagensUsadas / mensagensLimite) * 100;
    
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
            <Button 
              className="mt-4"
              onClick={() => window.location.href = '/'}
            >
              Voltar ao Painel Principal
            </Button>
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
        <h1 className="text-2xl font-bold mb-2">
          {editando ? (
            <Input 
              value={dadosEditados.nome} 
              onChange={(e) => setDadosEditados({...dadosEditados, nome: e.target.value})}
              placeholder="Nome do cliente"
              className="text-xl font-bold"
            />
          ) : (
            <>Olá, {cliente?.nome || "Cliente"}!</>
          )}
        </h1>
        <p className="text-gray-600">
          {editando ? (
            <Input 
              value={dadosEditados.whatsapp} 
              onChange={(e) => setDadosEditados({...dadosEditados, whatsapp: e.target.value})}
              placeholder="Número do WhatsApp"
              className="mt-2"
            />
          ) : (
            <>WhatsApp: {cliente?.whatsapp ? formatarWhatsAppParaExibicao(cliente.whatsapp) : "Não informado"}</>
          )}
        </p>
        
        {editando ? (
          <div className="mt-4 flex gap-2">
            <Button onClick={handleSalvarDados}>Salvar</Button>
            <Button variant="outline" onClick={() => setEditando(false)}>Cancelar</Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            className="mt-2" 
            onClick={() => setEditando(true)}
          >
            Editar dados
          </Button>
        )}
      </div>
      
      {/* Alerta de limite de mensagens */}
      {cliente && (
        <AlertaLimiteMensagens 
          mensagensUsadas={cliente.mensagens_usadas || 0}
          mensagensLimite={cliente.mensagens_limite || 1000}
          onUpgrade={handleUpgradePlano}
        />
      )}
      
      {/* Botões de navegação */}
      <div className="flex mb-6 border-b">
        <Button 
          variant="link" 
          className={`${mostrarDashboard ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setMostrarDashboard(true)}
        >
          Dashboard
        </Button>
        <Button 
          variant="link" 
          className={`${!mostrarDashboard ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setMostrarDashboard(false)}
        >
          Histórico de Mensagens
        </Button>
      </div>
      
      {/* Dashboard ou Histórico */}
      {mostrarDashboard ? (
        <>
          {/* Dashboard */}
          {cliente && <Dashboard clienteId={cliente.id} />}
          
          {/* Informações do plano */}
          <Card className="mb-6 mt-6">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-4">Seu Plano: {cliente?.plano || "Básico"}</h2>
              
              {/* Barra de progresso */}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span>Uso de mensagens este mês</span>
                  <span className="font-medium">
                    {cliente?.mensagens_usadas || 0} / {cliente?.mensagens_limite || 1000}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`${getProgressBarColor()} h-2.5 rounded-full`} 
                    style={{ 
                      width: `${Math.min(
                        ((cliente?.mensagens_usadas || 0) / (cliente?.mensagens_limite || 1000)) * 100, 
                        100
                      )}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              {renderPlanoDetalhes()}
            </CardContent>
          </Card>
        </>
      ) : (
        /* Painel de respostas */
        cliente && (
          <PainelRespostasCliente 
            clienteId={cliente.id}
            mensagens={mensagens}
            onAtualizarHistorico={(resetar = true) => cliente && atualizarHistorico(cliente.id as number, resetar)}
            onCarregarMais={carregarMaisMensagens}
            totalMensagens={totalMensagens}
            carregandoMais={carregandoMais}
            isAdmin={true}
          />
        )
      )}
    </div>
  );
}