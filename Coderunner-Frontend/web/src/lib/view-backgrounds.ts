/**
 * Character "view" backgrounds, themed per selected character:
 *  - the "before entering" Mission-Card images on /home, and
 *  - the "inside" levels-page backdrop on /levels/<age_group> (the four-levels page).
 *
 * Source masters live in public/assets/view/<character>/... and are uploaded to
 * Cloudinary at ORIGINAL quality via scripts/upload-view.js. List each uploaded
 * image in AVAILABLE_VIEW below. Anything NOT listed falls back to the current
 * default look, so a partially-themed character (or age group) degrades gracefully
 * instead of showing a broken image — add entries here as more are uploaded.
 */
import { getCloudinaryImage } from './cloudinary';
import type { CharacterId } from './character-themes';

// Uploaded view images, keyed `<character>/<slot>`.
//   slot = '<age_group>'        for the OUTSIDE Mission-Card image
//   slot = 'inside-<age_group>' for the INSIDE levels backdrop
// KEEP IN SYNC with scripts/upload-view.js (FILES): every key here must have been
// uploaded by that script, and vice-versa. A key with no upload → broken 404; an
// upload with no key → the new art silently falls back to the default.
const AVAILABLE_VIEW = new Set<string>([
  'kenji/11-14',        // OUTSIDE — Mission Card, 11-14
  'kenji/15-18',        // OUTSIDE — Mission Card, 15-18
  'kenji/inside-11-14', // INSIDE  — levels backdrop, 11-14
]);

// Defaults (the current look) for any combo not yet themed.
const DEFAULT_CARD = '/card-11-14.png';
const DEFAULT_BACKDROP =
  'https://res.cloudinary.com/dwqzqxeuk/image/upload/f_auto,q_auto/code-runner/ui/technological-exploration-settlement.jpg';

/** "Before entering" Mission-Card image for an age group, themed per character. */
export function getMissionCardImage(characterId: CharacterId, ageGroup: string): string {
  const key = `${characterId}/${ageGroup}`;
  return AVAILABLE_VIEW.has(key) ? getCloudinaryImage(`view/${key}`) : DEFAULT_CARD;
}

/** "Inside" levels-page backdrop for an age group, themed per character. */
export function getLevelsBackdrop(characterId: CharacterId, ageGroup: string): string {
  const key = `${characterId}/inside-${ageGroup}`;
  return AVAILABLE_VIEW.has(key) ? getCloudinaryImage(`view/${key}`) : DEFAULT_BACKDROP;
}
