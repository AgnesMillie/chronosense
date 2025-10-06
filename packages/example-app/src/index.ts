import express from 'express';
// A mágica do monorepo: importando nosso próprio pacote localmente!
import { ChronosenseAgent } from '@chronosense/agent-node';

// --- 1. Configuração do Agente ---
// Instanciamos o agente, apontando para a nossa API de dashboard.
const agent = new ChronosenseAgent({
  serviceName: 'example-app',
  ingestUrl: 'http://localhost:3000', // A URL da nossa dashboard-api
});
console.log(
  '-> Agent: Chronosense Agent inicializado para o serviço: example-app',
);

// --- 2. Criação da Aplicação de Exemplo ---
const app = express();
const PORT = 8080; // Usaremos uma porta diferente para não conflitar com a API

// --- 3. Rotas de Exemplo ---

// Uma rota que responde rapidamente
app.get('/fast', (req, res) => {
  const { end } = agent.startSpan('HTTP GET /fast');
  res.status(200).send('This was a fast response!');
  end();
});

// Uma rota que demora um tempo aleatório para responder
app.get('/slow', (req, res) => {
  const { end } = agent.startSpan('HTTP GET /slow');
  const operationTime = Math.random() * 500 + 100; // Simula entre 100ms e 600ms
  setTimeout(() => {
    res
      .status(200)
      .send(`This was a slow response after ${Math.round(operationTime)}ms.`);
    end();
  }, operationTime);
});

// Uma rota que simula um erro
app.get('/error', (req, res) => {
  const { span, end } = agent.startSpan('HTTP GET /error');
  try {
    throw new Error('This is a simulated error!');
  } catch (error: any) {
    span.status = 'ERROR';
    span.error = { message: error.message };
    res.status(500).send('Something went wrong!');
    end();
  }
});

// --- 4. Envio dos Dados (Flush) ---
// A cada 10 segundos, o agente tentará enviar os spans coletados para a API.
setInterval(() => {
  agent.flush();
}, 10000);

// --- 5. Inicia o Servidor de Exemplo ---
app.listen(PORT, () => {
  console.log(`🚀 Example App rodando em http://localhost:${PORT}`);
  console.log(
    'Acesse os endpoints (/fast, /slow, /error) para gerar dados de telemetria.',
  );
});
