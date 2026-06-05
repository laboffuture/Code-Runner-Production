import mongoose, { Schema, Document } from 'mongoose';

export interface ITeacherActivity extends Document {
  teacherId: mongoose.Types.ObjectId;
  classroomId: mongoose.Types.ObjectId | null;
  studentId: mongoose.Types.ObjectId;
  lastReviewedAt: Date;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherActivitySchema = new Schema<ITeacherActivity>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', default: null },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lastReviewedAt: { type: Date, default: Date.now },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'teacher_activity' }
);
TeacherActivitySchema.index({ teacherId: 1, studentId: 1 }, { unique: true });

export const TeacherActivity =
  mongoose.models.TeacherActivity || mongoose.model<ITeacherActivity>('TeacherActivity', TeacherActivitySchema);
