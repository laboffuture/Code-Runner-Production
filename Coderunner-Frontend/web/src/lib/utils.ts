import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns display difficulty label based on session and task type:
 * - Final tasks (case 6 / is_final_task) → Hard
 * - Sessions 5–10 → Medium
 * - Sessions 1–4  → Easy
 */
export function getDifficultyLabel(sessionId: number, isFinalTask?: boolean): string {
  if (isFinalTask) return 'Hard';
  if (sessionId >= 5) return 'Medium';
  return 'Easy';
}
