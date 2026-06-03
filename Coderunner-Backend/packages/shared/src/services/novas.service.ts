import mongoose from 'mongoose';
import { UserProgress, CoinTransaction } from '../database/models';
import { NOVAS } from '../utils/novas.config';
import { getLogger } from '../utils/logger.utils';

const logger = getLogger('novas-service');

/**
 * Award Novas (✨) to a student. The single earning gateway — by design Novas are earned
 * ONLY from contests. Gated by NOVAS.EARNING_ENABLED: while off (scaffold) this is a
 * no-op, so the contest hooks that call it stay dormant until earning goes live.
 *
 * Atomic + audited: the coin $inc and the CoinTransaction ledger row commit together in
 * one transaction (no coins without a ledger entry), matching the redeem/adjust bar.
 * Best-effort: never throws — a failed award must not break contest finalization; it logs
 * and returns false. Earning only adds, so amount must be a positive integer.
 */
export async function awardNovas(
  userId: string,
  amount: number,
  reason: string,
  refId?: string
): Promise<boolean> {
  if (!NOVAS.EARNING_ENABLED) return false; // dormant until go-live
  if (!mongoose.Types.ObjectId.isValid(userId)) return false;
  if (!Number.isInteger(amount) || amount <= 0) return false;

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const updated = await UserProgress
        .findOneAndUpdate(
          { userId },
          { $inc: { coins: amount } },
          { new: true, projection: { coins: 1 }, session }
        )
        .lean<{ coins?: number } | null>();
      if (!updated) {
        // No wallet for this user (a registered student always has one) — skip cleanly.
        const err: any = new Error('No UserProgress for awardNovas target');
        err.skip = true;
        throw err;
      }
      const balanceAfter = updated.coins ?? 0;
      await CoinTransaction.create(
        [{ userId, amount, type: 'earn', reason, refType: 'contest', refId: refId ?? null, balanceAfter }],
        { session }
      );
    });
    return true;
  } catch (error: any) {
    if (!error?.skip) {
      logger.error('awardNovas failed', {
        userId, amount,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return false;
  } finally {
    await session.endSession();
  }
}
