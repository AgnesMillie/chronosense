import express, { Request, Response, Application } from 'express';
import format from 'pg-format';
import { db } from './lib/db';

const app: Application = express();

app.use(express.json());

// Rota de Health Check
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Chronosense Dashboard API is running!' });
});

// Nova Rota de Consulta de Spans
app.get('/spans', async (req: Request, res: Response) => {
  try {
    // Consulta todos os spans, ordenando pelos mais recentes primeiro
    const { rows } = await db.query(
      'SELECT * FROM spans ORDER BY start_time DESC',
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching spans:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Rota de Ingestão de Dados
app.post('/ingest', async (req: Request, res: Response) => {
  const spans = req.body;

  if (!Array.isArray(spans) || spans.length === 0) {
    return res
      .status(400)
      .json({ error: 'Request body must be a non-empty array of spans.' });
  }

  const firstSpan = spans[0];
  if (!firstSpan.traceId || !firstSpan.serviceName) {
    return res
      .status(400)
      .json({ error: 'Spans must contain at least traceId and serviceName.' });
  }

  try {
    const values = spans.map((span) => [
      span.traceId,
      span.spanId,
      span.parentSpanId || null,
      span.serviceName,
      span.operationName,
      span.startTime,
      span.endTime,
      span.duration,
      span.kind || null,
      span.status,
      JSON.stringify(span.attributes || {}),
      JSON.stringify(span.error || null),
    ]);

    const sql = format(
      'INSERT INTO spans (trace_id, span_id, parent_span_id, service_name, operation_name, start_time, end_time, duration_ms, kind, status, attributes, error) VALUES %L',
      values,
    );

    await db.query(sql);

    res.status(202).send();
  } catch (error) {
    console.error('Error inserting data into the database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export { app };
