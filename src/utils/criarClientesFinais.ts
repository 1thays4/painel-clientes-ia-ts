import { supabase } from '../services/supabase';

// Função para criar clientes finais de teste
export async function criarClientesFinaisTeste(): Promise<void> {
  console.log('Iniciando criação de clientes finais de teste...');
  
  // Dados de exemplo para inserir
  const clientesFinais = [
    {
      id: 101,
      nome: 'João Silva',
      whatsapp: '5511988888888',
      email: 'joao@exemplo.com'
    },
    {
      id: 102,
      nome: 'Maria Oliveira',
      whatsapp: '5511977777777',
      email: 'maria@exemplo.com'
    },
    {
      id: 103,
      nome: 'Carlos Pereira',
      whatsapp: '5511966666666',
      email: 'carlos@exemplo.com'
    }
  ];
  
  try {
    // Inserir na tabela clientes_finais
    const { data, error } = await supabase
      .from('clientes_finais')
      .insert(clientesFinais)
      .select();
    
    if (error) {
      console.error('Erro ao inserir clientes finais:', error);
      return;
    }
    
    console.log(`✅ ${data?.length || 0} clientes finais inseridos com sucesso!`);
  } catch (error) {
    console.error('Erro ao criar clientes finais:', error);
  }
}