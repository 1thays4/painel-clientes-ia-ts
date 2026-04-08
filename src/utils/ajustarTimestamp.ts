/**
 * Ajusta o timestamp para o fuso horário de São Paulo (GMT-3)
 * @param date Data a ser ajustada (opcional, usa a data atual se não fornecida)
 * @returns Data ajustada para o fuso horário de São Paulo
 */
export function ajustarTimestampParaFusoBrasil(date?: Date): Date {
  const dataAtual = date || new Date();

  // Criar uma string de data no formato ISO com o fuso horário de São Paulo
  const dataString = dataAtual.toLocaleString("en-US", {
    timeZone: "America/Sao_Paulo",
  });

  // Converter de volta para objeto Date
  return new Date(dataString);
}

/**
 * Formata um timestamp para o formato ISO com o fuso horário de São Paulo
 * @param date Data a ser formatada (opcional, usa a data atual se não fornecida)
 * @returns String de data no formato ISO com o fuso horário correto
 */
export function formatarTimestampComFuso(date?: Date): string {
  const dataAjustada = ajustarTimestampParaFusoBrasil(date);

  // Formatar no padrão ISO com o offset de São Paulo (-03:00)
  return dataAjustada.toISOString().replace("Z", "-03:00");
}
