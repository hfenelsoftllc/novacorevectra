'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { AnimatedSectionProps } from '@/types';
import { cn } from '@/utils';

/**
 * Hook to detect user's motion preference
 */
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

/**
 * AnimatedSection wrapper component provides consistent animations for page sections
 * Supports custom animation properties and viewport settings
 * Respects user's motion preferences for accessibility
 * Memoized for performance optimization
 */
const AnimatedSectionComponent = React.forwardRef<
  HTMLElement,
  AnimatedSectionProps
>(
  (
    {
      children,
      className,
      animationProps = {},
      viewport = { once: true, margin: '-100px' },
      role,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...props
    },
    ref
  ) => {
    const prefersReducedMotion = useReducedMotion();

    const defaultAnimationProps = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: {
        duration: prefersReducedMotion ? 0.01 : 0.5, // Respect motion preferences
        ease: [0.25, 0.46, 0.45, 0.94], // Optimized easing curve
      },
      ...animationProps,
    };

    // If user prefers reduced motion, disable animations
    if (prefersReducedMotion) {
      return (
        <section
          ref={ref as React.RefObject<HTMLElement>}
          className={cn('relative', className)}
          role={role}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          tabIndex={-1}
          {...props}
        >
          {children}
        </section>
      );
    }

    return (
      <motion.section
        ref={ref}
        className={cn('relative', className)}
        initial={defaultAnimationProps.initial}
        whileInView={defaultAnimationProps.animate}
        viewport={viewport}
        transition={defaultAnimationProps.transition}
        role={role}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        tabIndex={-1}
        {...props}
      >
        {children}
      </motion.section>
    );
  }
);

AnimatedSectionComponent.displayName = 'AnimatedSection';

// Memoize the component to prevent unnecessary re-renders
export const AnimatedSection = React.memo(AnimatedSectionComponent);
