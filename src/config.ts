// Configurações da aplicação
export const config = {
  supabase: {
    url: "https://sqcedymaeazvrrgrokpv.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxY2VkeW1hZWF6dnJyZ3Jva3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5OTc3NTUsImV4cCI6MjA2NDU3Mzc1NX0.D65rBFBiVE1F9mVI15QgJeDepEhQtPj3eS2kXxRCfB8"
  },
  api: {
    baseUrl: "/api"
  },
  planos: {
    basico: {
      preco: 49,
      limite: 100
    },
    intermediario: {
      preco: 99,
      limite: 300
    },
    avancado: {
      preco: 149,
      limite: 1000
    }
  }
};