import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

// Abstração para executar queries
export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
};

// Exporta o pool para que possamos gerenciá-lo (ex: fechar a conexão nos testes)
export { pool };
