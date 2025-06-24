# Instruções para Correção dos Números de Cliente

Para corrigir o problema de exibição incorreta dos números de cliente no painel, siga estas instruções:

## 1. Adicione a função getNumeroClienteFinal ao PainelRespostasCliente.tsx

```typescript
// Função para determinar o número do cliente final
const getNumeroClienteFinal = (msg: Mensagem): string => {
  // Prioridade 1: numero_destino se não for igual ao whatsapp_cliente
  if (msg.numero_destino && msg.numero_destino !== msg.whatsapp_cliente) {
    return msg.numero_destino;
  }
  
  // Prioridade 2: numero_remetente se não for igual ao whatsapp_cliente
  if (msg.numero_remetente && msg.numero_remetente !== msg.whatsapp_cliente) {
    return msg.numero_remetente;
  }
  
  // Prioridade 3: whatsapp_cliente_final
  if (msg.whatsapp_cliente_final) {
    return msg.whatsapp_cliente_final;
  }
  
  return '';
};
```

## 2. Atualize o envio de mensagens no PainelRespostasCliente.tsx

Substitua:

```typescript
// Verificar se o número de WhatsApp é válido
const numeroDestino = msgSelecionada.numero_destino || msgSelecionada.whatsapp_cliente_final || '';
const numeroRemetente = msgSelecionada.numero_remetente || msgSelecionada.whatsapp_cliente || '';
```

Por:

```typescript
// Obter o número do cliente final
const numeroDestino = getNumeroClienteFinal(msgSelecionada);
const numeroRemetente = msgSelecionada.whatsapp_cliente || '';
```

## 3. Atualize a exibição do cliente final no PainelRespostasCliente.tsx

Substitua:

```jsx
<div>
  <h4 className="font-medium text-green-600">
    Cliente: {msgSelecionada?.nome_cliente_final && !msgSelecionada.nome_cliente_final.includes('+') 
      ? msgSelecionada.nome_cliente_final 
      : "Cliente não identificado"}
  </h4>
  {/* Mostrar número do cliente final */}
  {(msgSelecionada?.numero_destino || msgSelecionada?.whatsapp_cliente_final) && (
    <p className="text-sm text-gray-600">
      WhatsApp: {msgSelecionada.numero_destino || msgSelecionada.whatsapp_cliente_final}
    </p>
  )}
</div>
```

Por:

```jsx
<div>
  <h4 className="font-medium text-green-600">
    Cliente
  </h4>
  {(() => {
    const numeroClienteFinal = getNumeroClienteFinal(msgSelecionada);
    return numeroClienteFinal ? (
      <p className="text-sm text-gray-600">
        WhatsApp: {numeroClienteFinal}
      </p>
    ) : null;
  })()}
</div>
```

## 4. Adicione a função getNumeroClienteFinal ao MensagemGrupo.tsx

```typescript
// Função para determinar o número do cliente final
const getNumeroClienteFinal = (msg: Mensagem): string => {
  // Prioridade 1: numero_destino se não for igual ao whatsapp_cliente
  if (msg.numero_destino && msg.numero_destino !== msg.whatsapp_cliente) {
    return msg.numero_destino;
  }
  
  // Prioridade 2: numero_remetente se não for igual ao whatsapp_cliente
  if (msg.numero_remetente && msg.numero_remetente !== msg.whatsapp_cliente) {
    return msg.numero_remetente;
  }
  
  // Prioridade 3: whatsapp_cliente_final
  if (msg.whatsapp_cliente_final) {
    return msg.whatsapp_cliente_final;
  }
  
  return '';
};
```

## 5. Atualize a lógica de agrupamento no MensagemGrupo.tsx

Substitua:

```typescript
// Criar chave de agrupamento mais robusta
let chave;
// Priorizar o número de destino se disponível
if (msg.numero_destino) {
  chave = `destino_${msg.numero_destino}`;
} else if (msg.cliente_final_id) {
  chave = `cliente_${msg.cliente_final_id}`;
} else if (msg.whatsapp_cliente_final) {
  chave = `whatsapp_${msg.whatsapp_cliente_final}`;
} else {
  chave = `msg_${msg.id || Date.now()}`;
}
```

Por:

```typescript
// Obter o número do cliente final
const numeroClienteFinal = getNumeroClienteFinal(msg);

// Criar chave de agrupamento mais robusta
let chave;
if (numeroClienteFinal) {
  chave = `numero_${numeroClienteFinal}`;
} else if (msg.cliente_final_id) {
  chave = `cliente_${msg.cliente_final_id}`;
} else {
  chave = `msg_${msg.id || Date.now()}`;
}
```

## 6. Atualize a exibição do cabeçalho no MensagemGrupo.tsx

Substitua:

```jsx
<h3 className="font-bold text-green-600 mb-2">
  {msgs[0].nome_cliente_final && msgs[0].nome_cliente_final !== 'Usuário final' ? (
    <>
      Cliente: {msgs[0].nome_cliente_final} 
      {/* Mostrar número de destino se disponível, senão mostrar whatsapp_cliente_final */}
      {(msgs[0].numero_destino || msgs[0].whatsapp_cliente_final) ? 
        ` (${msgs[0].numero_destino || msgs[0].whatsapp_cliente_final})` : ''}
    </>
  ) : (
    <>
      Cliente: {msgs[0].numero_destino ? 
        `${msgs[0].numero_destino}` : 
        (msgs[0].whatsapp_cliente_final ? 
          `${msgs[0].whatsapp_cliente_final}` : 
          'Desconhecido')}
    </>
  )}
</h3>
```

Por:

```jsx
<h3 className="font-bold text-green-600 mb-2">
  Cliente: {getNumeroClienteFinal(msgs[0]) || 'Desconhecido'}
</h3>
```