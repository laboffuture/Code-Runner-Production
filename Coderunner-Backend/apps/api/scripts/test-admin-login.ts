import dotenv from 'dotenv';
import path from 'path';
import { connectToDatabase, Models, comparePassword } from '@code-runner/shared';

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env.local');
dotenv.config({ path: envPath });

async function testAdminLogin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectToDatabase();
    console.log('✅ Connected to MongoDB\n');

    // Find admin user
    const user = await Models.User.findOne({ username: 'admin' });

    if (!user) {
      console.log('❌ Admin user NOT FOUND in database!');
      process.exit(1);
    }

    console.log('✅ Admin user found:');
    console.log('   Username:', user.username);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Password Hash:', user.passwordHash.substring(0, 20) + '...');
    console.log('\n🔐 Testing password "admin123"...');

    // Test password
    const isPasswordValid = await comparePassword('admin123', user.passwordHash);

    if (isPasswordValid) {
      console.log('✅ Password is CORRECT!');
    } else {
      console.log('❌ Password is INCORRECT!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testAdminLogin();
