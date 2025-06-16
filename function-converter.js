// Código para converter o objeto em string
const inputData = $input.all()[0].json;

// Verificar se temos o formato esperado
if (inputData.messages && 
    inputData.messages[0] && 
    inputData.messages[0].role === 'system' && 
    typeof inputData.messages[0].content === 'object') {
  
  // Converter o objeto content para string
  inputData.messages[0].content = JSON.stringify(inputData.messages[0].content);
}

return [{ json: inputData }];