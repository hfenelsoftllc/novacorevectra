'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components';
import { ArrowRight, Calendar, Download, MessageCircle, Phone } from 'lucide-react';
import { CTASectionProps, CTAVariant } from '@/types';
import { cn } from '@/utils';
import { LeadCaptureForm } from '../forms/LeadCaptureForm';
import { calendarService, type ConsultationRequest } from '@/services/calendarService';

/**
 * CTA variant configurations
 */
const CTA_VARIANTS = {
  consultation: {
    title: 'Ready to Transform Your Business with AI?',
    description: 'Schedule a free consultation with our AI experts to discuss your specific needs and opportunities.',
    buttonText: 'Schedule Consultation',
    icon: Calendar,
    className: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
  },
  demo: {
    title: 'See Our AI Solutions in Action',
    description: 'Request a personalized demo to see how our AI solutions can address your specific challenges.',
    buttonText: 'Request Demo',
    icon: MessageCircle,
    className: 'bg-gradient-to-r from-green-600 to-teal-600 text-white',
  },
  whitepaper: {
    title: 'Download Our AI Governance Guide',
    description: 'Get our comprehensive whitepaper on implementing AI governance frameworks in your organization.',
    buttonText: 'Download Whitepaper',
    icon: Download,
    className: 'bg-gradient-to-r from-orange-600 to-red-600 text-white',
  },
  contact: {
    title: 'Get in Touch with Our Team',
    description: 'Have questions about our services? Contact us and we\'ll get back to you within 24 hours.',
    buttonText: 'Contact Us',
    icon: Phone,
    className: 'bg-gradient-to-r from-gray-700 to-gray-900 text-white',
  },
  newsletter: {
    title: 'Stay Updated on AI Trends',
    description: 'Subscribe to our newsletter for the latest insights on AI governance, trends, and best practices.',
    buttonText: 'Subscribe Now',
    icon: ArrowRight,
    className: 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white',
  },
} as const;

/**
 * Enhanced CTA section props
 */
interface EnhancedCTASectionProps extends Omit<CTASectionProps, 'title' | 'subtitle' | 'action'> {
  variant?: CTAVariant;
  title?: string;
  description?: string;
  buttonText?: string;
  onAction?: (data?: any) => void | Promise<void>;
  showLeadCapture?: boolean;
}

/**
 * CTASection component displays a call-to-action section with multiple variants
 * Includes smooth animations, responsive design, and optional lead capture forms
 * Memoized for performance optimization
 */
const CTASectionComponent = React.forwardRef<HTMLElement, EnhancedCTASectionProps>(
  ({ 
    variant = 'consultation',
    title,
    description,
    buttonText,
    onAction,
    showLeadCapture = false,
    className,
    children,
    ...props 
  }, ref) => {
    const [showForm, setShowForm] = React.useState(false);
    const config = CTA_VARIANTS[variant];
    const IconComponent = config.icon;

    const handleAction = async (data?: any) => {
      if (showLeadCapture) {
        setShowForm(true);
      } else if (onAction) {
        await onAction(data);
      }
    };

    const handleFormSubmit = async (data: any) => {
      try {
        // Handle form submission logic here
        console.log('Form submitted:', data);
        
        // Create calendar event for consultation requests
        if (variant === 'consultation' || variant === 'demo') {
          const consultationData: ConsultationRequest = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            company: data.company,
            jobTitle: data.jobTitle,
            industry: data.industry,
            projectType: data.projectType,
            message: data.message,
          };
          
          const calendarSuccess = await calendarService.createConsultationEvent(consultationData);
          
          if (calendarSuccess) {
            console.log('Calendar event created successfully');
          } else {
            console.warn('Failed to create calendar event, but form was submitted');
          }
        }
        
        setShowForm(false);
        
        // Call the onAction with form data
        if (onAction) {
          await onAction(data);
        }
      } catch (error) {
        console.error('Error handling form submission:', error);
        // Still close the form even if there's an error
        setShowForm(false);
      }
    };

    return (
      <section
        ref={ref}
        className={cn(
          'max-w-7xl mx-auto px-6 py-20 sm:py-24',
          className
        )}
        aria-labelledby='cta-heading'
        role='region'
        aria-label='Call to action'
        {...props}
      >
        <div className={cn(
          'rounded-2xl p-8 sm:p-12 text-center',
          config.className
        )}>
          {/* Animated Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className='flex justify-center mb-6'
          >
            <div className='p-3 bg-white/20 rounded-full'>
              <IconComponent className='h-8 w-8' aria-hidden='true' />
            </div>
          </motion.div>

          {/* Animated Title */}
          <motion.h3
            id='cta-heading'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
              duration: 0.4,
              delay: 0.1,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className='text-2xl sm:text-3xl lg:text-4xl font-semibold mb-4'
          >
            {title || config.title}
          </motion.h3>

          {/* Animated Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
              duration: 0.4,
              delay: 0.15,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className='text-base sm:text-lg opacity-90 max-w-2xl mx-auto leading-relaxed mb-8'
            aria-describedby='cta-heading'
          >
            {description || config.description}
          </motion.p>

          {/* Optional additional content */}
          {children && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.4,
                delay: 0.2,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className='mb-8'
            >
              {children}
            </motion.div>
          )}

          {/* Animated Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
              duration: 0.4,
              delay: 0.25,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <Button
              size='lg'
              onClick={() => handleAction()}
              className='bg-white text-gray-900 hover:bg-gray-100 gap-2 group'
              aria-label={`${buttonText || config.buttonText} - ${config.description}`}
            >
              {buttonText || config.buttonText}
              <ArrowRight
                className='h-4 w-4 transition-transform group-hover:translate-x-1'
                aria-hidden='true'
              />
            </Button>
          </motion.div>
        </div>

        {/* Lead Capture Form Modal */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className='bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto'
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <div className='flex justify-between items-center mb-4'>
                <h4 className='text-lg font-semibold text-gray-900' id="modal-title">
                  {variant === 'consultation' && 'Schedule Consultation'}
                  {variant === 'demo' && 'Request Demo'}
                  {variant === 'whitepaper' && 'Download Whitepaper'}
                  {variant === 'contact' && 'Contact Us'}
                  {variant === 'newsletter' && 'Subscribe to Newsletter'}
                </h4>
                <button
                  onClick={() => setShowForm(false)}
                  className='text-gray-400 hover:text-gray-600'
                  aria-label='Close form'
                >
                  ×
                </button>
              </div>
              <LeadCaptureForm
                variant={variant === 'newsletter' ? 'newsletter' : 'lead-capture'}
                onSubmit={handleFormSubmit}
                showProgressiveFields={variant !== 'newsletter'}
              />
            </motion.div>
          </motion.div>
        )}
      </section>
    );
  }
);

CTASectionComponent.displayName = 'CTASection';

// Memoize the component to prevent unnecessary re-renders
export const CTASection = React.memo(CTASectionComponent);
