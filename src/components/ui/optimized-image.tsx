'use client';

import * as React from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/utils';

export interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  showLoadingState?: boolean;
  loadingClassName?: string;
  errorClassName?: string;
  containerClassName?: string;
}

/**
 * Optimized image component with loading states, fallbacks, and error handling
 * Built on Next.js Image component for automatic optimization
 */
const OptimizedImage = React.forwardRef<HTMLImageElement, OptimizedImageProps>(
  ({
    src,
    alt,
    fallbackSrc,
    showLoadingState = true,
    loadingClassName,
    errorClassName,
    containerClassName,
    className,
    onError,
    onLoad,
    ...props
  }, ref) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [hasError, setHasError] = React.useState(false);
    const [currentSrc, setCurrentSrc] = React.useState(src);

    const handleLoad = React.useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
      setIsLoading(false);
      setHasError(false);
      onLoad?.(event);
    }, [onLoad]);

    const handleError = React.useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
      setIsLoading(false);
      
      // Try fallback image if available and not already using it
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        setIsLoading(true);
        setHasError(false);
        return;
      }
      
      // If no fallback or fallback also failed, show error state
      setHasError(true);
      onError?.(event);
    }, [onError, fallbackSrc, currentSrc]);

    // Reset state when src changes
    React.useEffect(() => {
      setCurrentSrc(src);
      setIsLoading(true);
      setHasError(false);
    }, [src]);

    return (
      <div className={cn('relative overflow-hidden', containerClassName)}>
        {/* Loading state */}
        {isLoading && showLoadingState && (
          <div className={cn(
            'absolute inset-0 bg-muted animate-pulse flex items-center justify-center',
            loadingClassName
          )}>
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error state */}
        {hasError && !isLoading && (
          <div className={cn(
            'absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground',
            errorClassName
          )}>
            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto mb-2 bg-muted-foreground/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-sm">Failed to load image</p>
            </div>
          </div>
        )}

        {/* Actual image */}
        <Image
          ref={ref}
          src={currentSrc}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            hasError ? 'opacity-0' : '',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          {...props}
        />
      </div>
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';

export { OptimizedImage };