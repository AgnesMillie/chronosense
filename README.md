# Chronosense APM

Um sistema de Monitoramento de Performance de Aplicações (APM) simplificado, construído com Node.js, React e PostgreSQL como um projeto de portfólio.

Este projeto demonstra uma arquitetura full-stack em monorepo, incluindo uma API de ingestão de dados, um agente de coleta e um dashboard em tempo real, tudo containerizado com Docker.

## Tecnologias Utilizadas

-   **Backend**: Node.js, Express, TypeScript
-   **Frontend**: React, TypeScript, Vite
-   **Database**: PostgreSQL
-   **DevOps**: Docker, Docker Compose, GitHub Actions

## Como Executar Localmente

**Pré-requisitos:** Node.js, Docker e NPM instalados.

1.  **Clonar e Instalar:**
    ```bash
    git clone [https://github.com/AgnesMillie/chronosense.git](https://github.com/AgnesMillie/chronosense.git)
    cd chronosense
    npm install
    ```

2.  **Criar arquivo de ambiente:**
    ```bash
    cp .env.example .env
    ```

3.  **Iniciar Banco de Dados e Rodar Migrations:**
    ```bash
    docker-compose up -d
    npm run migrate:up
    ```

4.  **Executar os Serviços (cada um em um terminal separado):**

    * **API (porta 3000):**
        ```bash
        npm run start:dev -w @chronosense/dashboard-api
        ```
    * **Frontend (porta 5173):**
        ```bash
        npm run dev -w @chronosense/dashboard-frontend
        ```
    * **App de Exemplo (porta 8080):**
        ```bash
        npm run start:dev -w @chronosense/example-app
        ```

5.  **Gerar e Ver os Dados:**
    * Acesse os endpoints do App de Exemplo (ex: `http://localhost:8080/fast`) para gerar dados.
    * Visualize os resultados em tempo real no Dashboard (ex: `http://localhost:5173`).
