/**
 * Script to test if API server is running and accessible
 * Run with: npx tsx src/scripts/test-api-server.ts
 */

async function testAPIServer() {
  const API_URL = 'http://localhost:4000';

  console.log('🧪 Testing API Server...\n');
  console.log('📋 API URL:', API_URL);

  try {
    // Test health endpoint
    console.log('\n🔌 Testing connection...');
    const response = await fetch(`${API_URL}/health`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Server is running!');
      console.log('📊 Response:', data);
    } else {
      console.log('⚠️  API responded but with error:', response.status, response.statusText);
    }
  } catch (error: any) {
    console.error('\n❌ Cannot connect to API server!');
    console.error('Error:', error.message);

    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
      console.error('\n💡 API server is not running.');
      console.error('\n🔧 To start the API server:');
      console.error('   1. Open a terminal');
      console.error('   2. cd apps/api');
      console.error('   3. npm run dev');
      console.error('\n   Or use the start-services script.');
    }
    process.exit(1);
  }
}

testAPIServer();
