import * as React from 'react';
import { cn } from '@/utils';

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'bars';
  color?: 'primary' | 'secondary' | 'muted';
  text?: string;
  'aria-label'?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const colorClasses = {
  primary: 'border-primary',
  secondary: 'border-secondary',
  muted: 'border-muted-foreground'
};

/**
 * Loading spinner component with multiple variants and sizes
 * Provides visual feedback during loading states with proper accessibility
 */
const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({
    className,
    size = 'md',
    variant = 'default',
    color = 'primary',
    text,
    'aria-label': ariaLabel,
    ...props
  }, ref) => {
    const defaultAriaLabel = text || 'Loading content, please wait';

    const renderSpinner = () => {
      switch (variant) {
        case 'dots':
          return (
            <div className="flex space-x-1" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-full bg-current animate-pulse',
                    size === 'sm' ? 'w-1 h-1' :
                    size === 'md' ? 'w-1.5 h-1.5' :
                    size === 'lg' ? 'w-2 h-2' : 'w-3 h-3'
                  )}
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
          );

        case 'pulse':
          return (
            <div 
              className={cn(
                'rounded-full bg-current animate-ping',
                sizeClasses[size]
              )}
              aria-hidden="true"
            />
          );

        case 'bars':
          return (
            <div className="flex space-x-0.5" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'bg-current animate-pulse',
                    size === 'sm' ? 'w-0.5 h-3' :
                    size === 'md' ? 'w-1 h-4' :
                    size === 'lg' ? 'w-1 h-6' : 'w-1.5 h-8'
                  )}
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '1.2s'
                  }}
                />
              ))}
            </div>
          );

        default:
          return (
            <div 
              className={cn(
                'border-2 border-t-transparent rounded-full animate-spin',
                sizeClasses[size],
                colorClasses[color]
              )}
              aria-hidden="true"
            />
          );
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center space-y-2',
          className
        )}
        role="status"
        aria-label={ariaLabel || defaultAriaLabel}
        aria-live="polite"
        {...props}
      >
        <div className={cn(
          'flex items-center justify-center',
          color === 'primary' ? 'text-primary' :
          color === 'secondary' ? 'text-secondary' : 'text-muted-foreground'
        )}>
          {renderSpinner()}
        </div>
        {text && (
          <span className="text-sm text-muted-foreground font-medium" aria-hidden="true">
            {text}
          </span>
        )}
        {/* Screen reader text */}
        <span className="sr-only">
          {ariaLabel || defaultAriaLabel}
        </span>
      </div>
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

export { LoadingSpinner };