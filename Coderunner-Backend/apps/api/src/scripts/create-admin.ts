/**
 * Script to create an admin user
 * Run with: npx tsx src/scripts/create-admin.ts
 */

import { Models, hashPassword } from '@code-runner/shared';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

async function createAdminUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await Models.User.findOne({ username: 'admin' });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('📝 Admin details:', {
        username: existingAdmin.username,
        email: existingAdmin.email,
        role: existingAdmin.role,
      });

      // Update password if needed
      const newPasswordHash = await hashPassword('admin123');
      existingAdmin.passwordHash = newPasswordHash;
      await existingAdmin.save();
      console.log('✅ Admin password reset to: admin123');
    } else {
      // Create admin user
      console.log('👤 Creating admin user...');

      const passwordHash = await hashPassword('admin123');

      const adminUser = new Models.User({
        username: 'admin',
        email: 'admin@coderunner.com',
        passwordHash,
        age_group: '15-18',
        role: 'admin',
        selectedCharacter: 'astra',
        onboardingComplete: true,
      });

      await adminUser.save();

      console.log('✅ Admin user created successfully!');
      console.log('📝 Login credentials:', {
        username: 'admin',
        password: 'admin123',
        email: 'admin@coderunner.com',
        role: 'admin',
      });
    }

    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
