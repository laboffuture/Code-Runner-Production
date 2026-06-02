import mongoose, { Schema, Document } from 'mongoose';

/**
 * One redemption order: a student spent Novas (✨) on an item, to be handed over
 * at school by name. Snapshots the student + item name so the developer's
 * fulfillment list stays correct even if the user or item later changes.
 */
export interface IStoreOrder extends Document {
  userId: mongoose.Types.ObjectId;
  studentNameSnapshot: string;
  itemId: mongoose.Types.ObjectId;
  itemNameSnapshot: string;
  coinsSpent: number;
  status: 'pending' | 'collected' | 'cancelled';
  collectedAt?: Date | null;
  fulfilledBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const StoreOrderSchema = new Schema<IStoreOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentNameSnapshot: { type: String, required: true },
    itemId: { type: Schema.Types.ObjectId, ref: 'StoreItem', required: true },
    itemNameSnapshot: { type: String, required: true },
    coinsSpent: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'collected', 'cancelled'], default: 'pending' },
    collectedAt: { type: Date, default: null },
    fulfilledBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true, collection: 'store_orders' }
);

StoreOrderSchema.index({ userId: 1, createdAt: -1 });
StoreOrderSchema.index({ status: 1, createdAt: -1 });

export const StoreOrder =
  mongoose.models.StoreOrder || mongoose.model<IStoreOrder>('StoreOrder', StoreOrderSchema);
