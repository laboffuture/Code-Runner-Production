import mongoose, { Schema, Document } from 'mongoose';

/**
 * Teacher-facing "Teaching Guide" (explained answer key) for ONE problem (= one case).
 * Lives in its OWN collection, served only behind the staff gate — NEVER included in any
 * student-facing query. The `question` is NOT stored here; it is joined from the Problem
 * doc at read time (single source of truth).
 */
export interface IWalkStep {
  label: string;        // "Read the input"
  code_snippet: string; // "n = int(input())"
  explanation: string;  // "We read the first line and turn it into a number with int()."
}

export interface ISolution extends Document {
  problem_id: number;
  level_number: number;
  session_id: number;
  case_number: number;
  solution_code: string;          // the answer
  walkthrough: IWalkStep[];       // logic breakdown
  student_explanation: string;    // easy, kid-friendly words to relay
  worked_example: string;         // a concrete example to show
  key_concepts: string[];
  common_mistakes: string[];
  verified: boolean;              // set by the verifier when solution_code passes its test cases
  created_at: Date;
  updated_at: Date;
}

const WalkStepSchema = new Schema<IWalkStep>(
  {
    label: { type: String, required: true },
    code_snippet: { type: String, default: '' },
    explanation: { type: String, required: true },
  },
  { _id: false }
);

const SolutionSchema = new Schema<ISolution>(
  {
    problem_id: { type: Number, required: true, unique: true }, // unique already creates the index
    level_number: { type: Number, required: true },
    session_id: { type: Number, required: true },
    case_number: { type: Number, required: true },
    solution_code: { type: String, required: true },
    walkthrough: { type: [WalkStepSchema], default: [] },
    student_explanation: { type: String, default: '' },
    worked_example: { type: String, default: '' },
    key_concepts: { type: [String], default: [] },
    common_mistakes: { type: [String], default: [] },
    verified: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'solutions' }
);

SolutionSchema.index({ level_number: 1, session_id: 1, case_number: 1 });

export const Solution =
  mongoose.models.Solution || mongoose.model<ISolution>('Solution', SolutionSchema);
