/**
 * Hook React para Anonimização
 * 
 * Use este hook em qualquer componente React para ativar anonimização automática
 * 
 * Exemplo:
 * const anonimizar = useAnonymize();
 * const nomeSeguro = anonimizar.name('João Silva');
 * const telefonSeguro = anonimizar.phone('5511999999999');
 */

import React from 'react';

import {
  anonymizeName,
  anonymizePhone,
  anonymizeEmail,
  anonymizeId,
  anonymizeCliente,
  anonymizeMensagem,
  isDemoMode,
} from '../utils/anonymize';

interface AnonymizeUtils {
  /** Anonimiza um nome de cliente/empresa */
  name: (name: string | null | undefined, type?: 'company' | 'person') => string;
  
  /** Anonimiza um número de telefone */
  phone: (phone: string | null | undefined) => string;
  
  /** Anonimiza um email */
  email: (email: string | null | undefined) => string;
  
  /** Anonimiza um ID */
  id: (id: string | number | null | undefined) => string;
  
  /** Anonimiza um objeto Cliente */
  cliente: (cliente: any) => any;
  
  /** Anonimiza um objeto Mensagem */
  mensagem: (mensagem: any) => any;
  
  /** Verifica se está em modo demo */
  isActive: () => boolean;
  
  /** Retorna dados anonimizados se modo demo está ativo, senão retorna dados originais */
  conditional: <T>(original: T, modificado: T) => T;
}

/**
 * Hook que retorna funções de anonimização
 * 
 * @example
 * ```tsx
 * function MeuComponente() {
 *   const anon = useAnonymize();
 *   
 *   return (
 *     <div>
 *       <h1>{anon.name('João Silva')}</h1>
 *       <p>{anon.phone('5511999999999')}</p>
 *       {anon.isActive() && <p>Modo demo ativo</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAnonymize(): AnonymizeUtils {
  return {
    name: (name, type = 'company') => anonymizeName(name, type),
    phone: anonymizePhone,
    email: anonymizeEmail,
    id: anonymizeId,
    cliente: anonymizeCliente,
    mensagem: anonymizeMensagem,
    isActive: isDemoMode,
    conditional: <T,>(original: T, modificado: T): T => 
      isDemoMode() ? modificado : original,
  };
}

/**
 * Componente wrapper para renderização condicional
 * 
 * @example
 * ```tsx
 * <AnonymizeWrapper>
 *   <ClientList clients={realClients} />
 * </AnonymizeWrapper>
 * 
 * // Inside ClientList:
 * if (isDemoMode()) {
 *   clients = anonymizeClientes(clients);
 * }
 * ```
 */
export function AnonymizeWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/**
 * HOC para envolver componentes e ativar anonimização
 * 
 * @example
 * ```tsx
 * const SafeClientList = withAnonymize(ClientList);
 * 
 * // ClientList receberá dados anonimizados automaticamente
 * <SafeClientList clients={clients} />
 * ```
 */
export function withAnonymize<P extends { data?: any; clients?: any; messages?: any }>(
  Component: React.ComponentType<P>,
) {
  return function AnonymizedComponent(props: P) {
    const anon = useAnonymize();
    
    if (!anon.isActive()) {
      return <Component {...props} />;
    }

    const anonymizedProps = { ...props };

    if ('data' in props && props.data) {
      if (Array.isArray(props.data)) {
        anonymizedProps.data = props.data.map((item) => {
          if (item.whatsapp) return anon.cliente(item);
          if (item.resposta) return anon.mensagem(item);
          return item;
        });
      } else if (typeof props.data === 'object') {
        const obj = props.data as any;
        if (obj.whatsapp) {
          anonymizedProps.data = anon.cliente(obj);
        } else if (obj.resposta) {
          anonymizedProps.data = anon.mensagem(obj);
        }
      }
    }

    if ('clients' in props && props.clients) {
      if (Array.isArray(props.clients)) {
        anonymizedProps.clients = props.clients.map((c) => anon.cliente(c));
      }
    }

    if ('messages' in props && props.messages) {
      if (Array.isArray(props.messages)) {
        anonymizedProps.messages = props.messages.map((m) => anon.mensagem(m));
      }
    }

    return <Component {...(anonymizedProps as P)} />;
  };
}

/**
 * Custom hook para anonimizar dados em um efeito
 * 
 * @example
 * ```tsx
 * function MeuComponente() {
 *   const [clients, setClients] = useState([]);
 *   useAnonymizeEffect(clients, setClients);
 *   
 *   return <div>{clients.map(c => c.nome)}</div>;
 * }
 * ```
 */
export function useAnonymizeEffect<T extends any[]>(
  data: T,
  setData: (data: T) => void,
): void {
  React.useEffect(() => {
    if (isDemoMode() && data && data.length > 0) {
      const first = data[0];
      if (first && typeof first === 'object') {
        if ('whatsapp' in first) {
          setData(data.map((item) => anonymizeCliente(item)) as T);
        } else if ('resposta' in first) {
          setData(data.map((item) => anonymizeMensagem(item)) as T);
        }
      }
    }
  }, [data, setData]);
}

/**
 * Hook para fazer fetch com anonimização automática
 * 
 * @example
 * ```tsx
 * const clients = useFetchAndAnonymize('/api/clientes');
 * ```
 */
export function useFetchAndAnonymize<T>(
  url: string,
  deps: React.DependencyList = [],
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
} {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const anon = useAnonymize();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        const result = await response.json();
        
        let processedData = result;
        
        if (anon.isActive()) {
          if (Array.isArray(result)) {
            processedData = result.map((item) => {
              if (item && typeof item === 'object') {
                if ('whatsapp' in item) return anon.cliente(item);
                if ('resposta' in item) return anon.mensagem(item);
              }
              return item;
            });
          } else if (result && typeof result === 'object') {
            if ('whatsapp' in result) {
              processedData = anon.cliente(result);
            } else if ('resposta' in result) {
              processedData = anon.mensagem(result);
            }
          }
        }
        
        setData(processedData as T);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, ...deps]);

  return { data, loading, error };
}

/**
 * Hook para armazenar estado com anonimização
 * 
 * @example
 * ```tsx
 * const [clients, setClients] = useAnonymizeState(initialClients);
 * ```
 */
export function useAnonymizeState<T>(
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = React.useState<T>(initialValue);
  const anon = useAnonymize();

  const setAnonymizedState = React.useCallback(
    (value: T | ((prev: T) => T)) => {
      let newValue = typeof value === 'function' ? (value as (prev: T) => T)(state) : value;
      
      if (anon.isActive() && Array.isArray(newValue)) {
        newValue = newValue.map((item) => {
          if (item && typeof item === 'object') {
            if ('whatsapp' in item) return anon.cliente(item);
            if ('resposta' in item) return anon.mensagem(item);
          }
          return item;
        }) as T;
      }
      
      setState(newValue);
    },
    [state, anon],
  );

  return [state, setAnonymizedState];
}

// Para usar, adicione este import no topo do arquivo:
// export { useAnonymize, AnonymizeWrapper, withAnonymize, useAnonymizeEffect, useFetchAndAnonymize, useAnonymizeState };
