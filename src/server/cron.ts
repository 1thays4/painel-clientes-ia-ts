import cron from 'node-cron';
import axios from 'axios';

/**
 * Configura jobs cron para executar tarefas agendadas
 * @param serverUrl URL base do servidor
 */
export function configurarCronJobs(serverUrl: string) {
  // Verificar follow-ups todos os dias às 10:00
  cron.schedule('0 10 * * *', async () => {
    console.log('Executando verificação de follow-ups agendada...');
    try {
      const response = await axios.get(`${serverUrl}/api/verificar-followups`);
      console.log('Resultado da verificação de follow-ups:', response.data);
    } catch (error) {
      console.error('Erro ao executar verificação de follow-ups:', error);
    }
  });

  console.log('Cron jobs configurados com sucesso');
}