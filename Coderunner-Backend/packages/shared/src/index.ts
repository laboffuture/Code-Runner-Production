// Main entry point for @code-runner/shared package

// Export types
export * from './types';
export * from './types/roles';

// Export database connection separately (not models to avoid conflicts)
export { connectToDatabase } from './database/connection';

// Export models under a namespace to avoid conflicts
export * as Models from './database/models';

// Re-export Ticket model interface/types at top level for consumers
export type {
  ITicket,
  TicketType,
  TicketStatus,
  TicketTargetRole,
} from './database/models/Ticket.model';
export type { ITeacherActivity } from './database/models/TeacherActivity.model';

// Student file workspace caps (shared by the runner sync and the API routes).
export {
  STUDENT_FILE_MAX_BYTES,
  STUDENT_FILE_MAX_PER_SCOPE,
} from './database/models/StudentFile.model';
export type { StudentFileScope } from './database/models/StudentFile.model';

// Export utilities
export * from './utils';

// Export services
export * from './services';
