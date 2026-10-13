import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  database: {
    authType: (process.env.DB_AUTH_TYPE || 'windows').toLowerCase(),
    server: process.env.DB_SERVER || 'DESKTOP-F3PIBN9',
    database: process.env.DB_NAME || 'SaiketTask6DB',
    port: parseInt(process.env.DB_PORT, 10) || 1433,
    odbcDriver: process.env.DB_ODBC_DRIVER || 'ODBC Driver 17 for SQL Server',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
    pool: {
      max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
      min: parseInt(process.env.DB_POOL_MIN, 10) || 0,
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT_MS, 10) || 30000,
      acquireTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS, 10) || 15000
    }
  }
};

