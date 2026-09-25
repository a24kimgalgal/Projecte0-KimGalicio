const con = require('./config/db');
const fs = require('fs');

const rawData = fs.readFileSync('./preguntes.json');
const data = JSON.parse(rawData);
const preguntes = data.preguntes;

console.log("Iniciant la creació de taules i migració de dades...");

const createPreguntesTable = `
CREATE TABLE IF NOT EXISTS preguntes (
    id INT PRIMARY KEY,
    pregunta VARCHAR(255) NOT NULL,
    imatge VARCHAR(255)
)`;

const createRespostesTable = `
CREATE TABLE IF NOT EXISTS respostes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pregunta_id INT,
    resposta VARCHAR(255) NOT NULL,
    es_correcta BOOLEAN NOT NULL,
    FOREIGN KEY (pregunta_id) REFERENCES preguntes(id) ON DELETE CASCADE
)`;

con.query(createPreguntesTable, function (err) {
    if (err) throw err;

    con.query(createRespostesTable, function (err) {
        if (err) throw err;
        preguntes.forEach(q => {
            const sqlPregunta = "INSERT IGNORE INTO preguntes (id, pregunta, imatge) VALUES (?, ?, ?)";
            con.query(sqlPregunta, [q.id, q.pregunta, q.imatge], function (err, result) {
                if (err) return;

                if (result.affectedRows === 0) return;

                const sqlRespostes = "INSERT INTO respostes (pregunta_id, resposta, es_correcta) VALUES (?, ?, ?)";

                con.query(sqlRespostes, [q.id, q.resposta_correcta, true], function (err) {
                    if (err) throw err;
                });

                q.respostes_incorrectes.forEach(resp_inc => {
                    con.query(sqlRespostes, [q.id, resp_inc, false], function (err) {
                        if (err) throw err;
                    });
                });
            });
        });

        setTimeout(() => {
            console.log("Migració completada.");
            process.exit(0);
        }, 3000);
    });
});
