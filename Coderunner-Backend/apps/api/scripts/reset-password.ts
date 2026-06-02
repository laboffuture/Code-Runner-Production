/**
 * Reset password for a specific user
 * Usage: npx tsx scripts/reset-password.ts <username> <new-password>
 */

import { connectToDatabase, Models, hashPassword } from '@code-runner/shared';

async function resetPassword() {
  const username = process.argv[2];
  const newPassword = process.argv[3];

  if (!username || !newPassword) {
    console.error('❌ Usage: npx tsx scripts/reset-password.ts <username> <new-password>');
    console.error('   Example: npx tsx scripts/reset-password.ts admin NewPass123!');
    process.exit(1);
  }

  console.log(`🔄 Resetting password for user: ${username}\n`);

  try {
    await connectToDatabase();
    console.log('✅ Connected to MongoDB\n');

    // Find user
    const user = await Models.User.findOne({ username });
    if (!user) {
      console.error(`❌ User '${username}' not found!`);
      process.exit(1);
    }

    // Hash new password (shared util — keeps the bcrypt cost in one place).
    const hashedPassword = await hashPassword(newPassword);

    // Update the REAL field. The model field is `passwordHash` (select:false);
    // writing `user.password` (a non-existent field) silently no-op'd, so this
    // script used to print "success" while the password never changed.
    user.passwordHash = hashedPassword;
    await user.save();

    console.log(`✅ Password reset successful for user: ${username}`);
    console.log(`\n📌 New credentials:`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${newPassword}`);
    console.log(`\n🔐 You can now login at: http://localhost:3000/login\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPassword();
