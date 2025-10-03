import dotenv from 'dotenv';
import path from 'path';

// Configura o dotenv para ler o arquivo .env na raiz do projeto
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { app } from './app';
import { db } from './lib/db';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Tenta fazer uma consulta simples para verificar a conexão com o banco
    await db.query('SELECT NOW()');
    console.log('✅ Database connection successful.');

    // Se a conexão for bem-sucedida, inicia o servidor web
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    // Se a conexão falhar, loga o erro e encerra a aplicação
    console.error('❌ Failed to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
