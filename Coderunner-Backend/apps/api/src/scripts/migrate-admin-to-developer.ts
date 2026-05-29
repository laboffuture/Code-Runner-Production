/**
 * One-time migration: promote legacy `role: 'admin'` users to `role: 'developer'`.
 *
 * The role model changed from ('student' | 'admin') to
 * ('student' | 'teacher' | 'developer'). Existing admin accounts (the dev/ops
 * team) must become 'developer' so they keep access to the monitoring
 * dashboard — Mongoose only validates roles on save, so existing documents are
 * not updated automatically.
 *
 * Run with:  npx tsx src/scripts/migrate-admin-to-developer.ts
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

  // `'admin'` is no longer part of the role union, hence the cast.
  const result = await Models.User.updateMany(
    { role: 'admin' as any },
    { $set: { role: 'developer' } }
  );

  console.log(`✅ Migrated ${result.modifiedCount} legacy 'admin' user(s) → 'developer'.`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
