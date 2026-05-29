import { OptimizedDatabaseService } from '../src/lib/database/db-service-optimized';

async function clearCache() {
  try {
    console.log('Clearing all problem caches...');

    // Invalidate all problem-related caches
    await OptimizedDatabaseService.invalidateCache('problem');

    console.log('✅ Cache cleared successfully!');
    console.log('Cache stats:', OptimizedDatabaseService.getCacheStats());

  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    process.exit(1);
  }
}

clearCache()
  .then(() => {
    console.log('\n✅ Cache clearing completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Cache clearing failed:', error);
    process.exit(1);
  });
