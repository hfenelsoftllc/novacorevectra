import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CTAVariant } from '@/types';
import { 
  trackEvent as trackAnalyticsEvent, 
  trackPageView as trackAnalyticsPageView,
  trackConversion,
  getUserId,
  getSessionId,
  getABTestVariant,
  trackABTestConversion,
  ABTest,
  ABTestVariant
} from '@/utils/analytics';

/**
 * Analytics event types
 */
export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  customParameters?: Record<string, any>;
}

/**
 * CTA tracking event data
 */
export interface CTATrackingEvent {
  variant: CTAVariant;
  position: string;
  page: string;
  userId?: string;
  sessionId?: string;
}

/**
 * Form tracking event data
 */
export interface FormTrackingEvent {
  formType: string;
  step: string;
  success: boolean;
  errorMessage?: string;
  formData?: Record<string, any>;
}

/**
 * Conversion tracking data
 */
export interface ConversionEvent {
  type: 'lead_capture' | 'form_submission' | 'cta_click' | 'page_engagement';
  value?: number;
  currency?: string;
  conversionId?: string;
  metadata?: Record<string, any>;
}

/**
 * Hook for analytics tracking with enhanced functionality
 */
export const useAnalytics = () => {
  const router = useRouter();
  const sessionId = useRef<string>();
  const userId = useRef<string>();
  const pageStartTime = useRef<number>();

  // Initialize session and user IDs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionId.current = getSessionId();
      userId.current = getUserId();
      pageStartTime.current = Date.now();
    }
  }, []);

  // Track page views on route changes
  useEffect(() => {
    // Track time on previous page
    if (pageStartTime.current) {
      const timeOnPage = Date.now() - pageStartTime.current;
      trackEngagement('time_on_page', window.location.pathname, timeOnPage);
    }

    // Track initial page view
    if (typeof window !== 'undefined') {
      trackAnalyticsPageView(window.location.pathname);
      pageStartTime.current = Date.now();
    }

    return () => {
      // Track time on page when component unmounts
      if (pageStartTime.current) {
        const timeOnPage = Date.now() - pageStartTime.current;
        trackEngagement('time_on_page', window.location.pathname, timeOnPage);
      }
    };
  }, [router]);

  /**
   * Track generic analytics event
   */
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    const enhancedEvent = {
      ...event,
      customParameters: {
        ...event.customParameters,
        user_id: userId.current,
        session_id: sessionId.current,
        timestamp: Date.now(),
        page_url: typeof window !== 'undefined' ? window.location.href : '',
      },
    };

    trackAnalyticsEvent(enhancedEvent);
  }, []);

  /**
   * Track CTA clicks with enhanced metrics
   */
  const trackCTAClick = useCallback((data: CTATrackingEvent) => {
    const eventData = {
      event: 'cta_click',
      category: 'engagement',
      action: 'cta_click',
      label: `${data.variant}_${data.position}_${data.page}`,
      value: 1,
      customParameters: {
        cta_variant: data.variant,
        cta_position: data.position,
        page: data.page,
        user_id: data.userId || userId.current,
        session_id: data.sessionId || sessionId.current,
        click_timestamp: Date.now(),
      },
    };

    trackEvent(eventData);

    // Also track as conversion if it's a high-value CTA
    if (['consultation', 'demo'].includes(data.variant)) {
      trackConversionEvent({
        type: 'cta_click',
        value: 1,
        metadata: {
          cta_variant: data.variant,
          cta_position: data.position,
          page: data.page,
        },
      });
    }
  }, [trackEvent]);

  /**
   * Track form interactions with detailed metrics
   */
  const trackFormEvent = useCallback((data: FormTrackingEvent) => {
    trackEvent({
      event: 'form_interaction',
      category: 'conversion',
      action: `form_${data.step}`,
      label: data.formType,
      value: data.success ? 1 : 0,
      customParameters: {
        form_type: data.formType,
        step: data.step,
        success: data.success,
        error_message: data.errorMessage,
        form_fields: data.formData ? Object.keys(data.formData) : [],
        field_count: data.formData ? Object.keys(data.formData).length : 0,
      },
    });
  }, [trackEvent]);

  /**
   * Track conversion events
   */
  const trackConversionEvent = useCallback((conversion: ConversionEvent) => {
    trackEvent({
      event: 'conversion',
      category: 'conversion',
      action: conversion.type,
      label: `${conversion.type}_${userId.current}`,
      value: conversion.value || 1,
      customParameters: {
        conversion_type: conversion.type,
        conversion_value: conversion.value,
        currency: conversion.currency || 'USD',
        conversion_id: conversion.conversionId,
        ...conversion.metadata,
      },
    });

    // Track in GA4 as conversion
    if (conversion.conversionId) {
      trackConversion(conversion.conversionId, conversion.value, conversion.currency);
    }
  }, [trackEvent]);

  /**
   * Track form submission with conversion
   */
  const trackFormSubmission = useCallback((formType: string, success: boolean, errorMessage?: string, formData?: Record<string, any>) => {
    trackFormEvent({
      formType,
      step: 'submit',
      success,
      ...(errorMessage && { errorMessage }),
      ...(formData && { formData }),
    });

    // Track as conversion if successful
    if (success) {
      trackConversionEvent({
        type: 'form_submission',
        value: getFormConversionValue(formType),
        metadata: {
          form_type: formType,
          form_fields: formData ? Object.keys(formData) : [],
        },
      });
    }
  }, [trackFormEvent, trackConversionEvent]);

  /**
   * Track form start
   */
  const trackFormStart = useCallback((formType: string) => {
    trackFormEvent({
      formType,
      step: 'start',
      success: true,
    });
  }, [trackFormEvent]);

  /**
   * Track form field completion
   */
  const trackFormFieldCompletion = useCallback((formType: string, fieldName: string, fieldValue?: any) => {
    trackFormEvent({
      formType,
      step: 'field_complete',
      success: true,
      formData: { [fieldName]: fieldValue !== undefined ? !!fieldValue : true },
    });
  }, [trackFormEvent]);

  /**
   * Track page view with enhanced data
   */
  const trackPageView = useCallback((page: string, title?: string, metadata?: Record<string, any>) => {
    trackEvent({
      event: 'page_view',
      category: 'navigation',
      action: 'page_view',
      label: page,
      customParameters: {
        page_title: title || (typeof document !== 'undefined' ? document.title : ''),
        page_location: typeof window !== 'undefined' ? window.location.href : '',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        ...metadata,
      },
    });
  }, [trackEvent]);

  /**
   * Track conversion funnel step
   */
  const trackFunnelStep = useCallback((step: string, page: string, metadata?: Record<string, any>) => {
    trackEvent({
      event: 'funnel_step',
      category: 'conversion',
      action: 'funnel_progress',
      label: `${step}_${page}`,
      customParameters: {
        funnel_step: step,
        page,
        step_order: getFunnelStepOrder(step),
        ...metadata,
      },
    });
  }, [trackEvent]);

  /**
   * Track user engagement with timing
   */
  const trackEngagement = useCallback((action: string, element: string, duration?: number, metadata?: Record<string, any>) => {
    trackEvent({
      event: 'user_engagement',
      category: 'engagement',
      action,
      label: element,
      value: duration || 0,
      customParameters: {
        engagement_type: action,
        element,
        duration: duration || 0,
        engagement_quality: getEngagementQuality(action, duration),
        ...metadata,
      },
    });
  }, [trackEvent]);

  /**
   * Track scroll depth
   */
  const trackScrollDepth = useCallback((depth: number, page: string) => {
    trackEngagement('scroll', page, depth, {
      scroll_depth: depth,
      scroll_milestone: getScrollMilestone(depth),
    });
  }, [trackEngagement]);

  /**
   * A/B Testing functions
   */
  const getTestVariant = useCallback((test: ABTest): ABTestVariant | null => {
    return getABTestVariant(test);
  }, []);

  const trackTestConversion = useCallback((testId: string, variantId: string, conversionType: string) => {
    trackABTestConversion(testId, variantId, conversionType);
  }, []);

  /**
   * Track session start
   */
  const trackSessionStart = useCallback(() => {
    trackEvent({
      event: 'session_start',
      category: 'session',
      action: 'start',
      label: sessionId.current || 'unknown',
      customParameters: {
        session_start_time: Date.now(),
        is_new_user: !localStorage.getItem('analytics_user_id'),
      },
    });
  }, [trackEvent]);

  /**
   * Track session end
   */
  const trackSessionEnd = useCallback((sessionDuration: number) => {
    trackEvent({
      event: 'session_end',
      category: 'session',
      action: 'end',
      label: sessionId.current || 'unknown',
      value: sessionDuration,
      customParameters: {
        session_duration: sessionDuration,
        session_end_time: Date.now(),
      },
    });
  }, [trackEvent]);

  return {
    // Core tracking
    trackEvent,
    trackPageView,
    trackEngagement,
    trackScrollDepth,
    
    // CTA and conversion tracking
    trackCTAClick,
    trackConversionEvent,
    
    // Form tracking
    trackFormEvent,
    trackFormSubmission,
    trackFormStart,
    trackFormFieldCompletion,
    
    // Funnel tracking
    trackFunnelStep,
    
    // Session tracking
    trackSessionStart,
    trackSessionEnd,
    
    // A/B Testing
    getTestVariant,
    trackTestConversion,
    
    // User and session IDs
    getUserId: () => userId.current,
    getSessionId: () => sessionId.current,
  };
};

/**
 * Helper function to get form conversion value
 */
const getFormConversionValue = (formType: string): number => {
  const conversionValues: Record<string, number> = {
    'contact': 10,
    'demo': 25,
    'consultation': 50,
    'newsletter': 5,
    'whitepaper': 15,
  };
  
  return conversionValues[formType] || 1;
};

/**
 * Helper function to get funnel step order
 */
const getFunnelStepOrder = (step: string): number => {
  const stepOrder: Record<string, number> = {
    'landing': 1,
    'services_view': 2,
    'cta_click': 3,
    'form_start': 4,
    'form_submit': 5,
    'conversion': 6,
  };
  
  return stepOrder[step] || 0;
};

/**
 * Helper function to determine engagement quality
 */
const getEngagementQuality = (action: string, duration?: number): string => {
  if (action === 'time_on_page' && duration) {
    if (duration < 10000) return 'low'; // Less than 10 seconds
    if (duration < 60000) return 'medium'; // Less than 1 minute
    return 'high'; // More than 1 minute
  }
  
  if (action === 'scroll' && duration) {
    if (duration < 25) return 'low';
    if (duration < 75) return 'medium';
    return 'high';
  }
  
  return 'medium';
};

/**
 * Helper function to get scroll milestone
 */
const getScrollMilestone = (depth: number): string => {
  if (depth >= 90) return '90%';
  if (depth >= 75) return '75%';
  if (depth >= 50) return '50%';
  if (depth >= 25) return '25%';
  return '0%';
};

