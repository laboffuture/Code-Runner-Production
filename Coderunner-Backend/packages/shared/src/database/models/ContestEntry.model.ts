import mongoose, { Schema, Document } from 'mongoose';

export interface IContestProblemResult {
  problemId: number;
  accepted: boolean;
  attempts: number;       // total submissions for this problem in this contest
  score: number;          // 0 until Accepted
  timeFromStart: number;  // seconds from contest start to first Accepted
  solvedAt?: Date;
}

export interface IContestEntry extends Document {
  contestId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  joinedAt: Date;
  totalScore: number;
  penaltyTime: number;    // sum of timeFromStart for Accepted problems (tiebreaker: lower = better)
  problems: IContestProblemResult[];
  rank?: number;          // set when contest ends
  ratingDelta?: number;   // set when contest ends
  createdAt: Date;
  updatedAt: Date;
}

const ContestEntrySchema = new Schema<IContestEntry>(
  {
    contestId: { type: Schema.Types.ObjectId, ref: 'Contest', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    joinedAt: { type: Date, default: Date.now },
    totalScore: { type: Number, default: 0 },
    penaltyTime: { type: Number, default: 0 },
    problems: [
      {
        problemId: { type: Number, required: true },
        accepted: { type: Boolean, default: false },
        attempts: { type: Number, default: 0 },
        score: { type: Number, default: 0 },
        timeFromStart: { type: Number, default: 0 },
        solvedAt: { type: Date },
      },
    ],
    rank: { type: Number },
    ratingDelta: { type: Number },
  },
  {
    timestamps: true,
    collection: 'contest_entries',
  }
);

// One entry per user per contest
ContestEntrySchema.index({ contestId: 1, userId: 1 }, { unique: true });
// Fast leaderboard sort
ContestEntrySchema.index({ contestId: 1, totalScore: -1, penaltyTime: 1 });

export const ContestEntry =
  mongoose.models.ContestEntry ||
  mongoose.model<IContestEntry>('ContestEntry', ContestEntrySchema);
