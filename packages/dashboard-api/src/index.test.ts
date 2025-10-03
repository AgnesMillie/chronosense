import request from 'supertest';
import { app } from './app';

describe('API Endpoints', () => {
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

  // Testes para a nova rota POST /ingest
  describe('POST /ingest', () => {
    const validSpan = {
      traceId: 'trace-123',
      spanId: 'span-456',
      serviceName: 'checkout-service',
      operationName: 'process-payment',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: 50,
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
});
