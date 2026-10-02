const express = require('express');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const port = Number(process.argv[2]) || 40600;

const con = require('./config/db');

const sessions = new Map();
const frontendDir = path.join(__dirname, '../frontend');
const imagesDir = path.join(frontendDir, 'img');

fs.mkdirSync(imagesDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imagesDir),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, extension).replace(/\s+/g, '-').toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${baseName}-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Només es permeten imatges'));
    }
    cb(null, true);
  }
});

function isAdmin(req, res, next) {
  const adminEmail = String(req.headers['x-admin-email'] || '').trim().toLowerCase();

  if (adminEmail === 'admin@gmail.com') {
    return next();
  }

  return res.status(403).json({ error: 'No tens permisos d’administrador' });
}

function parseIncorrectAnswers(value) {
  if (Array.isArray(value)) {
    return value.map(item => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(item => String(item).trim()).filter(Boolean);
      }
    } catch (error) {
    }

    return value.split(',').map(item => item.trim()).filter(Boolean);
  }

  return [];
}

function getNextQuestionId(callback) {
  con.query('SELECT MAX(id) AS maxId FROM preguntes', (err, result) => {
    if (err) return callback(err);

    const currentMax = Number(result?.[0]?.maxId || 0);
    const nextId = currentMax > 0 ? currentMax + 11 : 11;
    callback(null, nextId);
  });
}

function deletePhysicalImage(imagePath) {
  if (!imagePath || !imagePath.startsWith('/img/')) return;

  const absolutePath = path.join(frontendDir, imagePath.replace(/^\/+/, ''));
  fs.unlink(absolutePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('No s’ha pogut eliminar la imatge:', err.message);
    }
  });
}

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
app.use(express.static(frontendDir));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/login', (req, res) => {
  const { username, email } = req.body;
  if (username && email) {
    const sessionId = uuidv4();
    sessions.set(sessionId, { username, email });

    res.json({ success: true, sessionId: sessionId, username: username });
  } else {
    console.log('Falten dades. Retornant 400 Sol·licitud incorrecta.');
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
        resposta_correcta: q.resposta_correcta,
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

function mapPreguntesAmbRespostes(resultPreguntes, resultRespostes) {
  return resultPreguntes.map((p) => {
    const resps = resultRespostes.filter((r) => r.pregunta_id === p.id);
    const correcta = resps.find((r) => r.es_correcta)?.resposta;
    const incorrectes = resps.filter((r) => !r.es_correcta).map((r) => r.resposta);

    return {
      id: p.id,
      pregunta: p.pregunta,
      imatge: p.imatge,
      resposta_correcta: correcta,
      respostes_incorrectes: incorrectes
    };
  });
}

function getQuestionsListFromDb(callback) {
  con.query("SELECT * FROM preguntes ORDER BY id", (err, resultPreguntes) => {
    if (err) return callback(err);
    if (!resultPreguntes.length) return callback(null, []);

    const ids = resultPreguntes.map((p) => p.id);
    con.query("SELECT * FROM respostes WHERE pregunta_id IN (?)", [ids], (errRespostes, resultRespostes) => {
      if (errRespostes) return callback(errRespostes);
      callback(null, mapPreguntesAmbRespostes(resultPreguntes, resultRespostes));
    });
  });
}

function crearPregunta(req, res) {
  const { id, pregunta, resposta_correcta } = req.body;
  const respostes_incorrectes = parseIncorrectAnswers(req.body.respostes_incorrectes);
  const providedId = Number(id);
  const imatge = req.file ? `/img/${req.file.filename}` : (req.body.imatge || null);

  if (!pregunta || !resposta_correcta || respostes_incorrectes.length === 0) {
    if (req.file) {
      deletePhysicalImage(`/img/${req.file.filename}`);
    }
    return res.status(400).json({ error: 'Falten dades: pregunta, resposta correcta i respostes incorrectes obligatòries' });
  }

  const finalId = Number.isInteger(providedId) && providedId > 0 ? providedId : null;

  if (finalId !== null) {
    return insertQuestion(finalId, pregunta, imatge, resposta_correcta, respostes_incorrectes, req, res);
  }

  getNextQuestionId((err, questionId) => {
    if (err) {
      if (req.file) {
        deletePhysicalImage(`/img/${req.file.filename}`);
      }
      return res.status(500).json({ error: 'Error a la base de dades en generar l’ID de la pregunta' });
    }

    insertQuestion(questionId, pregunta, imatge, resposta_correcta, respostes_incorrectes, req, res);
  });
}

function insertQuestion(questionId, pregunta, imatge, resposta_correcta, respostes_incorrectes, req, res) {
  con.query("INSERT INTO preguntes (id, pregunta, imatge) VALUES (?, ?, ?)", [questionId, pregunta, imatge], (err) => {
    if (err) {
      if (req.file) {
        deletePhysicalImage(`/img/${req.file.filename}`);
      }
      return res.status(500).json({ error: 'Error a la base de dades en inserir la pregunta' });
    }

    const sqlRespostes = "INSERT INTO respostes (pregunta_id, resposta, es_correcta) VALUES (?, ?, ?)";

    con.query(sqlRespostes, [questionId, resposta_correcta, true], (errCorrecta) => {
      if (errCorrecta) {
        return res.status(500).json({ error: 'Error a la base de dades en inserir la resposta correcta' });
      }

      respostes_incorrectes.forEach((resp) => {
        con.query(sqlRespostes, [questionId, resp, false], (errIncorrecte) => {
          if (errIncorrecte) console.error(errIncorrecte);
        });
      });

      res.status(201).json({
        success: true,
        message: 'Pregunta creada correctament',
        question: {
          id: questionId,
          pregunta,
          imatge,
          resposta_correcta,
          respostes_incorrectes
        }
      });
    });
  });
}

function actualitzarPregunta(req, res) {
  const id = Number(req.params.id);
  const { pregunta, resposta_correcta } = req.body;
  const respostes_incorrectes = parseIncorrectAnswers(req.body.respostes_incorrectes);

  if (!pregunta || !resposta_correcta || respostes_incorrectes.length === 0) {
    return res.status(400).json({ error: 'Falten dades: pregunta, resposta correcta i respostes incorrectes obligatòries' });
  }

  con.query("SELECT imatge FROM preguntes WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error a la base de dades' });
    if (!result.length) return res.status(404).json({ error: 'Pregunta no trobada' });

    const previousImage = result[0].imatge;
    const nextImageValue = req.body.imatge;
    const imagePath = req.file
      ? `/img/${req.file.filename}`
      : (nextImageValue !== undefined ? (nextImageValue === 'null' || nextImageValue === '' ? null : nextImageValue) : previousImage);

    con.query("UPDATE preguntes SET pregunta = ?, imatge = ? WHERE id = ?", [pregunta, imagePath, id], (errUpdate) => {
      if (errUpdate) {
        if (req.file) deletePhysicalImage(`/img/${req.file.filename}`);
        return res.status(500).json({ error: 'Error a la base de dades en actualizar la pregunta' });
      }

      con.query("DELETE FROM respostes WHERE pregunta_id = ?", [id], (errDelete) => {
        if (errDelete) {
          return res.status(500).json({ error: 'Error a la base de dades en eliminar respostes antigues' });
        }

        const sqlRespostes = "INSERT INTO respostes (pregunta_id, resposta, es_correcta) VALUES (?, ?, ?)";
        con.query(sqlRespostes, [id, resposta_correcta, true], (errCorrecta) => {
          if (errCorrecta) {
            return res.status(500).json({ error: 'Error a la base de dades en inserir la resposta correcta' });
          }

          respostes_incorrectes.forEach((resp) => {
            con.query(sqlRespostes, [id, resp, false], (errIncorrecte) => {
              if (errIncorrecte) console.error(errIncorrecte);
            });
          });

          if (req.file && previousImage && previousImage !== imagePath) {
            deletePhysicalImage(previousImage);
          }

          res.json({
            success: true,
            message: 'Pregunta actualitzada correctament',
            question: {
              id,
              pregunta,
              imatge: imagePath,
              resposta_correcta,
              respostes_incorrectes
            }
          });
        });
      });
    });
  });
}

function eliminarPregunta(req, res) {
  const id = Number(req.params.id);

  con.query("SELECT imatge FROM preguntes WHERE id = ?", [id], (errSelect, result) => {
    if (errSelect) return res.status(500).json({ error: 'Error a la base de dades' });
    if (!result.length) return res.status(404).json({ error: 'Pregunta no trobada' });

    const imageToDelete = result[0].imatge;
    con.query("DELETE FROM preguntes WHERE id = ?", [id], (errDelete) => {
      if (errDelete) return res.status(500).json({ error: 'Error a la base de dades en eliminar la pregunta' });
      if (imageToDelete) deletePhysicalImage(imageToDelete);
      res.json({ success: true, message: 'Pregunta eliminada correctament' });
    });
  });
}

app.get('/api/questions', (req, res) => {
  getQuestionsListFromDb((err, questions) => {
    if (err) return res.status(500).json({ error: 'Error a la base de dades' });
    res.json(questions);
  });
});

app.get('/api/preguntes', (req, res) => {
  getQuestionsListFromDb((err, questions) => {
    if (err) return res.status(500).json({ error: 'Error a la base de dades' });
    res.json(questions);
  });
});

app.post('/api/questions', isAdmin, upload.single('image'), crearPregunta);
app.post('/api/preguntes', isAdmin, upload.single('image'), crearPregunta);

app.put('/api/questions/:id', isAdmin, upload.single('image'), actualitzarPregunta);
app.put('/api/preguntes/:id', isAdmin, upload.single('image'), actualitzarPregunta);

app.delete('/api/questions/:id', isAdmin, eliminarPregunta);
app.delete('/api/preguntes/:id', isAdmin, eliminarPregunta);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Servidor escoltant a http://localhost:${port}`);
  });
}

module.exports = app;