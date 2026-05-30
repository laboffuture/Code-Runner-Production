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

    // Admin credentials come from environment — NEVER hardcode them.
    // Set these in .env.local (which is git-ignored) before running:
    //   ADMIN_USERNAME=...  ADMIN_EMAIL=...  ADMIN_PASSWORD=...
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@coderunner.com';
    const adminPassword = process.env.ADMIN_PASSWORD;
    // ADMIN_ROLE lets this script seed either a developer (default) or a teacher.
    const adminRole: 'developer' | 'teacher' =
      process.env.ADMIN_ROLE === 'teacher' ? 'teacher' : 'developer';

    if (!adminPassword || adminPassword.length < 12) {
      console.error('❌ ADMIN_PASSWORD env var is required and must be at least 12 characters.');
      console.error('   Set it in .env.local (git-ignored), e.g.:');
      console.error('   ADMIN_PASSWORD=<a-strong-unique-password> npx tsx src/scripts/create-admin.ts');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await Models.User.findOne({ username: adminUsername });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists — leaving the existing password untouched.');
      console.log('📝 Admin details:', {
        username: existingAdmin.username,
        email: existingAdmin.email,
        role: existingAdmin.role,
      });

      // Only reset the password when explicitly requested, to avoid silently
      // clobbering a production admin password on every run.
      if (process.env.ADMIN_RESET_PASSWORD === 'true') {
        existingAdmin.passwordHash = await hashPassword(adminPassword);
        await existingAdmin.save();
        console.log('✅ Admin password reset from ADMIN_PASSWORD (ADMIN_RESET_PASSWORD=true).');
      } else {
        console.log('ℹ️  To reset it, re-run with ADMIN_RESET_PASSWORD=true.');
      }
    } else {
      // Create admin user
      console.log('👤 Creating admin user...');

      const passwordHash = await hashPassword(adminPassword);

      const adminUser = new Models.User({
        username: adminUsername,
        email: adminEmail,
        passwordHash,
        age_group: '15-18',
        role: adminRole,
        selectedCharacter: 'astra',
        onboardingComplete: true,
      });

      await adminUser.save();

      console.log(`✅ ${adminRole} user created successfully!`);
      console.log('📝 Login as:', {
        username: adminUsername,
        email: adminEmail,
        role: adminRole,
        password: '(the ADMIN_PASSWORD you provided — not shown)',
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
