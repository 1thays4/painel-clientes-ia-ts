/**
 * Script para encontrar cores hardcoded em arquivos .tsx e .ts
 * 
 * Uso: node scripts/encontrar-cores-hardcoded.js
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);

// Regex para encontrar cores hexadecimais
const hexColorRegex = /#([0-9a-fA-F]{3}){1,2}\b/g;

// Diretórios a serem ignorados
const ignoredDirs = ['node_modules', '.git', '.next', 'build', 'dist'];

// Extensões de arquivo a serem verificadas
const fileExtensions = ['.tsx', '.ts', '.js', '.jsx'];

// Função para verificar se um arquivo contém cores hardcoded
async function checkFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    const matches = content.match(hexColorRegex);
    
    if (matches && matches.length > 0) {
      console.log(`\n${filePath}:`);
      const uniqueColors = [...new Set(matches)];
      uniqueColors.forEach(color => {
        console.log(`  - ${color}`);
      });
      return uniqueColors.length;
    }
    return 0;
  } catch (error) {
    console.error(`Erro ao ler o arquivo ${filePath}:`, error.message);
    return 0;
  }
}

// Função para percorrer diretórios recursivamente
async function scanDirectory(directory) {
  let colorCount = 0;
  
  try {
    const items = await readdir(directory);
    
    for (const item of items) {
      const itemPath = path.join(directory, item);
      
      // Verificar se é um diretório
      const stats = await stat(itemPath);
      
      if (stats.isDirectory()) {
        // Ignorar diretórios específicos
        if (!ignoredDirs.includes(item)) {
          colorCount += await scanDirectory(itemPath);
        }
      } else if (stats.isFile()) {
        // Verificar apenas arquivos com extensões específicas
        const ext = path.extname(itemPath);
        if (fileExtensions.includes(ext)) {
          colorCount += await checkFile(itemPath);
        }
      }
    }
    
    return colorCount;
  } catch (error) {
    console.error(`Erro ao escanear o diretório ${directory}:`, error.message);
    return colorCount;
  }
}

// Função principal
async function main() {
  console.log('Procurando por cores hardcoded no projeto...');
  console.log('============================================');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const totalColors = await scanDirectory(srcDir);
  
  console.log('\n============================================');
  console.log(`Total de ocorrências de cores hardcoded: ${totalColors}`);
  console.log('Dica: Use o tema centralizado em src/theme/index.ts para substituir essas cores.');
}

main().catch(error => {
  console.error('Erro:', error);
  process.exit(1);
});