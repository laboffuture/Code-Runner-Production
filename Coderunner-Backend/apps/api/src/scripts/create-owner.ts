/**
 * Script to create the platform OWNER (oversight tier) account.
 * Run with: npx tsx src/scripts/create-owner.ts
 * Requires in .env.local (git-ignored): OWNER_USERNAME, OWNER_EMAIL, OWNER_PASSWORD
 */
import { Models, hashPassword } from '@code-runner/shared';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env.local') });

async function createOwnerUser() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    const ownerUsername = process.env.OWNER_USERNAME || 'owner';
    const ownerEmail = process.env.OWNER_EMAIL || 'owner@coderunner.com';
    const ownerPassword = process.env.OWNER_PASSWORD;

    if (!ownerPassword || ownerPassword.length < 12) {
      console.error('❌ OWNER_PASSWORD env var is required and must be at least 12 characters.');
      console.error('   Set it in .env.local, e.g. OWNER_PASSWORD=<strong-unique> npx tsx src/scripts/create-owner.ts');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const existing = await Models.User.findOne({ username: ownerUsername });
    if (existing) {
      console.log('⚠️  Owner user already exists — leaving the existing password untouched.');
      console.log('📝 Owner:', { username: existing.username, email: existing.email, role: existing.role });
      if (process.env.OWNER_RESET_PASSWORD === 'true') {
        existing.passwordHash = await hashPassword(ownerPassword);
        await existing.save();
        console.log('✅ Owner password reset (OWNER_RESET_PASSWORD=true).');
      } else {
        console.log('ℹ️  To reset it, re-run with OWNER_RESET_PASSWORD=true.');
      }
    } else {
      const passwordHash = await hashPassword(ownerPassword);
      const owner = new Models.User({
        username: ownerUsername,
        email: ownerEmail,
        passwordHash,
        age_group: '15-18',
        role: 'owner',
        selectedCharacter: 'astra',
        onboardingComplete: true,
      });
      await owner.save();
      console.log('✅ Owner user created:', { username: ownerUsername, email: ownerEmail, role: 'owner' });
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating owner user:', error);
    process.exit(1);
  }
}

createOwnerUser();
