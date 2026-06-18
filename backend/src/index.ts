import { ENV } from './config/env';
import app from './app';
import prisma from './config/prisma';

async function main() {
  await prisma.$connect();
  console.log('Database connected');

  app.listen(ENV.PORT, () => {
    console.log(`Rahaa backend running on port ${ENV.PORT} [${ENV.NODE_ENV}]`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
