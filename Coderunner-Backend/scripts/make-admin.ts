/**
 * Promote a user to admin role
 * 
 * Usage (from project root):
 *   npx tsx scripts/make-admin.ts <username>
 * 
 * Example:
 *   npx tsx scripts/make-admin.ts jagathguru
 * 
 * If you don't know your username, run without arguments to see all users:
 *   npx tsx scripts/make-admin.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

// Load env from api's .env.local
dotenv.config({ path: path.resolve(__dirname, '../apps/api/.env.local') });
dotenv.config(); // fallback

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set. Check apps/api/.env.local');
  process.exit(1);
}

const username = process.argv[2];

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI!);
  console.log('✅ Connected\n');

  const db = mongoose.connection.db!;
  const usersCollection = db.collection('users');

  // If no username given, list all users
  if (!username) {
    const allUsers = await usersCollection.find({}).project({ username: 1, role: 1, email: 1 }).toArray();
    console.log('All users in database:\n');
    if (allUsers.length === 0) {
      console.log('  (no users found — register one first via the app)');
    } else {
      allUsers.forEach(u => {
        const marker = u.role === 'admin' ? '👑' : '  ';
        console.log(`  ${marker} ${u.username} — ${u.role} — ${u.email}`);
      });
      console.log(`\nTo promote a user: npx tsx scripts/make-admin.ts <username>`);
    }
    await mongoose.disconnect();
    return;
  }

  // Find user
  const user = await usersCollection.findOne({ username });
  if (!user) {
    const allUsers = await usersCollection.find({}).project({ username: 1 }).toArray();
    console.error(`❌ User "${username}" not found.\n`);
    console.log('Available users:');
    allUsers.forEach(u => console.log(`  - ${u.username}`));
    await mongoose.disconnect();
    process.exit(1);
  }

  if (user.role === 'admin') {
    console.log(`✅ "${username}" is already an admin.`);
    await mongoose.disconnect();
    return;
  }

  // Promote
  await usersCollection.updateOne({ username }, { $set: { role: 'admin' } });
  console.log(`✅ "${username}" promoted to admin!\n`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Previous role: ${user.role}`);
  console.log(`   New role: admin`);
  console.log(`\nNow log in with this account and go to /admin/dashboard`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
