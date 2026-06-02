import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  stats: {
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    totalSubmissions: number;
    acceptedSubmissions: number;
    acceptanceRate: number;
    failedRuns: number;
  };
  streak: {
    current: number;
    longest: number;
    lastSubmissionDate: Date | null;
  };
  experience: number;
  level: number;
  contestRating: number;
  rank: 'NOVICE' | 'ADVANCED' | 'EXPERT' | 'MASTER';
  achievements: string[];
  skills: string[];
  recentActivity: Array<{
    problemId: number;
    problemTitle: string;
    difficulty: string;
    status: 'ACCEPTED' | 'FAILED';
    timestamp: Date;
  }>;
  submissionCalendar: Array<{
    date: Date;
    count: number;
  }>;
  // Distinct first-time solves per day — drives the accurate "solved over time"
  // chart (submissionCalendar counts every submission incl. failures).
  solvedCalendar: Array<{
    date: Date;
    count: number;
  }>;
  topicProgress: Array<{
    topic: string;
    solved: number;
    total: number;
  }>;
  solvedProblemIds: number[];
  unlockedCharacters: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserProgressSchema = new Schema<IUserProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    stats: {
      totalSolved: { type: Number, default: 0 },
      easySolved: { type: Number, default: 0 },
      mediumSolved: { type: Number, default: 0 },
      hardSolved: { type: Number, default: 0 },
      totalSubmissions: { type: Number, default: 0 },
      acceptedSubmissions: { type: Number, default: 0 },
      acceptanceRate: { type: Number, default: 0 },
      // G3: durable count of failed Runs (Run button erroring/timing out on a problem).
      failedRuns: { type: Number, default: 0 },
    },
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastSubmissionDate: { type: Date, default: null },
    },
    experience: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    contestRating: { type: Number, default: 1000 },
    rank: {
      type: String,
      enum: ['NOVICE', 'ADVANCED', 'EXPERT', 'MASTER'],
      default: 'NOVICE',
    },
    achievements: [{ type: String }],
    skills: [{ type: String }],
    recentActivity: [
      {
        problemId: { type: Number, required: true },
        problemTitle: { type: String, required: true },
        difficulty: { type: String, required: true },
        status: {
          type: String,
          enum: ['ACCEPTED', 'FAILED'],
          required: true,
        },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    submissionCalendar: [
      {
        date: { type: Date, required: true },
        count: { type: Number, default: 0 },
      },
    ],
    solvedCalendar: [
      {
        date: { type: Date, required: true },
        count: { type: Number, default: 0 },
      },
    ],
    topicProgress: [
      {
        topic: { type: String, required: true },
        solved: { type: Number, default: 0 },
        total: { type: Number, required: true },
      },
    ],
    solvedProblemIds: {
      type: [Number],
      default: [],
    },
    unlockedCharacters: {
      type: [String],
      default: ['astra'],
    },
  },
  {
    timestamps: true,
    collection: 'user_progress',
    // Guard the submission worker's read-modify-write progress update against
    // lost updates under concurrent grading (PM2 2x runner x worker concurrency).
    // save() now includes __v in its filter and throws VersionError on a stale
    // write; the worker retries from a fresh read. NOTE: this only affects
    // hydrated .save() of an EXISTING doc — atomic updateOne()/findOneAndUpdate()
    // and brand-new inserts are unaffected (an insert has no prior __v to stale).
    // The other hydrated savers are both on the users stats route: the
    // lazy-create insert (an insert — cannot VersionError) and the
    // solvedProblemIds backfill (converted to an atomic updateOne).
    optimisticConcurrency: true,
  }
);

// Index for efficient leaderboard queries
UserProgressSchema.index({ contestRating: -1 });
UserProgressSchema.index({ 'stats.totalSolved': -1 });
UserProgressSchema.index({ level: -1 });

// Method to calculate acceptance rate
UserProgressSchema.methods.updateAcceptanceRate = function () {
  if (this.stats.totalSubmissions > 0) {
    this.stats.acceptanceRate = parseFloat(
      ((this.stats.acceptedSubmissions / this.stats.totalSubmissions) * 100).toFixed(2)
    );
  } else {
    this.stats.acceptanceRate = 0;
  }
};

// Method to update rank based on contest rating
UserProgressSchema.methods.updateRank = function () {
  if (this.contestRating >= 2000) {
    this.rank = 'MASTER';
  } else if (this.contestRating >= 1600) {
    this.rank = 'EXPERT';
  } else if (this.contestRating >= 1200) {
    this.rank = 'ADVANCED';
  } else {
    this.rank = 'NOVICE';
  }
};

// Method to update level based on experience
UserProgressSchema.methods.updateLevel = function () {
  // Each level requires 500 XP
  this.level = Math.floor(this.experience / 500) + 1;
};

// Method to update streak
UserProgressSchema.methods.updateStreak = function () {
  const now = new Date();
  const lastSubmission = this.streak.lastSubmissionDate;

  if (!lastSubmission) {
    // First submission (also the first solve after a teacher reset, which clears
    // lastSubmissionDate but preserves longest). longest is a monotonic
    // high-water mark — never let it drop below a preserved value.
    this.streak.current = 1;
    this.streak.longest = Math.max(this.streak.longest || 0, 1);
    this.streak.lastSubmissionDate = now;
    return;
  }

  const daysDiff = Math.floor(
    (now.getTime() - lastSubmission.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff === 0) {
    // Same day, no change
    return;
  } else if (daysDiff === 1) {
    // Consecutive day
    this.streak.current += 1;
    this.streak.longest = Math.max(this.streak.longest, this.streak.current);
  } else {
    // Streak broken
    this.streak.current = 1;
  }

  this.streak.lastSubmissionDate = now;
};

// Method to unlock characters based on level
UserProgressSchema.methods.updateUnlockedCharacters = function () {
  const characterUnlockLevels = {
    astra: 1,   // Always unlocked
    nila: 5,    // Unlocks at level 5
    kenji: 10,  // Unlocks at level 10
    leo: 15,    // Unlocks at level 15
  };

  const newlyUnlocked: string[] = [];

  for (const [character, requiredLevel] of Object.entries(characterUnlockLevels)) {
    if (this.level >= requiredLevel && !this.unlockedCharacters.includes(character)) {
      this.unlockedCharacters.push(character);
      newlyUnlocked.push(character);
    }
  }

  return newlyUnlocked; // Return newly unlocked characters for notification
};

export const UserProgress = mongoose.models.UserProgress || mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);
