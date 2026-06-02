import { Router, Request, Response } from 'express';
import { Models, getLogger, NOVAS } from '@code-runner/shared';
import { authMiddleware } from '../middleware/auth.middleware';
import mongoose from 'mongoose';

const router = Router();
const logger = getLogger('store-routes');

// Everything here requires a logged-in user.
router.use(authMiddleware);

// GET /store/items — the active catalog (everyone sees the same store).
router.get('/items', async (_req: Request, res: Response) => {
  try {
    const items = await Models.StoreItem.find({ active: true }).sort({ priceCoins: 1 }).lean();
    res.json({ items });
  } catch (error) {
    logger.error('Failed to fetch store items', {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ error: 'Failed to fetch store items' });
  }
});

// GET /store/my-orders — the caller's own orders, newest first.
router.get('/my-orders', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const orders = await Models.StoreOrder.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ orders });
  } catch (error) {
    logger.error('Failed to fetch orders', {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// A business-rule failure that must roll the redeem transaction back and map to a
// specific HTTP status (vs. a 500 for an unexpected error).
class RedeemError extends Error {
  constructor(public statusCode: number, public payload: { error: string; message: string }) {
    super(payload.message);
  }
}

// POST /store/orders { itemId } — redeem Novas for an item (order now, collect at
// school). Gated by NOVAS.REDEMPTION_ENABLED: while off (scaffold) it returns a clean
// "coming soon" 503 and touches nothing.
//
// The spend is server-authoritative (price re-read from the DB, never the client) and
// fully ATOMIC: the debit, stock claim, order, and ledger write all run inside one
// MongoDB transaction, so a failure on any step rolls back every step — coins can never
// be spent without a matching order + ledger row. The conditional `coins >= price`
// debit can't go negative, and withTransaction auto-retries on the write-conflict that
// two concurrent debits of the same wallet would raise, so no double-spend.
// (Requires a replica set — Atlas always is; the path stays gated until go-live.)
router.post('/orders', async (req: Request, res: Response) => {
  if (!NOVAS.REDEMPTION_ENABLED) {
    return res.status(503).json({
      error: 'Coming soon',
      message: 'The store is not open for redemptions yet.',
    });
  }

  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const studentName = req.user?.username ?? 'Unknown';

  const itemId = String(req.body?.itemId || '');
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ error: 'Validation Error', message: 'A valid itemId is required' });
  }

  const session = await mongoose.startSession();
  try {
    let outcome: { orderId: string; balanceAfter: number } | null = null;

    await session.withTransaction(async () => {
      const item = await Models.StoreItem
        .findOne({ _id: itemId, active: true })
        .session(session)
        .lean<{ _id: mongoose.Types.ObjectId; name: string; priceCoins: number; stock: number | null } | null>();
      if (!item) throw new RedeemError(404, { error: 'Not Found', message: 'Item not available' });
      const price = item.priceCoins;

      // Atomic balance guard + debit; the returned doc carries this op's post-debit balance.
      const debited = await Models.UserProgress
        .findOneAndUpdate(
          { userId, coins: { $gte: price } },
          { $inc: { coins: -price } },
          { new: true, projection: { coins: 1 }, session }
        )
        .lean<{ coins?: number } | null>();
      if (!debited) throw new RedeemError(400, { error: 'Insufficient balance', message: 'Not enough Novas.' });
      const balanceAfter = debited.coins ?? 0;

      // Claim one unit if stock-limited (rolled back with everything else on any later throw).
      if (item.stock !== null) {
        const claim = await Models.StoreItem.updateOne(
          { _id: item._id, stock: { $gte: 1 } },
          { $inc: { stock: -1 } },
          { session }
        );
        if (claim.matchedCount === 0) {
          throw new RedeemError(409, { error: 'Out of stock', message: 'That item just sold out.' });
        }
      }

      // create([...], { session }) — the array form is required when passing options.
      const [order] = await Models.StoreOrder.create(
        [{
          userId,
          studentNameSnapshot: studentName,
          itemId: item._id,
          itemNameSnapshot: item.name,
          coinsSpent: price,
          status: 'pending',
        }],
        { session }
      );

      await Models.CoinTransaction.create(
        [{
          userId,
          amount: -price,
          type: 'spend',
          reason: `Store order: ${item.name}`,
          refType: 'order',
          refId: String(order._id),
          balanceAfter,
        }],
        { session }
      );

      outcome = { orderId: String(order._id), balanceAfter };
    });

    if (!outcome) {
      // Unreachable: a resolved transaction always sets outcome. Guard for safety/types.
      return res.status(500).json({ error: 'Failed to create order' });
    }
    const { orderId, balanceAfter } = outcome;
    return res.status(201).json({ orderId, coins: balanceAfter });
  } catch (error) {
    if (error instanceof RedeemError) {
      return res.status(error.statusCode).json(error.payload);
    }
    logger.error('Failed to create store order', {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ error: 'Failed to create order' });
  } finally {
    await session.endSession();
  }
});

export default router;
