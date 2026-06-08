/** Single source of truth for user roles. Every role union/enum derives from this. */
export const ROLES = ['student', 'teacher', 'developer', 'admin'] as const;
export type Role = (typeof ROLES)[number];
