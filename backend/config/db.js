const mysql = require('mysql');

const con = mysql.createConnection({
  host: "localhost",
  user: "a24kimgalgal",
  password: "QuizDbPassword",
  database: "quiz_db"
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connectat correctament a la base de dades MySQL!");
});

module.exports = con;
