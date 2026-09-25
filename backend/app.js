const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const port = Number(process.argv[2]) || 40600;

const preguntes = require('./preguntes.json');
const respostes = require('./respostes.json');

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
  const { username, email } = req.body;
  if (username && email) {
    const sessionId = uuidv4();
    sessions.set(sessionId, { username, email });

    res.json({ success: true, sessionId: sessionId, username: username });
  } else {
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
  const llistaPreguntes = preguntes.preguntes;
  const preguntesPartida = barrejarPreguntes(llistaPreguntes).slice(0, 10);
  if (sessionId && sessions.has(sessionId)) {
    sessions.get(sessionId).questions = preguntesPartida;
    console.log("Sesión guardada:", sessions.get(sessionId));
  }
  const preguntesClient = preguntesPartida.map(q => ({
    id: q.id,
    pregunta: q.pregunta,
    imatge: q.imatge,
    respostes: barrejarPreguntes([q.resposta_correcta, ...q.respostes_incorrectes])
  }));

  res.json({ preguntes: preguntesClient });
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

app.listen(port, () => {
  console.log(`Servidor escoltant a http://localhost:${port}`);
});