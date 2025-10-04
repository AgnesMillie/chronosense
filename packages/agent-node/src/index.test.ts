import axios from 'axios';
import { ChronosenseAgent } from './index';

// Diz ao Jest para substituir o módulo 'axios' por um mock automático.
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Configura um mock para a instância criada pelo axios.create
const mockedPost = jest.fn();
mockedAxios.create.mockReturnValue({
  post: mockedPost,
} as any);

describe('ChronosenseAgent', () => {
  // Limpa o histórico de chamadas do mock antes de cada teste
  beforeEach(() => {
    mockedPost.mockClear();
  });

  describe('constructor', () => {
    it('should throw an error if serviceName is not provided', () => {
      expect(() => {
        throw new ChronosenseAgent({
          serviceName: '',
          ingestUrl: 'http://localhost:3000',
        });
      }).toThrow(
        'serviceName and ingestUrl are required for ChronosenseAgent.',
      );
    });

    it('should throw an error if ingestUrl is not provided', () => {
      expect(() => {
        throw new ChronosenseAgent({
          serviceName: 'test-service',
          ingestUrl: '',
        });
      }).toThrow(
        'serviceName and ingestUrl are required for ChronosenseAgent.',
      );
    });
  });

  describe('startSpan and end', () => {
    it('should create a span with correct initial properties', () => {
      const agent = new ChronosenseAgent({
        serviceName: 'my-app',
        ingestUrl: 'http://localhost:3000',
      });
      const { span } = agent.startSpan('test-operation');

      expect(span.serviceName).toBe('my-app');
      expect(span.operationName).toBe('test-operation');
      expect(span.traceId).toBeDefined();
      expect(span.spanId).toBeDefined();
      expect(span.startTime).toBeInstanceOf(Date);
    });
  });

  describe('flush', () => {
    it('should not call axios.post if the buffer is empty', async () => {
      const agent = new ChronosenseAgent({
        serviceName: 'my-app',
        ingestUrl: 'http://localhost:3000',
      });
      await agent.flush();
      expect(mockedPost).not.toHaveBeenCalled();
    });

    it('should send buffered spans to the ingest endpoint via axios.post', async () => {
      // Mock da resposta do post para simular sucesso
      mockedPost.mockResolvedValue({ status: 202 });

      const agent = new ChronosenseAgent({
        serviceName: 'my-app',
        ingestUrl: 'http://localhost:3000',
      });

      // Cria e finaliza um span para adicioná-lo ao buffer
      const { end } = agent.startSpan('flushing-test');
      end();

      await agent.flush();

      // Verifica se o post foi chamado
      expect(mockedPost).toHaveBeenCalledTimes(1);

      // Verifica se o post foi chamado com os dados corretos
      const sentPayload = mockedPost.mock.calls[0][1]; // O payload é o segundo argumento da chamada post
      expect(Array.isArray(sentPayload)).toBe(true);
      expect(sentPayload.length).toBe(1);
      expect(sentPayload[0].operationName).toBe('flushing-test');
      expect(sentPayload[0].serviceName).toBe('my-app');
      expect(sentPayload[0].duration).toBeGreaterThanOrEqual(0);
    });
  });
});
