// Script para executar o teste do endpoint registrar-mensagem
const { exec } = require('child_process');

console.log('Executando teste do endpoint registrar-mensagem...');

// Comando para executar o script TypeScript com ts-node
const comando = 'npx ts-node src/scripts/testar-registrar-mensagem.ts';

// Executar o comando
const processo = exec(comando);

// Capturar saída padrão
processo.stdout.on('data', (dados) => {
  console.log(dados);
});

// Capturar saída de erro
processo.stderr.on('data', (dados) => {
  console.error(dados);
});

// Evento de finalização
processo.on('close', (codigo) => {
  console.log(`Processo finalizado com código ${codigo}`);
});