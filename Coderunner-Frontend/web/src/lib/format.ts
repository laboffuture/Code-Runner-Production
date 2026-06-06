/**
 * Shared display formatters — keep a given metric reading identically everywhere.
 */

/**
 * Acceptance rate is stored to 2 decimals (parseFloat(((accepted/total)*100).toFixed(2)))
 * on UserProgress. Render it as a whole percent on every surface — profile, leaderboard,
 * teacher roster + deep-dive, and the owner health panel — so the same student never shows
 * "87.53%" in one place and "88%" in another (M1). Previously only the owner panel rounded.
 */
export function formatAcceptanceRate(rate: number | null | undefined): string {
  return `${Math.round(Number(rate) || 0)}%`;
}
