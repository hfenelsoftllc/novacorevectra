'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { 
  leadCaptureSchema, 
  contactFormSchema, 
  newsletterSchema,
  type LeadCaptureFormData,
  type ContactFormData,
  type NewsletterFormData 
} from '@/schemas/forms';
import { FormVariant } from '@/types';
import { cn } from '@/utils';
import { 
  isReturningVisitor, 
  getVisitorData, 
  saveVisitorData, 
  getVisitCount,
  getProgressiveFields 
} from '@/utils/progressiveProfiling';
import { useAnalytics } from '@/hooks';

/**
 * Props for LeadCaptureForm component
 */
interface LeadCaptureFormProps {
  variant: FormVariant;
  onSubmit: (data: LeadCaptureFormData | ContactFormData | NewsletterFormData) => Promise<void>;
  showProgressiveFields?: boolean;
  className?: string;
  existingData?: Partial<LeadCaptureFormData>;
}

/**
 * Industry options for the form
 */
const INDUSTRY_OPTIONS = [
  { value: 'airlines', label: 'Airlines' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'financial', label: 'Financial Services' },
  { value: 'public-sector', label: 'Public Sector' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'technology', label: 'Technology' },
  { value: 'retail', label: 'Retail' },
  { value: 'other', label: 'Other' },
];

/**
 * Project type options
 */
const PROJECT_TYPE_OPTIONS = [
  { value: 'ai-strategy', label: 'AI Strategy & Planning' },
  { value: 'ai-implementation', label: 'AI Implementation' },
  { value: 'ai-governance', label: 'AI Governance' },
  { value: 'risk-assessment', label: 'Risk Assessment' },
  { value: 'compliance', label: 'Compliance & Auditing' },
  { value: 'training', label: 'Training & Development' },
  { value: 'other', label: 'Other' },
];

/**
 * Budget options
 */
const BUDGET_OPTIONS = [
  { value: 'under-50k', label: 'Under $50,000' },
  { value: '50k-100k', label: '$50,000 - $100,000' },
  { value: '100k-250k', label: '$100,000 - $250,000' },
  { value: '250k-500k', label: '$250,000 - $500,000' },
  { value: 'over-500k', label: 'Over $500,000' },
  { value: 'not-sure', label: 'Not sure yet' },
];

/**
 * Timeline options
 */
const TIMELINE_OPTIONS = [
  { value: 'immediate', label: 'Immediate (within 1 month)' },
  { value: '1-3-months', label: '1-3 months' },
  { value: '3-6-months', label: '3-6 months' },
  { value: '6-12-months', label: '6-12 months' },
  { value: 'over-12-months', label: 'Over 12 months' },
  { value: 'exploring', label: 'Just exploring options' },
];

/**
 * Newsletter interest options
 */
const NEWSLETTER_INTERESTS = [
  { value: 'ai-governance', label: 'AI Governance' },
  { value: 'industry-trends', label: 'Industry Trends' },
  { value: 'case-studies', label: 'Case Studies' },
  { value: 'best-practices', label: 'Best Practices' },
  { value: 'regulatory-updates', label: 'Regulatory Updates' },
];

/**
 * LeadCaptureForm component with validation and progressive profiling
 */
export const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({
  variant,
  onSubmit,
  showProgressiveFields = false,
  className,
  existingData,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [returningVisitor, setReturningVisitor] = React.useState(false);
  const [visitCount, setVisitCount] = React.useState(1);
  const [progressiveFieldsToShow, setProgressiveFieldsToShow] = React.useState<string[]>([]);
  
  const { trackFormStart, trackFormSubmission, trackFormFieldCompletion } = useAnalytics();

  // Determine schema based on variant
  const getSchema = () => {
    switch (variant) {
      case 'contact':
        return contactFormSchema;
      case 'newsletter':
        return newsletterSchema;
      default:
        return leadCaptureSchema;
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<any>({
    resolver: zodResolver(getSchema()),
    defaultValues: existingData,
  });

  // Initialize progressive profiling - use useMemo to prevent re-computation
  const { initialReturningVisitor, initialVisitCount, initialProgressiveFields } = React.useMemo(() => {
    const currentVisitCount = getVisitCount();
    const isReturning = isReturningVisitor();
    const visitorData = getVisitorData();
    
    const fieldsToShow = showProgressiveFields 
      ? getProgressiveFields(currentVisitCount, visitorData)
      : [];
    
    return {
      initialReturningVisitor: isReturning,
      initialVisitCount: currentVisitCount,
      initialProgressiveFields: fieldsToShow,
    };
  }, [showProgressiveFields]);

  // Set initial state only once
  React.useEffect(() => {
    setReturningVisitor(initialReturningVisitor);
    setVisitCount(initialVisitCount);
    setProgressiveFieldsToShow(initialProgressiveFields);
    
    // Pre-fill existing data if available
    if (showProgressiveFields) {
      const visitorData = getVisitorData();
      if (visitorData) {
        Object.entries(visitorData).forEach(([key, value]) => {
          if (value && key !== 'visitCount' && key !== 'lastVisit') {
            setValue(key as any, value);
          }
        });
      }
    }
    
    // Track form start only once
    trackFormStart(variant);
  }, []); // Empty dependency array to run only once

  const onFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      
      // Save data for progressive profiling
      if (variant !== 'newsletter') {
        saveVisitorData({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          company: data.company,
          industry: data.industry,
          jobTitle: data.jobTitle,
          visitCount: visitCount + 1,
        });
      }
      
      // Track successful submission
      trackFormSubmission(variant, true);
    } catch (error) {
      console.error('Form submission error:', error);
      trackFormSubmission(variant, false, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldComplete = (fieldName: string) => {
    trackFormFieldCompletion(variant, fieldName);
  };

  const shouldShowField = (fieldName: string): boolean => {
    if (!showProgressiveFields) return true;
    if (variant === 'newsletter') return true;
    
    // Always show basic fields
    const basicFields = ['firstName', 'lastName', 'email', 'company', 'industry', 'projectType', 'jobTitle'];
    if (basicFields.includes(fieldName)) return true;
    
    // Show progressive fields based on visit count
    return progressiveFieldsToShow.includes(fieldName);
  };

  const renderField = (
    name: string,
    label: string,
    type: string = 'text',
    options?: { value: string; label: string }[],
    required: boolean = true
  ) => {
    if (!shouldShowField(name)) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='space-y-2'
      >
        <label htmlFor={name} className='block text-sm font-medium text-gray-700'>
          {label} {required && <span className='text-red-500'>*</span>}
        </label>
        
        {type === 'select' && options ? (
          <select
            id={name}
            {...register(name as any)}
            onBlur={() => handleFieldComplete(name)}
            className={cn(
              'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              errors[name] && 'border-red-500'
            )}
          >
            <option value=''>Select {label.toLowerCase()}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            id={name}
            {...register(name as any)}
            onBlur={() => handleFieldComplete(name)}
            rows={4}
            className={cn(
              'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              errors[name] && 'border-red-500'
            )}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        ) : type === 'checkbox' && options ? (
          <div className='space-y-2'>
            {options.map((option) => (
              <label key={option.value} className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  value={option.value}
                  {...register(name as any)}
                  onChange={() => handleFieldComplete(name)}
                  className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                />
                <span className='text-sm text-gray-700'>{option.label}</span>
              </label>
            ))}
          </div>
        ) : (
          <input
            id={name}
            type={type}
            {...register(name as any)}
            onBlur={() => handleFieldComplete(name)}
            className={cn(
              'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              errors[name] && 'border-red-500'
            )}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        )}
        
        {errors[name] && (
          <p className='text-sm text-red-600' role='alert'>
            {errors[name]?.message as string}
          </p>
        )}
      </motion.div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={cn('space-y-4', className)}>
      {/* Newsletter Form */}
      {variant === 'newsletter' && (
        <>
          {renderField('firstName', 'First Name')}
          {renderField('email', 'Email Address', 'email')}
          {renderField('interests', 'Interests', 'checkbox', NEWSLETTER_INTERESTS, false)}
          {renderField('frequency', 'Email Frequency', 'select', [
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'quarterly', label: 'Quarterly' },
          ], false)}
        </>
      )}

      {/* Contact Form */}
      {variant === 'contact' && (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {renderField('firstName', 'First Name')}
            {renderField('lastName', 'Last Name')}
          </div>
          {renderField('email', 'Email Address', 'email')}
          {renderField('company', 'Company')}
          {renderField('subject', 'Subject')}
          {renderField('message', 'Message', 'textarea')}
        </>
      )}

      {/* Lead Capture Form */}
      {(variant === 'lead-capture' || variant === 'demo' || variant === 'consultation') && (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {renderField('firstName', 'First Name')}
            {renderField('lastName', 'Last Name')}
          </div>
          
          {renderField('email', 'Email Address', 'email')}
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {renderField('company', 'Company')}
            {renderField('jobTitle', 'Job Title')}
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {renderField('industry', 'Industry', 'select', INDUSTRY_OPTIONS)}
            {renderField('projectType', 'Project Type', 'select', PROJECT_TYPE_OPTIONS)}
          </div>

          {/* Progressive profiling fields */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {renderField('budget', 'Budget Range', 'select', BUDGET_OPTIONS, false)}
            {renderField('timeline', 'Timeline', 'select', TIMELINE_OPTIONS, false)}
          </div>
          
          {renderField('message', 'Additional Information', 'textarea', undefined, false)}
        </>
      )}

      {/* Returning visitor message */}
      {returningVisitor && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className='p-3 bg-blue-50 border border-blue-200 rounded-md'
        >
          <p className='text-sm text-blue-800'>
            Welcome back! We've pre-filled some of your information to save you time.
          </p>
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Button
          type='submit'
          disabled={isSubmitting}
          className='w-full'
          size='lg'
        >
          {isSubmitting ? 'Submitting...' : 
           variant === 'newsletter' ? 'Subscribe' :
           variant === 'contact' ? 'Send Message' :
           variant === 'demo' ? 'Request Demo' :
           variant === 'consultation' ? 'Schedule Consultation' :
           'Submit'}
        </Button>
      </motion.div>

      {/* Privacy Notice */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className='text-xs text-gray-500 text-center'
      >
        By submitting this form, you agree to our privacy policy and terms of service.
        We will never share your information with third parties.
      </motion.p>
    </form>
  );
};