/**
 * Character "view" art, themed per selected character. Presentation-only — the
 * underlying age-group curriculum axis (/levels/11-14 · /levels/15-18) is
 * unchanged; this only swaps which themed image each surface renders.
 *
 * Surfaces:
 *  - the two "before entering" Mission-Card images on /home  → slot 'basic' | 'advanced'
 *  - the "inside" levels-page backdrop on /levels/<age_group> → slot 'internal'
 *  - the character emblem (round header avatar)               → slot 'profile'
 *
 * Source masters live in public/assets/view/<character>/<slot>.png and are
 * uploaded to Cloudinary at ORIGINAL quality via scripts/upload-view.js (served
 * back through f_auto,q_auto, so delivery is auto-optimized). List each uploaded
 * image in AVAILABLE_VIEW below. Anything NOT listed falls back to the current
 * default look, so a partially-themed character degrades gracefully instead of
 * showing a broken image.
 */
import { getCloudinaryImage } from './cloudinary';
import type { CharacterId } from './character-themes';

export type CardVariant = 'basic' | 'advanced';

// Uploaded view images, keyed `<character>/<slot>`.
// KEEP IN SYNC with scripts/upload-view.js (FILES): every key here must have been
// uploaded by that script, and vice-versa. A key with no upload → broken 404; an
// upload with no key → the new art silently falls back to the default.
const AVAILABLE_VIEW = new Set<string>([
  'astra/basic', 'astra/advanced', 'astra/internal', 'astra/profile',
  'kenji/basic', 'kenji/advanced', 'kenji/internal', 'kenji/profile',
  'leo/basic',   'leo/advanced',   'leo/internal',   'leo/profile',
  'nila/basic',  'nila/advanced',  'nila/internal',  'nila/profile',
]);

// Defaults (the current look) for any combo not yet themed.
const DEFAULT_CARD = '/card-11-14.png';
const DEFAULT_BACKDROP =
  'https://res.cloudinary.com/dwqzqxeuk/image/upload/f_auto,q_auto/code-runner/ui/technological-exploration-settlement.jpg';

/** "Before entering" Mission-Card image (basic | advanced), themed per character. */
export function getMissionCardImage(characterId: CharacterId, variant: CardVariant): string {
  const key = `${characterId}/${variant}`;
  return AVAILABLE_VIEW.has(key) ? getCloudinaryImage(`view/${key}`) : DEFAULT_CARD;
}

/** "Inside" levels-page backdrop, themed per character (one backdrop, reused for both cards). */
export function getLevelsBackdrop(characterId: CharacterId): string {
  const key = `${characterId}/internal`;
  return AVAILABLE_VIEW.has(key) ? getCloudinaryImage(`view/${key}`) : DEFAULT_BACKDROP;
}

/**
 * Character emblem (round badge) for the header avatar, themed per character.
 * Returns null when not yet themed so the caller keeps its existing default avatar.
 */
export function getCharacterEmblem(characterId: CharacterId): string | null {
  const key = `${characterId}/profile`;
  return AVAILABLE_VIEW.has(key) ? getCloudinaryImage(`view/${key}`) : null;
}
