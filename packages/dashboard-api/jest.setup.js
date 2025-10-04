console.log('--- EXECUTANDO O ARQUIVO DE SETUP DO JEST ---'); // Linha de diagnóstico

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
