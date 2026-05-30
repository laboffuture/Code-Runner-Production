import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'teacher' | 'developer';
  age_group: '11-14' | '15-18';
  selectedCharacter: 'astra' | 'nila' | 'kenji' | 'leo';
  onboardingComplete: boolean;
  avatar: string;
  bio: string;
  classroomId?: mongoose.Types.ObjectId | null; // the classroom a student belongs to
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
    select: false, // never returned by default — must be opted in via .select('+passwordHash')
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'developer'],
    default: 'student',
  },
  age_group: {
    type: String,
    enum: ['11-14', '15-18'],
    required: true,
  },
  selectedCharacter: {
    type: String,
    enum: ['astra', 'nila', 'kenji', 'leo'],
    default: 'astra',
  },
  onboardingComplete: {
    type: Boolean,
    default: false,
  },
  avatar: {
    type: String,
    default: '',
    trim: true,
  },
  bio: {
    type: String,
    default: '',
    trim: true,
    maxlength: 500,
  },
  classroomId: {
    type: Schema.Types.ObjectId,
    ref: 'Classroom',
    default: null,
    index: true,
  },
}, {
  timestamps: true,
  collection: 'users',
});

// Indexes automatically created by 'unique: true' on username and email fields

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
