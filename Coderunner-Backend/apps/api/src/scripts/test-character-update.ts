/**
 * Script to test character update endpoint
 * Run with: npx tsx src/scripts/test-character-update.ts
 */

import { Models, connectToDatabase } from '@code-runner/shared';
import mongoose from 'mongoose';

async function testCharacterUpdate() {
  try {
    console.log('🧪 Testing Character Update...\n');

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await connectToDatabase();
    console.log('✅ Connected to MongoDB\n');

    // Find user by username
    const username = 'shifana';
    console.log(`Looking for user: ${username}`);
    const user = await Models.User.findOne({ username });

    if (!user) {
      console.error(`❌ User "${username}" not found`);
      console.log('\nAvailable users:');
      const users = await Models.User.find().select('username');
      users.forEach(u => console.log(`  - ${u.username}`));
      process.exit(1);
    }

    console.log('✅ User found:', {
      id: user._id,
      username: user.username,
      selectedCharacter: user.selectedCharacter,
      onboardingComplete: user.onboardingComplete,
    });

    // Convert userId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(user._id.toString());
    console.log('\n📋 User ObjectId:', userObjectId);

    // Check if UserProgress exists
    console.log('\nChecking UserProgress...');
    let progress = await Models.UserProgress.findOne({ userId: userObjectId });

    if (!progress) {
      console.log('⚠️  No UserProgress found, creating one...');
      progress = new Models.UserProgress({
        userId: userObjectId,
        stats: {
          totalSolved: 0,
          easySolved: 0,
          mediumSolved: 0,
          hardSolved: 0,
          totalSubmissions: 0,
          acceptedSubmissions: 0,
          acceptanceRate: 0,
        },
        streak: { current: 0, longest: 0, lastSubmissionDate: null },
        experience: 0,
        level: 1,
        contestRating: 1000,
        rank: 'NOVICE',
        achievements: [],
        skills: [],
        recentActivity: [],
        submissionCalendar: [],
        topicProgress: [],
      });
      await progress.save();
      console.log('✅ UserProgress created');
    } else {
      console.log('✅ UserProgress exists');
    }

    // Test character update
    console.log('\n🎭 Testing character update to "nila"...');
    const updatedUser = await Models.User.findByIdAndUpdate(
      user._id,
      { selectedCharacter: 'nila', onboardingComplete: true },
      { new: true }
    );

    if (updatedUser) {
      console.log('✅ Character updated successfully:', {
        selectedCharacter: updatedUser.selectedCharacter,
        onboardingComplete: updatedUser.onboardingComplete,
      });
    } else {
      console.error('❌ User update failed');
    }

    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testCharacterUpdate();
