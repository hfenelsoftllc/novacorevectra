import * as React from 'react';
import { motion } from 'framer-motion';
import { AnimatedSectionProps } from '@/types/common';
import { cn } from '@/utils/cn';

/**
 * AnimatedSection wrapper component provides consistent animations for page sections
 * Supports custom animation properties and viewport settings
 */
export const AnimatedSection = React.forwardRef<
  HTMLElement,
  AnimatedSectionProps
>(
  (
    {
      children,
      className,
      animationProps = {},
      viewport = { once: true, margin: '-100px' },
      ...props
    },
    ref
  ) => {
    const defaultAnimationProps = {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      transition: {
        duration: 0.6,
        ease: [0.21, 1.11, 0.81, 0.99],
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
        {...props}
      >
        {children}
      </motion.section>
    );
  }
);

AnimatedSection.displayName = 'AnimatedSection';
