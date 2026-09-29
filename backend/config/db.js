const mysql = require('mysql');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST_PROD || process.env.DB_HOST,
  port: process.env.DB_PORT_PROD || process.env.DB_PORT,
  user: process.env.DB_USER_PROD || process.env.DB_USER,
  password: process.env.DB_PASSWORD_PROD || process.env.DB_PASSWORD,
  database: process.env.DB_NAME_PROD || process.env.DB_NAME
});

pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.');
    }
    console.error('Error connecting to database:', err);
  }
  
  if (connection) {
    console.log("Connectat correctament a la base de dades MySQL!");
    connection.release();
  }
});

module.exports = pool;