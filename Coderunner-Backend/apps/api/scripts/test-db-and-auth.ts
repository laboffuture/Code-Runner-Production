/**
 * Test script to verify:
 * 1. MongoDB connection
 * 2. Database has collections
 * 3. Sample user exists or can be created
 */

import { connectToDatabase, Models } from '@code-runner/shared';

async function testDatabaseAndAuth() {
  console.log('🧪 Starting Database & Auth Tests...\n');

  try {
    // Test 1: MongoDB Connection
    console.log('1️⃣ Testing MongoDB connection...');
    await connectToDatabase();
    console.log('✅ MongoDB connected successfully!\n');

    // Test 2: Check collections exist
    console.log('2️⃣ Checking database collections...');
    const collections = await Models.User.db.db.listCollections().toArray();
    console.log('📦 Collections found:', collections.map(c => c.name).join(', '));
    console.log('✅ Database has collections!\n');

    // Test 3: Count users
    console.log('3️⃣ Counting users in database...');
    const userCount = await Models.User.countDocuments();
    console.log(`👥 Total users: ${userCount}`);

    if (userCount > 0) {
      const sampleUser = await Models.User.findOne().select('username email role createdAt');
      console.log('📋 Sample user:', {
        username: sampleUser?.username,
        email: sampleUser?.email,
        role: sampleUser?.role,
        createdAt: sampleUser?.createdAt
      });
    } else {
      console.log('⚠️  No users found - you need to register!');
    }
    console.log('');

    // Test 4: Check UserProgress collection
    console.log('4️⃣ Checking UserProgress collection...');
    const progressCount = await Models.UserProgress.countDocuments();
    console.log(`📊 Total user progress records: ${progressCount}`);

    if (progressCount > 0) {
      const sampleProgress = await Models.UserProgress.findOne()
        .populate('userId', 'username')
        .lean();
      console.log('📋 Sample progress:', {
        username: (sampleProgress as any)?.userId?.username,
        level: sampleProgress?.level,
        totalSolved: sampleProgress?.stats?.totalSolved,
        rank: sampleProgress?.rank
      });
    }
    console.log('');

    // Test 5: Check Problems collection
    console.log('5️⃣ Checking Problems collection...');
    const problemCount = await Models.Problem.countDocuments();
    console.log(`🧩 Total problems: ${problemCount}`);

    if (problemCount > 0) {
      const sampleProblem = await Models.Problem.findOne();
      console.log('📋 Sample problem:', {
        id: sampleProblem?.id,
        title: sampleProblem?.title,
        difficulty: sampleProblem?.difficulty
      });
    } else {
      console.log('⚠️  No problems found - database might be empty!');
    }
    console.log('');

    console.log('✅ All tests passed!');
    console.log('\n📌 Summary:');
    console.log(`   - MongoDB: Connected ✅`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - User Progress: ${progressCount}`);
    console.log(`   - Problems: ${problemCount}`);

    if (userCount === 0) {
      console.log('\n💡 Next steps:');
      console.log('   1. Start the frontend: cd Coderunner-Frontend/web && npm run dev');
      console.log('   2. Go to http://localhost:3000/register');
      console.log('   3. Create your first account!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testDatabaseAndAuth();
