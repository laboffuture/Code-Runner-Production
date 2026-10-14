'use client';

import { resolveApiUrl } from '@/lib/api-client';

interface PygameCanvasProps {
  /** Relative path from the execution result, e.g. "/pygame-builds/<id>/index.html". */
  url: string;
}

/**
 * Real interactive pygame window: the API serves the Pygbag/WASM build
 * (docker.executor.ts's buildPygameInteractive) as static files, and this
 * just iframes it directly — the build's own index.html loads the browser
 * Python runtime and the packaged game itself, entirely client-side.
 *
 * Must be a real absolute URL (not a blob: URL) — the build's index.html
 * does a relative fetch for its own data archive and loads an external
 * runtime script, neither of which works from a blob-URL document.
 */
export function PygameCanvas({ url }: PygameCanvasProps) {
  const src = `${resolveApiUrl()}${url}`;

  return (
    <div className="relative w-full bg-black rounded-lg border border-neon-purple/30">
      <iframe
        src={src}
        className="w-full h-[600px]"
        sandbox="allow-scripts allow-same-origin allow-modals allow-pointer-lock"
        allow="cross-origin-isolated"
        title="Pygame Interactive Canvas"
      />
    </div>
  );
}
