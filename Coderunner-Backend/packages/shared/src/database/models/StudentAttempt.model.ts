import mongoose, { Schema, Document } from 'mongoose';

/**
 * One record per graded submission, capturing behavioural signals for the
 * teacher integrity engine ("how they solved it"). Durable (unlike the 7-day
 * ExecutionResult cache).
 */
export interface IStudentAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: number;
  classroomId?: mongoose.Types.ObjectId | null;
  accepted: boolean;
  status: string;
  firstSolve: boolean;

  // Behavioural metrics (sent from the editor with the submission).
  timeOnProblemMs?: number; // open -> this submit
  runsBeforeSubmit?: number; // Run clicks since opening, before this submit
  pasteCount?: number; // paste events since opening
  pasteChars?: number; // total characters pasted
  codeLength?: number; // length of submitted code

  // Heuristic flags (computed at write time). NOT proof — teacher review hints.
  flags: {
    solvedTooFast: boolean;
    noIteration: boolean;
    largePaste: boolean;
  };

  createdAt: Date;
  updatedAt: Date;
}

const StudentAttemptSchema = new Schema<IStudentAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problemId: { type: Number, required: true, index: true },
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', default: null, index: true },
    accepted: { type: Boolean, required: true },
    status: { type: String, required: true },
    firstSolve: { type: Boolean, default: false },

    timeOnProblemMs: { type: Number },
    runsBeforeSubmit: { type: Number },
    pasteCount: { type: Number },
    pasteChars: { type: Number },
    codeLength: { type: Number },

    flags: {
      solvedTooFast: { type: Boolean, default: false },
      noIteration: { type: Boolean, default: false },
      largePaste: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    collection: 'student_attempts',
  }
);

StudentAttemptSchema.index({ userId: 1, createdAt: -1 });

export const StudentAttempt =
  mongoose.models.StudentAttempt || mongoose.model<IStudentAttempt>('StudentAttempt', StudentAttemptSchema);
