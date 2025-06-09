const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://sqcedymaeazvrrgrokpv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxY2VkeW1hZWF6dnJyZ3Jva3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5OTc3NTUsImV4cCI6MjA2NDU3Mzc1NX0.D65rBFBiVE1F9mVI15QgJeDepEhQtPj3eS2kXxRCfB8';
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rota para registrar mensagens
app.post('/api/registrar-mensagem', async (req, res) => {
  try {
    const { whatsappNumero, pergunta, resposta } = req.body;
    
    if (!whatsappNumero || !pergunta || !resposta) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }
    
    // Limpar o número do WhatsApp (remover prefixo "whatsapp:")
    const numeroLimpo = whatsappNumero.replace('whatsapp:', '');
    console.log('Processando mensagem de:', numeroLimpo);
    
    // Buscar cliente pelo número de WhatsApp
    let { data: clientes } = await supabase
      .from('clientes')
      .select('id')
      .eq('whatsapp', numeroLimpo);
    
    let clienteId;
    
    // Se o cliente não existir, criar um novo
    if (!clientes || clientes.length === 0) {
      console.log('Cliente não encontrado, criando novo cliente');
      
      const { data: novoCliente, error: createError } = await supabase
        .from('clientes')
        .insert([
          { 
            nome: `Cliente ${numeroLimpo}`,
            whatsapp: numeroLimpo,
            email: `cliente_${numeroLimpo.replace('+', '')}@exemplo.com`,
            plano: 'basico'
          }
        ])
        .select('id')
        .single();
      
      if (createError) {
        console.error('Erro ao criar cliente:', createError);
        return res.status(500).json({ error: 'Erro ao criar cliente' });
      }
      
      clienteId = novoCliente.id;
      console.log('Novo cliente criado com ID:', clienteId);
    } else {
      clienteId = clientes[0].id;
      console.log('Cliente encontrado com ID:', clienteId);
    }

    // Registrar a mensagem
    const { error: mensagemError } = await supabase
      .from('mensagens_enviadas')
      .insert([
        {
          cliente_id: clienteId,
          pergunta: pergunta,
          resposta: resposta,
          timestamp: new Date().toISOString(),
        }
      ]);

    if (mensagemError) {
      console.error('Erro ao registrar mensagem:', mensagemError);
      return res.status(500).json({ error: 'Erro ao registrar mensagem' });
    }

    return res.status(200).json({
      success: true,
      message: 'Mensagem registrada com sucesso',
      cliente_id: clienteId
    });
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor com Supabase rodando na porta ${PORT}`);
});