'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initializeGA, trackPageView } from '@/utils/analytics';

/**
 * Analytics context interface
 */
interface AnalyticsContextType {
  isInitialized: boolean;
}

/**
 * Analytics context
 */
const AnalyticsContext = createContext<AnalyticsContextType>({
  isInitialized: false,
});

/**
 * Analytics provider props
 */
interface AnalyticsProviderProps {
  children: ReactNode;
  measurementId?: string;
}

/**
 * Analytics provider component
 */
export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
  measurementId,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Initialize Google Analytics
  useEffect(() => {
    if (measurementId || process.env['NEXT_PUBLIC_GA_MEASUREMENT_ID']) {
      initializeGA();
      setIsInitialized(true);
    }
  }, [measurementId]);

  // Track page views on route changes
  useEffect(() => {
    if (isInitialized) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      trackPageView(url);
    }
  }, [pathname, searchParams, isInitialized]);

  // Track session start on mount
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      // Track session start if it's a new session
      const sessionStarted = sessionStorage.getItem('analytics_session_started');
      if (!sessionStarted) {
        sessionStorage.setItem('analytics_session_started', 'true');
        
        // Track session start event
        if (window.gtag) {
          window.gtag('event', 'session_start', {
            event_category: 'session',
            event_label: 'new_session',
          });
        }
      }
    }
  }, [isInitialized]);

  // Track session end on page unload
  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return;

    const handleBeforeUnload = () => {
      if (window.gtag) {
        window.gtag('event', 'session_end', {
          event_category: 'session',
          event_label: 'page_unload',
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isInitialized]);

  return (
    <AnalyticsContext.Provider value={{ isInitialized }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

/**
 * Hook to use analytics context
 */
export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
};

/**
 * Google Analytics Script component
 */
export const GoogleAnalyticsScript: React.FC<{ measurementId?: string }> = ({
  measurementId,
}) => {
  const gaId = measurementId || process.env['NEXT_PUBLIC_GA_MEASUREMENT_ID'];

  if (!gaId) {
    return null;
  }

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `,
        }}
      />
    </>
  );
};