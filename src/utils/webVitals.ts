/**
 * Core Web Vitals monitoring and performance utilities
 */

import { trackEvent } from './analytics';

export interface WebVitalMetric {
  name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'back-forward-cache' | 'prerender' | 'restore';
}

/**
 * Web Vitals thresholds based on Google's recommendations
 */
export const WEB_VITALS_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  FID: { good: 100, poor: 300 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
} as const;

/**
 * Get rating for a web vital metric
 */
export const getWebVitalRating = (
  name: WebVitalMetric['name'],
  value: number
): WebVitalMetric['rating'] => {
  const thresholds = WEB_VITALS_THRESHOLDS[name];
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
};

/**
 * Report web vital to analytics
 */
export const reportWebVital = (metric: any) => {
  // Track to Google Analytics
  trackEvent({
    event: 'web_vital',
    category: 'performance',
    action: metric.name,
    label: metric.rating,
    value: Math.round(metric.value),
    customParameters: {
      metric_name: metric.name,
      metric_value: metric.value,
      metric_rating: metric.rating,
      metric_delta: metric.delta,
      metric_id: metric.id,
      navigation_type: metric.navigationType,
    },
  });

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Web Vital - ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
  }
};

/**
 * Initialize web vitals monitoring
 */
export const initWebVitals = () => {
  if (typeof window === 'undefined') return;

  // Dynamic import to avoid SSR issues
  import('web-vitals').then(({ onCLS, onFCP, onFID, onLCP, onTTFB, onINP }) => {
    onCLS(reportWebVital);
    onFCP(reportWebVital);
    onFID(reportWebVital);
    onLCP(reportWebVital);
    onTTFB(reportWebVital);
    onINP(reportWebVital);
  }).catch((error) => {
    console.warn('Failed to load web-vitals library:', error);
  });
};

/**
 * Performance monitoring utilities
 */
export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
}

/**
 * Get performance metrics
 */
export const getPerformanceMetrics = (): PerformanceMetrics | null => {
  if (typeof window === 'undefined' || !window.performance) return null;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');

  const firstPaint = paint.find(entry => entry.name === 'first-paint')?.startTime || 0;
  const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;

  return {
    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    firstPaint,
    firstContentfulPaint,
  };
};

/**
 * Monitor resource loading performance
 */
export const monitorResourcePerformance = () => {
  if (typeof window === 'undefined') return;

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'resource') {
        const resourceEntry = entry as PerformanceResourceTiming;
        
        // Track slow resources
        if (resourceEntry.duration > 1000) {
          trackEvent({
            event: 'slow_resource',
            category: 'performance',
            action: 'resource_timing',
            label: resourceEntry.name,
            value: Math.round(resourceEntry.duration),
            customParameters: {
              resource_name: resourceEntry.name,
              resource_type: resourceEntry.initiatorType,
              resource_size: resourceEntry.transferSize,
              resource_duration: resourceEntry.duration,
            },
          });
        }
      }
    });
  });

  observer.observe({ entryTypes: ['resource'] });
};

/**
 * Monitor long tasks that block the main thread
 */
export const monitorLongTasks = () => {
  if (typeof window === 'undefined') return;

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      trackEvent({
        event: 'long_task',
        category: 'performance',
        action: 'main_thread_blocking',
        label: 'long_task',
        value: Math.round(entry.duration),
        customParameters: {
          task_duration: entry.duration,
          task_start_time: entry.startTime,
        },
      });
    });
  });

  try {
    observer.observe({ entryTypes: ['longtask'] });
  } catch (error) {
    // Long task API not supported
    console.warn('Long task monitoring not supported:', error);
  }
};

/**
 * Initialize all performance monitoring
 */
export const initPerformanceMonitoring = () => {
  initWebVitals();
  monitorResourcePerformance();
  monitorLongTasks();
  
  // Report initial performance metrics after page load
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const metrics = getPerformanceMetrics();
        if (metrics) {
          trackEvent({
            event: 'page_performance',
            category: 'performance',
            action: 'page_load_metrics',
            label: window.location.pathname,
            value: Math.round(metrics.loadTime),
            customParameters: {
              load_time: metrics.loadTime,
              dom_content_loaded: metrics.domContentLoaded,
              first_paint: metrics.firstPaint,
              first_contentful_paint: metrics.firstContentfulPaint,
              page_path: window.location.pathname,
            },
          });
        }
      }, 1000);
    });
  }
};