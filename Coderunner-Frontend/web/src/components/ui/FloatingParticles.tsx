'use client';

import { useEffect, useRef } from 'react';

interface FloatingParticlesProps {
  /** Accent color as a hex string (e.g. "#2e75b2"). Particles are rendered as
   *  small variations around this color, matching the original effect. */
  color?: string;
  /** Number of particles. Defaults to 800 to preserve the original look. */
  count?: number;
  /** Particle width/height as a CSS length. Defaults to "2px". */
  size?: string;
  /** Optional per-particle color generator returning a full CSS color (e.g.
   *  an rgba string). When omitted, colors vary around `color`. Used by the
   *  levels pages to reproduce their cyan field exactly. */
  getColor?: () => string;
  /** Container classes. Defaults to a fixed, full-screen, click-through layer. */
  className?: string;
  /** Stacking order of the particle layer. */
  zIndex?: number;
}

interface ParticleState {
  element: HTMLDivElement;
  x: number;
  y: number;
  speed: number;
  angle: number;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 46, g: 117, b: 178 };
}

/**
 * Shared floating-particles background.
 *
 * Visually identical to the original per-page `initFloatingParticles()` (same
 * 800 dots, colors, opacity, speed, edge-wrapping), but implemented once with
 * a correct lifecycle:
 *   - the requestAnimationFrame loop is cancelled on unmount (the original
 *     never cancelled it, so loops accumulated on navigation and froze the tab),
 *   - particle DOM nodes are removed on unmount,
 *   - the loop pauses while the tab is hidden (saves CPU/battery, invisible to
 *     an active user),
 *   - users who set "prefers-reduced-motion" get a static field instead of
 *     animation (no visual change for everyone else).
 */
export default function FloatingParticles({
  color = '#2e75b2',
  count = 800,
  size = '2px',
  getColor,
  className = 'fixed inset-0 pointer-events-none',
  zIndex = 2,
}: FloatingParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;

    container.innerHTML = '';
    const baseColor = hexToRgb(color);
    const particles: ParticleState[] = [];

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.width = size;
      particle.style.height = size;
      particle.style.borderRadius = '50%';
      particle.style.pointerEvents = 'none';

      if (getColor) {
        particle.style.backgroundColor = getColor();
      } else {
        // Variations around the accent color (identical to the original effect).
        const redValue = Math.floor(Math.random() * 30) + Math.max(0, baseColor.r - 15);
        const greenValue = Math.floor(Math.random() * 40) + Math.max(0, baseColor.g - 20);
        const blueValue = Math.floor(Math.random() * 50) + Math.max(0, baseColor.b - 25);
        const opacity = Math.random() * 0.5 + 0.2;
        particle.style.backgroundColor = `rgba(${redValue}, ${greenValue}, ${blueValue}, ${opacity})`;
      }

      const x = Math.random() * windowWidth;
      const y = Math.random() * windowHeight;
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';

      particles.push({
        element: particle,
        x,
        y,
        speed: Math.random() * 0.5 + 0.1,
        angle: Math.random() * Math.PI * 2,
      });
      container.appendChild(particle);
    }

    let rafId: number | null = null;

    const animate = () => {
      for (const p of particles) {
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;

        if (p.x < 0) p.x = windowWidth;
        if (p.x > windowWidth) p.x = 0;
        if (p.y < 0) p.y = windowHeight;
        if (p.y > windowHeight) p.y = 0;

        p.element.style.left = p.x + 'px';
        p.element.style.top = p.y + 'px';
      }
      rafId = requestAnimationFrame(animate);
    };

    const start = () => {
      if (rafId === null) rafId = requestAnimationFrame(animate);
    };
    const stop = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const handleResize = () => {
      windowWidth = window.innerWidth;
      windowHeight = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleVisibility = () => {
      if (document.hidden) stop();
      else if (!prefersReducedMotion) start();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    if (!prefersReducedMotion) start();

    return () => {
      stop();
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      container.innerHTML = '';
    };
  }, [color, count]);

  return (
    <div ref={containerRef} className={className} style={{ zIndex }} aria-hidden="true" />
  );
}
