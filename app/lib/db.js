// lib/db.js
import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgrespassword',
  port: 5432
});

export const queryDatabase = async (queryText, params) => {
  const client = await pool.connect();
  try {
    if (!Array.isArray(params) || !Array.isArray(params[0])) {
      throw new Error('Invalid params format. Expected an array containing an array of numbers.');
    }
    
    // Convert the inner array to a PostgreSQL vector literal
    const vectorLiteral = `[${params[0].join(',')}]`;
    const res = await client.query(queryText, [vectorLiteral]);
    return res.rows;
  } finally {
    client.release();
  }
};
