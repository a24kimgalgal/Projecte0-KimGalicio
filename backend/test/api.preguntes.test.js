const request = require('supertest');

jest.mock('uuid', () => ({ v4: () => 'fixed-uuid' }));

jest.mock('../config/db', () => {
  return {
    query: jest.fn((query, params, callback) => {
      const cb = typeof params === 'function' ? params : callback;

      if (query.includes('SELECT * FROM preguntes') && (query.includes('ORDER BY id') || query.includes('ORDER BY RAND()'))) {
        cb(null, [{ id: 1, pregunta: 'Q1', imatge: null }]);
      } else if (query.includes('SELECT * FROM respostes')) {
        cb(null, [
          { pregunta_id: 1, resposta: 'A', es_correcta: true },
          { pregunta_id: 1, resposta: 'B', es_correcta: false }
        ]);
      } else if (query.startsWith('INSERT INTO preguntes')) {
        cb(null);
      } else if (query.startsWith('INSERT INTO respostes')) {
        cb(null);
      } else if (query.startsWith('UPDATE preguntes')) {
        const requestedId = Array.isArray(params) ? Number(params[2]) : null;
        cb(null, { affectedRows: requestedId === 999 ? 0 : 1 });
      } else if (query.startsWith('DELETE FROM preguntes')) {
        const requestedId = Array.isArray(params) ? Number(params[0]) : null;
        cb(null, { affectedRows: requestedId === 999 ? 0 : 1 });
      } else if (query.startsWith('DELETE FROM respostes')) {
        cb(null, { affectedRows: 2 });
      } else if (query.includes('SELECT imatge FROM preguntes')) {
        const requestedId = Array.isArray(params) ? Number(params[0]) : null;
        cb(null, requestedId === 999 ? [] : [{ imatge: null }]);
      } else {
        cb(null, []);
      }
    })
  };
});

const app = require('../app');

describe('API Preguntes endpoints', () => {
  it('POST /api/preguntes - unauthorized without admin header returns 403', async () => {
    const res = await request(app).post('/api/preguntes').send({ id: 1 });
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/preguntes - valid admin body returns success', async () => {
    const res = await request(app)
      .post('/api/preguntes')
      .set('x-admin-email', 'admin@gmail.com')
      .send({
        id: 2,
        pregunta: 'New?',
        imatge: null,
        resposta_correcta: 'A',
        respostes_incorrectes: ['B', 'C']
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('success', true);
  });

  it('GET /api/preguntes returns array', async () => {
    const res = await request(app).get('/api/preguntes');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('POST /api/preguntes generates IDs within MySQL signed INT range', async () => {
    const db = require('../config/db');
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(3_000_000_000_000);

    await request(app)
      .post('/api/preguntes')
      .set('x-admin-email', 'admin@gmail.com')
      .send({
        pregunta: 'Overflow?',
        imatge: null,
        resposta_correcta: 'A',
        respostes_incorrectes: ['B', 'C']
      });

    const insertCall = db.query.mock.calls.find(([sql]) => String(sql).startsWith('INSERT INTO preguntes'));
    const generatedId = Number(insertCall[1][0]);

    expect(generatedId).toBeLessThanOrEqual(2147483647);
    expect(generatedId).toBeGreaterThan(0);

    nowSpy.mockRestore();
  });

  it('PUT /api/preguntes/:id returns 404 when not found as admin', async () => {
    const res = await request(app)
      .put('/api/preguntes/999')
      .set('x-admin-email', 'admin@gmail.com')
      .send({ pregunta: 'x', imatge: null, resposta_correcta: 'A', respostes_incorrectes: ['B'] });

    expect(res.statusCode).toBe(404);
  });

  it('DELETE /api/preguntes/:id returns 404 when not found as admin', async () => {
    const res = await request(app).delete('/api/preguntes/999').set('x-admin-email', 'admin@gmail.com');
    expect(res.statusCode).toBe(404);
  });
});
