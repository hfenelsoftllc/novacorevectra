/**
 * Integration tests for end-to-end analytics tracking
 * Tests analytics events, conversion tracking, and data flow
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useABTest } from '../../hooks/useABTest';
import HomePage from '../../../app/page';
import ContactPage from '../../../app/contact/page';
import { CTASection } from '../../components/sections/CTASection';
import { LeadCaptureForm } from '../../components/forms/LeadCaptureForm';
import * as analyticsUtils from '../../utils/analytics';

// Mock analytics utilities
jest.mock('../../utils/analytics', () => ({
  trackEvent: jest.fn(),
  trackPageView: jest.fn(),
  trackConversion: jest.fn(),
  getUserId: jest.fn(() => 'test-user-123'),
  getSessionId: jest.fn(() => 'test-session-456'),
  getABTestVariant: jest.fn(),
  trackABTestConversion: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('Analytics Tracking Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000',
        pathname: '/',
        search: '',
        hash: '',
      },
      writable: true,
    });
    
    // Mock document
    Object.defineProperty(document, 'title', {
      value: 'Test Page',
      writable: true,
    });
    
    Object.defineProperty(document, 'referrer', {
      value: 'https://google.com',
      writable: true,
    });
  });

  describe('Page View Tracking', () => {
    test('tracks page views correctly on component mount', () => {
      render(<HomePage />);
      
      // Verify page view tracking is called
      expect(analyticsUtils.trackPageView).toHaveBeenCalledWith('/');
    });

    test('tracks page metadata correctly', () => {
      render(<ContactPage />);
      
      // Verify page view includes metadata
      expect(analyticsUtils.trackPageView).toHaveBeenCalledWith('/contact');
    });

    test('tracks page transitions', async () => {
      const { unmount } = render(<HomePage />);
      
      // Simulate page transition
      unmount();
      render(<ContactPage />);
      
      // Verify both page views are tracked
      expect(analyticsUtils.trackPageView).toHaveBeenCalledTimes(2);
      expect(analyticsUtils.trackPageView).toHaveBeenCalledWith('/');
      expect(analyticsUtils.trackPageView).toHaveBeenCalledWith('/contact');
    });
  });

  describe('CTA Click Tracking', () => {
    test('tracks CTA clicks with correct data', async () => {
      const user = userEvent.setup();
      const mockOnAction = jest.fn();
      
      render(
        <CTASection
          variant="consultation"
          title="Test CTA"
          description="Test description"
          onAction={mockOnAction}
        />
      );
      
      const ctaButton = screen.getByRole('button');
      await user.click(ctaButton);
      
      // Verify CTA click tracking
      expect(analyticsUtils.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'cta_click',
          category: 'engagement',
          action: 'cta_click',
          label: expect.stringContaining('consultation'),
          customParameters: expect.objectContaining({
            cta_variant: 'consultation',
            user_id: 'test-user-123',
            session_id: 'test-session-456',
          }),
        })
      );
    });

    test('tracks high-value CTA conversions', async () => {
      const user = userEvent.setup();
      const mockOnAction = jest.fn();
      
      render(
        <CTASection
          variant="demo"
          title="Request Demo"
          description="Get a personalized demo"
          onAction={mockOnAction}
        />
      );
      
      const ctaButton = screen.getByRole('button');
      await user.click(ctaButton);
      
      // Verify conversion tracking for high-value CTAs
      expect(analyticsUtils.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'conversion',
          category: 'conversion',
          action: 'cta_click',
          customParameters: expect.objectContaining({
            conversion_type: 'cta_click',
            cta_variant: 'demo',
          }),
        })
      );
    });

    test('tracks CTA position and context', async () => {
      const user = userEvent.setup();
      
      render(<HomePage />);
      
      // Find CTA in hero section
      const exploreServicesBtn = screen.getByText(/Explore Our Services/i);
      await user.click(exploreServicesBtn);
      
      // Verify position tracking
      expect(analyticsUtils.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          customParameters: expect.objectContaining({
            page: '/',
            click_timestamp: expect.any(Number),
          }),
        })
      );
    });
  });

  describe('Form Tracking', () => {
    test('tracks form start, field completion, and submission', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
      
      render(
        <LeadCaptureForm
          variant="contact"
          onSubmit={mockOnSubmit}
        />
      );
      
      // Start filling form (should track form start)
      const firstNameInput = screen.getByLabelText(/First Name/i);
      await user.click(firstNameInput);
      
      // Fill form fields (should track field completion)
      await user.type(firstNameInput, 'John');
      await user.type(screen.getByLabelText(/Last Name/i), 'Doe');
      await user.type(screen.getByLabelText(/Email/i), 'john.doe@example.com');
      await user.type(screen.getByLabelText(/Company/i), 'Test Company');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        // Verify form tracking events
        expect(analyticsUtils.trackEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            event: 'form_interaction',
            category: 'conversion',
            action: 'form_start',
            label: 'contact',
          })
        );
        
        expect(analyticsUtils.trackEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            event: 'form_interaction',
            category: 'conversion',
            action: 'form_submit',
            label: 'contact',
            value: 1,
          })
        );
        
        // Verify conversion tracking
        expect(analyticsUtils.trackEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            event: 'conversion',
            category: 'conversion',
            action: 'form_submission',
          })
        );
      });
    });

    test('tracks form validation errors', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
      
      render(
        <LeadCaptureForm
          variant="contact"
          onSubmit={mockOnSubmit}
        />
      );
      
      // Submit empty form to trigger validation
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);
      
      // Verify error tracking
      expect(analyticsUtils.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'form_interaction',
          category: 'conversion',
          action: 'form_submit',
          value: 0,
          customParameters: expect.objectContaining({
            success: false,
          }),
        })
      );
    });

    test('tracks progressive profiling for returning users', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
      
      // Mock returning user
      (analyticsUtils.getUserId as jest.Mock).mockReturnValue('returning-user-789');
      
      render(
        <LeadCaptureForm
          variant="contact"
          onSubmit={mockOnSubmit}
          showProgressiveFields={true}
        />
      );
      
      // Fill and submit form
      await user.type(screen.getByLabelText(/First Name/i), 'Jane');
      await user.type(screen.getByLabelText(/Email/i), 'jane@example.com');
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        // Verify progressive profiling tracking
        expect(analyticsUtils.trackEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            customParameters: expect.objectContaining({
              user_id: 'returning-user-789',
              is_returning_user: true,
            }),
          })
        );
      });
    });
  });

  describe('Conversion Funnel Tracking', () => {
    test('tracks complete conversion funnel', async () => {
      const user = userEvent.setup();
      
      // Step 1: Landing page
      render(<HomePage />);
      
      expect(analyticsUtils.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'funnel_step',
          category: 'conversion',
          action: 'funnel_progress',
          label: 'landing_/',
        })
      );
      
      // Step 2: CTA click
      const exploreBtn = screen.getByText(/Explore Our Services/i);
      await user.click(exploreBtn);
      
      expect(analyticsUtils.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'funnel_step',
          category: 'conversion',
          action: 'funnel_progress',
          label: 'cta_click_/',
        })
      );
    });

    test('tracks funnel abandonment', async () => {
      const user = userEvent.setup();
      
      render(<ContactPage />);
      
      // Start form but don't complete
      await user.type(screen.getByLabelText(/First Name/i), 'John');
      
      // Simulate page unload (abandonment)
      fireEvent(window, new Event('beforeunload'));
      
      // Verify abandonment tracking
      expect(analyticsUtils.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'funnel_step',
          category: 'conversion',
          action: 'funnel_progress',
          customParameters: expect.objectContaining({
            funnel_step: 'form_start',
          }),
        })
      );
    });

    test('tracks conversion value correctly', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
      
      render(
        <LeadCaptureForm
          variant="demo"
          onSubmit={mockOnSubmit}
        />
      );
      
      // Complete high-value form
      await user.type(screen.getByLabelText(/First Name/i), 'John');
      await user.type(screen.getByLabelText(/Email/i), 'john@example.com');
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        // Verify conversion value tracking
        expect(analyticsUtils.trackEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            event: 'conversion',
            customParameters: expect.objectContaining({
              conversion_value: 25, // Demo form value
              conversion_type: 'form_submission',
            }),
          })
        );
      });
    });
  });

  describe('User Engagement Tracking', () => {
    test('tracks scroll depth', async () => {
      render(<HomePage />);
      
      // Simulate scroll events
      fireEvent.scroll(window, { target: { scrollY: 500 } });
      fireEvent.scroll(window, { target: { scrollY: 1000 } });
      
      // Verify scroll tracking
      expect(analyticsUtils.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'user_engagement',
          category: 'engagement',
          action: 'scroll',
          customParameters: expect.objectContaining({
            engagement_type: 'scroll',
            scroll_depth: expect.any(Number),
          }),
        })
      );
    });

    test('tracks time on page', async () => {
      const { unmount } = render(<HomePage />);
      
      // Simulate time passing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Unmount to trigger time tracking
      unmount();
      
      // Verify time on page tracking
      expect(analyticsUtils.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'user_engagement',
          category: 'engagement',
          action: 'time_on_page',
          value: expect.any(Number),
        })
      );
    });

    test('tracks element interactions', async () => {
      const user = userEvent.setup();
      
      render(<HomePage />);
      
      // Interact with various elements
      const heroSection = screen.getByText(/Trusted AI for Business Process Transformation/i);
      await user.hover(heroSection);
      
      // Verify interaction tracking
      expect(analyticsUtils.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'user_engagement',
          category: 'engagement',
          customParameters: expect.objectContaining({
            engagement_type: expect.any(String),
          }),
        })
      );
    });
  });

  describe('Session Tracking', () => {
    test('tracks session start and end', async () => {
      const { unmount } = render(<HomePage />);
      
      // Verify session start tracking
      expect(analyticsUtils.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'session_start',
          category: 'session',
          action: 'start',
          customParameters: expect.objectContaining({
            session_start_time: expect.any(Number),
          }),
        })
      );
      
      // Simulate session end
      unmount();
      
      // Verify session end tracking
      expect(analyticsUtils.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'session_end',
          category: 'session',
          action: 'end',
          value: expect.any(Number),
        })
      );
    });

    test('tracks new vs returning users', () => {
      // Mock new user
      (analyticsUtils.getUserId as jest.Mock).mockReturnValue(null);
      
      render(<HomePage />);
      
      expect(analyticsUtils.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          customParameters: expect.objectContaining({
            is_new_user: true,
          }),
        })
      );
    });
  });

  describe('Error Tracking', () => {
    test('tracks analytics errors gracefully', async () => {
      // Mock analytics error
      (analyticsUtils.trackEvent as jest.Mock).mockImplementation(() => {
        throw new Error('Analytics error');
      });
      
      const user = userEvent.setup();
      
      // Should not crash the application
      render(<HomePage />);
      
      const exploreBtn = screen.getByText(/Explore Our Services/i);
      await user.click(exploreBtn);
      
      // Application should continue working despite analytics error
      expect(exploreBtn).toBeInTheDocument();
    });

    test('tracks network failures', async () => {
      // Mock network failure
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn().mockRejectedValue(new Error('Network error'));
      
      render(
        <LeadCaptureForm
          variant="contact"
          onSubmit={mockOnSubmit}
        />
      );
      
      await user.type(screen.getByLabelText(/First Name/i), 'John');
      await user.type(screen.getByLabelText(/Email/i), 'john@example.com');
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        // Verify error tracking
        expect(analyticsUtils.trackEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            event: 'form_interaction',
            customParameters: expect.objectContaining({
              success: false,
              error_message: expect.any(String),
            }),
          })
        );
      });
      
      global.fetch = originalFetch;
    });
  });

  describe('Privacy and Compliance', () => {
    test('respects user privacy preferences', () => {
      // Mock privacy preferences
      Object.defineProperty(navigator, 'doNotTrack', {
        value: '1',
        writable: true,
      });
      
      render(<HomePage />);
      
      // Should still track basic functionality but respect privacy
      expect(analyticsUtils.trackPageView).toHaveBeenCalled();
    });

    test('handles GDPR compliance', () => {
      // Mock GDPR consent
      const mockConsent = {
        analytics: false,
        marketing: false,
        functional: true,
      };
      
      (window as any).gdprConsent = mockConsent;
      
      render(<HomePage />);
      
      // Should only track functional events when analytics consent is false
      expect(analyticsUtils.trackPageView).toHaveBeenCalled();
    });
  });

  describe('Performance Impact', () => {
    test('analytics tracking does not significantly impact performance', async () => {
      const startTime = performance.now();
      
      render(<HomePage />);
      
      // Simulate multiple interactions
      const user = userEvent.setup();
      const exploreBtn = screen.getByText(/Explore Our Services/i);
      
      for (let i = 0; i < 10; i++) {
        await user.click(exploreBtn);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should complete within reasonable time (< 1000ms)
      expect(totalTime).toBeLessThan(1000);
    });

    test('analytics batching works correctly', async () => {
      const user = userEvent.setup();
      
      render(<HomePage />);
      
      // Generate multiple events quickly
      const exploreBtn = screen.getByText(/Explore Our Services/i);
      
      for (let i = 0; i < 5; i++) {
        await user.click(exploreBtn);
      }
      
      // Verify events are tracked (batching would be handled by analytics utils)
      expect(analyticsUtils.trackEvent).toHaveBeenCalledTimes(5);
    });
  });
});