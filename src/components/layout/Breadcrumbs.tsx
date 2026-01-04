import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem } from '../../types/navigation';
import { cn } from '../../utils';

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

/**
 * Breadcrumbs component for deep page navigation
 * Provides hierarchical navigation context
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  items, 
  className,
  showHome = true 
}) => {
  if (!items.length && !showHome) {
    return null;
  }

  const allItems: BreadcrumbItem[] = showHome 
    ? [{ label: 'Home', href: '/' }, ...items]
    : items;

  return (
    <nav 
      className={cn('flex items-center space-x-1 text-sm', className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isHome = item.href === '/' && showHome;

          return (
            <li key={`${item.href}-${index}`} className="flex items-center">
              {index > 0 && (
                <ChevronRight 
                  className="h-4 w-4 text-muted-foreground mx-1 flex-shrink-0" 
                  aria-hidden="true"
                />
              )}
              
              {isLast ? (
                <span 
                  className="text-foreground font-medium"
                  aria-current="page"
                >
                  {isHome ? (
                    <Home className="h-4 w-4" aria-label="Home" />
                  ) : (
                    item.label
                  )}
                </span>
              ) : (
                <Link
                  href={item.href || '#'}
                  className={cn(
                    'text-muted-foreground hover:text-primary transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-sm px-1',
                    {
                      'pointer-events-none': !item.href
                    }
                  )}
                >
                  {isHome ? (
                    <Home className="h-4 w-4" aria-label="Home" />
                  ) : (
                    item.label
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};