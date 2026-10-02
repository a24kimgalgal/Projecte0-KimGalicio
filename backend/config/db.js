const mysql = require('mysql');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

function envValue(key, fallback) {
  const value = process.env[key];
  return value === undefined || value === null ? fallback : String(value).trim();
}

const config = {
  connectionLimit: 10,
  host: envValue('DB_HOST_PROD', envValue('DB_HOST', 'db')),
  port: Number(envValue('DB_PORT_PROD', envValue('DB_PORT', '3306'))),
  user: envValue('DB_USER_PROD', envValue('DB_USER', 'root')),
  password: envValue('DB_PASSWORD_PROD', envValue('DB_PASSWORD', '')),
  database: envValue('DB_NAME_PROD', envValue('DB_NAME', 'quiz_db'))
};

const pool = mysql.createPool(config);

function tryConnect(retriesLeft = 20) {
  pool.getConnection((err, connection) => {
    if (err) {
      if (err.code === 'ECONNREFUSED' && retriesLeft > 0) {
        console.warn(`MySQL no està disponible encara. Reintentant en 2s (${retriesLeft} intents restants)...`);
        return setTimeout(() => tryConnect(retriesLeft - 1), 2000);
      }

      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('La connexió amb la base de dades es va tancar.');
      }
      if (err.code === 'ER_CON_COUNT_ERROR') {
        console.error('La base de dades té massa connexions.');
      }
      if (err.code === 'ECONNREFUSED') {
        console.error('La connexió amb la base de dades ha estat rebutjada.');
      }
      console.error('Error en connectar a la base de dades:', err);
      return;
    }

    console.log('Connectat correctament a la base de dades MySQL!');
    connection.release();
  });
}

tryConnect();

module.exports = pool;