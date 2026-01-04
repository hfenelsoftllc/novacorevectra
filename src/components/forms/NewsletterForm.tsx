'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { newsletterSchema, type NewsletterFormData } from '@/schemas/forms';
import { cn } from '@/utils';
import { CheckCircle, AlertCircle, Mail } from 'lucide-react';

/**
 * Props for NewsletterForm component
 */
interface NewsletterFormProps {
  onSubmit: (data: NewsletterFormData) => Promise<void>;
  className?: string;
  variant?: 'inline' | 'modal' | 'sidebar';
  showInterests?: boolean;
  title?: string;
  description?: string;
}

/**
 * Newsletter interest options
 */
const NEWSLETTER_INTERESTS = [
  { value: 'ai-governance', label: 'AI Governance & Compliance' },
  { value: 'industry-trends', label: 'Industry Trends & Insights' },
  { value: 'case-studies', label: 'Case Studies & Success Stories' },
  { value: 'best-practices', label: 'Best Practices & Methodologies' },
  { value: 'regulatory-updates', label: 'Regulatory Updates' },
  { value: 'events-webinars', label: 'Events & Webinars' },
];

/**
 * NewsletterForm component for email subscriptions
 */
export const NewsletterForm: React.FC<NewsletterFormProps> = ({
  onSubmit,
  className,
  variant = 'inline',
  showInterests = true,
  title = 'Stay Updated on AI Trends',
  description = 'Get the latest insights on AI governance, industry trends, and best practices delivered to your inbox.',
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      frequency: 'monthly',
    },
  });

  const onFormSubmit = async (data: NewsletterFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      await onSubmit(data);
      setSubmitStatus('success');
      reset();
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while subscribing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isInline = variant === 'inline';
  const isModal = variant === 'modal';
  const isSidebar = variant === 'sidebar';

  return (
    <div className={cn(
      'w-full',
      isInline && 'max-w-2xl mx-auto',
      isModal && 'max-w-md',
      isSidebar && 'max-w-sm',
      className
    )}>
      {/* Header */}
      <div className={cn(
        'text-center mb-6',
        isSidebar && 'text-left mb-4'
      )}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex items-center justify-center gap-2 mb-3'
        >
          <Mail className={cn(
            'text-blue-600',
            isInline && 'h-6 w-6',
            (isModal || isSidebar) && 'h-5 w-5'
          )} />
          <h3 className={cn(
            'font-semibold text-gray-900',
            isInline && 'text-xl',
            (isModal || isSidebar) && 'text-lg'
          )}>
            {title}
          </h3>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            'text-gray-600',
            isInline && 'text-base',
            (isModal || isSidebar) && 'text-sm'
          )}
        >
          {description}
        </motion.p>
      </div>

      {/* Success Message */}
      {submitStatus === 'success' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className='mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center gap-3'
        >
          <CheckCircle className='h-5 w-5 text-green-600 flex-shrink-0' />
          <div>
            <h4 className='text-sm font-medium text-green-800'>Successfully subscribed!</h4>
            <p className='text-sm text-green-700'>
              Thank you for subscribing. Check your email for confirmation.
            </p>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {submitStatus === 'error' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className='mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-3'
        >
          <AlertCircle className='h-5 w-5 text-red-600 flex-shrink-0' />
          <div>
            <h4 className='text-sm font-medium text-red-800'>Subscription failed</h4>
            <p className='text-sm text-red-700'>{errorMessage}</p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-4'>
        {/* Name and Email */}
        <div className={cn(
          'grid gap-4',
          isInline && 'grid-cols-1 md:grid-cols-2',
          (isModal || isSidebar) && 'grid-cols-1'
        )}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='space-y-2'
          >
            <label htmlFor='firstName' className='block text-sm font-medium text-gray-700'>
              First Name <span className='text-red-500'>*</span>
            </label>
            <input
              id='firstName'
              type='text'
              {...register('firstName')}
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                errors.firstName && 'border-red-500 focus:ring-red-500 focus:border-red-500'
              )}
              placeholder='Enter your first name'
            />
            {errors.firstName && (
              <p className='text-sm text-red-600 flex items-center gap-1' role='alert'>
                <AlertCircle className='h-4 w-4' />
                {errors.firstName.message}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className='space-y-2'
          >
            <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
              Email Address <span className='text-red-500'>*</span>
            </label>
            <input
              id='email'
              type='email'
              {...register('email')}
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                errors.email && 'border-red-500 focus:ring-red-500 focus:border-red-500'
              )}
              placeholder='Enter your email address'
            />
            {errors.email && (
              <p className='text-sm text-red-600 flex items-center gap-1' role='alert'>
                <AlertCircle className='h-4 w-4' />
                {errors.email.message}
              </p>
            )}
          </motion.div>
        </div>

        {/* Interests */}
        {showInterests && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className='space-y-3'
          >
            <label className='block text-sm font-medium text-gray-700'>
              What interests you? (Optional)
            </label>
            <div className={cn(
              'grid gap-2',
              isInline && 'grid-cols-1 md:grid-cols-2',
              (isModal || isSidebar) && 'grid-cols-1'
            )}>
              {NEWSLETTER_INTERESTS.map((interest) => (
                <label key={interest.value} className='flex items-center space-x-2 text-sm'>
                  <input
                    type='checkbox'
                    value={interest.value}
                    {...register('interests')}
                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <span className='text-gray-700'>{interest.label}</span>
                </label>
              ))}
            </div>
          </motion.div>
        )}

        {/* Frequency */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className='space-y-2'
        >
          <label htmlFor='frequency' className='block text-sm font-medium text-gray-700'>
            Email Frequency
          </label>
          <select
            id='frequency'
            {...register('frequency')}
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          >
            <option value='weekly'>Weekly</option>
            <option value='monthly'>Monthly</option>
            <option value='quarterly'>Quarterly</option>
          </select>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            type='submit'
            disabled={isSubmitting}
            className='w-full'
            size={isInline ? 'lg' : 'default'}
          >
            {isSubmitting ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                Subscribing...
              </>
            ) : (
              'Subscribe to Newsletter'
            )}
          </Button>
        </motion.div>

        {/* Privacy Notice */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className='text-xs text-gray-500 text-center'
        >
          We respect your privacy. Unsubscribe at any time. No spam, ever.
        </motion.p>
      </form>
    </div>
  );
};