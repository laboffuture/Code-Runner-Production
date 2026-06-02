// Novas (✨) — frontend display + visibility. UI-only mirror of the backend flag
// (the web app does not import the backend shared package).
const flag = (v: string | undefined, def: boolean): boolean =>
  v === undefined ? def : v === 'true' || v === '1';

export const NOVAS = {
  NAME: 'Novas',
  EMOJI: '✨',
  VISIBLE: flag(process.env.NEXT_PUBLIC_NOVAS_VISIBLE, true),
} as const;
