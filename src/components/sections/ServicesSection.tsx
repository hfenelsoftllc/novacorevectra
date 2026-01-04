import * as React from 'react';
import { ServiceCard } from '@/components/cards/ServiceCard';
import { AnimatedSection } from '@/components/common/AnimatedSection';
import { SERVICES } from '@/constants/services';
import { SectionProps } from '@/types/common';
import { cn } from '@/utils/cn';

/**
 * ServicesSection component displays the services grid using ServiceCard components
 * Includes responsive layout and proper semantic structure
 * Memoized for performance optimization
 */
const ServicesSectionComponent = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <AnimatedSection
        ref={ref}
        className={cn('max-w-7xl mx-auto px-6 py-20', className)}
        animationProps={{
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94], // Optimized easing curve
          },
        }}
        aria-labelledby='services-heading'
        role='region'
        aria-label='Our services'
        {...props}
      >
        {/* Optional section header */}
        {children && <header className='text-center mb-16'>{children}</header>}

        {/* Services Grid */}
        <div
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8'
          role='list'
          aria-label='List of services offered'
        >
          {SERVICES.map((service, index) => (
            <div key={service.id} role='listitem'>
              <ServiceCard service={service} index={index} className='h-full' />
            </div>
          ))}
        </div>
      </AnimatedSection>
    );
  }
);

ServicesSectionComponent.displayName = 'ServicesSection';

// Memoize the component to prevent unnecessary re-renders
export const ServicesSection = React.memo(ServicesSectionComponent);
