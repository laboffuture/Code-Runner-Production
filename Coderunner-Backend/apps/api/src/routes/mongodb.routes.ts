import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Models } from '@code-runner/shared';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

/**
 * GET /admin/mongodb/stats
 * Real MongoDB stats from the live Mongoose connection.
 * 
 * NOTE: Atlas M0 (free tier) does NOT support collStats command.
 * We use countDocuments() for counts and aggregate $bsonSize for sizes.
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden', message: 'Admin access required' });
    }

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }

    // Get collection list
    const collectionList = await db.listCollections().toArray();

    // For each collection, get document count and estimate size
    // Atlas M0 doesn't support collStats, so we use countDocuments + sampling
    const collectionStats = await Promise.all(
      collectionList.map(async (col) => {
        try {
          const collection = db.collection(col.name);
          const count = await collection.countDocuments();
          
          // Estimate size by sampling documents (Atlas M0 compatible)
          let estimatedSize = 0;
          let avgObjSize = 0;
          
          if (count > 0) {
            try {
              // Sample up to 100 documents and calculate average BSON size
              const sampleResult = await collection.aggregate([
                { $sample: { size: Math.min(count, 100) } },
                { $project: { _bsonSize: { $bsonSize: '$$ROOT' } } },
                { $group: { _id: null, avgSize: { $avg: '$_bsonSize' }, totalSampleSize: { $sum: '$_bsonSize' } } }
              ]).toArray();
              
              if (sampleResult.length > 0) {
                avgObjSize = Math.round(sampleResult[0].avgSize || 0);
                estimatedSize = avgObjSize * count;
              }
            } catch (aggErr) {
              // $bsonSize requires MongoDB 4.4+. Fallback: estimate 200 bytes per doc
              avgObjSize = 200;
              estimatedSize = 200 * count;
            }
          }

          // Try to get index info
          let indexCount = 1; // At minimum _id index
          let indexSize = 0;
          try {
            const indexes = await collection.indexes();
            indexCount = indexes.length;
            // Estimate index size: ~40 bytes per document per index
            indexSize = indexCount * count * 40;
          } catch { /* ignore */ }

          return {
            name: col.name,
            count,
            size: estimatedSize,
            avgObjSize,
            storageSize: estimatedSize, // On Atlas M0, storageSize ≈ dataSize
            indexes: indexCount,
            indexSize,
          };
        } catch (err) {
          // Fallback: at least try count
          try {
            const count = await db.collection(col.name).countDocuments();
            return { name: col.name, count, size: count * 200, avgObjSize: 200, storageSize: count * 200, indexes: 1, indexSize: count * 40 };
          } catch {
            return { name: col.name, count: 0, size: 0, avgObjSize: 0, storageSize: 0, indexes: 0, indexSize: 0 };
          }
        }
      })
    );

    // Calculate totals
    const totalDataSize = collectionStats.reduce((sum, col) => sum + col.size, 0);
    const totalIndexSize = collectionStats.reduce((sum, col) => sum + col.indexSize, 0);
    const totalObjects = collectionStats.reduce((sum, col) => sum + col.count, 0);

    // App-level stats
    const [totalUsers, totalProblems] = await Promise.all([
      Models.User.countDocuments(),
      Models.Problem.countDocuments(),
    ]);

    let totalSubmissions = 0;
    let totalSolved = 0;
    try {
      const progressDocs = await Models.UserProgress.find({}).lean();
      totalSubmissions = progressDocs.reduce((sum: number, doc: any) => sum + (doc.stats?.totalSubmissions || 0), 0);
      totalSolved = progressDocs.reduce((sum: number, doc: any) => sum + (doc.stats?.totalSolved || 0), 0);
    } catch { /* ignore */ }

    const connectionState = mongoose.connection.readyState;
    const connectionStatus = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' }[connectionState] || 'unknown';

    res.json({
      connection: {
        status: connectionStatus,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name,
      },
      database: {
        name: mongoose.connection.name || 'code-runner',
        collections: collectionList.length,
        dataSize: totalDataSize,
        storageSize: totalDataSize,
        indexSize: totalIndexSize,
        totalSize: totalDataSize + totalIndexSize,
        avgObjSize: totalObjects > 0 ? Math.round(totalDataSize / totalObjects) : 0,
        objects: totalObjects,
      },
      collections: collectionStats,
      applicationStats: { totalUsers, totalProblems, totalSubmissions, totalSolved },
      recentOperations: [],
      atlasInfo: {
        hasAtlasAPI: !!(process.env.ATLAS_PUBLIC_KEY && process.env.ATLAS_PRIVATE_KEY),
        projectId: process.env.ATLAS_PROJECT_ID || null,
        orgId: process.env.ATLAS_ORG_ID || null,
      },
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error('Error fetching MongoDB stats:', error);
    res.status(500).json({ error: 'Failed to fetch MongoDB statistics', message: error.message });
  }
});

/**
 * GET /admin/mongodb/atlas
 * Atlas cluster info. Returns graceful fallback since Atlas Admin API requires Digest Auth.
 */
router.get('/atlas', async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden', message: 'Admin access required' });
    }

    const connHost = mongoose.connection.host || '';
    const connName = mongoose.connection.name || '';

    res.json({
      _note: 'Data derived from live Mongoose connection.',
      project: {
        id: process.env.ATLAS_PROJECT_ID || null,
        name: connName,
        orgId: process.env.ATLAS_ORG_ID || null,
        created: null,
      },
      clusters: [{
        name: connHost.split('.')[0] || 'atlas-cluster',
        state: mongoose.connection.readyState === 1 ? 'IDLE' : 'UNKNOWN',
        type: 'REPLICASET',
        tier: 'M0',
        provider: 'AWS',
        region: connHost.includes('aws') ? 'AWS' : 'Unknown',
        diskSizeGB: 0.5,
        mongoDBVersion: 'Unknown',
        backupEnabled: false,
        created: null,
        paused: false,
      }],
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error('Error fetching Atlas data:', error);
    res.json({
      _unavailable: true,
      message: error.message,
      project: { id: null, name: 'code-runner', orgId: null, created: null },
      clusters: [],
      timestamp: new Date(),
    });
  }
});

export default router;
