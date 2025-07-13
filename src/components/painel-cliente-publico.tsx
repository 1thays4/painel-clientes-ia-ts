import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card, CardContent } from "./ui/card";
import TestarIA from "./TestarIA";
import { contarMensagensMes } from "../services/mensagens";
import { ToastContainer } from "react-toastify";
import { supabase } from "../lib/supabase";
import "react-toastify/dist/ReactToastify.css";

// Usando o cliente supabase importado de lib/supabase

interface Cliente {
  id: number;
  nome: string;
  plano: string;
  status_pagamento?: "em_dia" | "pendente";
  mensagens_usadas?: number;
  mensagens_limite?: number;
}

export default function PainelClientePublico() {
  const router = useRouter();
  const { token } = router.query;
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  
  console.log("Componente PainelClientePublico renderizado com token:", token);

  useEffect(() => {
    const buscarCliente = async () => {
      if (!token) {
        setErro("Token inválido");
        setCarregando(false);
        return;
      }

      console.log("Buscando cliente com token:", token);

      try {
        // Busca direta dos dados do cliente pelo token
        const { data, error } = await supabase
          .from("clientes")
          .select("*")
          .eq("token_publico", token);
          
        console.log("Resultado da busca:", { data, error });
        
        if (error) {
          console.error("Erro ao buscar cliente:", error);
          setErro("Erro ao carregar dados do cliente");
          setCarregando(false);
          return;
        }
        
        if (!data || data.length === 0) {
          console.log("Nenhum cliente encontrado com este token");
          
          // Vamos listar todos os tokens para depuração
          const { data: allTokens } = await supabase
            .from("clientes")
            .select("id, token_publico");
            
          console.log("Tokens disponíveis no banco:", allTokens);
          
          setErro("Cliente não encontrado. Verifique se o link está correto.");
          setCarregando(false);
          return;
        }

        // Cliente encontrado
        const clienteData = data[0];
        console.log("Cliente encontrado:", clienteData);
        
        // Buscar contagem de mensagens do mês atual
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

        const { data: mensagensData, count } = await supabase
          .from('mensagens_enviadas')
          .select('id', { count: 'exact' })
          .eq('cliente_id', clienteData.id)
          .gte('timestamp', firstDay)
          .lte('timestamp', lastDay);
          
        // Atualizar o cliente com a contagem de mensagens
        setCliente({
          ...clienteData,
          mensagens_usadas: count || 0
        });
      } catch (error) {
        console.error("Erro:", error);
        setErro("Ocorreu um erro ao buscar os dados");
      } finally {
        setCarregando(false);
      }
    };

    buscarCliente();
  }, [token]);

  const renderPlanoDetalhes = () => {
    if (!cliente) return null;

    switch (cliente.plano) {
      case "essencial":
        return (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Plano Essencial</h3>
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
          </div>
        );
      case "Profissional":
        return (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Plano Profissional</h3>
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
          </div>
        );
      case "Estratégico":
        return (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Plano Estratégico</h3>
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

  if (carregando) {
    return (
      <div className="p-6 max-w-md mx-auto text-center">
        <p>Carregando informações...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="p-6 max-w-md mx-auto text-center">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-red-600 mb-2">Erro</h2>
            <p>{erro}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Função para atualizar a contagem de mensagens
  const atualizarContagemMensagens = async () => {
    if (cliente) {
      const mensagensUsadas = await contarMensagensMes(cliente.id);
      setCliente({
        ...cliente,
        mensagens_usadas: mensagensUsadas
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      <Card className="overflow-hidden">
        <CardContent className="pt-4 sm:pt-6">
          <h1 className="text-2xl font-bold mb-4">Seu Plano de Assistente IA</h1>
          {cliente && (
            <>
              <p className="mb-2">
                <span className="font-semibold">Olá, {cliente.nome}!</span>
              </p>
              <p className="mb-4">Bem-vindo ao seu painel de cliente. Aqui você pode ver os detalhes do seu plano atual.</p>
              
              {/* Status de pagamento */}
              <div className="mb-4 p-3 rounded-lg border">
                <h3 className="text-md font-semibold mb-2">Status da Conta</h3>
                {cliente.status_pagamento === "em_dia" ? (
                  <p className="flex items-center text-green-600">
                    <span className="mr-2">✓</span> Pagamento em dia
                  </p>
                ) : (
                  <p className="flex items-center text-amber-600">
                    <span className="mr-2">⚠️</span> Pagamento pendente
                  </p>
                )}
              </div>
              
              {/* Progresso de uso do plano */}
              {cliente.mensagens_usadas !== undefined && cliente.mensagens_limite !== undefined && (
                <div className="mb-4 p-3 rounded-lg border">
                  <h3 className="text-md font-semibold mb-2">Uso do Plano</h3>
                  <p className="text-sm mb-1">
                    Você usou {cliente.mensagens_usadas} de {cliente.mensagens_limite} interações com IA no WhatsApp este mês.
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (cliente.mensagens_usadas / cliente.mensagens_limite) * 100)}%` }}
                    ></div>
                  </div>
                  {cliente.mensagens_usadas >= cliente.mensagens_limite ? (
                    <p className="text-xs text-red-600 mt-1">
                      Você atingiu o limite de interações deste mês. Considere fazer um upgrade de plano.
                    </p>
                  ) : (
                    <p className="text-xs text-gray-600 mt-1">
                      Restam {cliente.mensagens_limite - cliente.mensagens_usadas} interações com IA neste mês.
                    </p>
                  )}
                </div>
              )}
              
              {renderPlanoDetalhes()}
              
              {/* Componente para testar IA no WhatsApp */}
              <div className="mt-6 border-t pt-4">
                <h3 className="text-md font-semibold mb-3">Assistente IA no WhatsApp</h3>
                {cliente && (
                  <TestarIA 
                    clienteId={cliente.id} 
                    limite={cliente.mensagens_limite || 100}
                    onMensagemEnviada={atualizarContagemMensagens}
                  />
                )}
              </div>
              
              {/* Botões para gerenciar plano e ver histórico */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  onClick={() => alert("Funcionalidade em desenvolvimento")}
                >
                  Gerenciar Plano
                </button>
                <button 
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  onClick={() => alert("Funcionalidade em desenvolvimento")}
                >
                  Ver Histórico
                </button>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Precisa de ajuda? Entre em contato pelo nosso suporte.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}