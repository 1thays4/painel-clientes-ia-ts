import React, { useEffect, useState } from 'react';
import { executarDiagnostico } from '../utils/diagnostico';
import { criarClientesFinaisTeste } from '../utils/criarClientesFinais';

const DiagnosticoPage: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Sobrescrever console.log para capturar os logs
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      originalLog(...args);
      setLogs(prev => [...prev, args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')]);
    };

    console.error = (...args) => {
      originalError(...args);
      setLogs(prev => [...prev, `ERRO: ${args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')}`]);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  const handleRunDiagnostic = async () => {
    setLogs([]);
    setIsRunning(true);
    try {
      await executarDiagnostico();
    } catch (error) {
      console.error('Erro ao executar diagnóstico:', error);
    }
    setIsRunning(false);
  };

  const handleCreateTestData = async () => {
    setLogs([]);
    setIsRunning(true);
    try {
      await criarClientesFinaisTeste();
      // Executar diagnóstico novamente para verificar se os dados foram inseridos
      await executarDiagnostico();
    } catch (error) {
      console.error('Erro ao criar dados de teste:', error);
    }
    setIsRunning(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Diagnóstico do Banco de Dados</h1>
      
      <div className="flex space-x-4 mb-4">
        <button 
          onClick={handleRunDiagnostic}
          disabled={isRunning}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isRunning ? 'Executando...' : 'Executar Diagnóstico'}
        </button>
        
        <button 
          onClick={handleCreateTestData}
          disabled={isRunning}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          {isRunning ? 'Executando...' : 'Criar Dados de Teste'}
        </button>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Resultados:</h2>
        <pre className="bg-black text-green-400 p-4 rounded overflow-auto max-h-96">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
          {isRunning && <div className="animate-pulse">Executando diagnóstico...</div>}
        </pre>
      </div>
    </div>
  );
};

export default DiagnosticoPage;