import { Router, Request, Response } from 'express';
import { Models, getLogger } from '@code-runner/shared';
import { authMiddleware, developerMiddleware } from '../middleware/auth.middleware';
import mongoose from 'mongoose';

const router = Router();
const logger = getLogger('admin-store-routes');

// Developer-only: every route here is the dev/ops team operating the Novas store.
// Teachers and students have NO access (no teacher-facing route exists).
router.use(authMiddleware);
router.use(developerMiddleware);

const CATEGORIES = ['sticker', 'merch', 'other'] as const;
type Category = (typeof CATEGORIES)[number];

// ── Catalog ──────────────────────────────────────────────────────────────────

// GET /admin/store/items — full catalog incl. inactive, newest first.
router.get('/items', async (_req: Request, res: Response) => {
  try {
    const items = await Models.StoreItem.find({}).sort({ createdAt: -1 }).lean();
    res.json({ items });
  } catch (error) {
    logger.error('Failed to list store items', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to list items' });
  }
});

// Validate + coerce an item body for create/update. Returns a clean field set or an error string.
function parseItemBody(body: any): { fields: Record<string, unknown> } | { error: string } {
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  if (!name) return { error: 'A name is required' };
  // priceCoins: required, a number >= 0. Reject blank/whitespace explicitly so a
  // missing price can't silently coerce to 0 (Number('') === 0) and ship a free item.
  const rawPrice = typeof body?.priceCoins === 'string' ? body.priceCoins.trim() : body?.priceCoins;
  if (rawPrice === '' || rawPrice === null || rawPrice === undefined) return { error: 'priceCoins is required' };
  const priceCoins = Number(rawPrice);
  if (!Number.isFinite(priceCoins) || priceCoins < 0) return { error: 'priceCoins must be a number >= 0' };
  const category: Category = CATEGORIES.includes(body?.category) ? body.category : 'other';
  // stock: a non-negative integer, or null for unlimited (blank/whitespace = unlimited).
  let stock: number | null = null;
  const rawStock = typeof body?.stock === 'string' ? body.stock.trim() : body?.stock;
  if (rawStock !== null && rawStock !== undefined && rawStock !== '') {
    const s = Number(rawStock);
    if (!Number.isInteger(s) || s < 0) return { error: 'stock must be a non-negative integer or null' };
    stock = s;
  }
  return {
    fields: {
      name,
      description: typeof body?.description === 'string' ? body.description.trim() : '',
      imageUrl: typeof body?.imageUrl === 'string' ? body.imageUrl.trim() : '',
      priceCoins,
      category,
      stock,
    },
  };
}

// POST /admin/store/items — create an item.
router.post('/items', async (req: Request, res: Response) => {
  try {
    const parsed = parseItemBody(req.body);
    if ('error' in parsed) return res.status(400).json({ error: 'Validation Error', message: parsed.error });
    const item = await Models.StoreItem.create({ ...parsed.fields, active: true });
    res.status(201).json({ item });
  } catch (error) {
    logger.error('Failed to create store item', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// PUT /admin/store/items/:id — update fields and/or active flag.
router.put('/items/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Validation Error', message: 'Invalid id' });
    const parsed = parseItemBody(req.body);
    if ('error' in parsed) return res.status(400).json({ error: 'Validation Error', message: parsed.error });
    // Only touch `active` when the caller explicitly sends a boolean — otherwise an
    // unrelated field edit would silently re-activate a deliberately hidden item.
    const set: Record<string, unknown> = { ...parsed.fields };
    if (typeof req.body?.active === 'boolean') set.active = req.body.active;
    const item = await Models.StoreItem.findByIdAndUpdate(id, { $set: set }, { new: true }).lean();
    if (!item) return res.status(404).json({ error: 'Not Found', message: 'Item not found' });
    res.json({ item });
  } catch (error) {
    logger.error('Failed to update store item', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// ── Fulfillment ──────────────────────────────────────────────────────────────

// GET /admin/store/orders?status=pending|collected|cancelled — the pickup list.
router.get('/orders', async (req: Request, res: Response) => {
  try {
    const status = String(req.query?.status || '');
    const filter = ['pending', 'collected', 'cancelled'].includes(status) ? { status } : {};
    const orders = await Models.StoreOrder.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    res.json({ orders });
  } catch (error) {
    logger.error('Failed to list orders', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to list orders' });
  }
});

// POST /admin/store/orders/:id/collect — mark an order handed over at school.
router.post('/orders/:id/collect', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Validation Error', message: 'Invalid id' });
    const order = await Models.StoreOrder.findOneAndUpdate(
      { _id: id, status: 'pending' },
      { $set: { status: 'collected', collectedAt: new Date(), fulfilledBy: req.user!.userId } },
      { new: true }
    ).lean();
    if (!order) return res.status(409).json({ error: 'Conflict', message: 'Order not found or not pending' });
    res.json({ order });
  } catch (error) {
    logger.error('Failed to mark collected', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// ── Manual Novas adjust (developer grant/correction) ─────────────────────────

// POST /admin/store/adjust-novas { username, amount, reason } — atomically add/remove
// a user's Novas and record a ledger entry. The one coin-write live in scaffold; it is
// developer-only and audited. amount may be negative (a correction) but cannot push a
// balance below 0. Coin $inc + ledger write run in one transaction (no half-applied
// adjust), matching the Phase-2 redeem's atomicity bar.
// NOTE: withTransaction requires a replica set; Atlas is one. A standalone local mongod
// will 500 here (fails closed — no partial write), same as the redeem path.
router.post('/adjust-novas', async (req: Request, res: Response) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const amount = Number(req.body?.amount);
  const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
  if (!username) return res.status(400).json({ error: 'Validation Error', message: 'username is required' });
  if (!Number.isInteger(amount) || amount === 0) return res.status(400).json({ error: 'Validation Error', message: 'amount must be a non-zero integer' });
  if (!reason) return res.status(400).json({ error: 'Validation Error', message: 'reason is required' });

  const user = await Models.User.findOne({ username }).select('_id').lean<{ _id: mongoose.Types.ObjectId } | null>();
  if (!user) return res.status(404).json({ error: 'Not Found', message: 'No user with that username' });
  const userId = user._id;

  const session = await mongoose.startSession();
  try {
    let balanceAfter = 0;
    await session.withTransaction(async () => {
      // For a deduction, guard so the balance can't go below 0 (coins >= -amount).
      const floor = amount < 0 ? -amount : 0;
      const updated = await Models.UserProgress
        .findOneAndUpdate(
          { userId, coins: { $gte: floor } },
          { $inc: { coins: amount } },
          { new: true, projection: { coins: 1 }, session }
        )
        .lean<{ coins?: number } | null>();
      if (!updated) {
        // Either no progress doc, or the deduction would go negative.
        const err: any = new Error('Adjustment would make the balance negative (or no wallet exists).');
        err.statusCode = 400;
        throw err;
      }
      balanceAfter = updated.coins ?? 0;
      await Models.CoinTransaction.create(
        [{ userId, amount, type: 'adjust', reason, refType: 'admin', refId: req.user!.userId, balanceAfter }],
        { session }
      );
    });
    res.json({ username, amount, balanceAfter });
  } catch (error: any) {
    if (error?.statusCode === 400) return res.status(400).json({ error: 'Validation Error', message: error.message });
    logger.error('Failed to adjust novas', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to adjust balance' });
  } finally {
    await session.endSession();
  }
});

export default router;
