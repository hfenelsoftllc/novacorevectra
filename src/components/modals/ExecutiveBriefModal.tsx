'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui';
import { X, FileText, Send } from 'lucide-react';
import { cn } from '@/utils';
import { emailService } from '@/services/emailService';

/**
 * Executive brief form schema
 */
const executiveBriefSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().min(1, 'Company name is required'),
  jobTitle: z.string().optional(),
  industry: z.string().optional(),
  message: z.string().optional(),
});

type ExecutiveBriefFormData = z.infer<typeof executiveBriefSchema>;

/**
 * Props for ExecutiveBriefModal component
 */
interface ExecutiveBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
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
 * ExecutiveBriefModal component for requesting executive brief documents
 */
const ExecutiveBriefModal: React.FC<ExecutiveBriefModalProps> = ({
  isOpen,
  onClose,
  className,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ExecutiveBriefFormData>({
    resolver: zodResolver(executiveBriefSchema),
  });

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setIsSubmitted(false);
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: ExecutiveBriefFormData) => {
    setIsSubmitting(true);
    
    try {
      const success = await emailService.sendExecutiveBriefRequest({
        ...data,
        jobTitle: data.jobTitle || '',
        industry: data.industry || '',
        message: data.message || ''
      });
      
      if (success) {
        setIsSubmitted(true);
        // Auto-close after 3 seconds
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        throw new Error('Failed to send request');
      }
    } catch (error) {
      console.error('Error submitting executive brief request:', error);
      alert('There was an error submitting your request. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (
    name: keyof ExecutiveBriefFormData,
    label: string,
    type: string = 'text',
    options?: { value: string; label: string }[],
    required: boolean = true
  ) => {
    return (
      <div className='space-y-2'>
        <label htmlFor={name} className='block text-sm font-medium text-gray-700'>
          {label} {required && <span className='text-red-500'>*</span>}
        </label>
        
        {type === 'select' && options ? (
          <select
            id={name}
            {...register(name)}
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
            {...register(name)}
            rows={4}
            className={cn(
              'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              errors[name] && 'border-red-500'
            )}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        ) : (
          <input
            id={name}
            type={type}
            {...register(name)}
            className={cn(
              'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              errors[name] && 'border-red-500'
            )}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        )}
        
        {errors[name] && (
          <p className='text-sm text-red-600' role='alert'>
            {errors[name]?.message}
          </p>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={cn(
              'bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto',
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className='flex items-center justify-between p-6 border-b border-gray-200'>
              <div className='flex items-center space-x-3'>
                <div className='p-2 bg-blue-100 rounded-lg'>
                  <FileText className='h-5 w-5 text-blue-600' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Request Executive Brief
                  </h3>
                  <p className='text-sm text-gray-500'>
                    Get our comprehensive AI strategy document
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className='text-gray-400 hover:text-gray-600 transition-colors'
                aria-label='Close modal'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            {/* Content */}
            <div className='p-6'>
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='text-center py-8'
                >
                  <div className='p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center'>
                    <Send className='h-8 w-8 text-green-600' />
                  </div>
                  <h4 className='text-lg font-semibold text-gray-900 mb-2'>
                    Request Submitted Successfully!
                  </h4>
                  <p className='text-gray-600 mb-4'>
                    Thank you for your interest. Our executive brief will be sent to your email address within 24 hours.
                  </p>
                  <p className='text-sm text-gray-500'>
                    This window will close automatically in a few seconds.
                  </p>
                </motion.div>
              ) : (
                <>
                  <div className='mb-6'>
                    <p className='text-gray-600 text-sm'>
                      Our executive brief provides a comprehensive overview of AI strategy, implementation frameworks, and governance best practices. Please fill out the form below and we'll send it to your email address.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                    {/* Name Fields */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {renderField('firstName', 'First Name')}
                      {renderField('lastName', 'Last Name')}
                    </div>

                    {/* Email */}
                    {renderField('email', 'Email Address', 'email')}

                    {/* Company */}
                    {renderField('company', 'Company')}

                    {/* Job Title and Industry */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {renderField('jobTitle', 'Job Title', 'text', undefined, false)}
                      {renderField('industry', 'Industry', 'select', INDUSTRY_OPTIONS, false)}
                    </div>

                    {/* Additional Information */}
                    {renderField('message', 'Additional Information', 'textarea', undefined, false)}

                    {/* Submit Button */}
                    <div className='pt-4'>
                      <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='w-full'
                        size='lg'
                      >
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className='w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2'
                            />
                            Submitting Request...
                          </>
                        ) : (
                          <>
                            <Send className='h-4 w-4 mr-2' />
                            Request Executive Brief
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Privacy Notice */}
                    <p className='text-xs text-gray-500 text-center'>
                      By submitting this form, you agree to receive the executive brief document via email. 
                      We will not share your information with third parties.
                    </p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

ExecutiveBriefModal.displayName = 'ExecutiveBriefModal';

export { ExecutiveBriefModal };