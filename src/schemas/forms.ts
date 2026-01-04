import { z } from 'zod';

/**
 * Base contact information schema
 */
export const baseContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
});

/**
 * Lead capture form schema with all fields
 */
export const leadCaptureSchema = baseContactSchema.extend({
  company: z.string().min(1, 'Company name is required').max(100, 'Company name must be less than 100 characters'),
  jobTitle: z.string().min(1, 'Job title is required').max(100, 'Job title must be less than 100 characters'),
  industry: z.string().min(1, 'Please select an industry'),
  projectType: z.string().min(1, 'Please select a project type'),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  message: z.string().max(1000, 'Message must be less than 1000 characters').optional(),
});

/**
 * Contact form schema
 */
export const contactFormSchema = baseContactSchema.extend({
  company: z.string().min(1, 'Company name is required').max(100, 'Company name must be less than 100 characters'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must be less than 1000 characters'),
});

/**
 * Newsletter subscription schema
 */
export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  interests: z.array(z.string()).optional(),
  frequency: z.enum(['weekly', 'monthly', 'quarterly']).optional(),
});

/**
 * Progressive profiling schema for returning visitors
 */
export const progressiveProfilingSchema = z.object({
  companySize: z.string().optional(),
  currentChallenges: z.array(z.string()).optional(),
  previousExperience: z.string().optional(),
  referralSource: z.string().optional(),
});

// Type exports
export type LeadCaptureFormData = z.infer<typeof leadCaptureSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type NewsletterFormData = z.infer<typeof newsletterSchema>;
export type ProgressiveProfilingData = z.infer<typeof progressiveProfilingSchema>;