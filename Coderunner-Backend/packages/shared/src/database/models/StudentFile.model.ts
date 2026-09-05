import mongoose, { Schema, Document } from 'mongoose';

/**
 * A single persistent text file in a student's workspace.
 *
 * Used by the File Handling curriculum (problems in session_id 37-41): the
 * runner writes any files a student's code creates back here after a Run, and
 * injects them into the container before the next Run — so a file made in one
 * task is available in every other file-handling task for that same student.
 *
 * Scoped by (userId, scope): one shared workspace per student per topic. Only
 * text files are stored (file-handling lessons write text/csv/json); binary
 * artifacts like matplotlib PNGs use the separate ExecutionResult.files path.
 */
export type StudentFileScope = 'file-handling';

/** Hard caps so a runaway script can't fill the DB. */
export const STUDENT_FILE_MAX_BYTES = 256 * 1024; // 256 KB per file
export const STUDENT_FILE_MAX_PER_SCOPE = 50; // files per workspace

export interface IStudentFile extends Document {
  userId: mongoose.Types.ObjectId;
  scope: StudentFileScope;
  fileName: string;
  content: string; // UTF-8 text
  size: number; // byte length of content
  createdAt: Date;
  updatedAt: Date;
}

const StudentFileSchema = new Schema<IStudentFile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scope: { type: String, required: true, default: 'file-handling' },
    fileName: { type: String, required: true },
    content: { type: String, default: '' },
    size: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: 'student_files',
  }
);

// One document per (student, workspace, filename). Also the lookup index for
// listing a student's workspace.
StudentFileSchema.index({ userId: 1, scope: 1, fileName: 1 }, { unique: true });

export const StudentFile =
  mongoose.models.StudentFile || mongoose.model<IStudentFile>('StudentFile', StudentFileSchema);
