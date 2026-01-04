'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { contactFormSchema, type ContactFormData } from '@/schemas/forms';
import { cn } from '@/utils';
import { CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Props for ContactForm component
 */
interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<void>;
  className?: string;
  showSuccessMessage?: boolean;
}

/**
 * ContactForm component for general inquiries
 */
export const ContactForm: React.FC<ContactFormProps> = ({
  onSubmit,
  className,
  showSuccessMessage = true,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onFormSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      await onSubmit(data);
      setSubmitStatus('success');
      if (showSuccessMessage) {
        reset();
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while sending your message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (
    name: keyof ContactFormData,
    label: string,
    type: string = 'text',
    required: boolean = true
  ) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='space-y-2'
    >
      <label htmlFor={name} className='block text-sm font-medium text-gray-700'>
        {label} {required && <span className='text-red-500'>*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={name}
          {...register(name)}
          rows={5}
          className={cn(
            'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
            errors[name] && 'border-red-500 focus:ring-red-500 focus:border-red-500'
          )}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      ) : (
        <input
          id={name}
          type={type}
          {...register(name)}
          className={cn(
            'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
            errors[name] && 'border-red-500 focus:ring-red-500 focus:border-red-500'
          )}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      )}
      
      {errors[name] && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-sm text-red-600 flex items-center gap-1'
          role='alert'
        >
          <AlertCircle className='h-4 w-4' />
          {errors[name]?.message}
        </motion.p>
      )}
    </motion.div>
  );

  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      {/* Success Message */}
      {submitStatus === 'success' && showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className='mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center gap-3'
        >
          <CheckCircle className='h-5 w-5 text-green-600' />
          <div>
            <h4 className='text-sm font-medium text-green-800'>Message sent successfully!</h4>
            <p className='text-sm text-green-700'>
              Thank you for contacting us. We'll get back to you within 24 hours.
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
          <AlertCircle className='h-5 w-5 text-red-600' />
          <div>
            <h4 className='text-sm font-medium text-red-800'>Error sending message</h4>
            <p className='text-sm text-red-700'>{errorMessage}</p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-6'>
        {/* Name Fields */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {renderField('firstName', 'First Name')}
          {renderField('lastName', 'Last Name')}
        </div>

        {/* Email and Company */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {renderField('email', 'Email Address', 'email')}
          {renderField('company', 'Company')}
        </div>

        {/* Subject */}
        {renderField('subject', 'Subject')}

        {/* Message */}
        {renderField('message', 'Message', 'textarea')}

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
            {isSubmitting ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                Sending Message...
              </>
            ) : (
              'Send Message'
            )}
          </Button>
        </motion.div>

        {/* Privacy Notice */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className='text-xs text-gray-500 text-center'
        >
          By submitting this form, you agree to our privacy policy. We will respond to your inquiry within 24 hours.
        </motion.p>
      </form>
    </div>
  );
};