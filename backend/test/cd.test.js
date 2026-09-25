const request = require('supertest');

jest.mock('uuid', () => ({
  v4: () => '12345678-1234-1234-1234-123456789012'
}));


jest.mock('../config/db', () => {
  return {
    query: jest.fn((query, params, callback) => {
      let cb = typeof params === 'function' ? params : callback;
      
      if (query.includes('SELECT * FROM preguntes')) {
        cb(null, [{ id: 1, pregunta: 'Quant és 2+2?', imatge: null }]);
      } else if (query.includes('SELECT * FROM respostes')) {
        cb(null, [
          { pregunta_id: 1, resposta: '4', es_correcta: 1 },
          { pregunta_id: 1, resposta: '3', es_correcta: 0 },
          { pregunta_id: 1, resposta: '5', es_correcta: 0 }
        ]);
      } else {
        cb(null, []);
      }
    })
  };
});

const app = require('../app');

describe('CD Tests - Production Readiness', () => {
  let sessionId = '';

  it('hauria de fer login correctament i guardar un sessionId', async () => {
    const res = await request(app).post('/login').send({ username: 'testuser', email: 'test@test.com' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.sessionId).toBeDefined();
    
    sessionId = res.body.sessionId;
  });

  it('hauria de poder obtenir una sessió vàlida amb el sessionId', async () => {
    const res = await request(app).get('/session').set('session-id', sessionId);
    expect(res.statusCode).toEqual(200);
    expect(res.body.loggedIn).toBe(true);
    expect(res.body.username).toBe('testuser');
  });

  it('hauria de poder demanar preguntes', async () => {
    const res = await request(app).get('/preguntes').set('session-id', sessionId);
    expect(res.statusCode).toEqual(200);
    expect(res.body.preguntes).toBeDefined();
    expect(res.body.preguntes.length).toBeGreaterThan(0);
    
    const primeraPregunta = res.body.preguntes[0];
    expect(primeraPregunta).toHaveProperty('id');
    expect(primeraPregunta).toHaveProperty('pregunta');
    expect(primeraPregunta).toHaveProperty('respostes');
    expect(primeraPregunta.respostes.length).toBe(3);
  });

  it('hauria de processar correctament una resposta enviada', async () => {
    const res = await request(app).post('/respostes').set('session-id', sessionId).send({
      respostes: {
        '1': '4'
      },
      temps: 10
    });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.encerts).toBe(1);
    expect(res.body.total).toBe(1);
  });
});
