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

describe('Auth Routes', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST);
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

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