// Este script gera um som de notificação usando Web Audio API
// Será carregado no index.html e disponibilizará o som para o serviço de notificações

window.generateNotificationSound = function() {
  // Verificar se o AudioContext já existe
  if (!window.notificationAudioContext) {
    try {
      window.notificationAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.error('Erro ao criar AudioContext:', e);
      return;
    }
  }
  
  const context = window.notificationAudioContext;
  
  // Criar oscilador para o som
  const oscillator = context.createOscillator();
  oscillator.type = 'sine';
  
  // Criar um nó de ganho para controlar o volume
  const gainNode = context.createGain();
  gainNode.gain.setValueAtTime(0.1, context.currentTime);
  
  // Configurar a frequência para um som de notificação agradável
  oscillator.frequency.setValueAtTime(880, context.currentTime); // Lá (A5)
  oscillator.frequency.setValueAtTime(1318.51, context.currentTime + 0.1); // Mi (E6)
  
  // Configurar o envelope do som
  gainNode.gain.setValueAtTime(0.1, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
  
  // Conectar os nós
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  
  // Iniciar e parar o oscilador
  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + 0.3);
  
  return true;
};