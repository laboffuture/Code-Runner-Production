import dotenv from 'dotenv';
import path from 'path';
import { connectToDatabase, Models, hashPassword } from '@code-runner/shared';

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env.local');
dotenv.config({ path: envPath });

async function resetAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectToDatabase();
    console.log('✅ Connected to MongoDB');

    // Delete existing admin user
    const deleted = await Models.User.deleteOne({ username: 'admin' });
    if (deleted.deletedCount > 0) {
      console.log('🗑️  Deleted existing admin user');
    }

    console.log('🔐 Creating new admin user...');
    const passwordHash = await hashPassword('admin123');

    const admin = await Models.User.create({
      username: 'admin',
      email: 'admin@coderunner.com',
      passwordHash,
      role: 'admin',
      age_group: '15-18',
    });

    console.log('\n✅ Admin user created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('  Email: admin@coderunner.com');
    console.log('  Role: admin');
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting admin user:', error);
    process.exit(1);
  }
}

resetAdmin();
