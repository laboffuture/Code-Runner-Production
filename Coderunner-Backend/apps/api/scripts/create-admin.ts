import dotenv from 'dotenv';
import path from 'path';
import { connectToDatabase, Models, hashPassword } from '@code-runner/shared';

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env.local');
dotenv.config({ path: envPath });

async function createAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectToDatabase();
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Models.User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Username:', existingAdmin.username);
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      console.log('\nIf you want to reset the password, delete this user first.');
      process.exit(0);
    }

    console.log('🔐 Creating admin user...');
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
    console.log('═══════════════════════════════════════');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin();
