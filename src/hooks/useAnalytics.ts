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
 * Hook for analytics tracking
 */
export const useAnalytics = () => {
  /**
   * Track generic analytics event
   */
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    // In a real implementation, this would send to Google Analytics, Mixpanel, etc.
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        custom_map: event.customParameters,
      });
    }
    
    // Also log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event);
    }
  }, []);

  /**
   * Track CTA clicks
   */
  const trackCTAClick = useCallback((data: CTATrackingEvent) => {
    trackEvent({
      event: 'cta_click',
      category: 'engagement',
      action: 'cta_click',
      label: `${data.variant}_${data.position}_${data.page}`,
      customParameters: {
        cta_variant: data.variant,
        cta_position: data.position,
        page: data.page,
        user_id: data.userId,
        session_id: data.sessionId,
      },
    });
  }, [trackEvent]);

  /**
   * Track form interactions
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
      },
    });
  }, [trackEvent]);

  /**
   * Track form submission
   */
  const trackFormSubmission = useCallback((formType: string, success: boolean, errorMessage?: string) => {
    trackFormEvent({
      formType,
      step: 'submit',
      success,
      ...(errorMessage && { errorMessage }),
    });
  }, [trackFormEvent]);

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
  const trackFormFieldCompletion = useCallback((formType: string, fieldName: string) => {
    trackFormEvent({
      formType,
      step: 'field_complete',
      success: true,
      formData: { [fieldName]: true },
    });
  }, [trackFormEvent]);

  /**
   * Track page view
   */
  const trackPageView = useCallback((page: string, title?: string) => {
    trackEvent({
      event: 'page_view',
      category: 'navigation',
      action: 'page_view',
      label: page,
      customParameters: {
        page_title: title,
        page_location: typeof window !== 'undefined' ? window.location.href : '',
      },
    });
  }, [trackEvent]);

  /**
   * Track conversion funnel step
   */
  const trackFunnelStep = useCallback((step: string, page: string, userId?: string) => {
    trackEvent({
      event: 'funnel_step',
      category: 'conversion',
      action: 'funnel_progress',
      label: `${step}_${page}`,
      customParameters: {
        funnel_step: step,
        page,
        user_id: userId,
      },
    });
  }, [trackEvent]);

  /**
   * Track user engagement
   */
  const trackEngagement = useCallback((action: string, element: string, duration?: number) => {
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
      },
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackCTAClick,
    trackFormEvent,
    trackFormSubmission,
    trackFormStart,
    trackFormFieldCompletion,
    trackPageView,
    trackFunnelStep,
    trackEngagement,
  };
};

/**
 * Global analytics type declaration for gtag
 */
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
  }
}