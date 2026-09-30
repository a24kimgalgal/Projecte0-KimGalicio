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

const queryAsync = (sql, values = []) => {
    return new Promise((resolve, reject) => {
        con.query(sql, values, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

async function runMigration() {
    try {
        await queryAsync(createPreguntesTable);
        await queryAsync(createRespostesTable);

        for (const q of preguntes) {
            const sqlPregunta = "INSERT IGNORE INTO preguntes (id, pregunta, imatge) VALUES (?, ?, ?)";
            const result = await queryAsync(sqlPregunta, [q.id, q.pregunta, q.imatge]);

            if (result.affectedRows > 0) {
                const sqlRespostes = "INSERT INTO respostes (pregunta_id, resposta, es_correcta) VALUES (?, ?, ?)";

                await queryAsync(sqlRespostes, [q.id, q.resposta_correcta, true]);

                for (const resp_inc of q.respostes_incorrectes) {
                    await queryAsync(sqlRespostes, [q.id, resp_inc, false]);
                }
            }
        }

        console.log("Migració completada amb èxit.");
    } catch (error) {
        console.error("Error durant la migració:", error);
    } finally {
        con.end((err) => {
            if (err) console.error("Error tancant el pool de connexions:", err);
            else console.log("Connexió tancada correctament.");
            process.exit(0);
        });
    }
}

runMigration();