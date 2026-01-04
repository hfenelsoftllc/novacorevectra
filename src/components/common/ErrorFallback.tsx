'use client';

import React from 'react';
import { Card, CardContent, Button } from '@/components';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  showHomeLink?: boolean;
  title?: string;
  description?: string;
}

/**
 * Enhanced error fallback component with better accessibility
 * Provides multiple recovery options and clear error communication
 */
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  showHomeLink = true,
  title = 'Something went wrong',
  description = 'We encountered an unexpected error. Please try refreshing the page or return to the home page.'
}) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && resetError) {
      resetError();
    }
  };

  return (
    <div 
      className='min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 flex items-center justify-center p-6'
      role="alert"
      aria-live="assertive"
      onKeyDown={handleKeyDown}
    >
      <Card className='max-w-md w-full bg-slate-950 border-slate-700'>
        <CardContent className='p-8 text-center'>
          <div className='mb-4 text-red-400 flex justify-center'>
            <AlertTriangle 
              className='h-12 w-12' 
              aria-hidden='true'
              role="img"
              aria-label="Error icon"
            />
          </div>
          
          <h1 className='text-xl font-semibold text-slate-100 mb-4'>
            {title}
          </h1>
          
          <p className='text-slate-300 mb-6'>
            {description}
          </p>

          {/* Development error details */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className='mb-6 text-left'>
              <summary className='cursor-pointer text-sm text-slate-400 hover:text-slate-300 focus:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-950 rounded'>
                Error details (development only)
              </summary>
              <pre className='mt-2 text-xs text-red-300 bg-slate-900 p-3 rounded overflow-auto max-h-32'>
                {error.message}
                {error.stack && `\n${error.stack}`}
              </pre>
            </details>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {resetError && (
              <Button
                onClick={resetError}
                className='gap-2'
                aria-label='Try again - Refresh the current page'
                autoFocus
              >
                <RefreshCw className='h-4 w-4' aria-hidden='true' />
                Try Again
              </Button>
            )}
            
            {showHomeLink && (
              <Button
                asChild
                variant="outline"
                className='gap-2'
                aria-label='Go to home page'
              >
                <Link href="/">
                  <Home className='h-4 w-4' aria-hidden='true' />
                  Go Home
                </Link>
              </Button>
            )}
          </div>

          {/* Keyboard hint */}
          <p className="text-xs text-slate-400 mt-4">
            Press Escape to try again or use the buttons above
          </p>
        </CardContent>
      </Card>
    </div>
  );
};