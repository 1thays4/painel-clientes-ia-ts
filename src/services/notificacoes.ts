// Serviço de notificações sonoras
export class NotificacaoService {
  private static instance: NotificacaoService;
  private audioContext: AudioContext | null = null;
  private notificacoesAtivadas: boolean = true;

  private constructor() {
    // Tentar criar o AudioContext quando necessário (para evitar problemas com políticas de autoplay)
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error('Erro ao criar AudioContext:', e);
    }
  }

  public static getInstance(): NotificacaoService {
    if (!NotificacaoService.instance) {
      NotificacaoService.instance = new NotificacaoService();
    }
    return NotificacaoService.instance;
  }

  // Tocar som de notificação
  public tocarNotificacao(): void {
    if (!this.notificacoesAtivadas) return;
    
    try {
      // Usar a função global de geração de som se disponível
      if (window && (window as any).generateNotificationSound) {
        (window as any).generateNotificationSound();
        return;
      }
      
      // Método alternativo se a função global não estiver disponível
      if (this.audioContext) {
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';
        
        // Criar um som de notificação simples
        oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1318.51, this.audioContext.currentTime + 0.1);
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
      }
    } catch (error) {
      console.error('Erro ao tocar notificação:', error);
    }
  }

  // Ativar ou desativar notificações
  public toggleNotificacoes(ativar?: boolean): boolean {
    if (ativar !== undefined) {
      this.notificacoesAtivadas = ativar;
    } else {
      this.notificacoesAtivadas = !this.notificacoesAtivadas;
    }
    return this.notificacoesAtivadas;
  }

  // Verificar se as notificações estão ativadas
  public isNotificacoesAtivadas(): boolean {
    return this.notificacoesAtivadas;
  }
}

// Exportar uma instância única do serviço
export const notificacaoService = NotificacaoService.getInstance();