const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Exercise = require('../src/models/Exercise');
const defaultExercises = require('../src/data/defaultExercises');

dotenv.config();

const seedExercises = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is required to seed exercises.');
  }

  await mongoose.connect(mongoUri);

  for (const exercise of defaultExercises) {
    await Exercise.findOneAndUpdate(
      { name: exercise.name },
      {
        ...exercise,
        instructions: '',
        isDefault: true,
        createdBy: null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
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
