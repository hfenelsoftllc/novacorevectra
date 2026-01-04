import * as React from 'react';
import { motion } from 'framer-motion';
import { AnimatedSectionProps } from '@/types';
import { cn } from '@/utils';

/**
 * AnimatedSection wrapper component provides consistent animations for page sections
 * Supports custom animation properties and viewport settings
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
    const defaultAnimationProps = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: {
        duration: 0.5, // Reduced duration for better performance
        ease: [0.25, 0.46, 0.45, 0.94], // Optimized easing curve
      },
      ...animationProps,
    };

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
