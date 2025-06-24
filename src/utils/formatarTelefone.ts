/**
 * Formata um número de telefone para o padrão brasileiro
 * Exemplo: 554791767425 -> +55 (47) 9 1767-7425
 */
export function formatarTelefone(numero: string): string {
  // Remover caracteres não numéricos
  const apenasDigitos = numero.replace(/\D/g, '');
  
  // Verificar se tem o formato completo com código do país
  if (apenasDigitos.length >= 12) {
    const codigoPais = apenasDigitos.substring(0, 2);
    const ddd = apenasDigitos.substring(2, 4);
    const parte1 = "9";//apenasDigitos.substring(4, 5); // Nono dígito
    const parte2 = apenasDigitos.substring(4, 8);
    const parte3 = apenasDigitos.substring(8, 13);
    
    return `+${codigoPais} (${ddd}) ${parte1} ${parte2}-${parte3}`;
  }
  
  // Se não tiver código do país, mas tiver DDD e 9 dígitos
  if (apenasDigitos.length >= 10) {
    const ddd = apenasDigitos.substring(0, 2);
    const parte1 = apenasDigitos.substring(2, 3); // Nono dígito
    const parte2 = apenasDigitos.substring(3, 7);
    const parte3 = apenasDigitos.substring(7);
    
    return `(${ddd}) ${parte1} ${parte2}-${parte3}`;
  }
  
  // Se for um número sem formatação padrão, retornar como está
  return numero;
}