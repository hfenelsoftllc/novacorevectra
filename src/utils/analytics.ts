/**
 * Analytics utilities for Google Analytics 4 integration and tracking
 */

import { AnalyticsEvent } from '@/types/analytics';

/**
 * Google Analytics 4 configuration
 */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

/**
 * Initialize Google Analytics 4
 */
export const initializeGA = () => {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return;

  // Load gtag script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

/**
 * Track page view
 */
export const trackPageView = (url: string, title?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
    page_title: title || document.title,
    page_location: window.location.href,
  });
};

/**
 * Track custom event
 */
export const trackEvent = (event: AnalyticsEvent) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', event.action, {
    event_category: event.category,
    event_label: event.label,
    value: event.value,
    custom_parameters: event.customParameters,
  });

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', event);
  }
};

/**
 * Track conversion event
 */
export const trackConversion = (conversionId: string, value?: number, currency = 'USD') => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'conversion', {
    send_to: conversionId,
    value: value,
    currency: currency,
  });
};

/**
 * Set user properties
 */
export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    custom_map: properties,
  });
};

/**
 * Generate session ID
 */
export const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get or create session ID
 */
export const getSessionId = (): string => {
  if (typeof window === 'undefined') return generateSessionId();

  const existingSessionId = sessionStorage.getItem('analytics_session_id');
  if (existingSessionId) {
    return existingSessionId;
  }

  const newSessionId = generateSessionId();
  sessionStorage.setItem('analytics_session_id', newSessionId);
  return newSessionId;
};

/**
 * Get or create user ID
 */
export const getUserId = (): string => {
  if (typeof window === 'undefined') return generateSessionId();

  const existingUserId = localStorage.getItem('analytics_user_id');
  if (existingUserId) {
    return existingUserId;
  }

  const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('analytics_user_id', newUserId);
  return newUserId;
};

/**
 * A/B Testing utilities
 */
export interface ABTestVariant {
  id: string;
  name: string;
  weight: number;
  content: any;
}

export interface ABTest {
  id: string;
  name: string;
  variants: ABTestVariant[];
  trafficAllocation: number; // Percentage of users to include in test
}

/**
 * Get A/B test variant for user
 */
export const getABTestVariant = (test: ABTest): ABTestVariant | null => {
  if (typeof window === 'undefined') return null;

  const userId = getUserId();
  const testKey = `ab_test_${test.id}`;
  
  // Check if user is already assigned to a variant
  const existingVariant = localStorage.getItem(testKey);
  if (existingVariant) {
    const variant = test.variants.find(v => v.id === existingVariant);
    if (variant) return variant;
  }

  // Check if user should be included in test
  const userHash = hashString(userId + test.id);
  const userPercentile = userHash % 100;
  
  if (userPercentile >= test.trafficAllocation) {
    return null; // User not in test
  }

  // Assign user to variant based on weighted distribution
  const totalWeight = test.variants.reduce((sum, variant) => sum + variant.weight, 0);
  const randomValue = userHash % totalWeight;
  
  let cumulativeWeight = 0;
  for (const variant of test.variants) {
    cumulativeWeight += variant.weight;
    if (randomValue < cumulativeWeight) {
      localStorage.setItem(testKey, variant.id);
      
      // Track A/B test assignment
      trackEvent({
        event: 'ab_test_assignment',
        category: 'experiment',
        action: 'variant_assigned',
        label: `${test.id}_${variant.id}`,
        customParameters: {
          test_id: test.id,
          test_name: test.name,
          variant_id: variant.id,
          variant_name: variant.name,
          user_id: userId,
        },
      });
      
      return variant;
    }
  }

  return test.variants[0]; // Fallback to first variant
};

/**
 * Simple hash function for consistent user assignment
 */
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

/**
 * Track A/B test conversion
 */
export const trackABTestConversion = (testId: string, variantId: string, conversionType: string) => {
  trackEvent({
    event: 'ab_test_conversion',
    category: 'experiment',
    action: 'conversion',
    label: `${testId}_${variantId}_${conversionType}`,
    value: 1,
    customParameters: {
      test_id: testId,
      variant_id: variantId,
      conversion_type: conversionType,
      user_id: getUserId(),
      session_id: getSessionId(),
    },
  });
};

/**
 * Global type declarations
 */
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
  }
}