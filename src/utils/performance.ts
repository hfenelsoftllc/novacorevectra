/**
 * Performance optimization utilities
 * Provides helper functions for improving application performance
 */

/**
 * Debounce function to limit the rate at which a function can fire
 * Useful for optimizing scroll, resize, and input handlers
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function to ensure a function is called at most once per specified interval
 * Useful for optimizing frequently fired events like scroll or mousemove
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Check if the user prefers reduced motion
 * Returns true if reduced motion is preferred, false otherwise
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (!window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Optimized easing curves for better animation performance
 */
export const easingCurves = {
  // Standard easing for most animations
  standard: [0.25, 0.46, 0.45, 0.94] as const,
  // Faster easing for quick interactions
  quick: [0.4, 0.0, 0.2, 1] as const,
  // Smooth easing for entrance animations
  entrance: [0.0, 0.0, 0.2, 1] as const,
  // Sharp easing for exit animations
  exit: [0.4, 0.0, 1, 1] as const,
} as const;

/**
 * Get optimized animation duration based on distance and user preferences
 */
export const getOptimizedDuration = (
  baseDuration: number,
  distance: number = 1
): number => {
  if (prefersReducedMotion()) return 0.1;
  
  // Scale duration based on distance, but cap it for performance
  const scaledDuration = baseDuration * Math.min(distance, 2);
  return Math.max(0.1, Math.min(scaledDuration, 1.0));
};