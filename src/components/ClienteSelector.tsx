import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Cliente {
  id: string; // UUID
  nome: string;
  whatsapp?: string;
  cliente_id?: string | number; // ID da empresa associada
  empresa_id?: string | number; // ID da empresa associada (campo alternativo)
}

interface ClienteSelectorProps {
  onClienteSelecionado: (clienteId: string | number | null, tipo?: 'empresa' | 'cliente_final') => void;
  clienteSelecionado: string | number | null;
  empresaId?: string | number; // ID da empresa atual
}

export default function ClienteSelector({ 
  onClienteSelecionado, 
  clienteSelecionado,
  empresaId
}: ClienteSelectorProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    const buscarClientes = async () => {
      try {
        setCarregando(true);
        
        // Lista de números do sistema que não devem aparecer como empresas
        const numerosDoSistema = [
          '5547991950615', 
          '+14155238886',
          '15557811105',
          '+15557811105'
        ];

        const { data: clientesData, errorB } = await supabase
          .from('clientes')
          .select('id, nome, whatsapp')
          .order('nome');
        
        if (errorB) {
          console.error('Erro ao buscar clientes:', errorB);
          return;
        } 

    // Buscar apenas os clientes finais da empresa atual, se especificada
    const query = supabase.from('clientes_finais').select('*');
    
    // Filtrar por empresa_id ou cliente_id se empresaId for fornecido
    if (empresaId) {
      query.or(`cliente_id.eq.${empresaId},cliente_id.eq.${empresaId}`);
    }
    
    const { data: clientesFinaisData, error } = await query;

        if (error) {
          console.error('Erro ao buscar clientes finais:', error);
          return;
        }

      // Filtrar clientes finais que possuem o clienteId
/*       const clientesFinaisDoCliente = clientesFinaisData.filter(
        (clienteFinal: { cliente_id?: string | number }) => clienteFinal.cliente_id == clientesData.id
      );
      console.log(`Clientes finais do cliente ${clientesData.id}:`, clientesFinaisDoCliente);
       */
        
        // Formatar e filtrar clientes finais
        const clientesFiltrados = clientesFinaisData ? clientesFinaisData
          .filter((cliente: { whatsapp?: string; }) => {
            // Se não tem WhatsApp, manter
            if (!cliente.whatsapp) return true;
            
            // Filtrar números do sistema
            return !numerosDoSistema.some(numero => {
              const clienteNumero = cliente.whatsapp?.replace(/\D/g, '');
              const sistemaNumero = numero.replace(/\D/g, '');
              return clienteNumero === sistemaNumero;
            });
          })
          .map((cliente: any) => ({
            ...cliente,
            // Garantir que o nome seja legível
            nome: cliente.nome /* ? `${cliente.nome} (Cliente Final)` : 'Cliente Final' */,
            // Manter referência à empresa
            empresa_id: cliente.empresa_id || cliente.cliente_id || empresaId
          })) : [];

        
        
        setClientes(clientesFiltrados);
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setCarregando(false);
      }
    };
    
    buscarClientes();
  }, [empresaId]);

  const clientesFiltrados = clientes.filter(cliente => 
    cliente.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    (cliente.whatsapp && cliente.whatsapp.includes(filtro))
  );

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Filtrar por Cliente</h3>
      
      <Input
        type="text"
        placeholder="Filtrar por nome"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="mb-3"
      />
      
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={clienteSelecionado === null ? "default" : "outline"}
          onClick={() => onClienteSelecionado(null)}
          className="mb-2"
        >
          Todos os Clientes
        </Button>
        
        {carregando ? (
          <p className="text-sm text-gray-500">Carregando empresas...</p>
        ) : clientesFiltrados.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma empresa encontrada</p>
        ) : (
          clientesFiltrados.map(cliente => (
            <Button 
              key={cliente.id}
              variant={clienteSelecionado === cliente.id ? "default" : "outline"}
              onClick={() => onClienteSelecionado(cliente.id, 'cliente_final')}
              className="mb-2"
            >
              {cliente.nome}
            </Button>
          ))
        )}
      </div>
    </div>
  );
}