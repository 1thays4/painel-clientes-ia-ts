import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Cliente {
  id: string; // UUID
  nome: string;
  whatsapp?: string;
}

interface ClienteSelectorProps {
  onClienteSelecionado: (clienteId: string | number | null) => void;
  clienteSelecionado: string | number | null;
}

export default function ClienteSelector({ 
  onClienteSelecionado, 
  clienteSelecionado 
}: ClienteSelectorProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    const buscarClientes = async () => {
      try {
        setCarregando(true);
        
        // Lista de números do sistema que não devem aparecer como empresas
        const numerosDoSistema = ['5547991950615', '+14155238886'];
        
        const { data, error } = await supabase
          .from('clientes')
          .select('id, nome, whatsapp')
          .order('nome');
        
        if (error) {
          console.error('Erro ao buscar clientes:', error);
          return;
        }
        
        // Filtrar clientes do sistema
        const clientesFiltrados = data ? data.filter((cliente: { whatsapp: string; }) => 
          !numerosDoSistema.includes(cliente.whatsapp?.replace(/\D/g, '')) && 
          !numerosDoSistema.includes(cliente.whatsapp)
        ) : [];
        
        setClientes(clientesFiltrados);
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setCarregando(false);
      }
    };
    
    buscarClientes();
  }, []);

  const clientesFiltrados = clientes.filter(cliente => 
    cliente.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    (cliente.whatsapp && cliente.whatsapp.includes(filtro))
  );

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Selecionar Empresa</h3>
      
      <Input
        type="text"
        placeholder="Filtrar por nome ou WhatsApp"
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
          Todas as Empresas
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
              onClick={() => onClienteSelecionado(cliente.id)}
              className="mb-2"
            >
              {cliente.nome} {cliente.whatsapp && `(${cliente.whatsapp})`}
            </Button>
          ))
        )}
      </div>
    </div>
  );
}