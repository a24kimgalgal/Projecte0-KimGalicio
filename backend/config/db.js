const mysql = require('mysql');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const con = mysql.createConnection({
  host: process.env.DB_HOST_PROD || process.env.DB_HOST,
  port: process.env.DB_PORT_PROD || process.env.DB_PORT,
  user: process.env.DB_USER_PROD || process.env.DB_USER,
  password: process.env.DB_PASSWORD_PROD || process.env.DB_PASSWORD,
  database: process.env.DB_NAME_PROD || process.env.DB_NAME
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connectat correctament a la base de dades MySQL!");
});

module.exports = con;