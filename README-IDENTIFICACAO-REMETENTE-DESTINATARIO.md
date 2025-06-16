# Identificação de Remetente e Destinatário

Este documento explica a nova lógica implementada para identificar corretamente quem está enviando e quem está recebendo mensagens.

## Conceito

O sistema agora utiliza dois números de telefone para determinar o tipo de cliente:

1. **Remetente (whatsappNumero)**: Quem está enviando a mensagem
2. **Destinatário (numeroDestino)**: Quem está recebendo a mensagem

A lógica é a seguinte:

- Se o **destinatário** for o número do proprietário (`5547991950615`), então o **remetente** é um cliente direto (empresa)
- Se o **destinatário** for qualquer outro número, então:
  - O **destinatário** é um cliente direto (empresa)
  - O **remetente** é um cliente final (usuário final)

## Implementação

### 1. Recebimento dos números

```javascript
let { whatsappNumero, numeroDestino, pergunta, resposta } = req.body;

// Se numeroDestino não foi fornecido, usar um valor padrão
if (!numeroDestino) {
  console.log('Número de destino não fornecido, usando padrão');
  numeroDestino = 'whatsapp:+5547991950615';
}
```

### 2. Normalização dos números

```javascript
// Limpar os números removendo prefixo whatsapp: e qualquer espaço
const numeroRemetenteOriginal = whatsappNumero.replace('whatsapp:', '').trim();
const numeroDestinoOriginal = numeroDestino.replace('whatsapp:', '').trim();

// Normalizar os números (manter apenas dígitos)
const numeroRemetenteNormalizado = numeroRemetenteOriginal.replace(/\D/g, '');
const numeroDestinoNormalizado = numeroDestinoOriginal.replace(/\D/g, '');
```

### 3. Identificação do tipo de cliente

```javascript
// Verificar se o destinatário é o proprietário
const destinatarioEhProprietario = numeroDestinoNormalizado === numeroProprietario || 
                                  numeroDestinoNormalizado.endsWith('47991950615');
```

### 4. Processamento baseado no tipo

Se o destinatário for o proprietário:
- O remetente é um cliente direto (empresa)
- Buscar ou criar o cliente pelo número do remetente

Se o destinatário NÃO for o proprietário:
- O destinatário é um cliente direto (empresa)
- O remetente é um cliente final
- Buscar ou criar a empresa pelo número do destinatário
- Buscar ou criar o cliente final pelo número do remetente

## Criação Automática

O sistema agora cria automaticamente:

1. **Clientes (empresas)** quando:
   - Um número não cadastrado envia mensagem para o proprietário
   - Um número não cadastrado recebe mensagem (não sendo o proprietário)

2. **Clientes finais** quando:
   - Um número não cadastrado envia mensagem para um cliente (não sendo o proprietário)

## Exemplo

### Cenário 1: Mensagem para o proprietário
- Remetente: +5511999999999
- Destinatário: +5547991950615 (proprietário)
- Resultado: +5511999999999 é cadastrado como cliente direto (empresa)

### Cenário 2: Mensagem para um cliente
- Remetente: +5511888888888
- Destinatário: +5511999999999 (cliente)
- Resultado: 
  - +5511999999999 é cadastrado como cliente direto (empresa) se não existir
  - +5511888888888 é cadastrado como cliente final associado à empresa