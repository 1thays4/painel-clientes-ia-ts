# 🔐 Sistema de Anonimização LGPD

## Visão Geral

Sistema completo de anonimização de dados implementado para conformidade com LGPD (Lei Geral de Proteção de Dados).

## Funcionalidades

- **Anonimização consistente**: Mesmo dado sempre gera o mesmo resultado anônimo
- **LGPD Compliant**: Atende Artigo 5º, Inciso II da legislação brasileira
- **React Hooks**: Integração seamless com componentes React
- **TypeScript**: Tipagem forte e segura

## Arquivos Principais

### Core
- `src/utils/anonymize.ts` - Utilitários de anonimização
- `src/hooks/useAnonymize.ts` - Hooks React para integração

### Exemplo
- `src/components/PainelClientesComAnonimizacao.tsx` - Componente demonstrativo

## Como Usar

```typescript
import { useAnonymize } from '@/hooks/useAnonymize';

function MeuComponente() {
  const anon = useAnonymize();

  return (
    <div>
      <h1>{anon.name('João Silva')}</h1>        // "Maria dos Santos"
      <p>{anon.phone('5511999999999')}</p>      // "5511999990001"
    </div>
  );
}
```

## Ativação

```bash
# Adicionar ao .env.local
NEXT_PUBLIC_DEMO_MODE=true
```

## Demonstração

Este sistema foi usado para gravar vídeos demonstrativos da aplicação mantendo a conformidade com LGPD, substituindo dados reais por fictícios de forma consistente e irreversível.

## Habilidades Demonstradas

- Privacy by Design
- LGPD/GDPR Compliance
- React Hooks avançados
- TypeScript
- Documentação técnica
- Desenvolvimento seguro