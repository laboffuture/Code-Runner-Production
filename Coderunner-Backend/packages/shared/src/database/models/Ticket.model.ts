import mongoose, { Schema, Document } from 'mongoose';

export type TicketType = 'bug_report' | 'doubt';
export type TicketStatus = 'open' | 'in_progress' | 'resolved';
export type TicketTargetRole = 'developer' | 'teacher';

export interface ITicket extends Document {
  type: TicketType;
  status: TicketStatus;
  targetRole: TicketTargetRole;
  createdBy: mongoose.Types.ObjectId;
  classroomId: mongoose.Types.ObjectId | null;
  assignedTo?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  firstResponseAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    type: { type: String, enum: ['bug_report', 'doubt'], required: true },
    status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
    targetRole: { type: String, enum: ['developer', 'teacher'], required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', default: null, index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, required: true, trim: true, maxlength: 4000 },
    firstResponseAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'tickets' }
);

TicketSchema.index({ targetRole: 1, status: 1, createdAt: -1 });
TicketSchema.index({ classroomId: 1, status: 1, createdAt: -1 });
TicketSchema.index({ status: 1, createdAt: -1 });

export const Ticket =
  mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);
