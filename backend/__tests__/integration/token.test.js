import request from 'supertest';

import app from '../../src/App';
import factory from '../factories';

describe('Token', () => {
  it('should receive an error message without token', async () => {
    const user = await factory.attrs('User');
    const withoutToken = await request(app)
      .put('/users')
      .send(user);

    expect(withoutToken.status).toBe(401);
    expect(withoutToken.body).toMatchObject({ error: 'Token not provided' });
  });

  it('should return a message token error', async () => {
    const user = await factory.attrs('User');
    const withoutToken = await request(app)
      .put('/users')
      .set('Authorization', 'Bearer 123456789')
      .send(user);

    expect(withoutToken.status).toBe(401);
    expect(withoutToken.body).toMatchObject({ error: 'Token invalid' });
  });
});
