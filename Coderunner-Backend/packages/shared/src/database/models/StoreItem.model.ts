import mongoose, { Schema, Document } from 'mongoose';

/**
 * A physical reward a student can redeem Novas (✨) for and collect at school.
 * Managed by developers (Phase 3). `stock: null` = unlimited.
 */
export interface IStoreItem extends Document {
  name: string;
  description?: string;
  imageUrl?: string;
  priceCoins: number;
  category: 'sticker' | 'merch' | 'other';
  stock: number | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StoreItemSchema = new Schema<IStoreItem>(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    priceCoins: { type: Number, required: true, min: 0 },
    category: { type: String, enum: ['sticker', 'merch', 'other'], default: 'other' },
    stock: { type: Number, default: null }, // null = unlimited
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'store_items' }
);

StoreItemSchema.index({ active: 1, priceCoins: 1 });

export const StoreItem =
  mongoose.models.StoreItem || mongoose.model<IStoreItem>('StoreItem', StoreItemSchema);
