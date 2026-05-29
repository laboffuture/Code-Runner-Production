/**
 * List all users in the database
 * Shows username, email, role, and account creation date
 */

import { connectToDatabase, Models } from '@code-runner/shared';

async function listUsers() {
  console.log('🔍 Checking MongoDB for registered users...\n');

  try {
    // Connect to MongoDB
    await connectToDatabase();
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const users = await Models.User.find({}).select('username email role age_group createdAt').lean();

    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('\n💡 To create a user:');
      console.log('   1. Start frontend: cd Coderunner-Frontend/web && npm run dev');
      console.log('   2. Go to: http://localhost:3000/register');
      console.log('   3. Create your account\n');
      process.exit(0);
    }

    console.log(`✅ Found ${users.length} user(s) in database:\n`);
    console.log('─'.repeat(80));

    users.forEach((user, index) => {
      console.log(`\n👤 User #${index + 1}:`);
      console.log(`   Username:    ${user.username}`);
      console.log(`   Email:       ${user.email}`);
      console.log(`   Role:        ${user.role}`);
      console.log(`   Age Group:   ${user.age_group || 'Not set'}`);
      console.log(`   Created:     ${new Date(user.createdAt).toLocaleString()}`);
      console.log('─'.repeat(80));
    });

    console.log('\n📌 Login Credentials:');
    console.log('   Username: [any username from above]');
    console.log('   Password: [the password YOU set during registration]');

    console.log('\n⚠️  Note: Passwords are hashed with bcrypt for security.');
    console.log('   We CANNOT show plain-text passwords.');
    console.log('   If you forgot your password, you need to reset it or create a new user.\n');

    console.log('🔐 To test login:');
    console.log('   1. Go to: http://localhost:3000/login');
    console.log('   2. Use username and the password you created\n');

    // Check for admin users
    const adminUsers = users.filter(u => u.role === 'admin');
    if (adminUsers.length > 0) {
      console.log('👑 Admin users:');
      adminUsers.forEach(admin => {
        console.log(`   - ${admin.username} (${admin.email})`);
      });
      console.log('');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
listUsers();
