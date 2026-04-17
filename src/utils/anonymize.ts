/**
 * Utilitário de anonimização de dados para conformidade com LGPD
 * Use ao gravar vídeos/demos da aplicação
 */

/** Nomes fictícios para anonimização */
const FAKE_NAMES = [
  'Empresa Test A',
  'Empresa Test B', 
  'Empresa Test C',
  'Empresa Demo 1',
  'Empresa Demo 2',
  'Cliente Exemplo 1',
  'Cliente Exemplo 2',
  'Negócio X',
  'Comércio Y',
  'Serviço Z'
];

/** Nomes fictícios para clientes finais */
const FAKE_CLIENT_NAMES = [
  'João da Silva',
  'Maria dos Santos',
  'Pedro Costa',
  'Ana Paula',
  'Carlos Mendes',
  'Juliana Oliveira',
  'Roberto Alves',
  'Fernanda Gomes',
  'Lucas Ferreira',
  'Patricia Rocha'
];

/** Números de telefone fictícios no formato internacional */
const FAKE_PHONES = [
  '5511999990001',
  '5511999990002',
  '5511988880001',
  '5511988880002',
  '5521999990001',
  '5521988880001',
  '5585999990001',
  '5585988880001',
  '5531999990001',
  '5531988880001',
];

/** E-mails fictícios */
const FAKE_EMAILS = [
  'contato@empresatest.com.br',
  'admin@empresademo.com.br',
  'suporte@clienteexemplo.com.br',
  'info@negocioteste.com.br',
  'vendas@comerciodemo.com.br',
  'atendimento@servicotest.com.br',
  'suporte@exemplo.com.br',
  'contato@demo.com.br',
  'admin@teste.com.br',
  'suporte@anonymous.com.br',
];

/**
 * Gera um hash consistente para um valor
 * Sempre retorna o mesmo ID fictício para a mesma entrada
 */
function simpleHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Cache para manter consistência entre múltiplas chamadas
 */
const anonymizeCache = new Map<string, string>();
const phoneCache = new Map<string, string>();

/**
 * Anonimiza um nome
 */
export function anonymizeName(name: string | null | undefined, type: 'company' | 'person' = 'company'): string {
  if (!name) return 'Nome Indisponível';
  
  const cacheKey = `name_${name}`;
  if (anonymizeCache.has(cacheKey)) {
    return anonymizeCache.get(cacheKey)!;
  }

  const nameList = type === 'company' ? FAKE_NAMES : FAKE_CLIENT_NAMES;
  const index = simpleHash(name) % nameList.length;
  const anonymized = nameList[index];
  
  anonymizeCache.set(cacheKey, anonymized);
  return anonymized;
}

/**
 * Anonimiza um número de telefone
 */
export function anonymizePhone(phone: string | null | undefined): string {
  if (!phone) return 'Telefone Indisponível';
  
  if (phoneCache.has(phone)) {
    return phoneCache.get(phone)!;
  }

  // Remove formatação
  const cleanPhone = phone.replace(/\D/g, '');
  const index = simpleHash(cleanPhone) % FAKE_PHONES.length;
  const anonymized = FAKE_PHONES[index];
  
  phoneCache.set(phone, anonymized);
  return anonymized;
}

/**
 * Anonimiza um email
 */
export function anonymizeEmail(email: string | null | undefined): string {
  if (!email) return 'email@anonymous.com.br';
  
  const cacheKey = `email_${email}`;
  if (anonymizeCache.has(cacheKey)) {
    return anonymizeCache.get(cacheKey)!;
  }

  const index = simpleHash(email) % FAKE_EMAILS.length;
  const anonymized = FAKE_EMAILS[index];
  
  anonymizeCache.set(cacheKey, anonymized);
  return anonymized;
}

/**
 * Anonimiza um ID
 */
export function anonymizeId(id: string | number | null | undefined): string {
  if (!id) return 'id-anon-000000';
  
  const idStr = String(id);
  const index = simpleHash(idStr) % 999999;
  return `id-anon-${String(index).padStart(6, '0')}`;
}

/**
 * Interface Cliente anonimizada
 */
export interface AnonimousCliente {
  [key: string]: any;
  id: string;
  nome: string;
  whatsapp?: string;
  email?: string;
}

/**
 * Anonimiza um objeto Cliente
 */
export function anonymizeCliente(cliente: any): AnonimousCliente {
  if (!cliente) return {} as AnonimousCliente;

  return {
    ...cliente,
    id: anonymizeId(cliente.id),
    nome: anonymizeName(cliente.nome, 'company'),
    whatsapp: cliente.whatsapp ? anonymizePhone(cliente.whatsapp) : undefined,
    email: cliente.email ? anonymizeEmail(cliente.email) : undefined,
    token_publico: cliente.token_publico ? anonymizeId(cliente.token_publico) : undefined,
  };
}

/**
 * Interface Mensagem anonimizada
 */
export interface AnonimousMensagem {
  [key: string]: any;
  id: string;
  nome_cliente?: string;
  whatsapp_cliente?: string;
  nome_cliente_final?: string;
  whatsapp_cliente_final?: string;
  numero_remetente?: string;
  numero_destino?: string;
}

/**
 * Anonimiza um objeto Mensagem
 */
export function anonymizeMensagem(mensagem: any): AnonimousMensagem {
  if (!mensagem) return {} as AnonimousMensagem;

  return {
    ...mensagem,
    id: anonymizeId(mensagem.id),
    cliente_id: anonymizeId(mensagem.cliente_id),
    nome_cliente: mensagem.nome_cliente ? anonymizeName(mensagem.nome_cliente, 'company') : undefined,
    whatsapp_cliente: mensagem.whatsapp_cliente ? anonymizePhone(mensagem.whatsapp_cliente) : undefined,
    nome_cliente_final: mensagem.nome_cliente_final ? anonymizeName(mensagem.nome_cliente_final, 'person') : undefined,
    whatsapp_cliente_final: mensagem.whatsapp_cliente_final ? anonymizePhone(mensagem.whatsapp_cliente_final) : undefined,
    numero_remetente: mensagem.numero_remetente ? anonymizePhone(mensagem.numero_remetente) : undefined,
    numero_destino: mensagem.numero_destino ? anonymizePhone(mensagem.numero_destino) : undefined,
  };
}

/**
 * Anonimiza um array de clientes
 */
export function anonymizeClientes(clientes: any[]): AnonimousCliente[] {
  return clientes.map(anonymizeCliente);
}

/**
 * Anonimiza um array de mensagens
 */
export function anonymizeMensagens(mensagens: any[]): AnonimousMensagem[] {
  return mensagens.map(anonymizeMensagem);
}

/**
 * Limpa o cache de anonimização (útil entre gravações)
 */
export function clearAnonymizeCache(): void {
  anonymizeCache.clear();
  phoneCache.clear();
}

/**
 * Retorna o estado do modo demo
 */
export function isDemoMode(): boolean {
  // Verificar variável de ambiente
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || 
         process.env.DEMO_MODE === 'true';
}
