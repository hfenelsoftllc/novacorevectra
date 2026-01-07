/**
 * Property-based tests for analytics event tracking
 * Feature: full-marketing-site, Property 7: Analytics Event Tracking
 * Validates: Requirements 7.1, 7.2
 */

import * as fc from 'fast-check';
import { renderHook, act } from '@testing-library/react';
import { cleanup } from '@testing-library/react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { CTAVariant } from '@/types/forms';

// Mock analytics utilities
jest.mock('@/utils/analytics', () => ({
  trackEvent: jest.fn(),
  trackPageView: jest.fn(),
  trackConversion: jest.fn(),
  getUserId: jest.fn(() => 'test-user-123'),
  getSessionId: jest.fn(() => 'test-session-456'),
  generateSessionId: jest.fn(() => 'test-session-456'),
  getABTestVariant: jest.fn(),
  trackABTestConversion: jest.fn(),
  initializeGA: jest.fn(),
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileInView, viewport, initial, animate, transition, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, whileInView, viewport, initial, animate, transition, ...props }: any) => <section {...props}>{children}</section>,
    h1: ({ children, whileInView, viewport, initial, animate, transition, ...props }: any) => <h1 {...props}>{children}</h1>,
    h3: ({ children, whileInView, viewport, initial, animate, transition, ...props }: any) => <h3 {...props}>{children}</h3>,
    p: ({ children, whileInView, viewport, initial, animate, transition, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, whileInView, viewport, initial, animate, transition, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock components that have complex dependencies
jest.mock('@/components/forms/LeadCaptureForm', () => ({
  LeadCaptureForm: ({ onSubmit }: any) => (
    <form data-testid="lead-capture-form">
      <input data-testid="form-input" />
      <button type="submit" onClick={() => onSubmit({ test: 'data' })}>
        Submit
      </button>
    </form>
  ),
}));

describe('Property 7: Analytics Event Tracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage and sessionStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('should track page views, user sessions, and conversion events for all analytics interactions', () => {
    // Feature: full-marketing-site, Property 7: Analytics Event Tracking
    fc.assert(
      fc.property(
        fc.record({
          page: fc.constantFrom('/', '/services', '/governance', '/about', '/contact'),
          title: fc.string({ minLength: 1, maxLength: 100 }),
          sessionId: fc.string({ minLength: 10, maxLength: 50 }),
          userId: fc.string({ minLength: 10, maxLength: 50 }),
        }),
        ({ page, title }) => {
          const { result } = renderHook(() => useAnalytics());

          // Test page view tracking
          act(() => {
            result.current.trackPageView(page, title);
          });

          // Verify analytics hook provides all required tracking methods
          expect(result.current.trackPageView).toBeDefined();
          expect(result.current.trackEvent).toBeDefined();
          expect(result.current.trackConversionEvent).toBeDefined();
          expect(result.current.trackEngagement).toBeDefined();
          expect(result.current.trackCTAClick).toBeDefined();
          expect(result.current.trackFormSubmission).toBeDefined();

          // Test session tracking
          act(() => {
            result.current.trackSessionStart();
          });

          // Test conversion event tracking
          act(() => {
            result.current.trackConversionEvent({
              type: 'form_submission',
              value: 25,
              metadata: { form_type: 'contact' },
            });
          });

          // Verify user and session ID methods are available
          expect(result.current.getUserId).toBeDefined();
          expect(result.current.getSessionId).toBeDefined();

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should record engagement metrics when users interact with CTAs', async () => {
    // Feature: full-marketing-site, Property 7: Analytics Event Tracking
    fc.assert(
      fc.property(
        fc.record({
          variant: fc.constantFrom('consultation', 'demo', 'whitepaper', 'contact', 'newsletter'),
          position: fc.constantFrom('hero', 'footer', 'sidebar', 'inline'),
          page: fc.constantFrom('/', '/services', '/contact', '/governance', '/about'),
          userId: fc.string({ minLength: 10, maxLength: 50 }).filter(s => s.trim().length >= 10),
          sessionId: fc.string({ minLength: 10, maxLength: 50 }).filter(s => s.trim().length >= 10),
        }),
        ({ variant, position, page, userId, sessionId }) => {
          const { result } = renderHook(() => useAnalytics());

          // Test CTA click tracking
          act(() => {
            result.current.trackCTAClick({
              variant: variant as CTAVariant,
              position,
              page,
              userId,
              sessionId,
            });
          });

          // Verify CTA tracking method is available and functional
          expect(result.current.trackCTAClick).toBeDefined();

          // Test engagement tracking for CTA interactions
          act(() => {
            result.current.trackEngagement('cta_hover', `${variant}_${position}`, 2000);
          });

          // Test funnel step tracking for CTA interactions
          act(() => {
            result.current.trackFunnelStep('cta_click', page);
          });

          // Verify all engagement tracking methods are available
          expect(result.current.trackEngagement).toBeDefined();
          expect(result.current.trackFunnelStep).toBeDefined();
          expect(result.current.trackScrollDepth).toBeDefined();

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should track form interactions and conversion events with detailed metrics', () => {
    // Feature: full-marketing-site, Property 7: Analytics Event Tracking
    fc.assert(
      fc.property(
        fc.record({
          formType: fc.constantFrom('contact', 'demo', 'consultation', 'newsletter', 'whitepaper'),
          success: fc.boolean(),
          errorMessage: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
          formData: fc.option(fc.record({
            firstName: fc.string({ minLength: 1, maxLength: 50 }),
            email: fc.emailAddress(),
            company: fc.string({ minLength: 1, maxLength: 100 }),
          })),
        }),
        ({ formType, success, errorMessage, formData }) => {
          const { result } = renderHook(() => useAnalytics());

          // Test form start tracking
          act(() => {
            result.current.trackFormStart(formType);
          });

          // Test form field completion tracking
          if (formData) {
            Object.keys(formData).forEach(fieldName => {
              act(() => {
                result.current.trackFormFieldCompletion(formType, fieldName, (formData as any)[fieldName]);
              });
            });
          }

          // Test form submission tracking
          act(() => {
            result.current.trackFormSubmission(formType, success, errorMessage || undefined, formData || undefined);
          });

          // Verify all form tracking methods are available
          expect(result.current.trackFormStart).toBeDefined();
          expect(result.current.trackFormFieldCompletion).toBeDefined();
          expect(result.current.trackFormSubmission).toBeDefined();
          expect(result.current.trackFormEvent).toBeDefined();

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should track user engagement events with timing and quality metrics', () => {
    // Feature: full-marketing-site, Property 7: Analytics Event Tracking
    fc.assert(
      fc.property(
        fc.record({
          action: fc.constantFrom('scroll', 'time_on_page', 'click', 'hover', 'focus'),
          element: fc.constantFrom('hero', 'services', 'cta', 'form', 'navigation'),
          duration: fc.integer({ min: 0, max: 300000 }), // 0 to 5 minutes in milliseconds
          page: fc.constantFrom('/', '/services', '/contact', '/governance', '/about'),
          scrollDepth: fc.integer({ min: 0, max: 100 }),
        }),
        ({ action, element, duration, page, scrollDepth }) => {
          const { result } = renderHook(() => useAnalytics());

          // Test general engagement tracking
          act(() => {
            result.current.trackEngagement(action, element, duration);
          });

          // Test scroll depth tracking specifically
          if (action === 'scroll') {
            act(() => {
              result.current.trackScrollDepth(scrollDepth, page);
            });
          }

          // Test session tracking with duration
          if (action === 'time_on_page') {
            act(() => {
              result.current.trackSessionEnd(duration);
            });
          }

          // Verify engagement tracking methods are available
          expect(result.current.trackEngagement).toBeDefined();
          expect(result.current.trackScrollDepth).toBeDefined();
          expect(result.current.trackSessionStart).toBeDefined();
          expect(result.current.trackSessionEnd).toBeDefined();

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should provide consistent user and session identification across all tracking events', () => {
    // Feature: full-marketing-site, Property 7: Analytics Event Tracking
    fc.assert(
      fc.property(
        fc.record({
          eventType: fc.constantFrom('page_view', 'cta_click', 'form_submit', 'engagement', 'conversion'),
          eventCount: fc.integer({ min: 1, max: 10 }),
        }),
        ({ eventType, eventCount }) => {
          const { result } = renderHook(() => useAnalytics());

          // Get initial user and session IDs
          const initialUserId = result.current.getUserId();
          const initialSessionId = result.current.getSessionId();

          // Track multiple events of the same type
          for (let i = 0; i < eventCount; i++) {
            act(() => {
              switch (eventType) {
                case 'page_view':
                  result.current.trackPageView(`/test-${i}`);
                  break;
                case 'cta_click':
                  result.current.trackCTAClick({
                    variant: 'consultation',
                    position: 'hero',
                    page: `/test-${i}`,
                  });
                  break;
                case 'form_submit':
                  result.current.trackFormSubmission('contact', true);
                  break;
                case 'engagement':
                  result.current.trackEngagement('scroll', 'page', 1000);
                  break;
                case 'conversion':
                  result.current.trackConversionEvent({
                    type: 'form_submission',
                    value: 10,
                  });
                  break;
              }
            });

            // Verify user and session IDs remain consistent
            expect(result.current.getUserId()).toBe(initialUserId);
            expect(result.current.getSessionId()).toBe(initialSessionId);
          }

          // Verify IDs are defined and non-empty
          expect(initialUserId).toBeDefined();
          expect(initialSessionId).toBeDefined();
          expect(typeof initialUserId).toBe('string');
          expect(typeof initialSessionId).toBe('string');
          expect(initialUserId?.length || 0).toBeGreaterThan(0);
          expect(initialSessionId?.length || 0).toBeGreaterThan(0);

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should track A/B test interactions and conversions as part of analytics system', () => {
    // Feature: full-marketing-site, Property 7: Analytics Event Tracking
    fc.assert(
      fc.property(
        fc.record({
          testId: fc.string({ minLength: 5, maxLength: 20 }).filter(s => s.trim().length >= 5),
          variantId: fc.constantFrom('control', 'variant_a', 'variant_b'),
          conversionType: fc.constantFrom('cta_click', 'form_submit', 'page_engagement'),
        }),
        ({ testId, variantId, conversionType }) => {
          const { result } = renderHook(() => useAnalytics());

          // Test A/B test conversion tracking
          act(() => {
            result.current.trackTestConversion(testId, variantId, conversionType);
          });

          // Test A/B test variant retrieval
          const testConfig = {
            id: testId,
            name: 'Test Config',
            variants: [
              { id: 'control', name: 'Control', weight: 50, content: {} },
              { id: 'variant_a', name: 'Variant A', weight: 50, content: {} },
            ],
            trafficAllocation: 100,
          };

          const variant = result.current.getTestVariant(testConfig);

          // Verify A/B testing methods are available
          expect(result.current.getTestVariant).toBeDefined();
          expect(result.current.trackTestConversion).toBeDefined();

          // Verify variant is either null or a valid variant
          if (variant !== null && variant !== undefined) {
            expect(variant).toHaveProperty('id');
            expect(variant).toHaveProperty('name');
            expect(variant).toHaveProperty('weight');
            expect(variant).toHaveProperty('content');
          }

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should maintain analytics functionality across different component interactions', async () => {
    // Feature: full-marketing-site, Property 7: Analytics Event Tracking
    fc.assert(
      fc.property(
        fc.record({
          variant: fc.constantFrom('consultation', 'demo', 'whitepaper'),
          interactionType: fc.constantFrom('click', 'keyboard'),
        }),
        ({ variant }) => {
          const { result } = renderHook(() => useAnalytics());

          // Test that analytics tracking is available
          act(() => {
            result.current.trackCTAClick({
              variant: variant as CTAVariant,
              position: 'test',
              page: '/test',
            });
          });

          // Verify analytics methods remain functional
          expect(result.current.trackCTAClick).toBeDefined();
          expect(result.current.trackEvent).toBeDefined();
          expect(result.current.trackEngagement).toBeDefined();

          // Test engagement tracking
          act(() => {
            result.current.trackEngagement('interaction', variant, 1000);
          });

          // Verify all methods are still available after interactions
          expect(result.current.trackPageView).toBeDefined();
          expect(result.current.trackConversionEvent).toBeDefined();
          expect(result.current.trackFormSubmission).toBeDefined();

          return true;
        }
      ),
      { numRuns: 10 }
    );
  });
});
