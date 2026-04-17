/**
 * EXEMPLO PRÁTICO DE INTEGRAÇÃO
 * 
 * Este é um exemplo de como integrar anonimização em um componente real
 * Copie este componente e adapte para você situ onde tem nomes e telefones
 * 
 * Local: src/components/PainelClientesComAnonimizacao.tsx
 */

import React, { useEffect, useState } from 'react';
import { Cliente } from '../types/Cliente';
import { useAnonymize } from '../hooks/useAnonymize';
import { isDemoMode } from '../utils/anonymize';

interface Props {
  clientes: Cliente[];
  onSelectCliente?: (cliente: Cliente) => void;
}

/**
 * Componente que exibe lista de clientes com suporte a anonimização
 */
export function PainelClientesComAnonimizacao({ clientes, onSelectCliente }: Props) {
  const anon = useAnonymize();
  const [clientesExibidos, setClientesExibidos] = useState<Cliente[]>([]);

  // Efeito para aplicar anonimização quando modo demo está ativo
  useEffect(() => {
    if (isDemoMode()) {
      // Anonimizar clientes
      const anonimizados = clientes.map((cliente) => ({
        ...cliente,
        nome: anon.name(cliente.nome, 'company'),
        whatsapp: cliente.whatsapp ? anon.phone(cliente.whatsapp) : undefined,
        email: cliente.email ? anon.email(cliente.email) : undefined,
      }));
      setClientesExibidos(anonimizados);
    } else {
      setClientesExibidos(clientes);
    }
  }, [clientes, anon]);

  return (
    <div className="painel-clientes">
      {/* Header com indicador de modo demo */}
      <div className="header">
        <h1>Painel de Clientes</h1>
        {isDemoMode() && (
          <div className="badge-demo">
            🔐 MODO DEMO - Dados Anonimizados (LGPD)
          </div>
        )}
      </div>

      {/* Lista de clientes */}
      <div className="clientes-list">
        {clientesExibidos.map((cliente) => (
          <div key={cliente.id} className="cliente-card">
            <div className="cliente-header">
              <h2>{cliente.nome}</h2>
              <span className="plano">{cliente.plano}</span>
            </div>

            <div className="cliente-info">
              {/* Telefone - anonimizado se modo demo */}
              <div className="info-row">
                <strong>WhatsApp:</strong>
                <span>
                  {cliente.whatsapp || 'Não informado'}
                </span>
              </div>

              {/* Email - anonimizado se modo demo */}
              <div className="info-row">
                <strong>Email:</strong>
                <span>
                  {cliente.email || 'Não informado'}
                </span>
              </div>

              {/* Outras informações */}
              <div className="info-row">
                <strong>Mensagens:</strong>
                <span>
                  {cliente.mensagens_usadas} / {cliente.mensagens_limite}
                </span>
              </div>

              <div className="info-row">
                <strong>Status:</strong>
                <span className={`status ${cliente.status_pagamento}`}>
                  {cliente.status_pagamento}
                </span>
              </div>
            </div>

            {/* Botão de ação */}
            <button
              className="btn-selecionar"
              onClick={() => onSelectCliente?.(cliente)}
            >
              Ver Detalhes
            </button>
          </div>
        ))}
      </div>

      {/* Estilos */}
      <style>{`
        .painel-clientes {
          padding: 20px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .badge-demo {
          background-color: #e8f5e9;
          border: 2px solid #4caf50;
          color: #1b5e20;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: bold;
        }

        .clientes-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .cliente-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 16px;
          background: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          transition: box-shadow 0.3s;
        }

        .cliente-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .cliente-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 12px;
        }

        .cliente-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .plano {
          background-color: #e3f2fd;
          color: #1565c0;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .cliente-info {
          margin-bottom: 16px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
          border-bottom: 1px solid #f5f5f5;
        }

        .info-row strong {
          color: #666;
        }

        .info-row span {
          color: #333;
          font-weight: 500;
        }

        .status {
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 12px;
          text-transform: uppercase;
        }

        .status.em_dia {
          background-color: #c8e6c9;
          color: #2e7d32;
        }

        .status.pendente {
          background-color: #ffccbc;
          color: #d84315;
        }

        .btn-selecionar {
          width: 100%;
          padding: 10px;
          background-color: #1976d2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.3s;
        }

        .btn-selecionar:hover {
          background-color: #1565c0;
        }
      `}</style>
    </div>
  );
}

/**
 * EXEMPLO 2: Com Supabase Real-time + Anonimização
 */
export function PainelClientesComSupabase() {
  const anon = useAnonymize();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarClientes = async () => {
      try {
        setLoading(true);
        // Simular fetch do Supabase
        // const { data, error } = await supabase
        //   .from('clientes')
        //   .select('*');
        
        const data: Cliente[] = []; // Substitua com dados reais
        
        if (isDemoMode() && data.length > 0) {
          // Anonimizar dados antes de armazenar no estado
          const anonimizados = data.map((cliente) => ({
            ...cliente,
            nome: anon.name(cliente.nome, 'company'),
            whatsapp: cliente.whatsapp ? anon.phone(cliente.whatsapp) : undefined,
            email: cliente.email ? anon.email(cliente.email) : undefined,
          }));
          setClientes(anonimizados);
        } else {
          setClientes(data);
        }
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarClientes();
  }, [anon]);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="painel-supabase">
      {isDemoMode() && <div className="alerta-demo">🔐 Modo Demo - LGPD Ativo</div>}
      
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>WhatsApp</th>
            <th>Email</th>
            <th>Plano</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>{cliente.nome}</td>
              <td>{cliente.whatsapp || '-'}</td>
              <td>{cliente.email || '-'}</td>
              <td>{cliente.plano}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <style>{`
        .painel-supabase {
          padding: 20px;
        }

        .alerta-demo {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          color: #856404;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-weight: bold;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        table th {
          background-color: #f5f5f5;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #e0e0e0;
        }

        table td {
          padding: 12px;
          border-bottom: 1px solid #e0e0e0;
        }

        table tbody tr:hover {
          background-color: #fafafa;
        }
      `}</style>
    </div>
  );
}

/**
 * EXEMPLO 3: Form de Filtro com Anonimização
 */
export function FiltroClientesComAnonimizacao() {
  const anon = useAnonymize();
  const [filtro, setFiltro] = useState('');
  const [resultados, setResultados] = useState<Cliente[]>([]);

  const handleFiltro = (valor: string) => {
    setFiltro(valor);
    
    // Aqui você faria uma busca
    // const resultaProcura = clientes.filter(...);
    
    // Se modo demo, anonimizar resultados
    if (isDemoMode()) {
      // setResultados(resultados.map(anon.cliente));
    }
  };

  return (
    <div className="filtro-wrapper">
      <input
        type="text"
        placeholder="Digite nome ou telefone do cliente..."
        value={filtro}
        onChange={(e) => handleFiltro(e.target.value)}
      />
      
      {isDemoMode() && (
        <small className="texto-demo">
          💡 Nota: Resultados são anonimizados (modo LGPD)
        </small>
      )}

      <div className="resultados">
        {resultados.map((cliente) => (
          <div key={cliente.id} className="item-resultado">
            <b>{cliente.nome}</b>
            <span>{cliente.whatsapp}</span>
          </div>
        ))}
      </div>

      <style>{`
        .filtro-wrapper {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .filtro-wrapper input {
          padding: 12px;
          font-size: 14px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
        }

        .texto-demo {
          color: #666;
          font-style: italic;
        }

        .resultados {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .item-resultado {
          padding: 8px;
          background-color: #f5f5f5;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
        }
      `}</style>
    </div>
  );
}

export default PainelClientesComAnonimizacao;
