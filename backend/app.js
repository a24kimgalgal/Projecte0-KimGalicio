const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const port = 3022;

const preguntes = require('./preguntes.json');
const respostes = require('./respostes.json');

const sessions = new Map();

//TODO: Implementar un sistema de sessions més segur i persistent.
//TODO: Implementar una funció per barrejar les preguntes i respostes abans de servir-les al client.
//TODO: Fer q només siguin 10 preguntes per partida.

app.use(cors());  
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    const sessionId = uuidv4();
    sessions.set(sessionId, { username });

    res.json({ success: true, sessionId: sessionId });
  } else {
    res.status(400).json({ success: false, message: 'Nom d\'usuari i contrasenya requerits' });
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
  res.json(preguntes);
});

app.get('/respostes', (req, res) => {
  res.json(respostes);
});

app.listen(port, () => {
  console.log(`Servidor escoltant a http://localhost:${port}`);
});