const request = require('supertest');

jest.mock('uuid', () => ({ v4: () => 'fixed-uuid' }));

const db = require('../config/db');

jest.mock('../config/db', () => ({
  query: jest.fn()
}));

const app = require('../app');

describe('Edge cases and validation tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /session without session-id returns loggedIn false', async () => {
    const res = await request(app).get('/session');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ loggedIn: false });
  });

  it('POST /login fails when required fields are missing', async () => {
    const res = await request(app).post('/login').send({ username: 'user' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Nom d'usuari i email requerits");
  });

  it('GET /preguntes returns an empty list when there are no questions', async () => {
    db.query.mockImplementation((query, params, callback) => {
      const cb = typeof params === 'function' ? params : callback;

      if (query.includes('SELECT * FROM preguntes ORDER BY RAND() LIMIT 10')) {
        return cb(null, []);
      }

      if (query.includes('SELECT * FROM respostes WHERE pregunta_id IN')) {
        return cb(null, []);
      }

      return cb(null, []);
    });

    const res = await request(app).get('/preguntes').set('session-id', 'missing-session');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ preguntes: [] });
  });

  it('POST /respostes fails when session-id is invalid', async () => {
    const res = await request(app)
      .post('/respostes')
      .set('session-id', 'unknown-session')
      .send({ respostes: { 1: 'A' }, temps: 10 });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Sessió no vàlida');
  });

  it('POST /api/preguntes rejects incomplete payloads as admin', async () => {
    const res = await request(app)
      .post('/api/preguntes')
      .set('x-admin-email', 'admin@gmail.com')
      .send({
        pregunta: 'Pregunta incompleta',
        resposta_correcta: 'A'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('Falten dades');
  });

  it('PUT /api/preguntes/:id rejects incomplete payloads as admin', async () => {
    const res = await request(app)
      .put('/api/preguntes/1')
      .set('x-admin-email', 'admin@gmail.com')
      .send({
        pregunta: 'Pregunta actualitzada',
        resposta_correcta: 'B'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('Falten dades');
  });

  it('GET /api/questions returns empty array when the database is empty', async () => {
    db.query.mockImplementation((query, params, callback) => {
      const cb = typeof params === 'function' ? params : callback;

      if (query.includes('SELECT * FROM preguntes ORDER BY id')) {
        return cb(null, []);
      }

      return cb(null, []);
    });

    const res = await request(app).get('/api/questions');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /api/preguntes accepts a JSON string array in respostes_incorrectes', async () => {
    db.query.mockImplementation((query, params, callback) => {
      const cb = typeof params === 'function' ? params : callback;

      if (query.startsWith('INSERT INTO preguntes')) {
        return cb(null);
      }

      if (query.startsWith('INSERT INTO respostes')) {
        return cb(null);
      }

      return cb(null, []);
    });

    const res = await request(app)
      .post('/api/preguntes')
      .set('x-admin-email', 'admin@gmail.com')
      .send({
        pregunta: 'Pregunta amb JSON',
        resposta_correcta: 'Correcta',
        respostes_incorrectes: '["Errada 1","Errada 2"]'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.question.respostes_incorrectes).toEqual(['Errada 1', 'Errada 2']);
  });

  it('DELETE /api/questions/:id returns 404 when the question does not exist', async () => {
    db.query.mockImplementation((query, params, callback) => {
      const cb = typeof params === 'function' ? params : callback;

      if (query.includes('SELECT imatge FROM preguntes WHERE id = ?')) {
        return cb(null, []);
      }

      return cb(null, []);
    });

    const res = await request(app)
      .delete('/api/questions/999')
      .set('x-admin-email', 'admin@gmail.com');

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Pregunta no trobada');
  });

  it('POST /api/preguntes rejects non-admin email even when body is valid', async () => {
    const res = await request(app)
      .post('/api/preguntes')
      .set('x-admin-email', 'user@gmail.com')
      .send({
        pregunta: 'Pregunta prohibida',
        resposta_correcta: 'A',
        respostes_incorrectes: ['B', 'C']
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toContain('No tens permisos d’administrador');
  });

  it('POST /api/preguntes accepts comma-separated strings in respostes_incorrectes', async () => {
    db.query.mockImplementation((query, params, callback) => {
      const cb = typeof params === 'function' ? params : callback;

      if (query.startsWith('INSERT INTO preguntes')) {
        return cb(null);
      }

      if (query.startsWith('INSERT INTO respostes')) {
        return cb(null);
      }

      return cb(null, []);
    });

    const res = await request(app)
      .post('/api/preguntes')
      .set('x-admin-email', 'admin@gmail.com')
      .send({
        pregunta: 'Pregunta amb coma',
        resposta_correcta: 'Correcta',
        respostes_incorrectes: 'Errada 1, Errada 2'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.question.respostes_incorrectes).toEqual(['Errada 1', 'Errada 2']);
  });

  it('POST /respostes rejects answers when the session has not started questions', async () => {
    const loginRes = await request(app).post('/login').send({ username: 'guest', email: 'guest@test.com' });
    const sessionId = loginRes.body.sessionId;

    const res = await request(app)
      .post('/respostes')
      .set('session-id', sessionId)
      .send({ respostes: { 1: 'A' }, temps: 5 });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('No hi ha preguntes iniciades per aquesta sessió');
  });
});
