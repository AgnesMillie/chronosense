module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Aponta para o nosso novo arquivo de setup, que carrega o .env
  setupFilesAfterEnv: ['<rootDir>/../jest.setup.js'],
  // Procura por arquivos de teste dentro da pasta src
  rootDir: 'src',
  // Padrão para encontrar os arquivos de teste
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  // Configura o alias '@/' para funcionar nos testes, assim como no tsconfig
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
