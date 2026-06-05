import type { ITicket } from '@code-runner/shared';

/** SLA thresholds (hours). Named constants for launch. */
export const SLA_HOURS = { bug_report: 48, doubt: 24 } as const;

/**
 * Delay/breach is anchored to ticket CREATION (never resets on first response),
 * so a ticket left unresolved always keeps climbing on the radar.
 */
export function computeTicketDelay(ticket: Pick<ITicket, 'type' | 'status' | 'resolvedAt' | 'createdAt'>) {
  const end = ticket.status === 'resolved' && ticket.resolvedAt ? new Date(ticket.resolvedAt) : new Date();
  const delayHours = (end.getTime() - new Date(ticket.createdAt).getTime()) / 3_600_000;
  const threshold = SLA_HOURS[ticket.type];
  const isBreached = ticket.status !== 'resolved' && delayHours > threshold;
  return { delayHours: Math.round(delayHours * 10) / 10, isBreached, thresholdHours: threshold };
}
