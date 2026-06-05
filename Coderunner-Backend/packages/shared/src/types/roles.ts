/** Single source of truth for user roles. Every role union/enum derives from this. */
export const ROLES = ['student', 'teacher', 'developer', 'owner'] as const;
export type Role = (typeof ROLES)[number];
