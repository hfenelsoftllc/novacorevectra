import * as React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { HeroSectionProps } from '@/types/common';
import { cn } from '@/utils/cn';

/**
 * HeroSection component displays the main hero section with title, subtitle, and action buttons
 * Includes responsive design and smooth animations
 */
export const HeroSection = React.forwardRef<HTMLElement, HeroSectionProps>(
  (
    {
      title,
      subtitle,
      primaryAction,
      secondaryAction,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          'max-w-7xl mx-auto px-6 py-24 text-center',
          className
        )}
        aria-labelledby="hero-title"
        role="banner"
        {...props}
      >
        {/* Animated Title */}
        <motion.h1
          id="hero-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground'
        >
          {title}
        </motion.h1>

        {/* Animated Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className='mt-6 text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed'
          aria-describedby="hero-title"
        >
          {subtitle}
        </motion.p>

        {/* Animated Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className='mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-4'
          role="group"
          aria-label="Hero section actions"
        >
          <Button
            size='lg'
            onClick={primaryAction.onClick}
            className='w-full sm:w-auto'
            aria-label={`${primaryAction.text} - Primary action`}
          >
            {primaryAction.text}
          </Button>
          <Button
            size='lg'
            variant='outline'
            onClick={secondaryAction.onClick}
            className='w-full sm:w-auto'
            aria-label={`${secondaryAction.text} - Secondary action`}
          >
            {secondaryAction.text}
          </Button>
        </motion.div>
      </section>
    );
  }
);

HeroSection.displayName = 'HeroSection';