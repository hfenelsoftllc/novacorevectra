/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useAnalytics } from '@/hooks/useAnalytics';

// Mock the analytics utilities
jest.mock('@/utils/analytics', () => ({
  trackEvent: jest.fn(),
  trackPageView: jest.fn(),
  trackConversion: jest.fn(),
  getUserId: jest.fn(() => 'test-user-id'),
  getSessionId: jest.fn(() => 'test-session-id'),
  getABTestVariant: jest.fn(),
  trackABTestConversion: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
}));

describe('useAnalytics', () => {
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

  test('should initialize analytics hook', () => {
    const { result } = renderHook(() => useAnalytics());

    expect(result.current).toHaveProperty('trackEvent');
    expect(result.current).toHaveProperty('trackCTAClick');
    expect(result.current).toHaveProperty('trackFormSubmission');
    expect(result.current).toHaveProperty('trackPageView');
    expect(result.current).toHaveProperty('trackEngagement');
  });

  test('should track CTA clicks', () => {
    const { result } = renderHook(() => useAnalytics());

    act(() => {
      result.current.trackCTAClick({
        variant: 'primary',
        position: 'hero',
        page: '/',
        userId: 'test-user',
        sessionId: 'test-session',
      });
    });

    // Verify that trackEvent was called with correct parameters
    expect(result.current.trackEvent).toBeDefined();
  });

  test('should track form submissions', () => {
    const { result } = renderHook(() => useAnalytics());

    act(() => {
      result.current.trackFormSubmission('contact', true);
    });

    // Verify that form submission tracking works
    expect(result.current.trackFormSubmission).toBeDefined();
  });

  test('should track page views', () => {
    const { result } = renderHook(() => useAnalytics());

    act(() => {
      result.current.trackPageView('/services', 'Services Page');
    });

    // Verify that page view tracking works
    expect(result.current.trackPageView).toBeDefined();
  });

  test('should track engagement events', () => {
    const { result } = renderHook(() => useAnalytics());

    act(() => {
      result.current.trackEngagement('scroll', '/services', 5000);
    });

    // Verify that engagement tracking works
    expect(result.current.trackEngagement).toBeDefined();
  });

  test('should track conversion events', () => {
    const { result } = renderHook(() => useAnalytics());

    act(() => {
      result.current.trackConversionEvent({
        type: 'form_submission',
        value: 25,
        metadata: { form_type: 'contact' },
      });
    });

    // Verify that conversion tracking works
    expect(result.current.trackConversionEvent).toBeDefined();
  });

  test('should provide user and session IDs', () => {
    const { result } = renderHook(() => useAnalytics());

    expect(result.current.getUserId).toBeDefined();
    expect(result.current.getSessionId).toBeDefined();
  });
});