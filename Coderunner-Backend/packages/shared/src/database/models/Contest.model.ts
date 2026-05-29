import mongoose, { Schema, Document } from 'mongoose';

export interface IContest extends Document {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;          // stored for fast range queries; = startTime + durationMinutes
  durationMinutes: number;
  problems: Array<{
    problemId: number;
    points: number;       // base score for solving this problem
  }>;
  status: 'draft' | 'upcoming' | 'active' | 'ended';
  ageGroup: '11-14' | '15-18' | 'all';
  maxParticipants?: number;
  registeredUsers: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  ratingUpdateApplied: boolean; // guard: only run once when contest ends
  createdAt: Date;
  updatedAt: Date;
}

const ContestSchema = new Schema<IContest>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    durationMinutes: { type: Number, required: true, min: 10, max: 480 },
    problems: [
      {
        problemId: { type: Number, required: true },
        points: { type: Number, required: true, min: 0 },
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'upcoming', 'active', 'ended'],
      default: 'draft',
    },
    ageGroup: {
      type: String,
      enum: ['11-14', '15-18', 'all'],
      default: 'all',
    },
    maxParticipants: { type: Number, min: 1 },
    registeredUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ratingUpdateApplied: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: 'contests',
  }
);

ContestSchema.index({ status: 1, startTime: 1 });
ContestSchema.index({ ageGroup: 1, status: 1 });

export const Contest =
  mongoose.models.Contest || mongoose.model<IContest>('Contest', ContestSchema);
