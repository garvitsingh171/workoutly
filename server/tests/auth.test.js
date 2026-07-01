const mongoose = require('mongoose');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-12345678901234567890';
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-12345678901234567890';
process.env.JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';
process.env.MONGO_URI_TEST =
  process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/workoutly_test';
process.env.MONGODB_URI_TEST = process.env.MONGODB_URI_TEST || process.env.MONGO_URI_TEST;

const app = require('../app');
const User = require('../src/models/User');
const Workout = require('../src/models/Workout');
const WorkoutSession = require('../src/models/WorkoutSession');
const PersonalRecord = require('../src/models/PersonalRecord');
const Exercise = require('../src/models/Exercise');
const Goal = require('../src/models/Goal');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);
});

afterEach(async () => {
  await PersonalRecord.deleteMany({});
  await Exercise.deleteMany({});
  await Goal.deleteMany({});
  await WorkoutSession.deleteMany({});
  await Workout.deleteMany({});
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

const validWorkoutPayload = (name = 'Push Day') => ({
  name,
  duration: 45,
  difficulty: 'beginner',
  notes: 'Simple strength workout',
  coverImage: null,
  exercises: [
    {
      name: 'Push Ups',
      sets: 3,
      reps: 12,
    },
  ],
});

const validSessionPayload = (workoutId, completedAt = new Date()) => {
  const startedAt = new Date(completedAt.getTime() - 30 * 60 * 1000);

  return {
    workout: workoutId,
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    durationMinutes: 30,
    exercises: [
      {
        name: 'Push Ups',
        sets: [
          {
            setNumber: 1,
            targetReps: 12,
            actualReps: 10,
            weight: 5,
            completed: true,
          },
          {
            setNumber: 2,
            targetReps: 12,
            actualReps: 8,
            weight: 10,
            completed: true,
          },
          {
            setNumber: 3,
            targetReps: 12,
            actualReps: 6,
            weight: 20,
            completed: false,
          },
        ],
      },
    ],
  };
};

const registerTestUser = async (email = 'testuser@example.com') => {
  const res = await request(app).post('/api/auth/register').send({
    name: 'Test User',
    email,
    password: 'password123',
  });

  return {
    token: res.body.token,
    user: res.body.user,
  };
};

const createWorkoutForUser = async (user, name = 'Push Day') => {
  return request(app)
    .post('/api/workouts')
    .set('Authorization', `Bearer ${user.token}`)
    .send(validWorkoutPayload(name));
};

describe('Auth Routes', () => {
  test('should register a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('data');
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
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.message).toContain('already exists');
  });

  test('should fail to register with missing required fields', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Incomplete User',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message');
  });

  test('should log in with correct credentials and set refresh cookie', async () => {
    await registerTestUser('login@example.com');

    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'password123',
    });

    const cookies = res.headers['set-cookie'] || [];

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user).toHaveProperty('_id');
    expect(res.body.user).toHaveProperty('email', 'login@example.com');
    expect(cookies.some((cookie) => cookie.startsWith('refreshToken='))).toBe(true);
    expect(cookies.some((cookie) => cookie.includes('HttpOnly'))).toBe(true);
  });

  test('should log in even when refresh token secret is not configured', async () => {
    await registerTestUser('login-no-refresh@example.com');
    const originalRefreshSecret = process.env.JWT_REFRESH_SECRET;
    delete process.env.JWT_REFRESH_SECRET;

    const res = await request(app).post('/api/auth/login').send({
      email: 'login-no-refresh@example.com',
      password: 'password123',
    });

    process.env.JWT_REFRESH_SECRET = originalRefreshSecret;

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.headers['set-cookie'] || []).toHaveLength(0);
  });

  test('should fail to log in with wrong password', async () => {
    await registerTestUser('wrongpass@example.com');

    const res = await request(app).post('/api/auth/login').send({
      email: 'wrongpass@example.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message');
  });

  test('should fail to refresh without cookie', async () => {
    const res = await request(app).post('/api/auth/refresh');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success', false);
  });

  test('should refresh access token with valid refresh cookie', async () => {
    await registerTestUser('refresh@example.com');

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'refresh@example.com',
      password: 'password123',
    });

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', loginRes.headers['set-cookie']);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
  });

  test('should clear refresh cookie on logout', async () => {
    const res = await request(app).post('/api/auth/logout');
    const cookies = res.headers['set-cookie'] || [];

    expect(res.status).toBe(200);
    expect(cookies.some((cookie) => cookie.startsWith('refreshToken='))).toBe(true);
    expect(cookies.some((cookie) => cookie.includes('Expires=Thu, 01 Jan 1970'))).toBe(true);
  });
});

describe('User Routes', () => {
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
      .get(`/api/users/${firstUser.user._id}`)
      .set('Authorization', `Bearer ${firstUser.token}`);

    expect(ownProfile.status).toBe(200);
    expect(ownProfile.body.data).toHaveProperty('email', 'owner@example.com');

    const otherProfile = await request(app)
      .get(`/api/users/${secondUser.user._id}`)
      .set('Authorization', `Bearer ${firstUser.token}`);

    expect(otherProfile.status).toBe(403);
    expect(otherProfile.body).toHaveProperty('success', false);
  });

  test('should protect profile updates and deletes by ownership', async () => {
    const firstUser = await registerTestUser('profile-owner@example.com');
    const secondUser = await registerTestUser('profile-other@example.com');

    const updateRes = await request(app)
      .put(`/api/users/${secondUser.user._id}`)
      .set('Authorization', `Bearer ${firstUser.token}`)
      .send({ name: 'Unauthorized Update' });

    expect(updateRes.status).toBe(403);

    const deleteRes = await request(app)
      .delete(`/api/users/${secondUser.user._id}`)
      .set('Authorization', `Bearer ${firstUser.token}`);

    expect(deleteRes.status).toBe(403);
  });
});

describe('Workout Routes', () => {
  test('should create a workout with a valid token', async () => {
    const user = await registerTestUser('workout-create@example.com');

    const res = await request(app)
      .post('/api/workouts')
      .set('Authorization', `Bearer ${user.token}`)
      .send(validWorkoutPayload());

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('name', 'Push Day');
    expect(res.body.data).toHaveProperty('author');
  });

  test('should reject an invalid workout payload', async () => {
    const user = await registerTestUser('workout-invalid@example.com');

    const res = await request(app)
      .post('/api/workouts')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: '',
        duration: 0,
        exercises: [],
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('success', false);
  });

  test('should list only the current user workouts', async () => {
    const firstUser = await registerTestUser('workout-owner@example.com');
    const secondUser = await registerTestUser('workout-other@example.com');

    await request(app)
      .post('/api/workouts')
      .set('Authorization', `Bearer ${firstUser.token}`)
      .send(validWorkoutPayload('Owner Workout'));

    await request(app)
      .post('/api/workouts')
      .set('Authorization', `Bearer ${secondUser.token}`)
      .send(validWorkoutPayload('Other Workout'));

    const res = await request(app)
      .get('/api/workouts?page=1&limit=10')
      .set('Authorization', `Bearer ${firstUser.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toHaveProperty('name', 'Owner Workout');
    expect(res.body).toHaveProperty('pagination');
  });

  test('should reject accessing another user workout', async () => {
    const firstUser = await registerTestUser('workout-viewer@example.com');
    const secondUser = await registerTestUser('workout-owner-2@example.com');

    const createRes = await request(app)
      .post('/api/workouts')
      .set('Authorization', `Bearer ${secondUser.token}`)
      .send(validWorkoutPayload('Private Workout'));

    const res = await request(app)
      .get(`/api/workouts/${createRes.body.data._id}`)
      .set('Authorization', `Bearer ${firstUser.token}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('success', false);
  });

  test('should update own workout', async () => {
    const user = await registerTestUser('workout-update@example.com');

    const createRes = await request(app)
      .post('/api/workouts')
      .set('Authorization', `Bearer ${user.token}`)
      .send(validWorkoutPayload('Before Update'));

    const res = await request(app)
      .put(`/api/workouts/${createRes.body.data._id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send(validWorkoutPayload('After Update'));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('name', 'After Update');
  });

  test('should delete own workout', async () => {
    const user = await registerTestUser('workout-delete@example.com');

    const createRes = await request(app)
      .post('/api/workouts')
      .set('Authorization', `Bearer ${user.token}`)
      .send(validWorkoutPayload('Delete Me'));

    const res = await request(app)
      .delete(`/api/workouts/${createRes.body.data._id}`)
      .set('Authorization', `Bearer ${user.token}`);

    const listRes = await request(app)
      .get('/api/workouts')
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('id', createRes.body.data._id);
    expect(listRes.body.data).toHaveLength(0);
  });

  test('should duplicate own workout', async () => {
    const user = await registerTestUser('workout-duplicate@example.com');
    const createRes = await createWorkoutForUser(user, 'Duplicate Me');

    const res = await request(app)
      .post(`/api/workouts/${createRes.body.data._id}/duplicate`)
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('name', 'Duplicate Me Copy');
    expect(res.body.data).toHaveProperty('author');
    expect(res.body.data._id).not.toBe(createRes.body.data._id);
  });

  test('should keep duplicated workout names within the max length', async () => {
    const user = await registerTestUser('workout-duplicate-long@example.com');
    const longWorkoutName = 'A'.repeat(100);
    const createRes = await createWorkoutForUser(user, longWorkoutName);

    const res = await request(app)
      .post(`/api/workouts/${createRes.body.data._id}/duplicate`)
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.status).toBe(201);
    expect(res.body.data.name).toHaveLength(100);
    expect(res.body.data.name.endsWith(' Copy')).toBe(true);
  });

  test('should not duplicate another user workout', async () => {
    const firstUser = await registerTestUser('workout-duplicate-blocked@example.com');
    const secondUser = await registerTestUser('workout-duplicate-owner@example.com');
    const createRes = await createWorkoutForUser(secondUser, 'Private Duplicate');

    const res = await request(app)
      .post(`/api/workouts/${createRes.body.data._id}/duplicate`)
      .set('Authorization', `Bearer ${firstUser.token}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('success', false);
  });
});

describe('Workout Session Routes', () => {
  test('should not create a session without a token', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .send(validSessionPayload(new mongoose.Types.ObjectId().toString()));

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success', false);
  });

  test('should create a session for own workout', async () => {
    const user = await registerTestUser('session-create@example.com');
    const workoutRes = await createWorkoutForUser(user, 'Session Workout');

    const res = await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${user.token}`)
      .send(validSessionPayload(workoutRes.body.data._id));

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('workoutName', 'Session Workout');
    expect(res.body.data).toHaveProperty('totalCompletedSets', 2);
    expect(res.body.data).toHaveProperty('totalVolume', 130);
  });

  test('should not create a session for another user workout', async () => {
    const firstUser = await registerTestUser('session-blocked@example.com');
    const secondUser = await registerTestUser('session-owner@example.com');
    const workoutRes = await createWorkoutForUser(secondUser, 'Private Session Workout');

    const res = await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${firstUser.token}`)
      .send(validSessionPayload(workoutRes.body.data._id));

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('success', false);
  });

  test('should list only current user sessions', async () => {
    const firstUser = await registerTestUser('session-list-owner@example.com');
    const secondUser = await registerTestUser('session-list-other@example.com');
    const firstWorkoutRes = await createWorkoutForUser(firstUser, 'Owner Session');
    const secondWorkoutRes = await createWorkoutForUser(secondUser, 'Other Session');

    await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${firstUser.token}`)
      .send(validSessionPayload(firstWorkoutRes.body.data._id));

    await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${secondUser.token}`)
      .send(validSessionPayload(secondWorkoutRes.body.data._id));

    const res = await request(app)
      .get('/api/sessions?page=1&limit=10')
      .set('Authorization', `Bearer ${firstUser.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toHaveProperty('workoutName', 'Owner Session');
    expect(res.body).toHaveProperty('pagination');
  });

  test('should require auth for session history', async () => {
    const res = await request(app).get('/api/sessions');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success', false);
  });

  test('should filter session history by date and workout name', async () => {
    const user = await registerTestUser('session-filter@example.com');
    const pushWorkoutRes = await createWorkoutForUser(user, 'Push History');
    const pullWorkoutRes = await createWorkoutForUser(user, 'Pull History');

    await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${user.token}`)
      .send(validSessionPayload(pushWorkoutRes.body.data._id, new Date('2026-07-01T10:00:00.000Z')));

    await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${user.token}`)
      .send(validSessionPayload(pullWorkoutRes.body.data._id, new Date('2026-07-03T10:00:00.000Z')));

    const dateRes = await request(app)
      .get('/api/sessions?from=2026-07-02&to=2026-07-04')
      .set('Authorization', `Bearer ${user.token}`);

    const nameRes = await request(app)
      .get('/api/sessions?workoutName=push')
      .set('Authorization', `Bearer ${user.token}`);

    expect(dateRes.status).toBe(200);
    expect(dateRes.body.data).toHaveLength(1);
    expect(dateRes.body.data[0]).toHaveProperty('workoutName', 'Pull History');
    expect(nameRes.status).toBe(200);
    expect(nameRes.body.data).toHaveLength(1);
    expect(nameRes.body.data[0]).toHaveProperty('workoutName', 'Push History');
  });

  test('should reject invalid session history date filters', async () => {
    const user = await registerTestUser('session-filter-invalid@example.com');

    const res = await request(app)
      .get('/api/sessions?from=bad-date')
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.message).toContain('YYYY-MM-DD');
  });

  test('should group calendar sessions by date for current user only', async () => {
    const firstUser = await registerTestUser('calendar-owner@example.com');
    const secondUser = await registerTestUser('calendar-other@example.com');
    const firstWorkoutRes = await createWorkoutForUser(firstUser, 'Calendar Owner');
    const secondWorkoutRes = await createWorkoutForUser(secondUser, 'Calendar Other');
    const trainedDate = new Date('2026-07-01T10:00:00.000Z');

    await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${firstUser.token}`)
      .send(validSessionPayload(firstWorkoutRes.body.data._id, trainedDate));

    await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${firstUser.token}`)
      .send(validSessionPayload(firstWorkoutRes.body.data._id, trainedDate));

    await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${secondUser.token}`)
      .send(validSessionPayload(secondWorkoutRes.body.data._id, trainedDate));

    const res = await request(app)
      .get('/api/sessions/calendar?month=2026-07')
      .set('Authorization', `Bearer ${firstUser.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toEqual({
      date: '2026-07-01',
      sessionCount: 2,
      totalVolume: 260,
      totalCompletedSets: 4,
    });
  });

  test('should require auth for CSV export', async () => {
    const res = await request(app).get('/api/sessions/export.csv');

    expect(res.status).toBe(401);
  });

  test('should export current user sessions as CSV rows per set', async () => {
    const firstUser = await registerTestUser('csv-owner@example.com');
    const secondUser = await registerTestUser('csv-other@example.com');
    const firstWorkoutRes = await createWorkoutForUser(firstUser, 'CSV Owner');
    const secondWorkoutRes = await createWorkoutForUser(secondUser, 'CSV Other');
    const payload = validSessionPayload(firstWorkoutRes.body.data._id, new Date('2026-07-01T10:00:00.000Z'));
    payload.exercises[0].sets = payload.exercises[0].sets.slice(0, 2);

    await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${firstUser.token}`)
      .send(payload);

    await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${secondUser.token}`)
      .send(validSessionPayload(secondWorkoutRes.body.data._id, new Date('2026-07-01T10:00:00.000Z')));

    const res = await request(app)
      .get('/api/sessions/export.csv')
      .set('Authorization', `Bearer ${firstUser.token}`);

    const rows = res.text.trim().split('\n');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(rows[0]).toBe(
      'sessionId,workoutName,completedAt,durationMinutes,exerciseName,setNumber,targetReps,actualReps,weight,completed,totalVolume'
    );
    expect(rows).toHaveLength(3);
    expect(res.text).toContain('CSV Owner');
    expect(res.text).not.toContain('CSV Other');
  });

  test('should return real summary totals', async () => {
    const user = await registerTestUser('session-summary@example.com');
    const workoutRes = await createWorkoutForUser(user, 'Summary Session');

    await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${user.token}`)
      .send(validSessionPayload(workoutRes.body.data._id));

    await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${user.token}`)
      .send(validSessionPayload(workoutRes.body.data._id));

    const res = await request(app)
      .get('/api/sessions/summary')
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('totalSessions', 2);
    expect(res.body.data).toHaveProperty('totalCompletedSets', 4);
    expect(res.body.data).toHaveProperty('totalVolume', 260);
    expect(res.body.data).toHaveProperty('sessionsThisWeek');
    expect(res.body.data).toHaveProperty('latestSession');
  });

  test('should require auth for exercise progress', async () => {
    const res = await request(app).get('/api/sessions/progress?exerciseName=Push%20Ups');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success', false);
  });

  test('should return progress for selected exercise sorted by completion date', async () => {
    const user = await registerTestUser('progress-selected@example.com');
    const workoutRes = await createWorkoutForUser(user, 'Progress Workout');
    const laterDate = new Date('2026-07-02T10:00:00.000Z');
    const earlierDate = new Date('2026-07-01T10:00:00.000Z');

    await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${user.token}`)
      .send(validSessionPayload(workoutRes.body.data._id, laterDate));

    await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${user.token}`)
      .send(validSessionPayload(workoutRes.body.data._id, earlierDate));

    const res = await request(app)
      .get('/api/sessions/progress?exerciseName=push%20ups')
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0]).toHaveProperty('completedAt', earlierDate.toISOString());
    expect(res.body.data[0]).toHaveProperty('workoutName', 'Progress Workout');
    expect(res.body.data[0]).toHaveProperty('bestWeight', 10);
    expect(res.body.data[0]).toHaveProperty('bestReps', 10);
    expect(res.body.data[0]).toHaveProperty('totalVolume', 130);
    expect(res.body.data[0]).toHaveProperty('completedSets', 2);
  });

  test('should return only current user progress data', async () => {
    const firstUser = await registerTestUser('progress-owner@example.com');
    const secondUser = await registerTestUser('progress-other@example.com');
    const firstWorkoutRes = await createWorkoutForUser(firstUser, 'Owner Progress');
    const secondWorkoutRes = await createWorkoutForUser(secondUser, 'Other Progress');

    await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${firstUser.token}`)
      .send(validSessionPayload(firstWorkoutRes.body.data._id));

    await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${secondUser.token}`)
      .send(validSessionPayload(secondWorkoutRes.body.data._id));

    const res = await request(app)
      .get('/api/sessions/progress?exerciseName=Push%20Ups')
      .set('Authorization', `Bearer ${firstUser.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toHaveProperty('workoutName', 'Owner Progress');
  });

  test('should return an empty progress array when no data exists', async () => {
    const user = await registerTestUser('progress-empty@example.com');

    const res = await request(app)
      .get('/api/sessions/progress?exerciseName=Bench%20Press')
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toEqual([]);
  });
});

describe('Goal Routes', () => {
  test('should require auth for current goal', async () => {
    const res = await request(app).get('/api/goals/current');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success', false);
  });

  test('should return a default current goal when none exists', async () => {
    const user = await registerTestUser('goal-current@example.com');

    const res = await request(app)
      .get('/api/goals/current')
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('weeklyWorkoutTarget', 3);
    expect(res.body.data).toHaveProperty('isActive', true);
  });

  test('should update the weekly workout target', async () => {
    const user = await registerTestUser('goal-update@example.com');

    const res = await request(app)
      .put('/api/goals/current')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ weeklyWorkoutTarget: 5 });

    const currentRes = await request(app)
      .get('/api/goals/current')
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('weeklyWorkoutTarget', 5);
    expect(currentRes.body.data).toHaveProperty('weeklyWorkoutTarget', 5);
  });

  test('should reject invalid weekly workout targets', async () => {
    const user = await registerTestUser('goal-invalid@example.com');

    const res = await request(app)
      .put('/api/goals/current')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ weeklyWorkoutTarget: 15 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.message).toContain('between 1 and 14');
  });

  test('should return goal summary with weekly sessions and streak fields', async () => {
    const user = await registerTestUser('goal-summary@example.com');
    const workoutRes = await createWorkoutForUser(user, 'Goal Summary Workout');
    const today = new Date();
    today.setHours(10, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await request(app)
      .put('/api/goals/current')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ weeklyWorkoutTarget: 4 });

    await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${user.token}`)
      .send(validSessionPayload(workoutRes.body.data._id, yesterday));

    await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${user.token}`)
      .send(validSessionPayload(workoutRes.body.data._id, today));

    const res = await request(app)
      .get('/api/goals/summary')
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('weeklyWorkoutTarget', 4);
    expect(res.body.data).toHaveProperty('sessionsThisWeek');
    expect(res.body.data.sessionsThisWeek).toBeGreaterThanOrEqual(1);
    expect(res.body.data).toHaveProperty('remainingThisWeek');
    expect(res.body.data).toHaveProperty('weeklyProgressPercent');
    expect(res.body.data).toHaveProperty('currentStreakDays');
    expect(res.body.data).toHaveProperty('longestStreakDays');
    expect(res.body.data.currentStreakDays).toBeGreaterThanOrEqual(1);
  });
});

describe('Personal Record Routes', () => {
  test('should create personal records after saving a session', async () => {
    const user = await registerTestUser('records-create@example.com');
    const workoutRes = await createWorkoutForUser(user, 'Record Workout');

    const sessionRes = await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${user.token}`)
      .send(validSessionPayload(workoutRes.body.data._id));

    const recordsRes = await request(app)
      .get('/api/records')
      .set('Authorization', `Bearer ${user.token}`);

    expect(sessionRes.status).toBe(201);
    expect(sessionRes.body.newRecords).toHaveLength(3);
    expect(recordsRes.status).toBe(200);
    expect(recordsRes.body.data).toHaveLength(3);
    expect(recordsRes.body.data.map((record) => record.recordType).sort()).toEqual([
      'max_reps',
      'max_volume',
      'max_weight',
    ]);
  });

  test('should update records only when the new value is higher', async () => {
    const user = await registerTestUser('records-update@example.com');
    const workoutRes = await createWorkoutForUser(user, 'Record Update Workout');

    await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${user.token}`)
      .send(validSessionPayload(workoutRes.body.data._id));

    const lowerPayload = validSessionPayload(workoutRes.body.data._id);
    lowerPayload.exercises[0].sets = [
      {
        setNumber: 1,
        targetReps: 12,
        actualReps: 4,
        weight: 2,
        completed: true,
      },
    ];

    const lowerRes = await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${user.token}`)
      .send(lowerPayload);

    const recordsRes = await request(app)
      .get('/api/records/Push%20Ups')
      .set('Authorization', `Bearer ${user.token}`);

    const maxWeight = recordsRes.body.data.find((record) => record.recordType === 'max_weight');
    const maxReps = recordsRes.body.data.find((record) => record.recordType === 'max_reps');
    const maxVolume = recordsRes.body.data.find((record) => record.recordType === 'max_volume');

    expect(lowerRes.status).toBe(201);
    expect(lowerRes.body.newRecords).toHaveLength(0);
    expect(maxWeight.value).toBe(10);
    expect(maxReps.value).toBe(10);
    expect(maxVolume.value).toBe(130);
  });

  test('should not show another user records', async () => {
    const firstUser = await registerTestUser('records-owner@example.com');
    const secondUser = await registerTestUser('records-other@example.com');
    const firstWorkoutRes = await createWorkoutForUser(firstUser, 'Owner Records');
    const secondWorkoutRes = await createWorkoutForUser(secondUser, 'Other Records');

    await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${firstUser.token}`)
      .send(validSessionPayload(firstWorkoutRes.body.data._id));

    await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${secondUser.token}`)
      .send(validSessionPayload(secondWorkoutRes.body.data._id));

    const res = await request(app)
      .get('/api/records')
      .set('Authorization', `Bearer ${firstUser.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.data.every((record) => record.workoutName === 'Owner Records')).toBe(true);
  });
});

describe('Exercise Library Routes', () => {
  test('should require auth for exercise list', async () => {
    const res = await request(app).get('/api/exercises');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success', false);
  });

  test('should list default exercises', async () => {
    const user = await registerTestUser('exercises-list@example.com');

    const res = await request(app)
      .get('/api/exercises')
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(15);
    expect(res.body.data.some((exercise) => exercise.name === 'Bench Press')).toBe(true);
  });

  test('should search exercises', async () => {
    const user = await registerTestUser('exercises-search@example.com');

    const res = await request(app)
      .get('/api/exercises?search=press')
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((exercise) => exercise.name.toLowerCase().includes('press'))).toBe(true);
  });

  test('should add a custom exercise', async () => {
    const user = await registerTestUser('exercises-add@example.com');

    const createRes = await request(app)
      .post('/api/exercises')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: 'Incline Dumbbell Press',
        category: 'chest',
        equipment: 'dumbbell',
      });

    const listRes = await request(app)
      .get('/api/exercises?search=incline')
      .set('Authorization', `Bearer ${user.token}`);

    expect(createRes.status).toBe(201);
    expect(createRes.body.data).toHaveProperty('isDefault', false);
    expect(listRes.body.data).toHaveLength(1);
    expect(listRes.body.data[0]).toHaveProperty('name', 'Incline Dumbbell Press');
  });
});
