@echo off
echo Iniciando migração para Next.js...

echo Renomeando arquivos de configuração...
ren tsconfig.next.json tsconfig.json
ren package.next.json package.json
ren tailwind.config.next.js tailwind.config.js
ren postcss.config.next.js postcss.config.js

echo Instalando dependências...
npm install

echo Migração concluída! Execute 'npm run dev' para iniciar o projeto.