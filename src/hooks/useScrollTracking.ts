'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAnalytics } from './useAnalytics';

/**
 * Hook for tracking scroll depth and engagement
 */
export const useScrollTracking = (page?: string) => {
  const { trackScrollDepth, trackEngagement } = useAnalytics();
  const scrollDepthRef = useRef<Set<number>>(new Set());
  const pageStartTime = useRef<number>(Date.now());
  const lastScrollTime = useRef<number>(Date.now());

  /**
   * Calculate scroll depth percentage
   */
  const calculateScrollDepth = useCallback((): number => {
    if (typeof window === 'undefined') return 0;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    if (documentHeight <= 0) return 100;
    
    return Math.round((scrollTop / documentHeight) * 100);
  }, []);

  /**
   * Handle scroll events
   */
  const handleScroll = useCallback(() => {
    const currentTime = Date.now();
    const scrollDepth = calculateScrollDepth();
    const currentPage = page || (typeof window !== 'undefined' ? window.location.pathname : '');

    // Track scroll milestones (25%, 50%, 75%, 90%, 100%)
    const milestones = [25, 50, 75, 90, 100];
    milestones.forEach(milestone => {
      if (scrollDepth >= milestone && !scrollDepthRef.current.has(milestone)) {
        scrollDepthRef.current.add(milestone);
        trackScrollDepth(milestone, currentPage);
      }
    });

    // Track scroll engagement (time between scrolls)
    const timeSinceLastScroll = currentTime - lastScrollTime.current;
    if (timeSinceLastScroll > 1000) { // Only track if more than 1 second since last scroll
      trackEngagement('scroll_pause', currentPage, timeSinceLastScroll, {
        scroll_depth: scrollDepth,
        pause_duration: timeSinceLastScroll,
      });
    }

    lastScrollTime.current = currentTime;
  }, [calculateScrollDepth, trackScrollDepth, trackEngagement, page]);

  /**
   * Track reading time when user stops scrolling
   */
  const trackReadingTime = useCallback(() => {
    const currentTime = Date.now();
    const readingTime = currentTime - pageStartTime.current;
    const currentPage = page || (typeof window !== 'undefined' ? window.location.pathname : '');
    const scrollDepth = calculateScrollDepth();

    trackEngagement('reading_time', currentPage, readingTime, {
      total_reading_time: readingTime,
      final_scroll_depth: scrollDepth,
      engagement_quality: readingTime > 30000 ? 'high' : readingTime > 10000 ? 'medium' : 'low',
    });
  }, [trackEngagement, calculateScrollDepth, page]);

  // Set up scroll tracking
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let scrollTimeout: NodeJS.Timeout;

    const throttledHandleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 100); // Throttle to every 100ms
    };

    // Track initial page load
    pageStartTime.current = Date.now();
    scrollDepthRef.current.clear();

    // Add scroll listener
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    // Track reading time on page unload
    const handleBeforeUnload = () => {
      trackReadingTime();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', throttledHandleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Track final reading time
      trackReadingTime();
    };
  }, [handleScroll, trackReadingTime]);

  /**
   * Reset tracking for new page
   */
  const resetTracking = useCallback(() => {
    pageStartTime.current = Date.now();
    lastScrollTime.current = Date.now();
    scrollDepthRef.current.clear();
  }, []);

  /**
   * Get current scroll depth
   */
  const getCurrentScrollDepth = useCallback((): number => {
    return calculateScrollDepth();
  }, [calculateScrollDepth]);

  /**
   * Get tracked milestones
   */
  const getTrackedMilestones = useCallback((): number[] => {
    return Array.from(scrollDepthRef.current);
  }, []);

  return {
    getCurrentScrollDepth,
    getTrackedMilestones,
    resetTracking,
  };
};