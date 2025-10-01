import request from 'supertest';
import { app } from './app';

describe('GET /', () => {
  it('should respond with a 200 status code and the welcome message', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Chronosense Dashboard API is running!',
    });
    expect(response.headers['content-type']).toMatch(/json/);
  });
});
