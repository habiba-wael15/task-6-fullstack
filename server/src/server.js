import { app } from './app.js';
import { config } from './config/env.js';
import { checkConnection, closePool } from './config/database.js';

const PORT = config.port;

const server = app.listen(PORT, async () => {
  console.log(`=============================================================`);
  console.log(` Saiket Systems - Task 6: Full Stack User Management API`);
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` Environment: ${config.env}`);
  console.log(` Database: ${config.database.database} on ${config.database.server}`);
  console.log(` Auth Mode: ${config.database.authType.toUpperCase()}`);
  console.log(`=============================================================`);

  // Verify database connection at startup
  const dbHealth = await checkConnection();
  if (dbHealth.connected) {
    console.log(`[Database Ready] Connected to SQL Server database '${config.database.database}'.`);
  } else {
    console.warn(`[Database Warning] Unable to connect to SQL Server database '${config.database.database}':`);
    console.warn(`                   ${dbHealth.error || dbHealth.message}`);
    console.warn(`                   Ensure SaiketTask6DB exists and SQL Server is running.`);
  }
});

// Graceful shutdown handling
async function handleShutdown(signal) {
  console.log(`\nReceived ${signal}. Gracefully closing HTTP server and database pool...`);
  server.close(async () => {
    await closePool();
    console.log('HTTP server and database connections closed. Process terminating.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 5000);
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

