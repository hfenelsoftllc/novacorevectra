/**
 * Interface for lead capture form data
 */
export interface LeadCaptureData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle: string;
  industry: string;
  projectType: string;
  budget?: string;
  timeline?: string;
  message?: string;
}

/**
 * Interface for contact form data
 */
export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  subject: string;
  message: string;
}

/**
 * Interface for newsletter form data
 */
export interface NewsletterFormData {
  email: string;
  firstName: string;
  interests?: string[];
  frequency?: 'weekly' | 'monthly' | 'quarterly';
}

/**
 * Interface for progressive profiling data
 */
export interface ProgressiveProfilingData {
  companySize?: string;
  currentChallenges?: string[];
  previousExperience?: string;
  referralSource?: string;
}

/**
 * Interface for form validation results
 */
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * CTA variant types
 */
export type CTAVariant = 'consultation' | 'demo' | 'whitepaper' | 'contact' | 'newsletter';

/**
 * Form variant types
 */
export type FormVariant = 'contact' | 'demo' | 'consultation' | 'newsletter' | 'lead-capture';

/**
 * Interface for CTA section props with variants
 */
export interface CTASectionVariantProps {
  variant: CTAVariant;
  title?: string;
  description?: string;
  buttonText?: string;
  onAction?: () => void;
  showLeadCapture?: boolean;
  className?: string;
}