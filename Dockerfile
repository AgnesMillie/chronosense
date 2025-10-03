# --- ESTÁGIO 1: BUILD ---
# Usamos uma imagem Node.js baseada em Alpine Linux, que é bem pequena.
# Damos a este estágio o nome 'builder' para referência futura.
FROM node:20-alpine AS builder

# Define o diretório de trabalho dentro do contêiner.
WORKDIR /app

# Copia os arquivos de definição de pacotes da raiz para aproveitar o cache do Docker.
COPY package.json package-lock.json ./

# Copia o package.json específico da nossa API.
COPY packages/dashboard-api/package.json ./packages/dashboard-api/

# Instala TODAS as dependências, incluindo as de desenvolvimento necessárias para o build.
# 'npm ci' é mais rápido e confiável para ambientes de automação.
RUN npm ci

# Copia todo o resto do código-fonte do projeto.
COPY . .

# Executa o script de build para o nosso pacote específico.
# Isso compila o TypeScript para JavaScript na pasta 'dist'.
RUN npm run build -w @chronosense/dashboard-api


# --- ESTÁGIO 2: PRODUÇÃO ---
# Começamos de uma nova imagem base limpa para o ambiente final.
FROM node:20-alpine

# Define o diretório de trabalho.
WORKDIR /app

# Copia os arquivos de definição de pacotes novamente.
COPY package.json package-lock.json ./
COPY packages/dashboard-api/package.json ./packages/dashboard-api/

# Instala APENAS as dependências de produção.
RUN npm ci --omit=dev

# Sintaxe: COPY --from=<nome_do_estágio> <origem> <destino>
COPY --from=builder /app/packages/dashboard-api/dist ./packages/dashboard-api/dist

# Expõe a porta em que nossa aplicação irá rodar.
EXPOSE 3000

# Define o comando que será executado quando o contêiner iniciar.
CMD ["node", "packages/dashboard-api/dist/server.js"]