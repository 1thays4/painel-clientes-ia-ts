import axios, { AxiosError } from 'axios';

// URL do endpoint (ajuste conforme necessário)
const API_URL = 'http://localhost:3000/api/registrar-mensagem';

// Dados de teste
const dadosTeste = {
  whatsappNumero: '+15557811105', // Substitua pelo número de um cliente real no banco
  pergunta: 'Esta é uma mensagem de teste para depuração',
  resposta: 'Esta é uma resposta de teste para depuração',
  numeroDestino: '+5511999999999', // Número de destino de teste
  numeroRemetente: '+15557811105' // Número de remetente (mesmo do cliente)
};

async function testarRegistrarMensagem() {
  console.log('Iniciando teste de registrar-mensagem.ts');
  console.log('Dados de teste:', dadosTeste);
  
  try {
    const resposta = await axios.post(API_URL, dadosTeste);
    console.log('✅ Teste bem-sucedido!');
    console.log('Resposta:', resposta.data);
  } catch (erro) {
    console.error('❌ Erro no teste:');
    const axiosError = erro as AxiosError;
    if (axiosError.response) {
      // O servidor respondeu com um status de erro
      console.error('Status:', axiosError.response.status);
      console.error('Dados:', axiosError.response.data);
      console.error('Headers:', axiosError.response.headers);
    } else if (axiosError.request) {
      // A requisição foi feita mas não houve resposta
      console.error('Sem resposta do servidor. Verifique se o servidor está rodando.');
    } else {
      // Erro na configuração da requisição
      console.error('Erro:', axiosError.message);
    }
  }
}

// Executar o teste
testarRegistrarMensagem();