const { Pool } = require("pg");

let pool = null;
let dbConnected = false;

const isDbConnected = () => dbConnected;

const getPool = () => {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    const isCloud =
      !connectionString.includes("localhost") &&
      !connectionString.includes("127.0.0.1");

    pool = new Pool({
      connectionString,
      ssl: isCloud ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
    });
  } else if (process.env.PGHOST && process.env.PGDATABASE) {
    pool = new Pool({
      host: process.env.PGHOST,
      port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      connectionTimeoutMillis: 5000,
    });
  }

  return pool;
};

const initDB = async () => {
  const currentPool = getPool();
  if (!currentPool) {
    dbConnected = false;
    console.warn(
      "⚠️ PostgreSQL: No connection configuration found (DATABASE_URL or PG* variables). Persistent history is disabled."
    );
    return false;
  }

  try {
    const client = await currentPool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS debug_history (
          id SERIAL PRIMARY KEY,
          session_id VARCHAR(100),
          language VARCHAR(50) NOT NULL,
          code TEXT NOT NULL,
          error_message TEXT,
          user_prompt TEXT,
          analysis JSONB NOT NULL,
          fixed_code TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        -- Safe migration for existing tables
        ALTER TABLE debug_history ADD COLUMN IF NOT EXISTS session_id VARCHAR(100);
        CREATE INDEX IF NOT EXISTS idx_debug_history_session_created ON debug_history(session_id, created_at DESC);
      `);
      dbConnected = true;
      console.log("✅ PostgreSQL Connected & Initialized Successfully");
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    dbConnected = false;
    console.error(
      "⚠️ PostgreSQL Connection Error (History disabled):",
      err.message
    );
    return false;
  }
};

const query = async (text, params) => {
  const currentPool = getPool();
  if (!currentPool || !dbConnected) {
    throw new Error("Database is not connected.");
  }
  return currentPool.query(text, params);
};

const closeDB = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    dbConnected = false;
  }
};

module.exports = {
  initDB,
  query,
  isDbConnected,
  closeDB,
};
