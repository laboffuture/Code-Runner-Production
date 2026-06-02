import mongoose, { Schema, Document } from 'mongoose';

/** Durable audit row: one per teacher-initiated student progress reset. Append-only. */
export interface IResetLog extends Document {
  teacherId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  classroomId?: mongoose.Types.ObjectId | null;
  scope: 'full' | 'from-session';
  fromSessionId?: number | null;
  clearedSolvedCount: number;
  prevLevel: number;
  prevXp: number;
  createdAt: Date;
  updatedAt: Date;
}

const ResetLogSchema = new Schema<IResetLog>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', default: null },
    scope: { type: String, enum: ['full', 'from-session'], required: true },
    fromSessionId: { type: Number, default: null },
    clearedSolvedCount: { type: Number, default: 0 },
    prevLevel: { type: Number, default: 1 },
    prevXp: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'reset_logs' }
);

export const ResetLog =
  mongoose.models.ResetLog || mongoose.model<IResetLog>('ResetLog', ResetLogSchema);
