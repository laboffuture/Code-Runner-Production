/**
 * Script to create/reset the platform ADMIN (top oversight tier) account.
 * Run with: npx tsx src/scripts/create-owner.ts
 * Requires in .env.local (git-ignored): OWNER_USERNAME, OWNER_EMAIL, OWNER_PASSWORD
 *
 * NOTE: the env vars + default username keep the `OWNER_`/`owner` names for
 * backward-compatibility with the existing account, but the role assigned is
 * 'admin' (the tier was renamed owner → admin). The legacy `owner` accounts are
 * promoted by scripts/migrate-owner-to-admin.ts.
 */
import { Models, hashPassword } from '@code-runner/shared';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env.local') });

async function createAdminUser() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    const adminUsername = process.env.OWNER_USERNAME || 'owner';
    const adminEmail = process.env.OWNER_EMAIL || 'owner@coderunner.com';
    const adminPassword = process.env.OWNER_PASSWORD;

    if (!adminPassword || adminPassword.length < 12) {
      console.error('❌ OWNER_PASSWORD env var is required and must be at least 12 characters.');
      console.error('   Set it in .env.local, e.g. OWNER_PASSWORD=<strong-unique> npx tsx src/scripts/create-owner.ts');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const existing = await Models.User.findOne({ username: adminUsername });
    if (existing) {
      console.log('⚠️  Admin user already exists — leaving the existing password untouched.');
      console.log('📝 Admin:', { username: existing.username, email: existing.email, role: existing.role });
      if (process.env.OWNER_RESET_PASSWORD === 'true') {
        existing.passwordHash = await hashPassword(adminPassword);
        // Self-heal: also ensure role 'admin'. Promotes a legacy pre-migration
        // 'owner' doc and satisfies the enum on save() regardless of whether
        // migrate-owner-to-admin.ts has run yet.
        existing.role = 'admin';
        await existing.save();
        console.log('✅ Admin password reset + role ensured admin (OWNER_RESET_PASSWORD=true).');
      } else {
        console.log('ℹ️  To reset it, re-run with OWNER_RESET_PASSWORD=true.');
      }
    } else {
      const passwordHash = await hashPassword(adminPassword);
      const admin = new Models.User({
        username: adminUsername,
        email: adminEmail,
        passwordHash,
        age_group: '15-18',
        role: 'admin',
        selectedCharacter: 'astra',
        onboardingComplete: true,
      });
      await admin.save();
      console.log('✅ Admin user created:', { username: adminUsername, email: adminEmail, role: 'admin' });
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
