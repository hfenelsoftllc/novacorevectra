import * as React from 'react';
import { Card, CardContent, Button } from '@/components';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error: Error | undefined;
  resetError: () => void;
}

/**
 * Default error fallback component
 */
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
}) => (
  <div className='min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 flex items-center justify-center p-6'>
    <Card className='max-w-md w-full bg-slate-950 border-slate-700'>
      <CardContent className='p-8 text-center'>
        <div className='mb-4 text-red-400 flex justify-center'>
          <AlertTriangle className='h-12 w-12' aria-hidden='true' />
        </div>
        <h2 className='text-xl font-semibold text-slate-100 mb-4'>
          Something went wrong
        </h2>
        <p className='text-slate-300 mb-6'>
          We encountered an unexpected error. Please try refreshing the page.
        </p>
        {process.env.NODE_ENV === 'development' && error && (
          <details className='mb-6 text-left'>
            <summary className='cursor-pointer text-sm text-slate-400 hover:text-slate-300'>
              Error details
            </summary>
            <pre className='mt-2 text-xs text-red-300 bg-slate-900 p-3 rounded overflow-auto'>
              {error.message}
              {error.stack && `\n${error.stack}`}
            </pre>
          </details>
        )}
        <Button
          onClick={resetError}
          className='gap-2'
          aria-label='Try again - Refresh the page'
        >
          <RefreshCw className='h-4 w-4' aria-hidden='true' />
          Try Again
        </Button>
      </CardContent>
    </Card>
  </div>
);

/**
 * Error boundary component for graceful error handling
 * Catches JavaScript errors anywhere in the child component tree and displays a fallback UI
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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error information
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
