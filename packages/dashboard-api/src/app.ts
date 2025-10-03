import express, { Request, Response, Application } from 'express';

// 1. Defina e configure o app
const app: Application = express();

// Adiciona o middleware para parse de JSON. DEVE VIR ANTES DAS ROTAS.
app.use(express.json());

// Rota de Health Check
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Chronosense Dashboard API is running!' });
});

// Rota de Ingestão de Dados
app.post('/ingest', (req: Request, res: Response) => {
  const spans = req.body;

  // Validação básica
  if (!Array.isArray(spans) || spans.length === 0) {
    return res
      .status(400)
      .json({ error: 'Request body must be a non-empty array of spans.' });
  }

  // Validação do primeiro span para garantir que os campos essenciais estão presentes
  const firstSpan = spans[0];
  if (!firstSpan.traceId || !firstSpan.serviceName) {
    return res
      .status(400)
      .json({ error: 'Spans must contain at least traceId and serviceName.' });
  }

  // Por enquanto, apenas logamos os dados recebidos para simular o processamento.
  console.log(
    `Received ${spans.length} spans for service: ${firstSpan.serviceName}`,
  );
  console.log(JSON.stringify(spans, null, 2));

  // Respondemos com 202 Accepted.
  // Isso informa ao cliente que recebemos os dados para processamento,
  // mas não o faz esperar pela conclusão desse processamento.
  res.status(202).send();
});

// 2. Exporte apenas o app, SEM chamar app.listen()
export { app };
