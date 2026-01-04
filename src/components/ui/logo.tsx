import * as React from 'react';
import { cn } from '@/utils';

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'compact' | 'text-only' | 'icon-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

const logoSizes = {
  sm: {
    icon: 'h-6 w-6',
    text: 'text-sm',
    container: 'space-x-1.5'
  },
  md: {
    icon: 'h-8 w-8',
    text: 'text-base',
    container: 'space-x-2'
  },
  lg: {
    icon: 'h-10 w-10',
    text: 'text-lg',
    container: 'space-x-2.5'
  },
  xl: {
    icon: 'h-12 w-12',
    text: 'text-xl',
    container: 'space-x-3'
  }
};

/**
 * Logo component with placeholder for company branding
 * Supports multiple variants and sizes for different use cases
 */
const Logo = React.forwardRef<HTMLDivElement, LogoProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    showText = true,
    ...props 
  }, ref) => {
    const sizeConfig = logoSizes[size];
    
    const renderIcon = () => (
      <div className={cn(
        'bg-gradient-to-br from-brand-primary to-primary-600 rounded-md flex items-center justify-center shadow-sm',
        sizeConfig.icon
      )}>
        <span className={cn(
          'text-white font-bold',
          size === 'sm' ? 'text-xs' : 
          size === 'md' ? 'text-sm' : 
          size === 'lg' ? 'text-base' : 'text-lg'
        )}>
          NCV
        </span>
      </div>
    );

    const renderText = () => (
      <span className={cn(
        'font-bold text-foreground tracking-tight',
        sizeConfig.text
      )}>
        NovaCoreVectra
      </span>
    );

    if (variant === 'icon-only') {
      return (
        <div ref={ref} className={cn('inline-flex', className)} {...props}>
          {renderIcon()}
        </div>
      );
    }

    if (variant === 'text-only') {
      return (
        <div ref={ref} className={cn('inline-flex', className)} {...props}>
          {renderText()}
        </div>
      );
    }

    if (variant === 'compact') {
      return (
        <div ref={ref} className={cn('inline-flex items-center', sizeConfig.container, className)} {...props}>
          {renderIcon()}
          <span className={cn(
            'font-bold text-foreground tracking-tight hidden sm:inline-block',
            sizeConfig.text
          )}>
            NCV
          </span>
        </div>
      );
    }

    // Default variant
    return (
      <div ref={ref} className={cn('inline-flex items-center', sizeConfig.container, className)} {...props}>
        {renderIcon()}
        {showText && (
          <span className={cn(
            'font-bold text-foreground tracking-tight',
            sizeConfig.text,
            size === 'sm' ? 'hidden sm:inline-block' : ''
          )}>
            NovaCoreVectra
          </span>
        )}
      </div>
    );
  }
);

Logo.displayName = 'Logo';

export { Logo };