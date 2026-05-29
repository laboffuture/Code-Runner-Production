/**
 * Detect if device is low-end based on:
 * - CPU cores
 * - Memory
 * - GPU capabilities
 */
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false;

  // Check CPU cores
  const cores = navigator.hardwareConcurrency || 4;
  if (cores < 4) return true;

  // Check memory (if available)
  const memory = (navigator as any).deviceMemory;
  if (memory && memory < 4) return true;

  // Check for mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) return true;

  return false;
}

/**
 * Get performance preset based on device capabilities
 */
export function getPerformancePreset(): 'low' | 'medium' | 'high' {
  if (isLowEndDevice()) return 'low';
  
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as any).deviceMemory || 4;
  
  if (cores >= 8 && memory >= 8) return 'high';
  return 'medium';
}
