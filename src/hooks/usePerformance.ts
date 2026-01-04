import { useCallback, useMemo } from 'react';

/**
 * Custom hook for performance optimizations
 * Provides utilities for reducing unnecessary computations and re-renders
 */
export const usePerformance = () => {
  // Memoized animation delay calculator
  const calculateAnimationDelay = useCallback(
    (index: number, baseDelay: number = 0.05) => {
      return Math.min(index * baseDelay, 0.3); // Cap maximum delay at 300ms
    },
    []
  );

  // Memoized easing curve for consistent animations
  const optimizedEasing = useMemo(() => [0.25, 0.46, 0.45, 0.94] as const, []);

  // Reduced motion preferences check
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    // Check if matchMedia is available (for testing environments)
    if (!window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Performance-optimized animation config
  const getAnimationConfig = useCallback(
    (duration: number = 0.4, delay: number = 0) => ({
      duration: prefersReducedMotion ? 0.1 : duration,
      delay: prefersReducedMotion ? 0 : delay,
      ease: optimizedEasing,
    }),
    [prefersReducedMotion, optimizedEasing]
  );

  return {
    calculateAnimationDelay,
    optimizedEasing,
    prefersReducedMotion,
    getAnimationConfig,
  };
};
