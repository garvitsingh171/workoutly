const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const Exercise = require('../src/models/Exercise');
const defaultExercises = require('../src/data/defaultExercises');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const ALLOWED_NODE_ENVS = new Set(['development', 'test', 'demo', 'local']);
const ALLOW_PRODUCTION = process.argv.includes('--allow-production');
const PRODUCTION_CONFIRM = process.env.SEED_PRODUCTION_CONFIRM;

const getMongoUri = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const mongoUri = process.env.MONGO_URI;
  const wantsProduction = nodeEnv === 'production' || /prod|production/i.test(mongoUri);

  if (!ALLOWED_NODE_ENVS.has(nodeEnv) && nodeEnv !== 'production') {
    throw new Error(`Refusing to seed exercises when NODE_ENV=${nodeEnv}. Use development, test, demo, local, or use the explicit production override.`);
  }

  if (!mongoUri) {
    throw new Error('MONGO_URI is required to seed exercises.');
  }

  if (wantsProduction && (!ALLOW_PRODUCTION || PRODUCTION_CONFIRM !== 'workoutly-prod')) {
    throw new Error(
      'Refusing to seed production exercises. Re-run with --allow-production and SEED_PRODUCTION_CONFIRM=workoutly-prod.'
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

const seedExercises = async () => {
  const mongoUri = getMongoUri();

  await mongoose.connect(mongoUri);
  assertSafeDatabase();
  if (ALLOW_PRODUCTION) {
    console.warn('Production seed override enabled for default exercises.');
  }

  for (const exercise of defaultExercises) {
    await Exercise.findOneAndUpdate(
      { name: exercise.name, isDefault: true },
      {
        ...exercise,
        instructions: exercise.instructions || '',
        isDefault: true,
        createdBy: null,
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  }

  console.log(`Seeded ${defaultExercises.length} default exercises.`);
  await mongoose.connection.close();
};

seedExercises().catch(async (error) => {
  console.error(error.message);
  await mongoose.connection.close();
  process.exit(1);
});
