const mysql = require('mysql');

const con = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "a24kimgalgal",
  password: process.env.DB_PASSWORD || "QuizDbPassword",
  database: process.env.DB_NAME || "quiz_db"
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connectat correctament a la base de dades MySQL!");
});

module.exports = con;
