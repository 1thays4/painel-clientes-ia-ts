// Configurações da aplicação
export const config = {
  supabase: {
    url: process.env.SUPABASE_URL || "https://sqcedymaeazvrrgrokpv.supabase.co",
    key: process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxY2VkeW1hZWF6dnJyZ3Jva3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5OTc3NTUsImV4cCI6MjA2NDU3Mzc1NX0.D65rBFBiVE1F9mVI15QgJeDepEhQtPj3eS2kXxRCfB8"
  },
  api: {
    baseUrl: "/api"
  },
  planos: {
    basico: {
      preco: 197,
      limite: 1000
    },
    intermediario: {
      preco: 247,
      limite: 3000
    },
    avancado: {
      preco: 297,
      limite: 5000
    }
  },
  // Configurações da API de IA
  IA_API_URL: process.env.IA_API_URL || "https://api.openai.com/v1/chat/completions",
  IA_API_KEY: process.env.IA_API_KEY || "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",
  IA_MODEL: process.env.IA_MODEL || "gpt-3.5-turbo",
  // Configurações do webhook do n8n
  N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook-test/whatsapp-resposta",
  N8N_WEBHOOK_METHOD: process.env.N8N_WEBHOOK_METHOD || "GET"
};