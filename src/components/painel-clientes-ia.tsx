import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { createClient } from "@supabase/supabase-js";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

interface Cliente {
  id: number;
  nome: string;
  whatsapp: string;
  plano: string;
  token_publico?: string;
  status_pagamento?: "em_dia" | "pendente";
  mensagens_usadas?: number;
  mensagens_limite?: number;
}

// Substitua pelos seus dados reais do Supabase
const supabaseUrl = "https://sqcedymaeazvrrgrokpv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxY2VkeW1hZWF6dnJyZ3Jva3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5OTc3NTUsImV4cCI6MjA2NDU3Mzc1NX0.D65rBFBiVE1F9mVI15QgJeDepEhQtPj3eS2kXxRCfB8";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PainelClientesIA() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nome, setNome] = useState<string>("");
  const [whatsapp, setWhatsapp] = useState<string>("");
  const [plano, setPlano] = useState<string>("basico");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [erros, setErros] = useState<{nome?: string; whatsapp?: string}>({});

    const carregarClientes = async () => {
    const { data, error } = await supabase.from("clientes").select("*");
    if (error) {
      console.error("Erro ao buscar clientes:", error);
      toast.error("Erro ao carregar clientes");
    } else {
      setClientes(data as Cliente[]);
    }
  };
  
  // Carregar clientes ao iniciar
  useEffect(() => {
    carregarClientes();
  }, []);

  const validarFormulario = () => {
    const novosErros: {nome?: string; whatsapp?: string} = {};
    let valido = true;
    
    // Verifica se os campos estão vazios
    if (!nome.trim()) {
      novosErros.nome = "O nome do cliente é obrigatório";
      valido = false;
    }
    
    if (!whatsapp.trim()) {
      novosErros.whatsapp = "O número de WhatsApp é obrigatório";
      valido = false;
    } else {
      // Validação do formato do WhatsApp (apenas números, com DDD, entre 10 e 11 dígitos)
      const whatsappLimpo = whatsapp.replace(/\D/g, '');
      const whatsappRegex = /^[0-9]{10,11}$/;
      if (!whatsappRegex.test(whatsappLimpo)) {
        novosErros.whatsapp = "Formato de WhatsApp inválido. Use apenas números com DDD (10 a 11 dígitos)";
        valido = false;
      }
    }
    
    setErros(novosErros);
    
    if (!valido) {
      toast.error("Verifique os campos destacados");
    }
    
    return valido;
  };

  // Função para gerar token único
  const gerarTokenPublico = () => {
    // Gerando um token mais simples e previsível para facilitar depuração
    const timestamp = new Date().getTime();
    const randomPart = Math.floor(Math.random() * 10000);
    const token = `token_${timestamp}_${randomPart}`;
    return token;
  };
  
  // Função para regenerar token de um cliente existente
  const regenerarToken = async (clienteId: number) => {
    const token_publico = gerarTokenPublico();
    console.log("Novo token gerado:", token_publico);
    
    const { error } = await supabase
      .from("clientes")
      .update({ token_publico })
      .eq("id", clienteId);
    
    if (error) {
      console.error("Erro ao regenerar token:", error);
      toast.error("Erro ao regenerar token");
    } else {
      console.log("Token atualizado com sucesso para cliente ID:", clienteId);
      toast.success("Token regenerado com sucesso");
      carregarClientes();
    }
  };

  const adicionarOuAtualizarCliente = async () => {
    // Valida os dados antes de prosseguir
    if (!validarFormulario()) {
      return;
    }
    
    // Formata o número de WhatsApp para conter apenas números
    const whatsappFormatado = whatsapp.replace(/\D/g, '');
    
    // Define limites de mensagens com base no plano
    const limitesMensagens = {
      basico: 100,
      intermediario: 300,
      avancado: 1000
    };
    
    if (editandoId) {
      // Ao atualizar, mantemos o token existente
      const { error } = await supabase
        .from("clientes")
        .update({ nome, whatsapp: whatsappFormatado, plano })
        .eq("id", editandoId);
      if (error) {
        console.error("Erro ao atualizar cliente:", error);
        toast.error("Erro ao atualizar cliente");
      } else {
        toast.success("Cliente atualizado com sucesso");
      }
    } else {
      // Ao criar novo cliente, geramos um token único
      const token_publico = gerarTokenPublico();
      const { error } = await supabase.from("clientes").insert([
        { 
          nome, 
          whatsapp: whatsappFormatado, 
          plano, 
          token_publico,
          status_pagamento: "em_dia",
          mensagens_usadas: 0,
          mensagens_limite: limitesMensagens[plano as keyof typeof limitesMensagens]
        },
      ]);
      if (error) {
        console.error("Erro ao adicionar cliente:", error);
        toast.error("Erro ao adicionar cliente");
      } else {
        toast.success("Cliente adicionado com sucesso");
      }
    }
    carregarClientes();
    limparFormulario();
  };

    const editarCliente = (cliente: Cliente) => {
    setNome(cliente.nome);
    setWhatsapp(cliente.whatsapp);
    setPlano(cliente.plano);
    setEditandoId(cliente.id);
  };

    const excluirCliente = async (id: number) => {
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) {
      console.error("Erro ao excluir cliente:", error);
      toast.error("Erro ao excluir cliente");
    } else {
      toast.success("Cliente excluído com sucesso");
      carregarClientes();
    }
  };

  const limparFormulario = () => {
    setNome("");
    setWhatsapp("");
    setPlano("basico");
    setEditandoId(null);
    setErros({});
  };

  // Função para alterar o status de pagamento de um cliente
  const alterarStatusPagamento = async (clienteId: number, novoStatus: "em_dia" | "pendente") => {
    const { error } = await supabase
      .from("clientes")
      .update({ status_pagamento: novoStatus })
      .eq("id", clienteId);
    
    if (error) {
      console.error("Erro ao alterar status de pagamento:", error);
      toast.error("Erro ao alterar status de pagamento");
    } else {
      toast.success(`Status de pagamento alterado para ${novoStatus === "em_dia" ? "em dia" : "pendente"}`);
      carregarClientes();
    }
  };

  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold">Painel de Clientes - Agente IA</h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <Button 
            onClick={handleLogout}
            className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
          >
            Sair
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="space-y-4 pt-4">
          <div>
            <Input
              placeholder="Nome do cliente"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                if (e.target.value.trim()) {
                  setErros(prev => ({...prev, nome: undefined}));
                }
              }}
              className={erros.nome ? "border-red-500" : ""}
            />
            {erros.nome && <p className="text-red-500 text-sm mt-1">{erros.nome}</p>}
          </div>
          <div>
            <Input
              placeholder="Número WhatsApp (com DDD)"
              value={whatsapp}
              onChange={(e) => {
                setWhatsapp(e.target.value);
                if (e.target.value.trim()) {
                  setErros(prev => ({...prev, whatsapp: undefined}));
                }
              }}
              className={erros.whatsapp ? "border-red-500" : ""}
            />
            {erros.whatsapp && <p className="text-red-500 text-sm mt-1">{erros.whatsapp}</p>}
            <p className="text-gray-500 text-xs mt-1">Formato: (00) 00000-0000</p>
          </div>
             <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            value={plano}
            onChange={(e) => setPlano(e.target.value)}
          >
            <option value="basico">Básico (R$ 49)</option>
            <option value="intermediario">Intermediário (R$ 99)</option>
            <option value="avancado">Avançado (R$ 149)</option>
          </select>
  
        </CardContent>
        <div className="flex flex-wrap gap-2 p-4">
            <Button 
              onClick={adicionarOuAtualizarCliente}
              className="bg-green-600 hover:bg-green-700"
            >
              {editandoId ? "Atualizar Cliente" : "Adicionar Cliente"}
            </Button>
            {editandoId && (
              <Button 
                onClick={limparFormulario}
                className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
              >
                Cancelar
              </Button>
            )}
          </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {clientes.map((cliente) => (
          <Card key={cliente.id} className="overflow-hidden">
            <CardContent className="pt-4 sm:p-6">
              <p><strong>Nome:</strong> {cliente.nome}</p>
              <p><strong>WhatsApp:</strong> {cliente.whatsapp}</p>
              <p><strong>Plano:</strong> {cliente.plano}</p>
              
              {/* Status de pagamento */}
              <p>
                <strong>Status:</strong> {cliente.status_pagamento === "em_dia" ? (
                  <span className="text-green-600">✓ Pagamento em dia</span>
                ) : (
                  <span className="text-amber-600 cursor-pointer" onClick={() => alterarStatusPagamento(cliente.id, "em_dia")}>
                    ⚠️ Pagamento pendente (clique para marcar como pago)
                  </span>
                )}
                {cliente.status_pagamento === "em_dia" && (
                  <button 
                    className="ml-2 text-xs text-gray-500 hover:text-red-500"
                    onClick={() => alterarStatusPagamento(cliente.id, "pendente")}
                  >
                    (marcar como pendente)
                  </button>
                )}
              </p>
              
              {/* Progresso de uso do plano */}
              {cliente.mensagens_usadas !== undefined && cliente.mensagens_limite !== undefined && (
                <div className="mt-2">
                  <p className="text-sm mb-1">
                    Você usou {cliente.mensagens_usadas} de {cliente.mensagens_limite} mensagens este mês.
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (cliente.mensagens_usadas / cliente.mensagens_limite) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 pt-3 justify-start">
                <Button onClick={() => editarCliente(cliente)}>Editar</Button>
                <Button onClick={() => excluirCliente(cliente.id)} style={{ backgroundColor: "#dc2626", color: "#fff" }}>Excluir</Button>
                
                {/* Botão para gerenciar plano */}
                <Button 
                  onClick={() => toast.info("Funcionalidade de gerenciamento de plano em desenvolvimento")}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Gerenciar Plano
                </Button>
                
                {/* Link para histórico */}
                <Button 
                  onClick={() => toast.info("Funcionalidade de histórico em desenvolvimento")}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Ver Histórico
                </Button>
                
                {cliente.token_publico ? (
                  <>
                    <Button 
                      onClick={() => {
                        const url = `${window.location.origin}/cliente/${cliente.token_publico}`;
                        navigator.clipboard.writeText(url);
                        console.log("URL copiada:", url);
                        toast.info("Link do painel copiado para a área de transferência");
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Copiar Link
                    </Button>
                    <Button 
                      onClick={() => regenerarToken(cliente.id)}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Novo Token
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => regenerarToken(cliente.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Gerar Link
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}