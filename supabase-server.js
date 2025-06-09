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
    
    console.log('Processando mensagem de:', whatsappNumero);
    
    // Limpar o número do WhatsApp (remover prefixo "whatsapp:")
    const numeroLimpo = whatsappNumero.replace('whatsapp:', '');
    
    // Buscar cliente pelo número de WhatsApp
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('id, mensagens_usadas, mensagens_limite')
      .eq('whatsapp', numeroLimpo)
      .single();

    if (clienteError) {
      console.error('Erro ao buscar cliente:', clienteError);
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    if (!cliente) {
      console.log('Cliente não encontrado para o número:', numeroLimpo);
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    console.log('Cliente encontrado:', cliente.id);

    // Registrar a mensagem
    const { error: mensagemError } = await supabase
      .from('mensagens_enviadas')
      .insert([
        {
          cliente_id: cliente.id,
          pergunta: pergunta,
          resposta: resposta,
          timestamp: new Date().toISOString(),
        }
      ]);

    if (mensagemError) {
      console.error('Erro ao registrar mensagem:', mensagemError);
      return res.status(500).json({ error: 'Erro ao registrar mensagem' });
    }

    // Atualizar contador de mensagens do cliente
    const novoTotal = cliente.mensagens_usadas + 1;
    
    const { error: updateError } = await supabase
      .from('clientes')
      .update({ mensagens_usadas: novoTotal })
      .eq('id', cliente.id);
      
    if (updateError) {
      console.error('Erro ao atualizar contador:', updateError);
    }

    return res.status(200).json({
      success: true,
      mensagens_usadas: novoTotal,
      mensagens_limite: cliente.mensagens_limite,
      disponivel: cliente.mensagens_limite - novoTotal
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