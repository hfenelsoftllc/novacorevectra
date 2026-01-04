import * as React from 'react';
import { cn } from '@/utils';

export interface ImagePlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | 'wide';
  variant?: 'default' | 'gradient' | 'pattern' | 'icon';
  showIcon?: boolean;
  iconType?: 'image' | 'user' | 'building' | 'chart' | 'document';
  text?: string;
  animate?: boolean;
}

const aspectRatios = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  wide: 'aspect-[16/9]'
};

const iconTypes = {
  image: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  user: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  building: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  chart: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  document: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
};

/**
 * Image placeholder component for visual consistency
 * Provides various styles and animations while content loads
 */
const ImagePlaceholder = React.forwardRef<HTMLDivElement, ImagePlaceholderProps>(
  ({
    className,
    width,
    height,
    aspectRatio = 'landscape',
    variant = 'default',
    showIcon = true,
    iconType = 'image',
    text,
    animate = false,
    style,
    ...props
  }, ref) => {
    const baseClasses = cn(
      'flex items-center justify-center rounded-lg overflow-hidden',
      aspectRatio && aspectRatios[aspectRatio],
      animate && 'animate-pulse'
    );

    const variantClasses = {
      default: 'bg-muted text-muted-foreground',
      gradient: 'bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 text-muted-foreground',
      pattern: 'bg-muted text-muted-foreground relative',
      icon: 'bg-muted/50 text-muted-foreground border-2 border-dashed border-muted-foreground/30'
    };

    const inlineStyles = {
      ...style,
      ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
      ...(height && { height: typeof height === 'number' ? `${height}px` : height })
    };

    return (
      <div
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], className)}
        style={inlineStyles}
        {...props}
      >
        {/* Pattern background for pattern variant */}
        {variant === 'pattern' && (
          <div className="absolute inset-0 opacity-5">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col items-center justify-center space-y-2 p-4 text-center relative z-10">
          {showIcon && iconTypes[iconType]}
          {text && (
            <span className="text-sm font-medium">
              {text}
            </span>
          )}
        </div>
      </div>
    );
  }
);

ImagePlaceholder.displayName = 'ImagePlaceholder';

export { ImagePlaceholder };