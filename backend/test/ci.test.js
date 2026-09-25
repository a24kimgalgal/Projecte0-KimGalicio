const request = require('supertest');

jest.mock('uuid', () => ({
  v4: () => '12345678-1234-1234-1234-123456789012'
}));


jest.mock('../config/db', () => {
  return {
    query: jest.fn((query, params, callback) => {
      if (typeof params === 'function') {
        params(null, []);
      } else if (typeof callback === 'function') {
        callback(null, []);
      }
    })
  };
});

const app = require('../app');

describe('CI Tests - Sanity Checks', () => {
  it('hauria de retornar { loggedIn: false } quan no hi ha sessió', async () => {
    const res = await request(app).get('/session');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('loggedIn', false);
  });

  it('hauria de donar error de "Falten dades" al login sense cos sencer', async () => {
    const res = await request(app).post('/login').send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success', false);
  });
});
