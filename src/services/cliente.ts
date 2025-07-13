import { supabase } from '../lib/supabase';
import { config } from '../config';
import { setupAuthHeaders } from '../lib/authHeaders';
import { Cliente } from '../types/Cliente';
import api from './api';

// Interface Cliente importada de ../types/Cliente

// Interface para o histórico de mensagens
export interface Mensagem {
  resposta_humana?: string;
  id: number | string;
  cliente_id?: string | number; // UUID na tabela real
  user_id?: string;
  pergunta: string;
  resposta: string;
  timestamp: string;
  nome_cliente?: string;
  whatsapp_cliente?: string;
  cliente_final_id?: number;
  nome_cliente_final?: string;
  whatsapp_cliente_final?: string;
  numero_remetente?: string;
  numero_destino?: string;
}

let clientesFinaisData: any[] = [];

// Buscar cliente pelo token público
export async function buscarClientePorToken(token: string): Promise<Cliente | null> {
  try {
    console.log("Buscando cliente com token:", token);
    
    // Verificar se o token é um UUID válido
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);
    
    let query;
    if (isUUID) {
      // Se o token parece um UUID, tente buscar por token_publico
      query = supabase
        .from("clientes")
        .select("*")
        .eq("token_publico", token)
        .limit(1);
    } else {
      // Caso contrário, busque apenas por token_publico
      query = supabase
        .from("clientes")
        .select("*")
        .eq("token_publico", token)
        .limit(1);
    }
    
    const { data, error } = await query;
    
    console.log("Resultado da busca de cliente:", { data, error });
    
    if (error) {
      console.error("Erro ao buscar cliente:", error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log("Cliente não encontrado para o token:", token);
      
      // Verificar se existem clientes sem token e atualizar
      await atualizarTokensNulos();
      
      // Tentar buscar cliente pelo ID (pode ser que o token seja na verdade um ID)
      const { data: clientePorId, error: errorId } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", token)
        .limit(1);
      
      if (!errorId && clientePorId && clientePorId.length > 0) {
        const cliente = clientePorId[0];
        
        // Se o cliente não tem token, gerar um e atualizar
        if (!cliente.token_publico) {
          const novoToken = gerarTokenPublico();
          await supabase
            .from("clientes")
            .update({ token_publico: novoToken })
            .eq("id", cliente.id);
          
          cliente.token_publico = novoToken;
        }
        
        return cliente;
      }
      
      // Criar um cliente real no banco de dados
      const novoToken = gerarTokenPublico();
      const novoCliente = {
        nome: "Cliente Novo",
        plano: "essencial",
        data_cadastro: new Date().toISOString(),
        mensagens_limite: config.planos.essencial.limite,
        mensagens_usadas: 0,
        token_publico: novoToken
      };
      
      // Inserir o cliente no banco de dados
      const { data: clienteCriado, error: errorCriacao } = await supabase
        .from("clientes")
        .insert([novoCliente])
        .select()
        .single();
      
      if (errorCriacao) {
        console.error("Erro ao criar cliente automático:", errorCriacao);
        return null;
      }
      
      console.log("Cliente criado automaticamente:", clienteCriado);
      return clienteCriado;
    }
    
    // Definir valores padrão para campos importantes
    const cliente = data[0];
    if (!cliente.mensagens_limite) {
      // Usar o limite do plano conforme configuração
      const planoConfig = config.planos[cliente.plano as keyof typeof config.planos];
      cliente.mensagens_limite = planoConfig?.limite || 1000;
    }
    
    return cliente;
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return null;
  }
}

// Buscar cliente pelo número de WhatsApp
export async function buscarClientePorWhatsApp(whatsapp: string): Promise<Cliente | null> {
  try {
    // Usar a nova API route para buscar cliente por WhatsApp
    const response = await api.get(`/cliente/whatsapp?whatsapp=${whatsapp}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar cliente por WhatsApp:", error);
    return null;
  }
}

// Atualizar dados do cliente
export async function atualizarCliente(
  id: string | number, 
  dados: { nome?: string; whatsapp?: string }
): Promise<boolean> {
  try {
    // Se for um cliente de demonstração, simular sucesso
    if (typeof id === 'string' && id.startsWith('demo-')) {
      return true;
    }
    
    const { error } = await supabase
      .from("clientes")
      .update(dados)
      .eq("id", id);
      
    if (error) {
      console.error("Erro ao atualizar cliente:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return false;
  }
}

// Buscar histórico de mensagens do cliente
export async function buscarHistoricoMensagens(
  clienteId: string | number | null, 
  limite: number = 200, 
  offset: number = 0,
  clienteFinalId?: string | number | null
): Promise<Mensagem[]> {
  // Configurar o token do cliente nos cabeçalhos
  setupAuthHeaders();
  try {
    console.log('Buscando histórico para cliente ID:', clienteId, 'limite:', limite, 'offset:', offset, 'cliente final ID:', clienteFinalId);
    
    // Se for um cliente de demonstração, retornar mensagens fictícias
    if (typeof clienteId === 'string' && clienteId?.startsWith('demo-')) {
      return [
        {
          id: 'demo-1',
          cliente_id: 'demo-empresa-1',
          pergunta: 'Como posso usar a IA no meu WhatsApp?',
          resposta: 'Para usar a IA no WhatsApp, basta enviar uma mensagem para o número cadastrado com o prefixo "IA:".',
          timestamp: new Date().toISOString(),
          nome_cliente: 'Empresa ABC',
          whatsapp_cliente: '5511999999999',
          cliente_final_id: 101,
          nome_cliente_final: 'João Silva',
          whatsapp_cliente_final: '5511988888888'
        },
        {
          id: 'demo-2',
          cliente_id: 'demo-empresa-1',
          pergunta: 'Quantas mensagens posso enviar por mês?',
          resposta: 'No plano básico, você tem direito a 100 mensagens por mês. Para mais mensagens, considere fazer upgrade para um plano superior.',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
          nome_cliente: 'Empresa ABC',
          whatsapp_cliente: '5511999999999',
          cliente_final_id: 102,
          nome_cliente_final: 'Maria Oliveira',
          whatsapp_cliente_final: '5511977777777'
        }
      ];
    }
    
    // Construir a consulta base
    let query = supabase
      .from('mensagens_enviadas')
      .select('*')
      .order('timestamp', { ascending: false });
    
    // Filtrar por cliente_id se fornecido
    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }
    
    // Filtrar por cliente_final_id se fornecido
    if (clienteFinalId) {
      console.log('Filtrando mensagens por cliente final ID:', clienteFinalId);
      query = query.eq('cliente_final_id', clienteFinalId);
    }
    
    // Aplicar paginação
    query = query.range(offset, offset + limite - 1);
    
    const { data, error } = await query;
    
    console.log('Mensagens encontradas:', data?.length || 0);
    
    if (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
    
    // Buscar informações dos clientes para as mensagens encontradas
    if (data && data.length > 0) {
      // Obter IDs únicos de clientes
      const clienteIds = Array.from(new Set(data.map((msg: { cliente_id: any; }) => msg.cliente_id).filter(Boolean)));
      
      // Buscar informações dos clientes
      const { data: clientesData } = await supabase
        .from('clientes')
        .select('id, nome, whatsapp')
        .in('id', clienteIds);
      
      // Criar mapa de clientes para fácil acesso
      const clientesMap: { [key: string]: { id: string | number; nome?: string; whatsapp?: string } } = {};
      if (clientesData) {
        clientesData.forEach((cliente: { id: string | number; nome?: string; whatsapp?: string }) => {
          clientesMap[String(cliente.id)] = cliente;
        });
      }
      
      // Obter IDs únicos de clientes finais
      const clienteFinaisIds = Array.from(new Set(data
        .map((msg: { cliente_final_id: any; }) => msg.cliente_final_id)
        .filter(Boolean)));
      
      // Buscar informações dos clientes finais
      clientesFinaisData = await buscarClientesFinais(); 
      
      // Filtrar clientes finais que possuem o clienteId
      const clientesFinaisDoCliente = clientesFinaisData.filter(
        (clienteFinal: { cliente_id?: string | number }) => clienteFinal.cliente_id == clienteId
      );
      console.log(`Clientes finais do cliente ${clienteId}:`, clientesFinaisDoCliente);
      
      // Criar mapa de clientes finais para fácil acesso
      const clientesFinaisMap = processarClientesFinais(clientesFinaisData);
      
      // Verificar se há dados
      console.log(`Encontrados ${clientesFinaisData.length} clientes finais`);
      
      // Formatar os dados para corresponder à interface Mensagem
      const mensagensFormatadas = data.map((msg: { 
        cliente_id: any; 
        cliente_final_id: any;
        numero_remetente?: string;
        numero_destino?: string;
      }) => {
        const cliente = clientesMap[String(msg.cliente_id)] || {};
        // Usar os dados do mapa de clientes finais
        const clienteFinal = msg.cliente_final_id ? clientesFinaisMap[String(msg.cliente_final_id)] || {} : {};
        
        // Função para limpar e validar número de WhatsApp
        const formatarNumeroWhatsApp = (numero?: string): string => {
          if (!numero) return '';
          
          // Remover todos os caracteres não numéricos
          const apenasDigitos = numero.replace(/\D/g, '');
          
          // Verificar se tem pelo menos 10 dígitos (código de área + número)
          if (apenasDigitos.length >= 10) {
            return apenasDigitos;
          }
          
          return '';
        };
        
        const whatsappCliente = formatarNumeroWhatsApp((cliente as { whatsapp?: string }).whatsapp);
        const whatsappClienteFinal = formatarNumeroWhatsApp((clienteFinal as { whatsapp?: string })?.whatsapp);
        
        // Usar os números de remetente e destino se disponíveis
        const numeroRemetente = (msg as any).numero_remetente || whatsappCliente;
        const numeroDestino = (msg as any).numero_destino || whatsappClienteFinal;
        
        // Se o número de destino for igual ao número do cliente, usar o número de remetente como destino
        const numeroDestinoFinal = numeroDestino === whatsappCliente ? numeroRemetente : numeroDestino;
        
        return {
          ...msg,
          nome_cliente: (cliente as { nome?: string }).nome || 'Cliente sem nome',
          whatsapp_cliente: whatsappCliente,
          nome_cliente_final: (clienteFinal as { nome?: string })?.nome || 'Usuário final',
          whatsapp_cliente_final: numeroDestinoFinal || whatsappClienteFinal,
          numero_remetente: numeroRemetente,
          numero_destino: numeroDestinoFinal
        };
      });
      
      return mensagensFormatadas;
    }
    
    return [];
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return [];
  }
}

// Gerar token público aleatório
export function gerarTokenPublico(): string {
  // Gerar um token aleatório mais robusto
  const timestamp = Date.now().toString(36);
  const randomPart1 = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  
  // Combinar partes para criar um token único
  return `${timestamp}-${randomPart1}-${randomPart2}`;
}

// Executar atualização de tokens ao carregar o módulo
(async function inicializarTokens() {
  console.log("Verificando clientes sem token...");
  try {
    const atualizados = await atualizarTokensNulos();
    if (atualizados > 0) {
      console.log(`Inicialização: ${atualizados} clientes receberam novos tokens`);
    }
  } catch (error) {
    console.error("Erro na inicialização de tokens:", error);
  }
})();

// Atualizar tokens nulos para clientes existentes
export async function atualizarTokensNulos(): Promise<number> {
  try {
    // Buscar clientes sem token
    const { data: clientesSemToken, error: errorBusca } = await supabase
      .from("clientes")
      .select("id")
      .or("token_publico.is.null,token_publico.eq.''");
    
    if (errorBusca) {
      console.error("Erro ao buscar clientes sem token:", errorBusca);
      return 0;
    }
    
    if (!clientesSemToken || clientesSemToken.length === 0) {
      console.log("Nenhum cliente sem token encontrado");
      return 0;
    }
    
    console.log(`Encontrados ${clientesSemToken.length} clientes sem token`);
    
    // Atualizar cada cliente com um novo token
    let atualizados = 0;
    for (const cliente of clientesSemToken) {
      const { error } = await supabase
        .from("clientes")
        .update({ token_publico: gerarTokenPublico() })
        .eq("id", cliente.id);
      
      if (!error) atualizados++;
    }
    
    console.log(`${atualizados} clientes atualizados com novos tokens`);
    return atualizados;
  } catch (error) {
    console.error("Erro ao atualizar tokens:", error);
    return 0;
  }
}

// Buscar todos os clientes finais
export async function buscarClientesFinais(): Promise<any[]> {
  try {
    
    // Tentar buscar na tabela clientes_finais
    const { data, error } = await supabase
      .from('clientes_finais')
      .select('*');
    
    if (error) {
      console.error('Erro ao buscar clientes_finais:', error);
      
      // Tentar com nome alternativo
      console.log('Tentando com nome alternativo: cliente_final');
      const { data: altData, error: altError } = await supabase
        .from('cliente_final')
        .select('*');
      
      if (altError) {
        console.error('Erro ao buscar cliente_final:', altError);
        
        // Tentar criar a tabela se ela não existir
        if (altError.code === '42P01') { // Tabela não existe
          console.log('Tabela não existe. Verifique o nome correto da tabela no Supabase.');
        }
        
        return [];
      }
      
      console.log('Clientes finais encontrados (tabela singular):', altData?.length || 0);
      return altData || [];
    }
    
    console.log('Clientes finais encontrados:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar clientes finais:', error);
    return [];
  }
}

// Processar dados de clientes finais
export function processarClientesFinais(clientesFinaisData: any[]): { [key: string]: { id: string | number; nome?: string; whatsapp?: string; email?: string } } {
  const clientesFinaisMap: { [key: string]: { id: string | number; nome?: string; whatsapp?: string; email?: string } } = {};
  
  if (clientesFinaisData && clientesFinaisData.length > 0) {
    clientesFinaisData.forEach((clienteFinal: { id: string | number; nome?: string; whatsapp?: string; email?: string }) => {
      clientesFinaisMap[String(clienteFinal.id)] = clienteFinal;
    });
  }
  
  return clientesFinaisMap;
}

// Contar total de mensagens do cliente
export async function contarTotalMensagens(clienteId: string | number | null): Promise<number> {
  // Configurar o token do cliente nos cabeçalhos
  setupAuthHeaders();
  try {
    console.log('Contando total de mensagens para cliente ID:', clienteId);
    
    // Se for um cliente de demonstração, retornar um valor fixo
    if (typeof clienteId === 'string' && clienteId?.startsWith('demo-')) {
      return 2;
    }
    
    let query = supabase
      .from('mensagens_enviadas')
      .select('id', { count: 'exact' });
    
    // Filtrar por cliente_id se fornecido
    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }
    
    const { count, error } = await query;
    
    if (error) {
      console.error('Erro ao contar mensagens:', error);
      return 0;
    }
    
    console.log('Total de mensagens encontradas:', count);
    return count || 0;
  } catch (error) {
    console.error('Erro ao contar mensagens:', error);
    return 0;
  }
}

// Criar um novo cliente associado a um usuário
export async function criarCliente(
  userData: { 
    nome: string; 
    plano?: string;
    whatsapp?: string;
  }
): Promise<Cliente | null> {
  try {
    // Incluir apenas os campos que existem na tabela
    const novoCliente = {
      nome: userData.nome,
      plano: userData.plano || "essencial",
      whatsapp: userData.whatsapp || "",
      data_cadastro: new Date().toISOString(),
      token_publico: gerarTokenPublico()
    };
    
    const { data, error } = await supabase
      .from("clientes")
      .insert([novoCliente])
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao criar cliente:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return null;
  }
}