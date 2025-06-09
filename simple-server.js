const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rota para registrar mensagens
app.post('/api/registrar-mensagem', (req, res) => {
  console.log('Mensagem recebida:', req.body);
  
  // Simulação de resposta bem-sucedida
  res.status(200).json({ 
    success: true,
    mensagem: 'Mensagem registrada com sucesso'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor simples rodando na porta ${PORT}`);
});