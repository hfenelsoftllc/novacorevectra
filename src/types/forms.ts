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
 * Interface for form validation results
 */
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}