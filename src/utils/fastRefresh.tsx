/**
 * Fast Refresh utilities and best practices
 * Helps prevent Fast Refresh failures in development
 */

import React from 'react';

/**
 * HOC wrapper that ensures components are Fast Refresh compatible
 * Adds displayName and proper error boundaries
 */
export function withFastRefresh<P extends object>(
  Component: React.ComponentType<P>,
  displayName: string
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => {
    try {
      return <Component {...props} />;
    } catch (error) {
      console.error(`Error in ${displayName}:`, error);
      return (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <h3 className="text-red-800 font-semibold">Component Error</h3>
          <p className="text-red-600 text-sm">
            {displayName} failed to render. Check console for details.
          </p>
        </div>
      );
    }
  };

  WrappedComponent.displayName = displayName;
  return WrappedComponent;
}

/**
 * Validates that a component follows Fast Refresh best practices
 */
export function validateFastRefreshComponent(
  Component: React.ComponentType<any>,
  componentName: string
): boolean {
  const issues: string[] = [];

  // Check if component has displayName
  if (!Component.displayName) {
    issues.push(`Missing displayName for ${componentName}`);
  }

  // Check if component is a named function (not anonymous)
  if (Component.name === '' || Component.name === 'Anonymous') {
    issues.push(`Component ${componentName} should be a named function`);
  }

  // Log issues in development
  if (process.env.NODE_ENV === 'development' && issues.length > 0) {
    console.warn(`Fast Refresh issues in ${componentName}:`, issues);
  }

  return issues.length === 0;
}

/**
 * Safe lazy loading wrapper that handles errors gracefully
 */
export function safeLazy<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T } | T>,
  fallback?: React.ComponentType
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    try {
      const module = await importFn();
      
      // Handle both default exports and named exports
      const Component = 'default' in module ? module.default : module;
      
      // Validate the component
      if (typeof Component !== 'function') {
        throw new Error('Lazy loaded module does not export a valid React component');
      }

      return { default: Component };
    } catch (error) {
      console.error('Error loading lazy component:', error);
      
      // Return fallback component or a simple error component
      const ErrorComponent = fallback || (() => (
        <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-md">
          <p className="text-yellow-800">Failed to load component</p>
        </div>
      ));
      
      return { default: ErrorComponent as T };
    }
  });
}

/**
 * Development-only component that shows Fast Refresh status
 */
export const FastRefreshIndicator: React.FC = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-green-100 border border-green-300 rounded-md p-2 text-xs text-green-800">
      ⚡ Fast Refresh Active
    </div>
  );
};

/**
 * Hook to detect Fast Refresh errors and provide debugging info
 */
export function useFastRefreshDebug(componentName: string) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${componentName} mounted successfully`);
      
      return () => {
        console.log(`🔄 ${componentName} unmounting (Fast Refresh or navigation)`);
      };
    }
    return undefined;
  }, [componentName]);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error(`❌ Runtime error in ${componentName}:`, event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error(`❌ Unhandled promise rejection in ${componentName}:`, event.reason);
    };

    if (process.env.NODE_ENV === 'development') {
      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }
    return undefined;
  }, [componentName]);
}