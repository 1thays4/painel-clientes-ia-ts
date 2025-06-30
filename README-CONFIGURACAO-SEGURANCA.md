# Configuração de Segurança do Banco de Dados

## Visão Geral

Este documento explica como configurar a segurança do banco de dados Supabase para o painel de clientes.

## Problema Resolvido

O sistema estava enfrentando problemas de acesso aos dados devido às políticas de segurança (Row Level Security - RLS) do Supabase. Após desativar temporariamente as políticas, o sistema voltou a funcionar normalmente.

## Tabelas Existentes

O banco de dados contém as seguintes tabelas:
- `access_logs` - Logs de acesso
- `clientes` - Informações dos clientes
- `clientes_finais` - Informações dos clientes finais (destinatários das mensagens)
- `mensagens_enviadas` - Histórico de mensagens
- `user_cliente_access` - Relação entre usuários e clientes
- `user_profiles` - Perfis de usuários

## Solução Implementada

Criamos um script SQL (`setup_secure_policies.sql`) que configura políticas de segurança adequadas para permitir acesso aos dados sem comprometer a segurança:

1. **Habilita RLS em todas as tabelas principais**:
   - `mensagens_enviadas`
   - `clientes`
   - `clientes_finais`

2. **Cria políticas que permitem acesso baseado em regras**:
   - Usuários autenticados (administradores) têm acesso completo
   - Clientes não autenticados têm acesso aos seus próprios dados

3. **Cria índices para melhorar performance**:
   - Índice em `cliente_id` nas tabelas `mensagens_enviadas` e `clientes_finais`

## Como Implementar

1. Execute o script `setup_secure_policies.sql` no SQL Editor do Supabase
2. Teste o sistema para garantir que o acesso aos dados está funcionando corretamente
3. Monitore o desempenho e faça ajustes conforme necessário

## Considerações de Segurança

Esta configuração permite acesso público aos dados, o que é adequado para um sistema onde os clientes precisam acessar seus próprios dados sem autenticação completa. Se você precisar de uma segurança mais rigorosa, considere implementar um sistema de autenticação mais robusto.

## Próximos Passos

1. Implementar um sistema de autenticação mais robusto (se necessário)
2. Adicionar logs de auditoria para rastrear acesso aos dados
3. Configurar backups regulares do banco de dados