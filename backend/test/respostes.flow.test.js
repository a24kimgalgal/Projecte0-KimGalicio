const request = require('supertest');

jest.mock('uuid', () => ({ v4: () => 'flow-uuid' }));

jest.mock('../config/db', () => {
  return {
    query: jest.fn((query, params, callback) => {
      const cb = typeof params === 'function' ? params : callback;
      if (query.includes('SELECT * FROM preguntes')) {
        cb(null, [{ id: 1, pregunta: '2+2?', imatge: null }]);
      } else if (query.includes('SELECT * FROM respostes')) {
        cb(null, [
          { pregunta_id: 1, resposta: '4', es_correcta: 1 },
          { pregunta_id: 1, resposta: '3', es_correcta: 0 }
        ]);
      } else {
        cb(null, []);
      }
    })
  };
});

const app = require('../app');

describe('Respostes flow', () => {
  it('login -> preguntes -> respostes flow returns score', async () => {
    const login = await request(app).post('/login').send({ username: 'u', email: 'e@e' });
    expect(login.statusCode).toBe(200);
    const sid = login.body.sessionId;

    const preg = await request(app).get('/preguntes').set('session-id', sid);
    expect(preg.statusCode).toBe(200);
    expect(preg.body.preguntes.length).toBeGreaterThan(0);

    const res = await request(app).post('/respostes').set('session-id', sid).send({ respostes: { '1': '4' }, temps: 5 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('encerts');
    expect(res.body.encerts).toBeGreaterThanOrEqual(0);
  });
});
