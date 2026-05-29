/**
 * Script to test MongoDB connection
 * Run with: npx tsx src/scripts/test-mongodb.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

async function testMongoDBConnection() {
  const mongoUri = process.env.MONGODB_URI;

  console.log('🧪 Testing MongoDB Connection...\n');
  console.log('📋 Connection String:', mongoUri?.replace(/:[^:@]+@/, ':****@'));

  if (!mongoUri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  try {
    console.log('\n🔌 Attempting to connect...');

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    });

    console.log('✅ Successfully connected to MongoDB!');
    console.log('📊 Connection details:', {
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      state: mongoose.connection.readyState,
    });

    // Test database operations
    console.log('\n🧪 Testing database operations...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections:`, collections.map(c => c.name).join(', '));

    await mongoose.disconnect();
    console.log('\n✅ Connection test passed!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);

    if (error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
      console.error('\n💡 DNS Resolution Failed. Possible causes:');
      console.error('   1. MongoDB Atlas cluster is paused or deleted');
      console.error('   2. Invalid cluster hostname in connection string');
      console.error('   3. Network/firewall blocking MongoDB Atlas');
      console.error('\n🔧 Solutions:');
      console.error('   - Check MongoDB Atlas dashboard: https://cloud.mongodb.com/');
      console.error('   - Verify cluster is active (not paused)');
      console.error('   - Check if your IP is whitelisted in Network Access');
    } else if (error.message.includes('Authentication failed')) {
      console.error('\n💡 Authentication Failed. Possible causes:');
      console.error('   1. Incorrect username or password');
      console.error('   2. Password contains special characters that need URL encoding');
      console.error('\n🔧 Solutions:');
      console.error('   - Check credentials in MongoDB Atlas');
      console.error('   - URL-encode special characters in password (@ = %40)');
    }

    process.exit(1);
  }
}

testMongoDBConnection();
