import request from 'supertest';
import format from 'pg-format';
import { app } from './app';
import { db, pool } from './lib/db';

describe('API Endpoints', () => {
  // Hook que executa UMA VEZ após TODOS os testes deste arquivo terminarem
  afterAll(async () => {
    await pool.end(); // Fecha a conexão com o banco de dados
  });

  // Teste para a rota GET / (Health Check)
  describe('GET /', () => {
    it('should respond with a 200 status code and the welcome message', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Chronosense Dashboard API is running!',
      });
      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  // Testes para a rota POST /ingest
  describe('POST /ingest', () => {
    const validSpan = {
      traceId: 'trace-123',
      spanId: 'span-456',
      serviceName: 'checkout-service',
      operationName: 'process-payment',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: 50,
      status: 'OK',
    };

    it('should respond with 202 Accepted for a valid payload', async () => {
      const response = await request(app).post('/ingest').send([validSpan]);
      expect(response.status).toBe(202);
    });

    it('should respond with 400 Bad Request for an empty array', async () => {
      const response = await request(app).post('/ingest').send([]);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Request body must be a non-empty array of spans.',
      });
    });

    it('should respond with 400 Bad Request for a non-array payload', async () => {
      const response = await request(app)
        .post('/ingest')
        .send({ not: 'an array' });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Request body must be a non-empty array of spans.',
      });
    });

    it('should respond with 400 Bad Request if spans are missing required fields', async () => {
      const invalidSpan = { spanId: 'span-789' }; // Faltam traceId e serviceName
      const response = await request(app).post('/ingest').send([invalidSpan]);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Spans must contain at least traceId and serviceName.',
      });
    });
  });

  // Testes para a nova rota GET /spans
  describe('GET /spans', () => {
    // Antes de cada teste neste bloco, limpa a tabela de spans
    beforeEach(async () => {
      await db.query('DELETE FROM spans');
    });

    it('should return an empty array when no spans exist', async () => {
      const response = await request(app).get('/spans');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return an array of spans when spans exist', async () => {
      // 1. Inserir um dado de teste diretamente no banco
      const testSpan = {
        trace_id: 'get-test-trace-id',
        span_id: 'get-test-span-id',
        service_name: 'test-service',
        operation_name: 'test-op',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        duration_ms: 100,
        status: 'OK',
        attributes: JSON.stringify({ key: 'value' }),
      };
      const sql = format(
        'INSERT INTO spans (trace_id, span_id, service_name, operation_name, start_time, end_time, duration_ms, status, attributes) VALUES (%L)',
        [Object.values(testSpan)],
      );
      await db.query(sql);

      // 2. Chamar a API
      const response = await request(app).get('/spans');

      // 3. Verificar a resposta
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].trace_id).toBe('get-test-trace-id');
      expect(response.body[0].service_name).toBe('test-service');
      expect(response.body[0].attributes).toEqual({ key: 'value' });
    });
  });
});
