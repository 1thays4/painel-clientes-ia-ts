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

// Função para garantir que existe um cliente
async function garantirClienteExiste() {
  try {
    console.log('Verificando se existe cliente padrão...');
    
    // Verificar se existe algum cliente
    const { data: clientes, error } = await supabase
      .from('clientes')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Erro ao verificar clientes:', error);
      throw new Error('Erro ao verificar clientes');
    }
    
    // Se não existir nenhum cliente, criar um padrão
    if (!clientes || clientes.length === 0) {
      console.log('Criando cliente padrão...');
      
      const { data, error: createError } = await supabase
        .from('clientes')
        .insert([
          { 
            nome: 'Empresa Padrão',
            whatsapp: '5547991950615',
            email: 'empresa@exemplo.com',
            plano: 'basico',
            data_cadastro: new Date().toISOString()
          }
        ])
        .select('id')
        .single();
      
      if (createError) {
        console.error('Erro ao criar cliente padrão:', createError);
        throw new Error('Erro ao criar cliente padrão');
      }
      
      console.log('Cliente padrão criado com ID:', data.id);
      return data.id;
    }
    
    console.log('Cliente existente encontrado com ID:', clientes[0].id);
    return clientes[0].id;
  } catch (err) {
    console.error('Erro em garantirClienteExiste:', err);
    throw err;
  }
}

// Rota para registrar mensagens
app.post('/api/registrar-mensagem', async (req, res) => {
  try {
    let { whatsappNumero, numeroDestino, pergunta, resposta } = req.body;
    
    if (!whatsappNumero || !pergunta || !resposta) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }
    
    // Se numeroDestino não foi fornecido, usar um valor padrão
    if (!numeroDestino) {
      console.log('Número de destino não fornecido, usando padrão');
      numeroDestino = 'whatsapp:+5547991950615';
    }
    
    // Limpar o número do WhatsApp (remover prefixo "whatsapp:")
    // Verificar se é uma string literal com o código replace
    if (whatsappNumero.includes('.replace(')) {
      whatsappNumero = whatsappNumero.split('"')[0];
    }
    if (numeroDestino.includes('.replace(')) {
      numeroDestino = numeroDestino.split('"')[0];
    }
    
    // Limpar os números removendo prefixo whatsapp: e qualquer espaço
    const numeroRemetenteOriginal = whatsappNumero.replace('whatsapp:', '').trim();
    const numeroDestinoOriginal = numeroDestino.replace('whatsapp:', '').trim();
    
    // Normalizar os números (manter apenas dígitos)
    const numeroRemetenteNormalizado = numeroRemetenteOriginal.replace(/\D/g, '');
    const numeroDestinoNormalizado = numeroDestinoOriginal.replace(/\D/g, '');
    
    console.log('Remetente:', numeroRemetenteOriginal, '(normalizado:', numeroRemetenteNormalizado, ')');
    console.log('Destinatário:', numeroDestinoOriginal, '(normalizado:', numeroDestinoNormalizado, ')');
    
    // Número do proprietário do sistema
    const numeroProprietario = '5547991950615';  // Já normalizado
    
    // Verificar se o destinatário é o proprietário
    // Se o destinatário for o proprietário, então o remetente é um cliente direto
    const destinatarioEhProprietario = numeroDestinoNormalizado === numeroProprietario || 
                                      numeroDestinoNormalizado.endsWith('47991950615');
    
    console.log('Destinatário é o proprietário?', destinatarioEhProprietario ? 'SIM' : 'NÃO');
    
    let clienteId;
    let clienteFinalId = null;
    
    // Garantir que existe pelo menos um cliente no sistema
    let clientePadraoId;
    try {
      clientePadraoId = await garantirClienteExiste();
    } catch (error) {
      console.error('Erro ao garantir cliente padrão:', error);
      return res.status(500).json({ error: 'Erro ao configurar sistema' });
    }
    
    if (destinatarioEhProprietario) {
      // Se o destinatário for o proprietário, o remetente é um cliente direto (empresa)
      console.log('Mensagem para o proprietário. Remetente é um cliente direto.');
      
      // Buscar cliente pelo número de WhatsApp do remetente
      let { data: clientes } = await supabase
        .from('clientes')
        .select('id')
        .eq('whatsapp', numeroRemetenteOriginal);
      
      if (!clientes || clientes.length === 0) {
        console.log('Cliente não encontrado, criando novo cliente');
        
        try {
          const { data: novoCliente, error: createError } = await supabase
            .from('clientes')
            .insert([
              { 
                nome: `Cliente ${numeroRemetenteOriginal}`,
                whatsapp: numeroRemetenteOriginal,
                email: `cliente_${numeroRemetenteNormalizado}@exemplo.com`,
                plano: 'basico',
                data_cadastro: new Date().toISOString(),
                token_publico: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
              }
            ])
            .select('id')
            .single();
          
          if (createError) {
            console.error('Erro ao criar cliente:', createError);
            clienteId = clientePadraoId; // Usar cliente padrão em caso de erro
          } else {
            clienteId = novoCliente.id;
            console.log('Novo cliente criado com ID:', clienteId);
          }
        } catch (err) {
          console.error('Erro ao criar cliente:', err);
          clienteId = clientePadraoId; // Usar cliente padrão em caso de erro
        }
      } else {
        clienteId = clientes[0].id;
        console.log('Cliente encontrado com ID:', clienteId);
      }
    } else {
      // Se o destinatário NÃO for o proprietário, então:
      // 1. O destinatário é um cliente (empresa)
      // 2. O remetente é um cliente final
      console.log('Mensagem para um cliente. Remetente é um cliente final.');
      
      // Buscar o cliente (empresa) pelo número de WhatsApp do destinatário
      let { data: empresas } = await supabase
        .from('clientes')
        .select('id')
        .eq('whatsapp', numeroDestinoOriginal);
      
      if (!empresas || empresas.length === 0) {
        console.log('Empresa destinatária não encontrada, criando nova empresa');
        
        try {
          const { data: novaEmpresa, error: createError } = await supabase
            .from('clientes')
            .insert([
              { 
                nome: `Empresa ${numeroDestinoOriginal}`,
                whatsapp: numeroDestinoOriginal,
                email: `empresa_${numeroDestinoNormalizado}@exemplo.com`,
                plano: 'basico',
                data_cadastro: new Date().toISOString(),
                token_publico: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
              }
            ])
            .select('id')
            .single();
          
          if (createError) {
            console.error('Erro ao criar empresa:', createError);
            clienteId = clientePadraoId; // Usar cliente padrão em caso de erro
          } else {
            clienteId = novaEmpresa.id;
            console.log('Nova empresa criada com ID:', clienteId);
          }
        } catch (err) {
          console.error('Erro ao criar empresa:', err);
          clienteId = clientePadraoId; // Usar cliente padrão em caso de erro
        }
      } else {
        clienteId = empresas[0].id;
        console.log('Empresa encontrada com ID:', clienteId);
      }
      
      // Buscar cliente final pelo número de WhatsApp do remetente
      let { data: clientesFinais } = await supabase
        .from('clientes_finais')
        .select('id')
        .eq('whatsapp', numeroRemetenteOriginal);
      
      // Se o cliente final não existir, criar um novo
      if (!clientesFinais || clientesFinais.length === 0) {
        console.log('Cliente final não encontrado, criando novo');
        
        try {
          const { data: novoClienteFinal, error: createError } = await supabase
            .from('clientes_finais')
            .insert([
              { 
                nome: `Cliente ${numeroRemetenteOriginal}`,
                whatsapp: numeroRemetenteOriginal,
                email: `cliente_${numeroRemetenteNormalizado}@exemplo.com`,
                cliente_id: clienteId,
                data_cadastro: new Date().toISOString()
              }
            ])
            .select('id')
            .single();
          
          if (createError) {
            console.error('Erro ao criar cliente final:', createError);
            // Continuar sem cliente final em caso de erro
          } else {
            clienteFinalId = novoClienteFinal.id;
            console.log('Novo cliente final criado com ID:', clienteFinalId);
          }
        } catch (err) {
          console.error('Erro ao criar cliente final:', err);
          // Continuar sem cliente final em caso de erro
        }
      } else {
        clienteFinalId = clientesFinais[0].id;
        console.log('Cliente final encontrado com ID:', clienteFinalId);
      }
    }

    // Registrar a mensagem
    const { error: mensagemError } = await supabase
      .from('mensagens_enviadas')
      .insert([
        {
          cliente_id: clienteId,
          cliente_final_id: clienteFinalId,
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
      cliente_id: clienteId,
      cliente_final_id: clienteFinalId,
      destinatario_eh_proprietario: destinatarioEhProprietario,
      remetente: numeroRemetenteOriginal,
      destinatario: numeroDestinoOriginal
    });
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de teste para verificar se o servidor está funcionando
app.get('/api/teste', (req, res) => {
  console.log('Rota de teste acessada');
  return res.status(200).json({ message: 'Servidor funcionando corretamente' });
});

// Rota para debug
app.get('/api/debug', async (req, res) => {
  console.log('=== INFORMAÇÕES DE DEBUG ===');
  console.log('Servidor rodando na porta:', PORT);
  console.log('Supabase URL:', supabaseUrl);
  console.log('Ambiente:', process.env.NODE_ENV || 'desenvolvimento');
  
  try {
    // Verificar se existe algum cliente
    const { data: clientes, error } = await supabase
      .from('clientes')
      .select('id, nome, whatsapp')
      .limit(5);
    
    if (error) {
      console.error('Erro ao buscar clientes:', error);
      return res.status(500).json({ error: 'Erro ao buscar clientes' });
    }
    
    console.log('Clientes encontrados:', clientes?.length || 0);
    console.log('==========================');
    
    return res.status(200).json({ 
      status: 'online',
      port: PORT,
      environment: process.env.NODE_ENV || 'desenvolvimento',
      timestamp: new Date().toISOString(),
      clientes: clientes || []
    });
  } catch (err) {
    console.error('Erro na rota de debug:', err);
    return res.status(500).json({ error: 'Erro na rota de debug' });
  }
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log('======================================');
  console.log(`Servidor com Supabase rodando na porta ${PORT}`);
  console.log('Data/Hora de início:', new Date().toISOString());
  console.log('Versão do Node:', process.version);
  
  // Garantir que existe pelo menos um cliente no sistema
  try {
    await garantirClienteExiste();
    console.log('Sistema configurado com sucesso!');
  } catch (error) {
    console.error('ERRO AO CONFIGURAR SISTEMA:', error);
  }
  
  console.log('======================================');
});