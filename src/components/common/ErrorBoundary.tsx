'use client';

import * as React from 'react';
import { ErrorFallback } from './ErrorFallback';
import { announceToScreenReader } from './AccessibilityAnnouncer';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showHomeLink?: boolean;
}

interface ErrorFallbackProps {
  error: Error | undefined;
  resetError: () => void;
  showHomeLink?: boolean;
}

/**
 * Error boundary component for graceful error handling
 * Catches JavaScript errors anywhere in the child component tree and displays a fallback UI
 * Includes accessibility features and error reporting
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  override componentDidMount() {
    // Add global escape key listener
    if (typeof window !== 'undefined') {
      document.addEventListener('keydown', this.handleKeyDown);
    }
  }

  override componentWillUnmount() {
    // Remove global escape key listener
    if (typeof window !== 'undefined') {
      document.removeEventListener('keydown', this.handleKeyDown);
    }
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.state.hasError) {
      this.resetError();
    }
  };

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error information
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Announce error to screen readers
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        announceToScreenReader(
          'An error occurred while loading the page. Please try refreshing or use the navigation to go to another page.',
          'assertive'
        );
      }, 100);
    }

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report error to analytics or error tracking service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
      });
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    
    // Announce recovery to screen readers
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        announceToScreenReader('Page has been reset. Content is now loading.', 'polite');
      }, 100);
    }
    
    // Force a re-render by updating the key of the children
    this.forceUpdate();
  };

  override render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || ErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          showHomeLink={this.props.showHomeLink}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
