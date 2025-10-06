import { useState, useEffect } from 'react';
import axios from 'axios';

// Define a "forma" dos dados de um Span que esperamos da API
interface Span {
  id: string;
  trace_id: string;
  service_name: string;
  operation_name: string;
  duration_ms: number;
  status: 'OK' | 'ERROR';
  start_time: string; // ISO string format
}

function App() {
  // Estado para armazenar a lista de spans
  const [spans, setSpans] = useState<Span[]>([]);
  // Estado para armazenar mensagens de erro de conexão com a API
  const [error, setError] = useState<string | null>(null);

  // useEffect é um "hook" do React que executa código em certos momentos.
  // Usaremos para buscar dados quando o componente é montado e depois em intervalos.
  useEffect(() => {
    const fetchSpans = async () => {
      try {
        const response = await axios.get<Span[]>('http://localhost:3000/spans');
        setSpans(response.data);
        setError(null); // Limpa erros anteriores se a conexão for bem-sucedida
      } catch (err) {
        console.error('Failed to fetch spans:', err);
        setError('Failed to connect to the Chronosense API. Is it running?');
      }
    };

    // Busca os dados imediatamente quando a página carrega
    fetchSpans();

    // Configura um "timer" para buscar os dados a cada 5 segundos
    const intervalId = setInterval(fetchSpans, 5000);

    // Função de limpeza: o React a executa quando o componente é "desmontado".
    // Isso previne vazamentos de memória.
    return () => clearInterval(intervalId);
  }, []); // O array vazio [] significa que este efeito roda apenas uma vez (na montagem)

  return (
    <div className="container">
      <h1>Chronosense Dashboard</h1>
      <p>Showing telemetry data received by the API. Refreshes automatically every 5 seconds.</p>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Service Name</th>
            <th>Operation</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {spans.length > 0 ? (
            spans.map((span) => (
              <tr key={span.id}>
                <td>{span.service_name}</td>
                <td>{span.operation_name}</td>
                <td>{span.duration_ms}ms</td>
                <td style={{ color: span.status === 'ERROR' ? 'red' : 'green' }}>
                  {span.status}
                </td>
                <td>{new Date(span.start_time).toLocaleTimeString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>
                {error ? 'Could not load data.' : 'No telemetry data received yet. Waiting for agents...'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;