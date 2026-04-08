/**
 * Gerenciador de tokens com expiração e refresh
 */

// Duração padrão do token em minutos
const TOKEN_DURATION = 60; // 1 hora
const REFRESH_DURATION = 1440; // 24 horas

interface TokenData {
  token: string;
  clienteId: string;
  expiresAt: number;
  refreshExpiresAt: number;
}

/**
 * Salva o token do cliente com expiração
 */
export function saveClientToken(token: string, clienteId: string): void {
  const now = Date.now();
  const expiresAt = now + TOKEN_DURATION * 60 * 1000;
  const refreshExpiresAt = now + REFRESH_DURATION * 60 * 1000;

  const tokenData: TokenData = {
    token,
    clienteId,
    expiresAt,
    refreshExpiresAt,
  };

  // Salvar no sessionStorage
  sessionStorage.setItem("clienteTokenData", JSON.stringify(tokenData));

  // Registrar o acesso
  logAccess("token_created", clienteId);
}

/**
 * Verifica se o token do cliente é válido
 */
export function isTokenValid(): boolean {
  const tokenDataStr = sessionStorage.getItem("clienteTokenData");
  if (!tokenDataStr) return false;

  try {
    const tokenData: TokenData = JSON.parse(tokenDataStr);
    return Date.now() < tokenData.expiresAt;
  } catch (error) {
    return false;
  }
}

/**
 * Verifica se o token pode ser renovado
 */
export function canRefreshToken(): boolean {
  const tokenDataStr = sessionStorage.getItem("clienteTokenData");
  if (!tokenDataStr) return false;

  try {
    const tokenData: TokenData = JSON.parse(tokenDataStr);
    return Date.now() < tokenData.refreshExpiresAt;
  } catch (error) {
    return false;
  }
}

/**
 * Renova o token do cliente
 */
export function refreshToken(): boolean {
  if (!canRefreshToken()) return false;

  const tokenDataStr = sessionStorage.getItem("clienteTokenData");
  if (!tokenDataStr) return false;

  try {
    const tokenData: TokenData = JSON.parse(tokenDataStr);

    // Renovar o token
    const now = Date.now();
    tokenData.expiresAt = now + TOKEN_DURATION * 60 * 1000;

    // Salvar o token renovado
    sessionStorage.setItem("clienteTokenData", JSON.stringify(tokenData));

    // Registrar a renovação
    logAccess("token_refreshed", tokenData.clienteId);

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Obtém o token do cliente
 */
export function getClientToken(): string | null {
  // Verificar se o token é válido
  if (!isTokenValid()) {
    // Tentar renovar o token
    if (!refreshToken()) {
      return null;
    }
  }

  const tokenDataStr = sessionStorage.getItem("clienteTokenData");
  if (!tokenDataStr) return null;

  try {
    const tokenData: TokenData = JSON.parse(tokenDataStr);
    return tokenData.token;
  } catch (error) {
    return null;
  }
}

/**
 * Obtém o ID do cliente
 */
export function getClientId(): string | null {
  const tokenDataStr = sessionStorage.getItem("clienteTokenData");
  if (!tokenDataStr) return null;

  try {
    const tokenData: TokenData = JSON.parse(tokenDataStr);
    return tokenData.clienteId;
  } catch (error) {
    return null;
  }
}

/**
 * Limpa o token do cliente
 */
export function clearClientToken(): void {
  const tokenDataStr = sessionStorage.getItem("clienteTokenData");
  if (tokenDataStr) {
    try {
      const tokenData: TokenData = JSON.parse(tokenDataStr);
      logAccess("token_cleared", tokenData.clienteId);
    } catch (error) {
      // Ignorar erro
    }
  }

  sessionStorage.removeItem("clienteTokenData");
}

/**
 * Registra um acesso no log
 */
export function logAccess(action: string, clienteId: string): void {
  const now = new Date();
  const logEntry = {
    timestamp: now.toISOString(),
    action,
    clienteId,
    userAgent: navigator.userAgent,
    ip: "client-side", // O IP real será capturado pelo servidor
  };

  // Enviar para o servidor em segundo plano
  sendLogToServer(logEntry).catch(console.error);

  // Também salvar localmente para debug
  const logs = JSON.parse(localStorage.getItem("accessLogs") || "[]");
  logs.push(logEntry);
  localStorage.setItem("accessLogs", JSON.stringify(logs.slice(-100))); // Manter apenas os últimos 100 logs
}

/**
 * Envia o log para o servidor
 */
async function sendLogToServer(logEntry: any): Promise<void> {
  try {
    const response = await fetch("/api/log-access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(logEntry),
      // Não esperar pela resposta
      keepalive: true,
    });

    // Não precisamos esperar pela resposta
  } catch (error) {
    // Ignorar erros de envio de log
    console.error("Erro ao enviar log:", error);
  }
}
