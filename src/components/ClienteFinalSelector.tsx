import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ClienteFinal {
  id: string | number;
  nome: string;
  whatsapp?: string;
  cliente_id: string; // UUID
}

interface ClienteFinalSelectorProps {
  onClienteFinalSelecionado: (clienteFinalId: string | number | null) => void;
  clienteFinalSelecionado: string | number | null;
  clienteId: string | number | null;
}

export default function ClienteFinalSelector({ 
  onClienteFinalSelecionado, 
  clienteFinalSelecionado,
  clienteId
}: ClienteFinalSelectorProps) {
  const [clientesFinais, setClientesFinais] = useState<ClienteFinal[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    if (!clienteId) {
      setClientesFinais([]);
      setCarregando(false);
      return;
    }

    const buscarClientesFinais = async () => {
      try {
        setCarregando(true);
        
        // Se for um cliente de demonstração, retornar dados fictícios
        if (typeof clienteId === 'string' && clienteId.startsWith('demo-')) {
          setClientesFinais([
            {
              id: 101,
              nome: 'João Silva',
              whatsapp: '5511988888888',
              cliente_id: clienteId as string
            },
            {
              id: 102,
              nome: 'Maria Oliveira',
              whatsapp: '5511977777777',
              cliente_id: clienteId as string
            },
            {
              id: 103,
              nome: 'Carlos Pereira',
              whatsapp: '5511966666666',
              cliente_id: clienteId as string
            }
          ]);
          return;
        }
        
        // Primeiro, buscar o número da empresa
        const { data: empresaData, error: empresaError } = await supabase
          .from('clientes')
          .select('whatsapp')
          .eq('id', clienteId)
          .single();
        
        if (empresaError) {
          console.error('Erro ao buscar dados da empresa:', empresaError);
        }
        
        const numeroEmpresa = empresaData?.whatsapp?.replace(/\D/g, '');
        
        // Buscar todos os clientes finais
        const { data, error } = await supabase
          .from('clientes_finais')
          .select('id, nome, whatsapp, cliente_id')
          .eq('cliente_id', clienteId)
          .order('nome');
        
        if (error) {
          console.error('Erro ao buscar clientes finais:', error);
          return;
        }
        
        // Filtrar clientes finais que têm o mesmo número da empresa
        const clientesFinaisFiltrados = data ? data.filter((cliente: { whatsapp: string; }) => {
          const numeroCliente = cliente.whatsapp?.replace(/\D/g, '');
          return !numeroEmpresa || !numeroCliente || numeroEmpresa !== numeroCliente;
        }) : [];
        
        setClientesFinais(clientesFinaisFiltrados);
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setCarregando(false);
      }
    };
    
    buscarClientesFinais();
  }, [clienteId]);

  const clientesFiltrados = clientesFinais.filter(cliente => 
    cliente.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    (cliente.whatsapp && cliente.whatsapp.includes(filtro))
  );

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Filtrar por Contato</h3>
      
      {!clienteId ? (
        <p className="text-sm text-gray-500">Selecione uma empresa primeiro</p>
      ) : (
        <>
          <Input
            type="text"
            placeholder="Filtrar por nome ou WhatsApp"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="mb-3"
          />
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={clienteFinalSelecionado === null ? "default" : "outline"}
              onClick={() => onClienteFinalSelecionado(null)}
              className="mb-2"
            >
              Todos os Contatos
            </Button>
            
            {carregando ? (
              <p className="text-sm text-gray-500">Carregando clientes finais...</p>
            ) : clientesFiltrados.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum cliente final encontrado</p>
            ) : (
              clientesFiltrados.map(cliente => (
                <Button 
                  key={cliente.id}
                  variant={clienteFinalSelecionado === cliente.id ? "default" : "outline"}
                  onClick={() => onClienteFinalSelecionado(cliente.id)}
                  className="mb-2"
                >
                  {cliente.nome} {cliente.whatsapp && `(${cliente.whatsapp})`}
                </Button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}