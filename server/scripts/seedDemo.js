const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../src/models/User');
const Exercise = require('../src/models/Exercise');
const Workout = require('../src/models/Workout');
const WorkoutSession = require('../src/models/WorkoutSession');
const PersonalRecord = require('../src/models/PersonalRecord');
const Goal = require('../src/models/Goal');
const defaultExercises = require('../src/data/defaultExercises');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const getDefaultBaseDateText = () => new Date().toISOString().slice(0, 10);
const DEMO_PASSWORD = 'DemoPass123!';
const ALLOWED_NODE_ENVS = new Set(['development', 'test', 'demo', 'local']);
const DRY_RUN = process.argv.includes('--dry-run');
const ALLOW_PRODUCTION = process.argv.includes('--allow-production');
const PRODUCTION_CONFIRM = process.env.SEED_PRODUCTION_CONFIRM;

const DEMO_PERSONAS = [
  {
    key: 'beginner',
    name: 'Bella Beginner',
    email: 'bella.beginner@demo.workoutly.com',
    weeklyTarget: 3,
    strengthScale: 0.72,
    progressRate: 1.3,
    preferredHour: 7,
    partialRate: 0.09,
    routineKeys: ['beginner-full-body', 'home-bodyweight'],
    shouldTrain: (offset, date) => offset >= -55 && [1, 3, 5].includes(date.getUTCDay()) && Math.abs(offset) % 14 !== 0,
  },
  {
    key: 'muscle',
    name: 'Max Muscle',
    email: 'max.muscle@demo.workoutly.com',
    weeklyTarget: 4,
    strengthScale: 1.04,
    progressRate: 2.1,
    preferredHour: 18,
    partialRate: 0.08,
    routineKeys: ['upper-lower-upper', 'strength-builder'],
    shouldTrain: (offset, date) => [1, 2, 4, 6].includes(date.getUTCDay()) && Math.abs(offset) % 17 !== 0,
  },
  {
    key: 'fat-loss',
    name: 'Maya Momentum',
    email: 'maya.momentum@demo.workoutly.com',
    weeklyTarget: 4,
    strengthScale: 0.82,
    progressRate: 1.4,
    preferredHour: 6,
    partialRate: 0.12,
    routineKeys: ['fat-loss-cardio-strength', 'core-mobility'],
    shouldTrain: (offset, date) => [0, 2, 4].includes(date.getUTCDay()) && Math.abs(offset) % 19 !== 0,
  },
  {
    key: 'advanced',
    name: 'Alex Advanced',
    email: 'alex.advanced@demo.workoutly.com',
    weeklyTarget: 6,
    strengthScale: 1.22,
    progressRate: 2.8,
    preferredHour: 17,
    partialRate: 0.05,
    routineKeys: ['push-day', 'pull-day', 'leg-day'],
    shouldTrain: (offset, date) => [1, 2, 3, 4, 5, 6].includes(date.getUTCDay()) && Math.abs(offset) % 13 !== 0,
  },
  {
    key: 'inconsistent',
    name: 'Ivy Inconsistent',
    email: 'ivy.inconsistent@demo.workoutly.com',
    weeklyTarget: 3,
    strengthScale: 0.9,
    progressRate: 1.1,
    preferredHour: 20,
    partialRate: 0.18,
    routineKeys: ['home-bodyweight', 'core-mobility'],
    shouldTrain: (offset) => [-88, -81, -73, -66, -58, -47, -44, -31, -22, -16, -9, -4, -1].includes(offset),
  },
  {
    key: 'consistent',
    name: 'Casey Consistent',
    email: 'casey.consistent@demo.workoutly.com',
    weeklyTarget: 5,
    strengthScale: 1.02,
    progressRate: 1.7,
    preferredHour: 6,
    partialRate: 0.08,
    routineKeys: [
      'casey-upper-strength',
      'casey-zone-2-run',
      'casey-mobility-core',
      'casey-lower-strength',
      'casey-full-body-conditioning',
    ],
    routineByDay: {
      1: 'casey-upper-strength',
      2: 'casey-zone-2-run',
      3: 'casey-mobility-core',
      4: 'casey-lower-strength',
      6: 'casey-full-body-conditioning',
    },
    shouldTrain: (offset, date) =>
      offset >= -27
      && [1, 2, 3, 4, 6].includes(date.getUTCDay())
      && ![-19, -11, -5].includes(offset),
  },
  {
    key: 'empty',
    name: 'Erin Empty State',
    email: 'erin.empty@demo.workoutly.com',
    weeklyTarget: 3,
    strengthScale: 0.8,
    progressRate: 1,
    preferredHour: 8,
    partialRate: 0,
    routineKeys: [],
    shouldTrain: () => false,
  },
];

const ROUTINES = {
  'beginner-full-body': {
    name: 'Beginner Full Body 3x/week',
    difficulty: 'beginner',
    duration: 42,
    goal: 'Learn the main movement patterns and build consistency.',
    scheduleDays: [1, 3, 5],
    exercises: [
      { name: 'Goblet Squat', fallbackName: 'Squat', sets: 3, reps: 10, restSeconds: 75, notes: 'Move slowly and keep posture tall.' },
      { name: 'Push Up', sets: 3, reps: 8, restSeconds: 75, notes: 'Use an incline if needed.' },
      { name: 'Lat Pulldown', sets: 3, reps: 10, restSeconds: 90, notes: 'Pull elbows toward ribs.' },
      { name: 'Romanian Deadlift', sets: 2, reps: 10, restSeconds: 90, notes: 'Feel hamstrings load.' },
      { name: 'Plank', sets: 3, reps: 35, restSeconds: 45, notes: 'Treat reps as seconds.' },
    ],
  },
  'home-bodyweight': {
    name: 'Home Bodyweight Plan',
    difficulty: 'beginner',
    duration: 32,
    goal: 'Stay active without gym equipment.',
    scheduleDays: [2, 4, 6],
    exercises: [
      { name: 'Push Up', sets: 4, reps: 10, restSeconds: 60, notes: 'Stop two reps before form breaks.' },
      { name: 'Lunges', sets: 3, reps: 12, restSeconds: 60, notes: 'Each side.' },
      { name: 'Glute Bridge', sets: 3, reps: 15, restSeconds: 45, notes: 'Pause at the top.' },
      { name: 'Bicycle Crunch', sets: 3, reps: 20, restSeconds: 45, notes: 'Controlled rotation.' },
      { name: 'Yoga Flow', sets: 1, reps: 12, restSeconds: 30, notes: 'Cool down flow.' },
    ],
  },
  'upper-lower-upper': {
    name: 'Upper Lower Split',
    difficulty: 'intermediate',
    duration: 58,
    goal: 'Build balanced muscle with repeatable weekly volume.',
    scheduleDays: [1, 2, 4, 6],
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 8, restSeconds: 120, notes: 'Add weight when all reps are clean.' },
      { name: 'Barbell Row', sets: 4, reps: 8, restSeconds: 120, notes: 'Keep torso set.' },
      { name: 'Leg Press', sets: 4, reps: 10, restSeconds: 105, notes: 'Full range without knee lockout.' },
      { name: 'Dumbbell Lateral Raise', sets: 3, reps: 14, restSeconds: 60, notes: 'Strict tempo.' },
      { name: 'Tricep Pushdown', sets: 3, reps: 12, restSeconds: 60, notes: 'Control the top.' },
      { name: 'Hammer Curl', sets: 3, reps: 12, restSeconds: 60, notes: 'No swinging.' },
    ],
  },
  'strength-builder': {
    name: 'Strength Builder',
    difficulty: 'intermediate',
    duration: 64,
    goal: 'Progress heavy compound lifts while tracking volume.',
    scheduleDays: [1, 3, 5],
    exercises: [
      { name: 'Squat', sets: 5, reps: 5, restSeconds: 150, notes: 'Brace before each rep.' },
      { name: 'Bench Press', sets: 5, reps: 5, restSeconds: 150, notes: 'Pause first rep of every set.' },
      { name: 'Deadlift', sets: 3, reps: 5, restSeconds: 180, notes: 'Reset every rep.' },
      { name: 'Pull Up', sets: 4, reps: 8, restSeconds: 120, notes: 'Full hang to strong finish.' },
      { name: 'Farmer Carry', sets: 3, reps: 40, restSeconds: 90, notes: 'Treat reps as meters.' },
    ],
  },
  'fat-loss-cardio-strength': {
    name: 'Fat Loss Cardio + Strength',
    difficulty: 'intermediate',
    duration: 50,
    goal: 'Blend heart-rate work and full-body strength.',
    scheduleDays: [0, 2, 4],
    exercises: [
      { name: 'Rowing Machine', sets: 4, reps: 5, restSeconds: 60, notes: 'Treat reps as minutes.' },
      { name: 'Kettlebell Swing', sets: 4, reps: 16, restSeconds: 60, notes: 'Powerful hip snap.' },
      { name: 'Leg Press', sets: 3, reps: 12, restSeconds: 75, notes: 'Smooth tempo.' },
      { name: 'Cable Wood Chop', sets: 3, reps: 12, restSeconds: 45, notes: 'Each side.' },
      { name: 'Elliptical', sets: 1, reps: 15, restSeconds: 30, notes: 'Treat reps as steady minutes.' },
    ],
  },
  'core-mobility': {
    name: 'Core & Mobility',
    difficulty: 'beginner',
    duration: 28,
    goal: 'Recover better and build trunk control.',
    scheduleDays: [0, 3, 6],
    exercises: [
      { name: 'Dead Bug', sets: 3, reps: 10, restSeconds: 30, notes: 'Slow opposite arm and leg.' },
      { name: 'Plank', sets: 3, reps: 45, restSeconds: 45, notes: 'Treat reps as seconds.' },
      { name: 'Thoracic Rotation', sets: 2, reps: 8, restSeconds: 20, notes: 'Each side.' },
      { name: "World's Greatest Stretch", sets: 2, reps: 6, restSeconds: 20, notes: 'Each side.' },
      { name: 'Foam Rolling', sets: 1, reps: 8, restSeconds: 15, notes: 'Gentle pressure.' },
    ],
  },
  'casey-upper-strength': {
    name: 'Upper Body Strength',
    difficulty: 'intermediate',
    duration: 58,
    goal: 'Build pressing and pulling strength with repeatable weekly volume.',
    scheduleDays: [1],
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 6, restSeconds: 150, notes: 'Top set should feel heavy but clean.' },
      { name: 'Pull Up', sets: 4, reps: 7, restSeconds: 120, notes: 'Use full range and controlled negatives.' },
      { name: 'Incline Dumbbell Press', sets: 3, reps: 9, restSeconds: 105, notes: 'Pause briefly in the bottom position.' },
      { name: 'Seated Cable Row', sets: 3, reps: 10, restSeconds: 90, notes: 'Drive elbows back and avoid shrugging.' },
      { name: 'Face Pull', sets: 3, reps: 14, restSeconds: 60, notes: 'Keep this light and crisp.' },
    ],
  },
  'casey-zone-2-run': {
    name: 'Zone 2 Run',
    difficulty: 'beginner',
    duration: 42,
    goal: 'Build aerobic base with conversational effort and relaxed pacing.',
    scheduleDays: [2],
    exercises: [
      { name: 'Running', sets: 1, reps: 35, restSeconds: 0, notes: 'Treat reps as minutes at easy conversational pace.' },
      { name: 'Hip Flexor Stretch', sets: 2, reps: 8, restSeconds: 20, notes: 'Open hips after the run.' },
      { name: 'Cat Cow', sets: 2, reps: 8, restSeconds: 20, notes: 'Downshift breathing before wrapping up.' },
    ],
  },
  'casey-mobility-core': {
    name: 'Mobility + Core',
    difficulty: 'beginner',
    duration: 34,
    goal: 'Keep recovery honest while building trunk control.',
    scheduleDays: [3],
    exercises: [
      { name: 'Dead Bug', sets: 3, reps: 10, restSeconds: 30, notes: 'Slow opposite arm and leg.' },
      { name: 'Plank', sets: 3, reps: 50, restSeconds: 45, notes: 'Treat reps as seconds.' },
      { name: 'Cable Wood Chop', sets: 3, reps: 12, restSeconds: 45, notes: 'Each side with stable hips.' },
      { name: "World's Greatest Stretch", sets: 2, reps: 6, restSeconds: 20, notes: 'Each side, pause where tight.' },
      { name: 'Foam Rolling', sets: 1, reps: 8, restSeconds: 15, notes: 'Spend extra time on quads and lats.' },
    ],
  },
  'casey-lower-strength': {
    name: 'Lower Body Strength',
    difficulty: 'intermediate',
    duration: 62,
    goal: 'Progress squat and hinge strength without burying recovery.',
    scheduleDays: [4],
    exercises: [
      { name: 'Squat', sets: 5, reps: 5, restSeconds: 150, notes: 'Add load only when bar speed stays strong.' },
      { name: 'Romanian Deadlift', sets: 4, reps: 8, restSeconds: 120, notes: 'Hips back and lats tight.' },
      { name: 'Bulgarian Split Squat', sets: 3, reps: 10, restSeconds: 90, notes: 'Each side with controlled depth.' },
      { name: 'Leg Curl', sets: 3, reps: 12, restSeconds: 75, notes: 'Squeeze hamstrings at the top.' },
      { name: 'Standing Calf Raise', sets: 4, reps: 14, restSeconds: 60, notes: 'Full stretch and full lockout.' },
    ],
  },
  'casey-full-body-conditioning': {
    name: 'Full Body Conditioning',
    difficulty: 'intermediate',
    duration: 48,
    goal: 'Finish the week with athletic full-body work and moderate conditioning.',
    scheduleDays: [6],
    exercises: [
      { name: 'Rowing Machine', sets: 4, reps: 4, restSeconds: 60, notes: 'Treat reps as minutes at strong but sustainable pace.' },
      { name: 'Kettlebell Swing', sets: 4, reps: 18, restSeconds: 60, notes: 'Power comes from hips, not shoulders.' },
      { name: 'Thruster', sets: 3, reps: 10, restSeconds: 75, notes: 'Smooth squat into press.' },
      { name: 'Farmer Carry', sets: 3, reps: 45, restSeconds: 75, notes: 'Treat reps as meters.' },
      { name: 'Bicycle Crunch', sets: 3, reps: 22, restSeconds: 45, notes: 'Controlled rotation.' },
    ],
  },
  'push-day': {
    name: 'Push Day',
    difficulty: 'advanced',
    duration: 72,
    goal: 'High-quality chest, shoulder, and triceps volume.',
    scheduleDays: [1, 4],
    exercises: [
      { name: 'Bench Press', sets: 5, reps: 5, restSeconds: 150, notes: 'Heavy top sets.' },
      { name: 'Incline Dumbbell Press', sets: 4, reps: 8, restSeconds: 120, notes: 'Deep stretch.' },
      { name: 'Overhead Press', sets: 4, reps: 6, restSeconds: 135, notes: 'No layback.' },
      { name: 'Cable Fly', sets: 3, reps: 14, restSeconds: 60, notes: 'Squeeze at midline.' },
      { name: 'Dumbbell Lateral Raise', sets: 4, reps: 15, restSeconds: 60, notes: 'Strict reps.' },
      { name: 'Skull Crusher', sets: 3, reps: 10, restSeconds: 75, notes: 'Elbows steady.' },
    ],
  },
  'pull-day': {
    name: 'Pull Day',
    difficulty: 'advanced',
    duration: 70,
    goal: 'Back thickness, width, and biceps.',
    scheduleDays: [2, 5],
    exercises: [
      { name: 'Deadlift', sets: 4, reps: 4, restSeconds: 180, notes: 'Strong setup.' },
      { name: 'Pull Up', sets: 4, reps: 8, restSeconds: 120, notes: 'Chest to bar when possible.' },
      { name: 'Barbell Row', sets: 4, reps: 8, restSeconds: 120, notes: 'No torso bounce.' },
      { name: 'Seated Cable Row', sets: 3, reps: 10, restSeconds: 90, notes: 'Squeeze shoulder blades.' },
      { name: 'Face Pull', sets: 3, reps: 15, restSeconds: 60, notes: 'High elbows.' },
      { name: 'Cable Curl', sets: 3, reps: 12, restSeconds: 60, notes: 'Constant tension.' },
    ],
  },
  'leg-day': {
    name: 'Leg Day Warrior',
    difficulty: 'advanced',
    duration: 76,
    goal: 'Heavy lower-body strength and hypertrophy.',
    scheduleDays: [3, 6],
    exercises: [
      { name: 'Squat', sets: 5, reps: 5, restSeconds: 165, notes: 'Brace hard.' },
      { name: 'Romanian Deadlift', sets: 4, reps: 8, restSeconds: 135, notes: 'Hips back.' },
      { name: 'Bulgarian Split Squat', sets: 3, reps: 10, restSeconds: 90, notes: 'Each side.' },
      { name: 'Leg Curl', sets: 3, reps: 12, restSeconds: 75, notes: 'Hamstring squeeze.' },
      { name: 'Standing Calf Raise', sets: 4, reps: 14, restSeconds: 60, notes: 'Full stretch.' },
      { name: 'Hanging Leg Raise', sets: 3, reps: 12, restSeconds: 60, notes: 'No swing.' },
    ],
  },
};

const BASE_WEIGHTS = {
  'Bench Press': 55,
  'Incline Dumbbell Press': 24,
  'Chest Press Machine': 55,
  'Barbell Row': 50,
  'Seated Cable Row': 45,
  'Lat Pulldown': 48,
  Deadlift: 90,
  Squat: 70,
  'Front Squat': 55,
  'Leg Press': 120,
  'Romanian Deadlift': 62.5,
  'Bulgarian Split Squat': 18,
  'Leg Curl': 36,
  'Leg Extension': 38,
  'Standing Calf Raise': 65,
  'Hip Thrust': 70,
  'Overhead Press': 38,
  'Dumbbell Lateral Raise': 8,
  'Rear Delt Fly': 8,
  'Skull Crusher': 24,
  'Tricep Pushdown': 30,
  'Cable Curl': 24,
  'Hammer Curl': 14,
  'Bicep Curl': 12,
  'Kettlebell Swing': 20,
  'Farmer Carry': 28,
};

const SESSION_NOTES = [
  'Felt smooth after warm-up.',
  'Good energy, added a little load where it felt right.',
  'Kept rest honest and moved well.',
  'Technique focus day with controlled tempo.',
  'Short on time but finished the main work.',
  'Strong finish on the final sets.',
  'Easy start, better rhythm after the second exercise.',
  'Left one rep in reserve on most sets.',
];

const seededRandom = (seed) => {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
};

const hashString = (value) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const parseBaseDate = () => {
  const dateText = process.env.SEED_BASE_DATE || getDefaultBaseDateText();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    throw new Error('SEED_BASE_DATE must use YYYY-MM-DD format.');
  }

  const parsed = new Date(`${dateText}T12:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== dateText) {
    throw new Error('SEED_BASE_DATE is not a valid calendar date.');
  }

  return parsed;
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const setUtcTime = (date, hour, minute = 0) => {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    hour,
    minute,
    0,
    0
  ));
};

const formatDateLabel = (date) => date.toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

const getScheduleLabel = (scheduleDays) => {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return scheduleDays.map((day) => labels[day]).join(', ');
};

const getUpcomingSchedule = (baseDate, scheduleDays) => {
  const dates = [];

  for (let offset = 1; offset <= 14; offset += 1) {
    const date = addDays(baseDate, offset);
    if (scheduleDays.includes(date.getUTCDay())) {
      dates.push(formatDateLabel(date));
    }
  }

  return dates.join(', ');
};

const normalizeRoutineExercise = (exercise) => ({
  name: exercise.fallbackName || exercise.name,
  sets: exercise.sets,
  reps: exercise.reps,
  restSeconds: exercise.restSeconds,
  notes: exercise.notes,
});

const buildRoutineNotes = (routine, baseDate) => {
  const upcoming = getUpcomingSchedule(baseDate, routine.scheduleDays);
  return [
    routine.goal,
    `Suggested days: ${getScheduleLabel(routine.scheduleDays)}.`,
    upcoming ? `Next 14 days: ${upcoming}.` : 'No upcoming days in the next 14 days.',
  ].join(' ');
};

const getMongoUri = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const mongoUri = nodeEnv === 'test'
    ? process.env.MONGO_URI_TEST || process.env.MONGODB_URI_TEST || process.env.MONGO_URI
    : process.env.MONGO_URI;
  const wantsProduction = nodeEnv === 'production' || /prod|production/i.test(mongoUri);

  if (!ALLOWED_NODE_ENVS.has(nodeEnv) && nodeEnv !== 'production') {
    throw new Error(`Refusing to seed when NODE_ENV=${nodeEnv}. Use development, test, demo, local, or use the explicit production override.`);
  }

  if (!mongoUri) {
    throw new Error('MONGO_URI is required to seed demo data.');
  }

  if (wantsProduction && (!ALLOW_PRODUCTION || PRODUCTION_CONFIRM !== 'workoutly-prod')) {
    throw new Error(
      'Refusing to seed production. Re-run with --allow-production and SEED_PRODUCTION_CONFIRM=workoutly-prod.'
    );
  }

  return mongoUri;
};

const assertSafeDatabase = () => {
  const dbName = mongoose.connection.name || '';
  if (/prod|production/i.test(dbName) && (!ALLOW_PRODUCTION || PRODUCTION_CONFIRM !== dbName)) {
    throw new Error(
      `Refusing to seed database "${dbName}". Re-run with --allow-production and SEED_PRODUCTION_CONFIRM=${dbName}.`
    );
  }
};

const upsertExerciseLibrary = async () => {
  for (const exercise of defaultExercises) {
    await Exercise.findOneAndUpdate(
      { name: exercise.name, isDefault: true },
      {
        ...exercise,
        instructions: exercise.instructions || '',
        isDefault: true,
        createdBy: null,
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true, runValidators: true }
    );
  }
};

const resetDemoOwnedData = async () => {
  const demoEmails = DEMO_PERSONAS.map((persona) => persona.email);
  const existingUsers = await User.find({ email: { $in: demoEmails } }).select('_id email');
  const userIds = existingUsers.map((user) => user._id);

  if (userIds.length === 0) {
    return {
      users: 0,
      workouts: 0,
      sessions: 0,
      records: 0,
      goals: 0,
      customExercises: 0,
    };
  }

  console.warn('Refreshing demo data: deleting only data owned by stable @demo.workoutly.com accounts.');

  const [sessionResult, recordResult, goalResult, workoutResult, customExerciseResult, userResult] = await Promise.all([
    WorkoutSession.deleteMany({ user: { $in: userIds } }),
    PersonalRecord.deleteMany({ user: { $in: userIds } }),
    Goal.deleteMany({ user: { $in: userIds } }),
    Workout.deleteMany({ author: { $in: userIds } }),
    Exercise.deleteMany({ createdBy: { $in: userIds } }),
    User.deleteMany({ _id: { $in: userIds } }),
  ]);

  return {
    users: userResult.deletedCount || 0,
    workouts: workoutResult.deletedCount || 0,
    sessions: sessionResult.deletedCount || 0,
    records: recordResult.deletedCount || 0,
    goals: goalResult.deletedCount || 0,
    customExercises: customExerciseResult.deletedCount || 0,
  };
};

const createDemoUsers = async () => {
  const password = await bcrypt.hash(DEMO_PASSWORD, 10);
  const usersByPersona = new Map();

  for (const persona of DEMO_PERSONAS) {
    const user = await User.create({
      name: persona.name,
      email: persona.email,
      password,
    });

    await Goal.create({
      user: user._id,
      weeklyWorkoutTarget: persona.weeklyTarget,
      isActive: true,
    });

    usersByPersona.set(persona.key, user);
  }

  return usersByPersona;
};

const createRoutineWorkouts = async (usersByPersona, baseDate) => {
  const workoutsByPersona = new Map();

  for (const persona of DEMO_PERSONAS) {
    const user = usersByPersona.get(persona.key);
    const personaWorkouts = new Map();

    for (const routineKey of persona.routineKeys) {
      const routine = ROUTINES[routineKey];
      const workout = await Workout.create({
        name: routine.name,
        exercises: routine.exercises.map(normalizeRoutineExercise),
        duration: routine.duration,
        difficulty: routine.difficulty,
        notes: buildRoutineNotes(routine, baseDate),
        coverImage: null,
        author: user._id,
      });

      personaWorkouts.set(routineKey, workout);
    }

    workoutsByPersona.set(persona.key, personaWorkouts);
  }

  return workoutsByPersona;
};

const getExerciseCategory = (exerciseName) => {
  const exercise = defaultExercises.find((item) => item.name === exerciseName);
  return exercise?.category || 'other';
};

const getBaseWeight = (exerciseName) => {
  if (Object.prototype.hasOwnProperty.call(BASE_WEIGHTS, exerciseName)) {
    return BASE_WEIGHTS[exerciseName];
  }

  const category = getExerciseCategory(exerciseName);
  if (category === 'cardio' || category === 'core' || category === 'other') return 0;
  if (category === 'arms' || category === 'shoulders') return 14;
  if (category === 'legs') return 42;
  if (category === 'back' || category === 'chest') return 35;
  return 25;
};

const roundToIncrement = (value, increment = 2.5) => {
  return Math.max(0, Math.round(value / increment) * increment);
};

const buildSetLogs = ({ exercise, persona, daysFromStart, random, partial, exerciseIndex }) => {
  const baseWeight = getBaseWeight(exercise.name);
  const progressWeight = Math.floor(daysFromStart / 14) * persona.progressRate;
  const setLogs = [];

  for (let setIndex = 0; setIndex < exercise.sets; setIndex += 1) {
    const shouldMissSet = partial && exerciseIndex >= 3 && setIndex >= Math.max(1, exercise.sets - 2);
    const completed = !shouldMissSet;
    const repVariance = Math.floor(random() * 3) - 1;
    const targetReps = exercise.reps;
    const actualReps = completed ? Math.max(1, targetReps + repVariance) : 0;
    const jitter = (random() - 0.5) * 3;
    const weight = baseWeight === 0
      ? 0
      : roundToIncrement((baseWeight * persona.strengthScale) + progressWeight + (setIndex * 1.25) + jitter);

    setLogs.push({
      setNumber: setIndex + 1,
      targetReps,
      actualReps,
      weight,
      completed,
    });
  }

  return setLogs;
};

const buildSessionPayload = ({
  persona,
  user,
  workout,
  routine,
  date,
  offset,
  sessionIndex,
  baseDate,
}) => {
  const random = seededRandom(hashString(`${persona.key}:${workout.name}:${offset}:${sessionIndex}`));
  const hourJitter = Math.floor(random() * 3) - 1;
  const minute = [0, 10, 15, 25, 30, 40, 45][Math.floor(random() * 7)];
  const completedAt = setUtcTime(date, Math.max(5, Math.min(21, persona.preferredHour + hourJitter)), minute);
  const durationMinutes = Math.max(18, routine.duration + Math.floor((random() - 0.5) * 14));
  const startedAt = new Date(completedAt.getTime() - durationMinutes * 60 * 1000);
  const daysFromStart = Math.max(0, Math.round((date.getTime() - addDays(baseDate, -89).getTime()) / 86400000));
  const partial = random() < persona.partialRate;

  let totalCompletedSets = 0;
  let totalVolume = 0;

  const exercises = routine.exercises.map((exercise, exerciseIndex) => {
    const normalizedExercise = normalizeRoutineExercise(exercise);
    const sets = buildSetLogs({
      exercise: normalizedExercise,
      persona,
      daysFromStart,
      random,
      partial,
      exerciseIndex,
    });

    sets.forEach((set) => {
      if (set.completed) {
        totalCompletedSets += 1;
        totalVolume += set.actualReps * set.weight;
      }
    });

    return {
      name: normalizedExercise.name,
      sets,
    };
  });

  const note = partial
    ? 'Partially completed: stopped early and kept the main lifts logged.'
    : SESSION_NOTES[Math.floor(random() * SESSION_NOTES.length)];

  return {
    user: user._id,
    workout: workout._id,
    workoutName: workout.name,
    startedAt,
    completedAt,
    durationMinutes,
    exercises,
    totalCompletedSets,
    totalVolume,
    notes: note,
  };
};

const buildTrainingDates = (persona, baseDate) => {
  const dates = [];

  for (let offset = -89; offset <= 0; offset += 1) {
    const date = addDays(baseDate, offset);
    if (persona.shouldTrain(offset, date)) {
      dates.push({ date, offset });
    }
  }

  return dates;
};

const createSessions = async (usersByPersona, workoutsByPersona, baseDate) => {
  const sessionPayloads = [];

  for (const persona of DEMO_PERSONAS) {
    if (persona.routineKeys.length === 0) continue;

    const user = usersByPersona.get(persona.key);
    const dates = buildTrainingDates(persona, baseDate);

    dates.forEach(({ date, offset }, index) => {
      const routineKey = persona.routineByDay?.[date.getUTCDay()] || persona.routineKeys[index % persona.routineKeys.length];
      const routine = ROUTINES[routineKey];
      const workout = workoutsByPersona.get(persona.key).get(routineKey);

      sessionPayloads.push(buildSessionPayload({
        persona,
        user,
        workout,
        routine,
        date,
        offset,
        sessionIndex: index,
        baseDate,
      }));
    });
  }

  sessionPayloads.sort((first, second) => first.completedAt - second.completedAt);

  const createdSessions = await WorkoutSession.insertMany(sessionPayloads, { ordered: true });
  await createPersonalRecordsForSessions(createdSessions);

  return createdSessions;
};

const getCompletedSets = (exercise) => {
  if (!Array.isArray(exercise.sets)) {
    return [];
  }

  return exercise.sets.filter((set) => set.completed);
};

const setBestRecord = (recordMap, record) => {
  const key = `${record.user}:${record.exerciseName.toLowerCase()}:${record.recordType}`;
  const currentRecord = recordMap.get(key);

  if (!currentRecord || record.value > currentRecord.value) {
    recordMap.set(key, record);
  }
};

const createPersonalRecordsForSessions = async (sessions) => {
  const recordMap = new Map();

  sessions.forEach((session) => {
    (session.exercises || []).forEach((exercise) => {
      const exerciseName = String(exercise.name || '').trim();
      const completedSets = getCompletedSets(exercise);

      if (!exerciseName || completedSets.length === 0) {
        return;
      }

      const maxWeight = Math.max(...completedSets.map((set) => Number(set.weight) || 0));
      const maxReps = Math.max(...completedSets.map((set) => Number(set.actualReps) || 0));
      const totalVolume = completedSets.reduce(
        (sum, set) => sum + (Number(set.actualReps) || 0) * (Number(set.weight) || 0),
        0
      );

      [
        { recordType: 'max_weight', value: maxWeight },
        { recordType: 'max_reps', value: maxReps },
        { recordType: 'max_volume', value: totalVolume },
      ].forEach((recordValue) => {
        setBestRecord(recordMap, {
          user: session.user,
          exerciseName,
          recordType: recordValue.recordType,
          value: recordValue.value,
          session: session._id,
          workoutName: session.workoutName,
          achievedAt: session.completedAt,
        });
      });
    });
  });

  const records = [...recordMap.values()];

  if (records.length > 0) {
    await PersonalRecord.insertMany(records, { ordered: true });
  }
};

const buildPlannedSummary = (baseDate) => {
  let workouts = 0;
  let sessions = 0;
  let totalSetLogs = 0;

  DEMO_PERSONAS.forEach((persona) => {
    workouts += persona.routineKeys.length;

    if (persona.routineKeys.length === 0) return;

    buildTrainingDates(persona, baseDate).forEach(({ date }, index) => {
      const routineKey = persona.routineByDay?.[date.getUTCDay()] || persona.routineKeys[index % persona.routineKeys.length];
      const routine = ROUTINES[routineKey];
      sessions += 1;
      totalSetLogs += routine.exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
    });
  });

  return {
    demoUsers: DEMO_PERSONAS.length,
    exercises: defaultExercises.length,
    uniqueRoutineDefinitions: Object.keys(ROUTINES).length,
    userOwnedRoutineCopies: workouts,
    sessions,
    totalSetLogs,
  };
};

const summarizeSeed = async (usersByPersona) => {
  const userIds = [...usersByPersona.values()].map((user) => user._id);
  const [workouts, sessions, records, exercises] = await Promise.all([
    Workout.countDocuments({ author: { $in: userIds } }),
    WorkoutSession.countDocuments({ user: { $in: userIds } }),
    PersonalRecord.countDocuments({ user: { $in: userIds } }),
    Exercise.countDocuments({ isDefault: true }),
  ]);

  const setTotals = await WorkoutSession.aggregate([
    { $match: { user: { $in: userIds } } },
    { $unwind: '$exercises' },
    { $unwind: '$exercises.sets' },
    {
      $group: {
        _id: null,
        totalSets: { $sum: 1 },
        completedSets: {
          $sum: {
            $cond: ['$exercises.sets.completed', 1, 0],
          },
        },
      },
    },
  ]);

  return {
    demoUsers: userIds.length,
    exercises,
    workouts,
    sessions,
    personalRecords: records,
    totalSetLogs: setTotals[0]?.totalSets || 0,
    completedSetLogs: setTotals[0]?.completedSets || 0,
  };
};

const seedDemo = async () => {
  const baseDate = parseBaseDate();

  if (DRY_RUN) {
    console.log(`Dry run only. No database writes will be performed.`);
    console.log(`Base date: ${baseDate.toISOString().slice(0, 10)}`);
    console.log('Planned demo data:', buildPlannedSummary(baseDate));
    console.log(`Demo password for every @demo.workoutly.com user: ${DEMO_PASSWORD}`);
    return;
  }

  const mongoUri = getMongoUri();
  await mongoose.connect(mongoUri);
  assertSafeDatabase();

  console.log(`Connected to MongoDB database "${mongoose.connection.name}".`);
  if (ALLOW_PRODUCTION) {
    console.warn('Production seed override enabled. Only stable @demo.workoutly.com owned data will be refreshed.');
  }
  console.log(`Seeding Workoutly demo data around ${baseDate.toISOString().slice(0, 10)}.`);

  await upsertExerciseLibrary();
  const deleted = await resetDemoOwnedData();
  const usersByPersona = await createDemoUsers();
  const workoutsByPersona = await createRoutineWorkouts(usersByPersona, baseDate);
  await createSessions(usersByPersona, workoutsByPersona, baseDate);
  const summary = await summarizeSeed(usersByPersona);

  console.log('Deleted old demo-owned data:', deleted);
  console.log('Seeded demo data:', summary);
  console.log(`Demo password for every @demo.workoutly.com user: ${DEMO_PASSWORD}`);
  console.log('Recommended rich dashboard login: casey.consistent@demo.workoutly.com');
  console.log('Empty-state login: erin.empty@demo.workoutly.com');
};

seedDemo()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
