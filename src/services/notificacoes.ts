// Serviço de notificações sonoras
export class NotificacaoService {
  private static instance: NotificacaoService;
  private audioContext: AudioContext | null = null;
  private notificacaoAudio: HTMLAudioElement | null = null;
  private notificacoesAtivadas: boolean = true;

  private constructor() {
    // Inicializar o áudio de notificação
    this.notificacaoAudio = new Audio('/notification.mp3');
    
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
      // Verificar se o áudio foi carregado
      if (!this.notificacaoAudio) {
        this.notificacaoAudio = new Audio('/notification.mp3');
      }
      
      // Reiniciar o áudio para poder tocar novamente
      this.notificacaoAudio.currentTime = 0;
      
      // Tocar o som
      this.notificacaoAudio.play().catch(e => {
        console.error('Erro ao tocar notificação:', e);
        
        // Tentar método alternativo se o play() falhar
        if (this.audioContext) {
          const oscillator = this.audioContext.createOscillator();
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
          
          const gainNode = this.audioContext.createGain();
          gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
          
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          
          oscillator.start();
          oscillator.stop(this.audioContext.currentTime + 0.5);
        }
      });
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