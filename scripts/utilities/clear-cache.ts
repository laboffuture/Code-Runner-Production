import { createClient } from 'redis';

async function clearCache() {
  const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  try {
    await client.connect();

    // Clear all cache keys
    await client.flushAll();


  } catch (error) {

  } finally {
    await client.quit();

  }
}

clearCache()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(0); // Exit with 0 even on error since Redis might not be running
  });
