import { config } from './env.js';

let pool = null;
let sqlDriver = null;

/**
 * Dynamically resolves the mssql driver based on auth mode:
 * - 'windows': loads 'mssql/msnodesqlv8.js' for Windows SSPI Trusted Connection via ODBC
 * - 'sql': loads standard 'mssql' (Tedious) for SQL Server credentials
 */
export async function getSqlDriver() {
  if (sqlDriver) {
    return sqlDriver;
  }

  const { authType } = config.database;

  if (authType === 'windows') {
    try {
      const module = await import('mssql/msnodesqlv8.js');
      sqlDriver = module.default || module;
      return sqlDriver;
    } catch (err) {
      throw new Error(
        `Windows Authentication requires 'msnodesqlv8'. Failed to load 'mssql/msnodesqlv8.js': ${err.message}. ` +
        `Ensure 'msnodesqlv8' is installed and ODBC driver '${config.database.odbcDriver}' is available.`
      );
    }
  }

  // Fallback / standard SQL Server Authentication
  try {
    const module = await import('mssql');
    sqlDriver = module.default || module;
    return sqlDriver;
  } catch (err) {
    throw new Error(`Failed to load 'mssql' driver: ${err.message}`);
  }
}

/**
 * Builds the driver-specific pool configuration
 */
export function buildDatabaseConfig() {
  const db = config.database;

  if (db.authType === 'windows') {
    // Windows Authentication using msnodesqlv8 and ODBC Driver
    const connectionString = `Driver={${db.odbcDriver}};Server=${db.server};Database=${db.database};Trusted_Connection=yes;`;
    return {
      connectionString,
      driver: 'msnodesqlv8',
      pool: {
        max: db.pool.max,
        min: db.pool.min,
        idleTimeoutMillis: db.pool.idleTimeoutMillis
      },
      connectionTimeout: db.pool.acquireTimeoutMillis,
      requestTimeout: 15000
    };
  }

  // SQL Server username/password authentication
  return {
    server: db.server,
    database: db.database,
    port: db.port,
    user: db.user,
    password: db.password,
    options: {
      encrypt: db.encrypt,
      trustServerCertificate: db.trustServerCertificate
    },
    pool: {
      max: db.pool.max,
      min: db.pool.min,
      idleTimeoutMillis: db.pool.idleTimeoutMillis
    },
    connectionTimeout: db.pool.acquireTimeoutMillis,
    requestTimeout: 15000
  };
}

/**
 * Returns or initializes the singleton connection pool.
 */
export async function getPool() {
  if (pool && pool.connected) {
    return pool;
  }

  const driver = await getSqlDriver();
  const poolConfig = buildDatabaseConfig();

  try {
    const newPool = new driver.ConnectionPool(poolConfig);
    pool = await newPool.connect();

    pool.on('error', (err) => {
      console.error('[Database Pool Error]:', err.message);
    });

    return pool;
  } catch (err) {
    pool = null;
    const authDesc = config.database.authType === 'windows'
      ? `Windows Authentication via ${config.database.odbcDriver}`
      : `SQL Authentication`;

    const failureMessage =
      `SQL Server connection failed (${authDesc}) to server '${config.database.server}', database '${config.database.database}': ${err.message}`;

    console.error(`[Database Connection Failure] ${failureMessage}`);
    const connectionError = new Error(failureMessage);
    connectionError.originalError = err;
    connectionError.code = err.code || 'DB_CONNECTION_FAILED';
    throw connectionError;
  }
}

/**
 * Checks connection health without throwing unhandled exceptions.
 * Used for /api/health endpoint.
 */
export async function checkConnection() {
  try {
    const activePool = await getPool();
    const result = await activePool.request().query('SELECT 1 AS alive, SYSUTCDATETIME() AS serverTimeUtc');

    return {
      connected: true,
      server: config.database.server,
      database: config.database.database,
      authType: config.database.authType,
      serverTimeUtc: result.recordset[0]?.serverTimeUtc,
      message: 'Database connection is healthy and responsive.'
    };
  } catch (err) {
    return {
      connected: false,
      server: config.database.server,
      database: config.database.database,
      authType: config.database.authType,
      error: err.message,
      message: 'Unable to connect to Microsoft SQL Server. Verify database service and schema in SSMS.'
    };
  }
}

/**
 * Closes the connection pool cleanly during graceful shutdown or tests.
 */
export async function closePool() {
  if (pool) {
    try {
      await pool.close();
    } catch (err) {
      console.warn('[Database Pool Close Warning]:', err.message);
    } finally {
      pool = null;
    }
  }
}

