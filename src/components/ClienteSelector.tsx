import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, MenuItem, FormControl, InputLabel, Chip, Box, TextField, Autocomplete } from '@mui/material';

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
          })) .sort((a: any, b: any) => a.nome.localeCompare(b.nome, 'pt-BR')) // <-- Ordenação alfabética 
          : [];

        
        
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
      <h3 className="text-lg font-medium mb-3">Filtrar:</h3>
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Autocomplete
          options={[{ id: 'todos', nome: 'Todos os Clientes' }, ...clientes]}
          getOptionLabel={(option) => option.nome}
          fullWidth
          loading={carregando}
          loadingText="Carregando clientes..."
          noOptionsText="Nenhum cliente encontrado"
          value={clienteSelecionado === null ? { id: 'todos', nome: 'Todos os Clientes' } : 
                 clientes.find(c => c.id === clienteSelecionado) || null}
          onChange={(_, newValue) => {
            if (newValue === null || newValue.id === 'todos') {
              onClienteSelecionado(null);
            } else {
              onClienteSelecionado(newValue.id, 'cliente_final');
            }
          }}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Selecione um cliente" 
              variant="outlined" 
              placeholder="Buscar cliente"
            />
          )}
          renderOption={(props, option) => (
            <MenuItem {...props} key={option.id}>
              {option.nome}
            </MenuItem>
          )}
          sx={{ bgcolor: 'white', borderRadius: 1 }}
        />
        
        <Button 
          variant={clienteSelecionado === null ? "default" : "outline"}
          onClick={() => onClienteSelecionado(null)}
        >
          Limpar
        </Button>
      </Box>
    </div>
  );
}