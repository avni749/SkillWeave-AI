import request from 'supertest';
import app from '../src/app.js'; // Assuming app is exported

describe('Health API', () => {
  it('should return 200 OK from the health check endpoint', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
});
