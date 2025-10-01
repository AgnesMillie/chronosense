import express, { Request, Response, Application } from 'express';

// 1. Defina e configure o app
const app: Application = express();

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Chronosense Dashboard API is running!' });
});

// 2. Exporte apenas o app, SEM chamar app.listen()
export { app };
