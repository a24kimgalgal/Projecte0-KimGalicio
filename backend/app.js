const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const port = Number(process.argv[2]) || 40600;

const con = require('./config/db');

const sessions = new Map();

//TODO: Implementar un sistema de sessions més segur i persistent.
//TODO: Implementar una funció per barrejar les preguntes abans de servir-les al client (utilitzant Math.random()). (FET)
//TODO: Fer q només siguin 10 preguntes per partida. (FET)

function barrejarPreguntes(array) {
  const arrayBarrejat = [...array];
  for (let i = arrayBarrejat.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arrayBarrejat[i], arrayBarrejat[j]] = [arrayBarrejat[j], arrayBarrejat[i]];
  }
  return arrayBarrejat;
}

app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/login', (req, res) => {
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);

  const { username, email } = req.body;
  if (username && email) {
    const sessionId = uuidv4();
    sessions.set(sessionId, { username, email });

    res.json({ success: true, sessionId: sessionId, username: username });
  } else {
    console.log("Falten dades. Retornant 400 Bad Request.");
    res.status(400).json({ success: false, message: 'Nom d\'usuari i email requerits' });
  }
});

app.get('/session', (req, res) => {
  const sessionId = req.headers['session-id'];
  if (sessionId && sessions.has(sessionId)) {
    res.json({ loggedIn: true, username: sessions.get(sessionId).username });
  } else {
    res.json({ loggedIn: false });
  }
});

app.get('/preguntes', (req, res) => {
  const sessionId = req.headers['session-id'];

  con.query("SELECT * FROM preguntes ORDER BY RAND() LIMIT 10", (err, resultPreguntes) => {
    if (err) return res.status(500).json({ error: "Error a la base de dades" });

    const questionIds = resultPreguntes.map(p => p.id);
    if (questionIds.length === 0) return res.json({ preguntes: [] });

    con.query("SELECT * FROM respostes WHERE pregunta_id IN (?)", [questionIds], (err, resultRespostes) => {
      if (err) return res.status(500).json({ error: "Error a la base de dades" });

      const preguntesPartida = resultPreguntes.map(p => {
        const resps = resultRespostes.filter(r => r.pregunta_id === p.id);
        const correcta = resps.find(r => r.es_correcta)?.resposta;
        const incorrectes = resps.filter(r => !r.es_correcta).map(r => r.resposta);

        return {
          id: p.id,
          pregunta: p.pregunta,
          imatge: p.imatge,
          resposta_correcta: correcta,
          respostes_incorrectes: incorrectes
        };
      });

      if (sessionId && sessions.has(sessionId)) {
        sessions.get(sessionId).questions = preguntesPartida;
      }

      const preguntesClient = preguntesPartida.map(q => ({
        id: q.id,
        pregunta: q.pregunta,
        imatge: q.imatge,
        respostes: barrejarPreguntes([q.resposta_correcta, ...q.respostes_incorrectes])
      }));

      res.json({ preguntes: preguntesClient });
    });
  });
});

app.post('/respostes', (req, res) => {
  const sessionId = req.headers['session-id'];

  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ error: 'Sessió no vàlida' });
  }

  const sessionData = sessions.get(sessionId);
  const preguntesPartida = sessionData.questions;

  if (!preguntesPartida) {
    return res.status(400).json({ error: 'No hi ha preguntes iniciades per aquesta sessió' });
  }

  const respostesUsuari = req.body.respostes || {};
  const tempsUsuari = req.body.temps || 0;
  let encerts = 0;
  const total = preguntesPartida.length;

  preguntesPartida.forEach(q => {
    if (respostesUsuari[q.id] === q.resposta_correcta) {
      encerts++;
    }
  });

  res.json({
    puntuacio: `${encerts}/${total}`,
    encerts: encerts,
    total: total,
    temps: tempsUsuari
  });
});

app.get('/api/preguntes', (req, res) => {
  con.query("SELECT * FROM preguntes", (err, result) => {
    if (err) return res.status(500).json({ error: "Error a la base de dades" });
    res.json(result);
  });
});

app.post('/api/preguntes', (req, res) => {
  const { id, pregunta, imatge, resposta_correcta, respostes_incorrectes } = req.body;

  if (!id || !pregunta || !resposta_correcta || !respostes_incorrectes || !Array.isArray(respostes_incorrectes)) {
    return res.status(400).json({ error: "Falten dades" });
  }

  con.query("INSERT INTO preguntes (id, pregunta, imatge) VALUES (?, ?, ?)", [id, pregunta, imatge || null], (err) => {
    if (err) return res.status(500).json({ error: "Error a la base de dades en inserir la pregunta" });

    const sqlRespostes = "INSERT INTO respostes (pregunta_id, resposta, es_correcta) VALUES (?, ?, ?)";

    con.query(sqlRespostes, [id, resposta_correcta, true], (err) => {
      if (err) console.error(err);
    });

    respostes_incorrectes.forEach(resp => {
      con.query(sqlRespostes, [id, resp, false], (err) => {
        if (err) console.error(err);
      });
    });

    res.json({ success: true, missatge: "Pregunta inserida correctament" });
  });
});

app.put('/api/preguntes/:id', (req, res) => {
  const id = req.params.id;
  const { pregunta, imatge } = req.body;

  con.query("UPDATE preguntes SET pregunta = ?, imatge = ? WHERE id = ?", [pregunta, imatge, id], (err, result) => {
    if (err) return res.status(500).json({ error: "Error a la base de dades" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Pregunta no trobada" });
    res.json({ success: true, missatge: "Pregunta actualitzada correctament" });
  });
});

app.delete('/api/preguntes/:id', (req, res) => {
  const id = req.params.id;
  con.query("DELETE FROM preguntes WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Error a la base de dades" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Pregunta no trobada" });
    res.json({ success: true, missatge: "Pregunta eliminada correctament" });
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Servidor escoltant a http://localhost:${port}`);
  });
}

module.exports = app;