import request from 'supertest';
import app from '../../src/App';

import truncate from '../util/truncate';

import factory from '../factories';

describe('Session', () => {
  beforeAll(async () => {
    await truncate();
    factory.cleanUp();
  });

  it("shouldnt't be able authenticate without user registered", async () => {
    const authUser = await request(app)
      .post('/sessions')
      .send({
        email: 'cleiton',
        password: 'cleiton123',
      });

    expect(authUser.status).toBe(401);
    expect(authUser.body).toMatchObject({ error: 'User not found' });
  });

  it("shouldnt't be able authenticate with wrong password", async () => {
    const { email } = await factory.create('User');

    const authUser = await request(app)
      .post('/sessions')
      .send({
        email,
        password: '',
      });

    expect(authUser.status).toBe(401);
    expect(authUser.body).toMatchObject({ error: 'Password does not match' });
  });

  it('should be able to authenticate on application', async () => {
    const { email, password } = await factory.create('User', {}, {});

    const authUser = await request(app)
      .post('/sessions')
      .send({
        email,
        password,
      });

    expect(authUser.body).toHaveProperty('token');
  });
});
