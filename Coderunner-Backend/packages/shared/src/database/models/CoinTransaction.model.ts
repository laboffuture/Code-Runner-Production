import mongoose, { Schema, Document } from 'mongoose';

/**
 * Append-only ledger of every Novas (✨) movement — earn (contest), spend (store
 * order), or a developer adjust. Durable audit trail for real-merch disputes.
 */
export interface ICoinTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number; // +earn / -spend
  type: 'earn' | 'spend' | 'adjust';
  reason: string;
  refType?: 'contest' | 'order' | 'admin' | null;
  refId?: string | null;
  balanceAfter: number;
  createdAt: Date;
  updatedAt: Date;
}

const CoinTransactionSchema = new Schema<ICoinTransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['earn', 'spend', 'adjust'], required: true },
    reason: { type: String, required: true },
    refType: { type: String, enum: ['contest', 'order', 'admin', null], default: null },
    refId: { type: String, default: null },
    balanceAfter: { type: Number, required: true },
  },
  { timestamps: true, collection: 'coin_transactions' }
);

CoinTransactionSchema.index({ userId: 1, createdAt: -1 });

export const CoinTransaction =
  mongoose.models.CoinTransaction ||
  mongoose.model<ICoinTransaction>('CoinTransaction', CoinTransactionSchema);
