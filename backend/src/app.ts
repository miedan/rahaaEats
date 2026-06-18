import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import authRoutes from './routes/auth.routes';

const app = express();

app.use(cors({ origin: ENV.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: ENV.NODE_ENV });
});

app.use('/api/v1/auth', authRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

export default app;
