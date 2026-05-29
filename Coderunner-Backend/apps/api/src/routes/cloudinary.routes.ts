import { Router, Request, Response } from 'express';
import { authMiddleware, developerMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.use(developerMiddleware);

/**
 * GET /admin/cloudinary/stats
 * Get Cloudinary usage statistics
 * 
 * Cloudinary Free Plan Limits:
 * - 25 credits/month
 * - Storage: 25 GB (uses credits)
 * - Bandwidth: 25 GB/month (uses credits)
 * - Transformations: 25,000/month (uses credits)
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'developer') {
      return res.status(403).json({ error: 'Forbidden', message: 'Developer access required' });
    }

    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return res.status(400).json({
        _unavailable: true,
        error: 'Cloudinary not configured',
        message: 'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env',
      });
    }

    const auth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64');

    // Fetch usage from Cloudinary Admin API
    const usageResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/usage`,
      { headers: { 'Authorization': `Basic ${auth}` } }
    );

    if (!usageResponse.ok) {
      const errText = await usageResponse.text();
      throw new Error(`Cloudinary API ${usageResponse.status}: ${errText}`);
    }

    const u: any = await usageResponse.json();

    // Cloudinary API returns: { plan, storage: { usage }, bandwidth: { usage }, 
    //   transformations: { usage }, credits: { usage, limit, used_percent } }
    // "usage" values for storage/bandwidth are in BYTES
    // "usage" for transformations is COUNT
    // "credits" usage/limit are in CREDITS (float)

    // Free plan limits
    const STORAGE_LIMIT = 25 * 1024 * 1024 * 1024; // 25 GB in bytes
    const BANDWIDTH_LIMIT = 25 * 1024 * 1024 * 1024; // 25 GB in bytes  
    const TRANSFORMATION_LIMIT = 25000; // 25,000 transformations
    const CREDITS_LIMIT = u.credits?.limit || 25;

    const storageUsed = u.storage?.usage || 0;
    const bandwidthUsed = u.bandwidth?.usage || 0;
    const transformationsUsed = u.transformations?.usage || 0;
    const creditsUsed = u.credits?.usage || 0;

    // Fetch resource count
    let totalImages = 0;
    let totalVideos = 0;
    let recentUploads: any[] = [];

    try {
      const imgRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image?max_results=10`,
        { headers: { 'Authorization': `Basic ${auth}` } }
      );
      if (imgRes.ok) {
        const imgData: any = await imgRes.json();
        totalImages = imgData.total_count || imgData.resources?.length || 0;
        recentUploads = (imgData.resources || []).slice(0, 10).map((r: any) => ({
          public_id: r.public_id,
          format: r.format,
          bytes: r.bytes,
          width: r.width,
          height: r.height,
          created_at: r.created_at,
          url: r.secure_url,
          type: r.resource_type,
        }));
      }
    } catch (err) {
      console.error('Failed to fetch Cloudinary resources:', err);
    }

    try {
      const vidRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/video?max_results=1`,
        { headers: { 'Authorization': `Basic ${auth}` } }
      );
      if (vidRes.ok) {
        const vidData: any = await vidRes.json();
        totalVideos = vidData.total_count || vidData.resources?.length || 0;
      }
    } catch (err) {
      // Video fetch failed, not critical
    }

    res.json({
      cloudName: CLOUDINARY_CLOUD_NAME,
      usage: {
        plan: u.plan || 'Free',
        credits: {
          used: creditsUsed,
          limit: CREDITS_LIMIT,
          usage_pct: CREDITS_LIMIT > 0 ? (creditsUsed / CREDITS_LIMIT) * 100 : 0,
        },
        bandwidth: {
          used: bandwidthUsed,
          limit: BANDWIDTH_LIMIT,
          usage_pct: BANDWIDTH_LIMIT > 0 ? (bandwidthUsed / BANDWIDTH_LIMIT) * 100 : 0,
        },
        storage: {
          used: storageUsed,
          limit: STORAGE_LIMIT,
          usage_pct: STORAGE_LIMIT > 0 ? (storageUsed / STORAGE_LIMIT) * 100 : 0,
        },
        transformations: {
          used: transformationsUsed,
          limit: TRANSFORMATION_LIMIT,
          usage_pct: TRANSFORMATION_LIMIT > 0 ? (transformationsUsed / TRANSFORMATION_LIMIT) * 100 : 0,
        },
      },
      assets: {
        totalImages,
        totalVideos,
        totalStorage: storageUsed,
      },
      recentUploads,
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error('Error fetching Cloudinary stats:', error);
    res.status(500).json({ error: 'Failed to fetch Cloudinary statistics', message: error.message });
  }
});

export default router;
