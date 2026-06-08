/**
 * One-time migration: rename the legacy `role: 'owner'` users to `role: 'admin'`.
 *
 * The top oversight tier was renamed from 'owner' to 'admin' so the role model
 * is (student | teacher | developer | admin). Mongoose only validates roles on
 * save, so existing documents are not updated automatically — this script
 * promotes them in place.
 *
 * Coordinated with deploy: run this when the API serving the admin area is on
 * the new code (the `adminMiddleware` gate now requires role 'admin'); until
 * then an un-migrated account still has role 'owner' and would be rejected.
 *
 * After migrating, the admin must log OUT and back IN: a JWT minted before the
 * migration still carries role 'owner' and is rejected by adminMiddleware's
 * stage-1 (JWT) check until re-login.
 *
 * Run with:  npx tsx src/scripts/migrate-owner-to-admin.ts
 */

import { Models } from '@code-runner/shared';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env.local') });

async function run() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI not found in environment');
    process.exit(1);
  }

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(mongoUri);

  // `'owner'` is no longer part of the role union, hence the cast.
  const result = await Models.User.updateMany(
    { role: 'owner' as any },
    { $set: { role: 'admin' } }
  );

  console.log(`✅ Migrated ${result.modifiedCount} legacy 'owner' user(s) → 'admin'.`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
