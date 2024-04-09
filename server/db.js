const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'nvmtdb',
  password: '12345',
  port: 5432, // Default PostgreSQL port
});

module.exports = pool;
