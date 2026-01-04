'use client';

import { useState, useEffect, useCallback } from 'react';
import { getABTestVariant, ABTest, ABTestVariant } from '@/utils/analytics';
import { useAnalytics } from './useAnalytics';

/**
 * Hook for A/B testing functionality
 */
export const useABTest = (test: ABTest) => {
  const [variant, setVariant] = useState<ABTestVariant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { trackTestConversion } = useAnalytics();

  // Get variant assignment on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const assignedVariant = getABTestVariant(test);
      setVariant(assignedVariant);
      setIsLoading(false);
    }
  }, [test]);

  /**
   * Track conversion for this A/B test
   */
  const trackConversion = useCallback((conversionType: string) => {
    if (variant) {
      trackTestConversion(test.id, variant.id, conversionType);
    }
  }, [variant, test.id, trackTestConversion]);

  /**
   * Get content for current variant or fallback to control
   */
  const getContent = useCallback(<T = any>(fallback?: T): T => {
    if (variant) {
      return variant.content as T;
    }
    
    // Fallback to control variant or provided fallback
    const controlVariant = test.variants.find(v => v.id === 'control');
    if (controlVariant) {
      return controlVariant.content as T;
    }
    
    return fallback || test.variants[0]?.content as T;
  }, [variant, test.variants]);

  /**
   * Check if user is in the test
   */
  const isInTest = variant !== null;

  /**
   * Get variant ID
   */
  const getVariantId = () => variant?.id || null;

  /**
   * Get variant name
   */
  const getVariantName = () => variant?.name || null;

  return {
    variant,
    isLoading,
    isInTest,
    getContent,
    getVariantId,
    getVariantName,
    trackConversion,
  };
};

/**
 * Hook for multiple A/B tests
 */
export const useMultipleABTests = (tests: Record<string, ABTest>) => {
  const [variants, setVariants] = useState<Record<string, ABTestVariant | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { trackTestConversion } = useAnalytics();

  // Get variant assignments on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const assignedVariants: Record<string, ABTestVariant | null> = {};
      
      Object.entries(tests).forEach(([key, test]) => {
        assignedVariants[key] = getABTestVariant(test);
      });
      
      setVariants(assignedVariants);
      setIsLoading(false);
    }
  }, [tests]);

  /**
   * Track conversion for a specific test
   */
  const trackConversion = useCallback((testKey: string, conversionType: string) => {
    const variant = variants[testKey];
    const test = tests[testKey];
    
    if (variant && test) {
      trackTestConversion(test.id, variant.id, conversionType);
    }
  }, [variants, tests, trackTestConversion]);

  /**
   * Get content for a specific test variant
   */
  const getContent = useCallback(<T = any>(testKey: string, fallback?: T): T => {
    const variant = variants[testKey];
    const test = tests[testKey];
    
    if (variant) {
      return variant.content as T;
    }
    
    // Fallback to control variant or provided fallback
    if (test) {
      const controlVariant = test.variants.find(v => v.id === 'control');
      if (controlVariant) {
        return controlVariant.content as T;
      }
      
      return fallback || test.variants[0]?.content as T;
    }
    
    return fallback as T;
  }, [variants, tests]);

  /**
   * Check if user is in a specific test
   */
  const isInTest = useCallback((testKey: string): boolean => {
    return variants[testKey] !== null;
  }, [variants]);

  /**
   * Get variant ID for a specific test
   */
  const getVariantId = useCallback((testKey: string): string | null => {
    return variants[testKey]?.id || null;
  }, [variants]);

  /**
   * Get variant name for a specific test
   */
  const getVariantName = useCallback((testKey: string): string | null => {
    return variants[testKey]?.name || null;
  }, [variants]);

  /**
   * Get all active tests (where user is assigned to a variant)
   */
  const getActiveTests = useCallback((): string[] => {
    return Object.keys(variants).filter(key => variants[key] !== null);
  }, [variants]);

  return {
    variants,
    isLoading,
    getContent,
    isInTest,
    getVariantId,
    getVariantName,
    getActiveTests,
    trackConversion,
  };
};