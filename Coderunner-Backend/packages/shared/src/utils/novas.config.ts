// Novas (✨) — single source of truth for the currency's flags + display.
// Lets us flip the feature on or rename it from one place. Env-overridable in prod.
const flag = (v: string | undefined, def: boolean): boolean =>
  v === undefined ? def : v === 'true' || v === '1';

// NOTE: the browser cannot import this package, so the frontend keeps a mirror at
// web/src/lib/novas.ts reading NEXT_PUBLIC_NOVAS_VISIBLE. To hide Novas you must set
// BOTH NOVAS_VISIBLE (here) and NEXT_PUBLIC_NOVAS_VISIBLE (web) — keep them in sync.
export const NOVAS = {
  // Display
  NAME: 'Novas',
  EMOJI: '✨',
  // Flags — scaffold posture: a VISIBLE sample, but earning + spending OFF.
  VISIBLE: flag(process.env.NOVAS_VISIBLE, true),
  EARNING_ENABLED: flag(process.env.NOVAS_EARNING_ENABLED, false),
  REDEMPTION_ENABLED: flag(process.env.STORE_REDEMPTION_ENABLED, false),
} as const;
