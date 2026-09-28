const request = require('supertest');

jest.mock('uuid', () => ({ v4: () => 'fixed-uuid' }));

jest.mock('../config/db', () => {
  return {
    query: jest.fn((query, params, callback) => {
      const cb = typeof params === 'function' ? params : callback;
      if (query.includes('SELECT * FROM preguntes') && !query.includes('ORDER')) {
        cb(null, [{ id: 1, pregunta: 'Q1', imatge: null }]);
      } else if (query.startsWith('INSERT INTO preguntes')) {
        cb(null);
      } else if (query.startsWith('INSERT INTO respostes')) {
        cb(null);
      } else if (query.startsWith('UPDATE preguntes')) {
        cb(null, { affectedRows: 0 });
      } else if (query.startsWith('DELETE FROM preguntes')) {
        cb(null, { affectedRows: 0 });
      } else {
        cb(null, []);
      }
    })
  };
});

const app = require('../app');

describe('API Preguntes endpoints', () => {
  it('POST /api/preguntes - missing fields returns 400', async () => {
    const res = await request(app).post('/api/preguntes').send({ id: 1 });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/preguntes - valid body returns success', async () => {
    const res = await request(app).post('/api/preguntes').send({
      id: 2,
      pregunta: 'New?',
      imatge: null,
      resposta_correcta: 'A',
      respostes_incorrectes: ['B', 'C']
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('GET /api/preguntes returns array', async () => {
    const res = await request(app).get('/api/preguntes');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('PUT /api/preguntes/:id returns 404 when not found', async () => {
    const res = await request(app).put('/api/preguntes/999').send({ pregunta: 'x', imatge: null });
    expect(res.statusCode).toBe(404);
  });

  it('DELETE /api/preguntes/:id returns 404 when not found', async () => {
    const res = await request(app).delete('/api/preguntes/999');
    expect(res.statusCode).toBe(404);
  });
});
