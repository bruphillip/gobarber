import request from 'supertest';
import app from '../../src/App';

import truncate from '../util/truncate';

import factory from '../factories';

describe('User', () => {
  beforeAll(async () => {
    await truncate();
    factory.cleanUp();
  });

  it('should be able to register an user', async () => {
    const user = await factory.attrs('User');

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.body).toHaveProperty('id');
  });

  it("shouldn't be able to register duplicated users", async () => {
    const user = await factory.attrs('User');

    await request(app)
      .post('/users')
      .send(user);

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });

  it('user should have password cryped', async () => {
    const user = await factory.create('User', {
      password: '123456',
    });

    const comparison = await user.checkPassoword('123456');

    expect(comparison).toBe(true);
  });

  it('should not be able user request with invalid body', async () => {
    const user = await factory.attrs('User', {
      email: 123456,
    });

    const response = await request(app)
      .put('/users')
      .send(user);

    expect(response.status).toBe(400);
  });

  it('not possible user change his informations with wrong credentials', async () => {
    const { email, password } = await factory.create('User', {}, {});

    const authUser = await request(app)
      .post('/sessions')
      .send({
        email,
        password,
      });

    const { token } = authUser.body;

    const updateUser = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email,
        oldPassword: password,
        confirmPassword: '123456',
      });

    expect(updateUser.status).toBe(400);
    expect(updateUser.body).toMatchObject({ error: 'Validation fails' });
  });

  it('not possible user change his informations with wrong password', async () => {
    const { email, password } = await factory.create('User');

    const authUser = await request(app)
      .post('/sessions')
      .send({
        email,
        password,
      });

    const { token } = authUser.body;

    const updateUser = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email,
        oldPassword: '123456',
        confirmPassword: '123456',
        password: '123456',
      });

    expect(updateUser.status).toBe(401);
    expect(updateUser.body).toMatchObject({ error: "Password doesn't match" });
  });

  it('not possible user change his informations with duplated email', async () => {
    const users = [];
    users[0] = await factory.create('User');
    users[1] = await factory.create('User', {
      email: 'teste@email.com',
    });

    const authUser = await request(app)
      .post('/sessions')
      .send({
        email: users[0].email,
        password: users[0].password,
      });

    const { token } = authUser.body;

    const updateUser = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: users[1].email,
        oldPassword: users[0].password,
        confirmPassword: '123456',
        password: '123456',
      });

    expect(updateUser.status).toBe(400);
    expect(updateUser.body).toMatchObject({ error: 'User already exists' });
  });

  it('possible user change his informations', async () => {
    const user = await factory.create('User');

    const authUser = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: user.password,
      });

    const { token } = authUser.body;

    const updateUser = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Demo Name',
        email: 'demo@test.com.br',
        oldPassword: user.password,
        confirmPassword: '123456',
        password: '123456',
        provider: true,
      });

    expect(updateUser.status).toBe(200);
    expect(updateUser.body).toHaveProperty('email');
  });
});
