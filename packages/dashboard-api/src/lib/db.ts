import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

// Exportamos um objeto 'db' que expõe um método 'query'.
// Isso cria uma abstração simples sobre o pool.
export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
};