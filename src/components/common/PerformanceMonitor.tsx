'use client';

import * as React from 'react';
import { initPerformanceMonitoring } from '@/utils/webVitals';

/**
 * Component that initializes performance monitoring
 * Should be included once in the root layout
 */
export const PerformanceMonitor: React.FC = () => {
  React.useEffect(() => {
    // Initialize performance monitoring after component mounts
    initPerformanceMonitoring();
  }, []);

  // This component doesn't render anything
  return null;
};