import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = ['PORT', 'MONGODB_URI', 'NODE_ENV'];

for (const envVar of requiredEnv) {
  if (!process.env[envVar] || process.env[envVar].trim() === '') {
    throw new Error(`Falta configurar la variable de entorno obligatoria: ${envVar}`);
  }
}

const port = Number(process.env.PORT);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error('La variable PORT debe ser un número entero mayor que 0.');
}

export const config = Object.freeze({
  port,
  mongoUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV
});
