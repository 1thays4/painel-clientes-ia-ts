const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const cron = require('node-cron');

// Configuração do Supabase
const supabaseUrl = 'https://sqcedymaeazvrrgrokpv.supabase.co';
// Chave de serviço (service role) - substitua pela sua chave de serviço real
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxY2VkeW1hZWF6dnJyZ3Jva3B2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODk5Nzc1NSwiZXhwIjoyMDY0NTczNzU1fQ.0-YnV_E5xb1qb9-vflaz4lMunGx5I43axzXBR-E8HUw';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Função para verificar e marcar clientes para follow-up
async function verificarEMarcarFollowup() {
  try {
    console.log('Verificando clientes para follow-up...');
    
    // Obter data atual
    const agora = new Date();
    
    // Calcular data de 24 horas atrás
    const vinteQuatroHorasAtras = new Date(agora);
    vinteQuatroHorasAtras.setHours(agora.getHours() - 24);
    
    // Formatar data para ISO string
    const vinteQuatroHorasAtrasISO = vinteQuatroHorasAtras.toISOString();
    
    console.log(`Buscando mensagens anteriores a ${vinteQuatroHorasAtrasISO}`);
    
    // Buscar clientes finais com última mensagem há mais de 24 horas
    const { data: ultimasMensagens, error: mensagensError } = await supabase
      .from('mensagens_enviadas')
      .select(`
        id,
        cliente_final_id,
        timestamp,
        clientes_finais:cliente_final_id (
          id,
          nome,
          whatsapp,
          modo
        )
      `)
      .lt('timestamp', vinteQuatroHorasAtrasISO)
      .order('timestamp', { ascending: false });
    
    if (mensagensError) {
      console.error('Erro ao buscar mensagens:', mensagensError);
      return { success: false, error: mensagensError };
    }
    
    if (!ultimasMensagens || ultimasMensagens.length === 0) {
      console.log('Nenhuma mensagem encontrada para follow-up');
      return { success: true, clientesAtualizados: 0 };
    }
    
    console.log(`Encontradas ${ultimasMensagens.length} mensagens para análise`);
    
    // Agrupar por cliente_final_id para pegar apenas a última mensagem de cada cliente
    const clientesMap = new Map();
    
    for (const mensagem of ultimasMensagens) {
      if (!mensagem.cliente_final_id || !mensagem.clientes_finais) continue;
      
      // Se o cliente já foi processado ou já está em aberto/encerrado, pular
      if (clientesMap.has(mensagem.cliente_final_id) || 
          mensagem.clientes_finais.modo === 'em aberto' || 
          mensagem.clientes_finais.modo === 'encerrado') {
        continue;
      }
      
      clientesMap.set(mensagem.cliente_final_id, mensagem);
    }
    
    console.log(`Clientes únicos para follow-up: ${clientesMap.size}`);
    
    // Marcar clientes para follow-up
    const clientesAtualizados = [];
    
    for (const [clienteId, mensagem] of clientesMap.entries()) {
      console.log(`Marcando cliente ${clienteId} para follow-up`);
      
      const { data, error } = await supabase
        .from('clientes_finais')
        .update({ 
          modo: 'em aberto',
          observacoes: `Marcado para follow-up automaticamente em ${agora.toISOString()}. Última mensagem em ${mensagem.timestamp}.`
        })
        .eq('id', clienteId);
      
      if (error) {
        console.error(`Erro ao marcar cliente ${clienteId} para follow-up:`, error);
      } else {
        clientesAtualizados.push(clienteId);
        console.log(`Cliente ${clienteId} marcado para follow-up com sucesso`);
      }
    }
    
    console.log(`Total de clientes marcados para follow-up: ${clientesAtualizados.length}`);
    
    return { 
      success: true, 
      clientesAtualizados: clientesAtualizados.length,
      clienteIds: clientesAtualizados
    };
  } catch (error) {
    console.error('Erro ao verificar e marcar follow-ups:', error);
    return { success: false, error };
  }
}

// Rota para verificar e marcar clientes para follow-up
app.get('/api/verificar-followups', async (req, res) => {
  try {
    const resultado = await verificarEMarcarFollowup();
    
    if (!resultado.success) {
      return res.status(500).json({ 
        error: 'Erro ao verificar follow-ups',
        details: resultado.error
      });
    }
    
    return res.status(200).json({
      success: true,
      message: `${resultado.clientesAtualizados} clientes marcados para follow-up`,
      clientesAtualizados: resultado.clientesAtualizados,
      clienteIds: resultado.clienteIds
    });
  } catch (error) {
    console.error('Erro na rota de verificação de follow-ups:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Configurar cron job para verificar follow-ups diariamente às 9:00
cron.schedule('0 9 * * *', async () => {
  console.log('Executando verificação automática de follow-ups...');
  try {
    const resultado = await verificarEMarcarFollowup();
    console.log('Resultado da verificação automática:', resultado);
  } catch (error) {
    console.error('Erro na verificação automática de follow-ups:', error);
  }
});

// Rota de teste para verificar se o servidor está funcionando
app.get('/api/teste', (req, res) => {
  console.log('Rota de teste acessada');
  return res.status(200).json({ message: 'Servidor de follow-up funcionando corretamente' });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log('======================================');
  console.log(`Servidor de Follow-up rodando na porta ${PORT}`);
  console.log('Data/Hora de início:', new Date().toISOString());
  console.log('Versão do Node:', process.version);
  console.log('======================================');
});