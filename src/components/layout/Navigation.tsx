'use client';

import React from 'react';
import Link from 'next/link';
import { MAIN_NAVIGATION } from '../../constants/navigation';
import { cn } from '../../utils';

export interface NavigationProps {
  currentPath: string | null;
  className?: string;
  onItemClick?: (() => void) | undefined;
  isMobile?: boolean;
}

/**
 * Navigation component with active state highlighting
 * Supports both desktop and mobile layouts
 */
export const Navigation: React.FC<NavigationProps> = ({ 
  currentPath, 
  className, 
  onItemClick,
  isMobile = false 
}) => {
  const isActivePath = (href: string) => {
    if (!currentPath) return false;
    if (href === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(href);
  };

  return (
    <nav className={cn('navigation', className)} role="navigation" aria-label="Main navigation">
      {MAIN_NAVIGATION.map((item) => {
        const isActive = isActivePath(item.href);
        
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              'relative px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md',
              'hover:text-primary hover:bg-accent',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              {
                // Desktop active styles
                'text-primary bg-accent': isActive && !isMobile,
                'text-muted-foreground': !isActive && !isMobile,
                // Mobile active styles
                'text-primary bg-accent border-l-4 border-primary pl-2': isActive && isMobile,
                'text-muted-foreground hover:text-primary': !isActive && isMobile,
                // Mobile specific styles
                'block w-full text-left': isMobile,
                'inline-flex items-center': !isMobile,
              }
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <span onClick={onItemClick} className="flex items-center w-full">
              {item.icon && (
                <span className="mr-2 flex-shrink-0">
                  {item.icon}
                </span>
              )}
              {item.label}
              
              {/* Active indicator for desktop */}
              {isActive && !isMobile && (
                <span 
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                  aria-hidden="true"
                />
              )}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};