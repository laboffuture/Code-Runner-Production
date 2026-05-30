import mongoose, { Schema, Document } from 'mongoose';

export interface IClassroom extends Document {
  name: string;
  age_group: '11-14' | '15-18';
  joinCode: string;
  teacherIds: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClassroomSchema = new Schema<IClassroom>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    age_group: { type: String, enum: ['11-14', '15-18'], required: true },
    // Short human-friendly code students use to self-join.
    joinCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    teacherIds: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    collection: 'classrooms',
  }
);

export const Classroom =
  mongoose.models.Classroom || mongoose.model<IClassroom>('Classroom', ClassroomSchema);
