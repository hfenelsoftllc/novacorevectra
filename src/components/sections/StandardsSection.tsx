import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedSection } from '@/components/common/AnimatedSection';
import { STANDARDS } from '@/constants/standards';
import { SectionProps } from '@/types/common';
import { usePerformance } from '@/hooks/usePerformance';
import { cn } from '@/utils/cn';

/**
 * StandardsSection component displays compliance standards in a card layout
 * Includes proper semantic structure and responsive design
 * Memoized for performance optimization
 */
const StandardsSectionComponent = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, children, ...props }, ref) => {
    const { calculateAnimationDelay, prefersReducedMotion } = usePerformance();

    return (
      <AnimatedSection
        ref={ref}
        className={cn(
          'bg-muted/30 border-t border-border',
          className
        )}
        animationProps={{
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { 
            duration: 0.5, 
            ease: [0.25, 0.46, 0.45, 0.94] // Optimized easing curve
          },
        }}
        aria-labelledby="standards-heading"
        role="region"
        aria-label="Compliance standards"
        {...props}
      >
        <div className='max-w-7xl mx-auto px-6 py-20 text-center'>
          {/* Section Header */}
          <header className='mb-12'>
            <h2 id="standards-heading" className='text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground mb-4'>
              Standards-Aligned. Audit-Ready.
            </h2>
            <p className='text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
              Our delivery framework is aligned with globally recognized AI and
              security standards to ensure trust, accountability, and resilience.
            </p>
          </header>

          {/* Optional additional content */}
          {children && (
            <div className='mb-10'>
              {children}
            </div>
          )}

          {/* Standards Grid */}
          <div 
            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
            role="list"
            aria-label="List of compliance standards"
          >
            {STANDARDS.map((standard, index) => {
              const animationDelay = calculateAnimationDelay(index);
              
              return (
                <Card
                  key={standard.id}
                  className={cn(
                    'bg-card border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/5',
                    !prefersReducedMotion && 'animate-in fade-in slide-in-from-bottom-4'
                  )}
                  style={{
                    animationDelay: prefersReducedMotion ? '0ms' : `${animationDelay * 1000}ms`,
                    animationFillMode: 'both',
                  }}
                  role="listitem"
                  tabIndex={0}
                  aria-label={`Standard: ${standard.name}${standard.description ? ` - ${standard.description}` : ''}`}
                >
                  <CardContent className='p-6'>
                    <h3 className='font-medium text-foreground text-sm sm:text-base leading-relaxed'>
                      {standard.name}
                    </h3>
                    {standard.description && (
                      <p className='mt-2 text-xs sm:text-sm text-muted-foreground'>
                        {standard.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </AnimatedSection>
    );
  }
);

StandardsSectionComponent.displayName = 'StandardsSection';

// Memoize the component to prevent unnecessary re-renders
export const StandardsSection = React.memo(StandardsSectionComponent);