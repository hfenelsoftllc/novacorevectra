import * as React from 'react';
import { motion } from 'framer-motion';
import { ServiceCardProps } from '@/types/common';
import { usePerformance } from '@/hooks/usePerformance';
import { cn } from '@/utils/cn';

/**
 * ServiceCard component displays a service offering with icon, title, description, and bullet points
 * Includes animation support and proper TypeScript interfaces
 * Memoized for performance optimization
 */
const ServiceCardComponent = React.forwardRef<HTMLDivElement, ServiceCardProps>(
  ({ service, index = 0, className, ...props }, ref) => {
    const { calculateAnimationDelay, getAnimationConfig } = usePerformance();
    const animationDelay = calculateAnimationDelay(index);
    const animationConfig = getAnimationConfig(0.4, animationDelay);

    return (
      <motion.div
        ref={ref}
        className={cn(
          'group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5',
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={animationConfig}
        whileHover={{
          y: -2, // Reduced hover movement for smoother animation
          transition: { duration: 0.15 }, // Faster hover transition
        }}
        role='article'
        tabIndex={0}
        aria-labelledby={`service-title-${service.id}`}
        aria-describedby={`service-description-${service.id}`}
        {...props}
      >
        {/* Icon */}
        <div
          className='mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20'
          aria-hidden='true'
        >
          {service.icon}
        </div>

        {/* Title */}
        <h3
          id={`service-title-${service.id}`}
          className='mb-3 text-xl font-semibold text-foreground'
        >
          {service.title}
        </h3>

        {/* Description */}
        <p
          id={`service-description-${service.id}`}
          className='mb-4 text-sm text-muted-foreground leading-relaxed'
        >
          {service.description}
        </p>

        {/* Bullet Points */}
        <ul
          className='space-y-2'
          aria-label={`Key features of ${service.title}`}
        >
          {service.bullets.map((bullet, bulletIndex) => (
            <li
              key={bulletIndex}
              className='flex items-start text-sm text-muted-foreground'
            >
              <span
                className='mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary'
                aria-hidden='true'
              />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        {/* Hover effect overlay */}
        <div
          className='absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100'
          aria-hidden='true'
        />
      </motion.div>
    );
  }
);

ServiceCardComponent.displayName = 'ServiceCard';

// Memoize the component to prevent unnecessary re-renders
export const ServiceCard = React.memo(ServiceCardComponent);
