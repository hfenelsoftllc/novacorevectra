import * as React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { CTASectionProps } from '@/types/common';
import { cn } from '@/utils/cn';

/**
 * CTASection component displays a call-to-action section with title, subtitle, and action button
 * Includes smooth animations and responsive design
 * Memoized for performance optimization
 */
const CTASectionComponent = React.forwardRef<HTMLElement, CTASectionProps>(
  (
    {
      title,
      subtitle,
      action,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          'max-w-7xl mx-auto px-6 py-20 sm:py-24 text-center',
          className
        )}
        aria-labelledby="cta-heading"
        role="region"
        aria-label="Call to action"
        {...props}
      >
        {/* Animated Title */}
        <motion.h3
          id="cta-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ 
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94] // Optimized easing curve
          }}
          className='text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground mb-4'
        >
          {title}
        </motion.h3>

        {/* Animated Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ 
            duration: 0.4, 
            delay: 0.05, // Reduced delay
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className='text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8'
          aria-describedby="cta-heading"
        >
          {subtitle}
        </motion.p>

        {/* Optional additional content */}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ 
              duration: 0.4, 
              delay: 0.1,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className='mb-8'
          >
            {children}
          </motion.div>
        )}

        {/* Animated Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ 
            duration: 0.4, 
            delay: 0.15,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          <Button
            size='lg'
            onClick={action.onClick}
            className='gap-2 group'
            aria-label={`${action.text} - Contact us to get started`}
          >
            {action.text}
            <ArrowRight 
              className='h-4 w-4 transition-transform group-hover:translate-x-1' 
              aria-hidden="true"
            />
          </Button>
        </motion.div>
      </section>
    );
  }
);

CTASectionComponent.displayName = 'CTASection';

// Memoize the component to prevent unnecessary re-renders
export const CTASection = React.memo(CTASectionComponent);