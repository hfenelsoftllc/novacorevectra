import { ProgressiveProfilingData } from '@/types';

/**
 * Key for storing visitor data in localStorage
 */
const VISITOR_DATA_KEY = 'leadCaptureVisitorData';
const VISIT_COUNT_KEY = 'leadCaptureVisitCount';
const LAST_VISIT_KEY = 'leadCaptureLastVisit';

/**
 * Interface for visitor tracking data
 */
interface VisitorData {
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  industry?: string;
  jobTitle?: string;
  visitCount: number;
  lastVisit: string;
  progressiveData?: ProgressiveProfilingData;
}

/**
 * Check if visitor is returning based on localStorage data
 */
export const isReturningVisitor = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const visitCount = localStorage.getItem(VISIT_COUNT_KEY);
  return visitCount ? parseInt(visitCount, 10) > 1 : false;
};

/**
 * Get stored visitor data
 */
export const getVisitorData = (): Partial<VisitorData> | null => {
  if (typeof window === 'undefined') return null;
  
  const data = localStorage.getItem(VISITOR_DATA_KEY);
  return data ? JSON.parse(data) : null;
};

/**
 * Save visitor data for progressive profiling
 */
export const saveVisitorData = (data: Partial<VisitorData>): void => {
  if (typeof window === 'undefined') return;
  
  const existingData = getVisitorData() || {};
  const updatedData = {
    ...existingData,
    ...data,
    lastVisit: new Date().toISOString(),
  };
  
  localStorage.setItem(VISITOR_DATA_KEY, JSON.stringify(updatedData));
};

/**
 * Track visitor visit
 */
export const trackVisit = (): void => {
  if (typeof window === 'undefined') return;
  
  const currentCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10);
  const newCount = currentCount + 1;
  
  localStorage.setItem(VISIT_COUNT_KEY, newCount.toString());
  localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString());
};

/**
 * Get visit count
 */
export const getVisitCount = (): number => {
  if (typeof window === 'undefined') return 0;
  
  return parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10);
};

/**
 * Get fields to show based on visit count and existing data
 */
export const getProgressiveFields = (visitCount: number, existingData?: Partial<VisitorData> | null): string[] => {
  const fields: string[] = [];
  
  // Always show basic fields on first visit
  if (visitCount === 1) {
    return ['firstName', 'lastName', 'email', 'company'];
  }
  
  // Second visit - add industry and job title if not already captured
  if (visitCount === 2) {
    if (!existingData?.industry) fields.push('industry');
    if (!existingData?.jobTitle) fields.push('jobTitle');
  }
  
  // Third visit and beyond - add progressive profiling fields
  if (visitCount >= 3) {
    fields.push('budget', 'timeline', 'companySize', 'currentChallenges');
  }
  
  return fields;
};

/**
 * Determine which form variant to show based on visitor behavior
 */
export const getRecommendedFormVariant = (visitCount: number, pageContext?: string): 'consultation' | 'demo' | 'whitepaper' | 'contact' => {
  // First-time visitors on services page - suggest demo
  if (visitCount === 1 && pageContext === 'services') {
    return 'demo';
  }
  
  // Returning visitors who haven't converted - suggest consultation
  if (visitCount >= 2) {
    return 'consultation';
  }
  
  // Visitors on governance/compliance pages - suggest whitepaper
  if (pageContext === 'governance' || pageContext === 'compliance') {
    return 'whitepaper';
  }
  
  // Default to consultation
  return 'consultation';
};

/**
 * Clear visitor data (for testing or privacy compliance)
 */
export const clearVisitorData = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(VISITOR_DATA_KEY);
  localStorage.removeItem(VISIT_COUNT_KEY);
  localStorage.removeItem(LAST_VISIT_KEY);
};

/**
 * Get time since last visit in days
 */
export const getDaysSinceLastVisit = (): number => {
  if (typeof window === 'undefined') return 0;
  
  const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
  if (!lastVisit) return 0;
  
  const lastVisitDate = new Date(lastVisit);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastVisitDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};