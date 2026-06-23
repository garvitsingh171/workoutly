const mongoose = require('mongoose');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-12345678901234567890';
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
process.env.MONGO_URI_TEST =
  process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/workoutly_test';
process.env.MONGODB_URI_TEST = process.env.MONGODB_URI_TEST || process.env.MONGO_URI_TEST;

const app = require('../app');
const User = require('../src/models/User');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth Routes', () => {
  test('should register a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', 'testuser@example.com');
  });

  test('should fail to register with an existing email', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'password123',
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Another User',
      email: 'existing@example.com',
      password: 'differentpassword',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('already exists');
  });

  test('should fail to register with missing required fields', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Incomplete User',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('should log in with correct credentials', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login Test User',
      email: 'login@example.com',
      password: 'password123',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
  });

  test('should fail to log in with wrong password', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Password Test User',
      email: 'wrongpass@example.com',
      password: 'correctpassword',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'wrongpass@example.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });
});

describe('User Routes', () => {
  const registerTestUser = async (email) => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Route Test User',
      email,
      password: 'password123',
    });

    return {
      token: res.body.token,
      userId: res.body.user._id,
    };
  };

  test('should not allow authenticated users to list all users', async () => {
    const user = await registerTestUser('list-blocked@example.com');

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
  });

  test('should allow users to view only their own profile', async () => {
    const firstUser = await registerTestUser('owner@example.com');
    const secondUser = await registerTestUser('other@example.com');

    const ownProfile = await request(app)
      .get(`/api/users/${firstUser.userId}`)
      .set('Authorization', `Bearer ${firstUser.token}`);

    expect(ownProfile.status).toBe(200);
    expect(ownProfile.body.data).toHaveProperty('email', 'owner@example.com');

    const otherProfile = await request(app)
      .get(`/api/users/${secondUser.userId}`)
      .set('Authorization', `Bearer ${firstUser.token}`);

    expect(otherProfile.status).toBe(403);
    expect(otherProfile.body).toHaveProperty('success', false);
  });

  test('should protect profile updates and deletes by ownership', async () => {
    const firstUser = await registerTestUser('profile-owner@example.com');
    const secondUser = await registerTestUser('profile-other@example.com');

    const updateRes = await request(app)
      .put(`/api/users/${secondUser.userId}`)
      .set('Authorization', `Bearer ${firstUser.token}`)
      .send({ name: 'Unauthorized Update' });

    expect(updateRes.status).toBe(403);

    const deleteRes = await request(app)
      .delete(`/api/users/${secondUser.userId}`)
      .set('Authorization', `Bearer ${firstUser.token}`);

    expect(deleteRes.status).toBe(403);
  });
});
