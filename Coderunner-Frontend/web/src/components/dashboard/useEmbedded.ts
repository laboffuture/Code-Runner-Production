'use client';

import { useEffect, useState } from 'react';

/**
 * True when this page is rendered inside another window's <iframe> — i.e.
 * embedded in the ADMIN-LINK hub — or when `?embed=1` is present (an explicit
 * override so embedded mode can be tested in a normal browser tab).
 *
 * Detection needs `window`, so it runs client-side only: the hook starts
 * `false` during SSR / first paint and flips after mount. That keeps the
 * normal (non-embedded) render byte-identical and hydration-safe; inside the
 * hub the surrounding chrome simply drops on the first client effect.
 *
 * Note: `window.self !== window.top` is a safe identity check even across
 * origins — only *reading properties* of a cross-origin `window.top` throws.
 */
export function useEmbedded(): boolean {
  const [embedded, setEmbedded] = useState(false);

  useEffect(() => {
    const inIframe = window.self !== window.top;
    const forced = new URLSearchParams(window.location.search).get('embed') === '1';
    setEmbedded(inIframe || forced);
  }, []);

  return embedded;
}
