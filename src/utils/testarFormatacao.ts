import { formatarTelefone } from './formatarTelefone';

// Exemplos de uso
console.log(formatarTelefone('554791767425')); // Deve retornar: +55 (47) 9 1767-7425
console.log(formatarTelefone('+554791767425')); // Deve retornar: +55 (47) 9 1767-7425
console.log(formatarTelefone('4791767425')); // Deve retornar: (47) 9 1767-7425