import axios, { AxiosInstance } from 'axios';
import { randomUUID } from 'crypto';

// Interface para a configuração do agente
interface AgentConfig {
  serviceName: string;
  ingestUrl: string;
}

// Interface para os dados de um Span
interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string | null;
  serviceName: string;
  operationName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'OK' | 'ERROR';
  attributes: Record<string, any>;
  error?: any;
}

export class ChronosenseAgent {
  private readonly serviceName: string;
  private readonly ingestUrl: string;
  private spanBuffer: Partial<Span>[] = [];
  private readonly axiosInstance: AxiosInstance;

  constructor(config: AgentConfig) {
    if (!config.serviceName || !config.ingestUrl) {
      throw new Error(
        'serviceName and ingestUrl are required for ChronosenseAgent.',
      );
    }
    this.serviceName = config.serviceName;
    this.ingestUrl = config.ingestUrl;

    this.axiosInstance = axios.create({
      baseURL: this.ingestUrl,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Inicia um novo span.
   * @param operationName O nome da operação a ser medida.
   * @returns Um objeto Span com uma função `end()` para finalizar a medição.
   */
  public startSpan(operationName: string) {
    const span: Partial<Span> = {
      traceId: randomUUID(),
      spanId: randomUUID(),
      serviceName: this.serviceName,
      operationName,
      startTime: new Date(),
      status: 'OK',
      attributes: {},
    };

    const end = () => {
      span.endTime = new Date();
      span.duration = span.endTime.getTime() - (span.startTime?.getTime() || 0);
      this.spanBuffer.push(span);
    };

    return { span, end };
  }

  /**
   * Envia os spans acumulados no buffer para o endpoint de ingestão.
   */
  public async flush() {
    if (this.spanBuffer.length === 0) {
      console.log('No spans to flush.');
      return;
    }

    try {
      console.log(`Flushing ${this.spanBuffer.length} spans...`);
      await this.axiosInstance.post('/ingest', this.spanBuffer);
      // Limpa o buffer após o envio bem-sucedido
      this.spanBuffer = [];
      console.log('Spans flushed successfully.');
    } catch (error: any) {
      console.error('Error flushing spans:', error.message);
      // Aqui, em um agente real, teríamos uma lógica de retry ou de salvar em disco.
    }
  }
}
