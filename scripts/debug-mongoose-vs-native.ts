import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import { Models } from '@code-runner/shared';

const MONGODB_URI = 'mongodb+srv://code-runner-admin:Lof%40123@code-runner-db.62kbtjj.mongodb.net/code-runner?retryWrites=true&w=majority&appName=code-runner-db';

async function debugMongooseVsNative() {
  // Test with native MongoDB client
  console.log('=== TESTING WITH NATIVE MONGODB CLIENT ===\n');
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('code-runner');

    const nativeProblem: any = await db.collection('problems').findOne({ problem_id: 999 });
    console.log('Native client found problem 999:', nativeProblem ? 'YES' : 'NO');

    if (nativeProblem) {
      console.log('Fields in database:');
      console.log('  - problem_id:', nativeProblem.problem_id);
      console.log('  - title:', nativeProblem.title);
      console.log('  - session_id:', nativeProblem.session_id);
      console.log('  - age_group:', nativeProblem.age_group);
      console.log('  - level_number:', nativeProblem.level_number);
      console.log('  - difficulty:', nativeProblem.difficulty);
      console.log('  - All keys:', Object.keys(nativeProblem).join(', '));
    }

    await client.close();
  } catch (error) {
    console.error('Native client error:', error);
    await client.close();
  }

  // Test with Mongoose
  console.log('\n=== TESTING WITH MONGOOSE ===\n');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Mongoose connected successfully');
    console.log('Connected to database:', mongoose.connection.db?.databaseName);

    // Try to find problem 999
    const mongooseProblem: any = await Models.Problem.findOne({ problem_id: 999 }).lean();
    console.log('Mongoose found problem 999:', mongooseProblem ? 'YES' : 'NO');

    if (mongooseProblem) {
      console.log('Fields from Mongoose:');
      console.log('  - problem_id:', mongooseProblem.problem_id);
      console.log('  - title:', mongooseProblem.title);
      console.log('  - All keys:', Object.keys(mongooseProblem).join(', '));
    } else {
      // Try without lean() to see if there's a schema issue
      console.log('\nTrying without .lean()...');
      const mongooseProblem2: any = await Models.Problem.findOne({ problem_id: 999 });
      console.log('Found:', mongooseProblem2 ? 'YES' : 'NO');

      // Try querying all problems to see how many exist
      const count = await Models.Problem.countDocuments({});
      console.log('\nTotal problems in collection (Mongoose):', count);

      // Get first few problem IDs to see what Mongoose sees
      const someProblemIds: any = await Models.Problem.find({}).select('problem_id title').limit(10).lean();
      console.log('First 10 problem IDs Mongoose can see:', someProblemIds.map((p: any) => p.problem_id).join(', '));

      // Try direct query on mongoose connection
      const directQuery = await mongoose.connection.db?.collection('problems').findOne({ problem_id: 999 });
      console.log('\nDirect query via mongoose.connection.db:', directQuery ? 'FOUND' : 'NOT FOUND');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Mongoose error:', error);
    await mongoose.disconnect();
  }
}

debugMongooseVsNative()
  .then(() => {
    console.log('\nDebug complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
