'use client';

import * as React from 'react';
import { HeroSection, ServicesSection, ErrorBoundary } from '@/components';
import { ExecutiveBriefModal } from '@/components/modals/ExecutiveBriefModal';
import { emailService, type ContactFormData } from '@/services/emailService';
import { safeLazy, useFastRefreshDebug } from '@/utils/fastRefresh';

// Lazy load non-critical components for better performance
const StandardsSection = safeLazy(() => 
  import('@/components/sections/StandardsSection').then(module => ({
    default: module.StandardsSection,
  }))
);

const CTASection = safeLazy(() => 
  import('@/components/sections/CTASection').then(module => ({
    default: module.CTASection,
  }))
);

/**
 * ServicesOverview component - Main landing page for NovaCoreVectra's AI services
 * Refactored from monolithic component to use proper component composition
 * with TypeScript interfaces and error boundary for graceful error handling
 * Includes performance optimizations with lazy loading for non-critical components
 */
const ServicesOverview: React.FC = () => {
  const [showExecutiveBriefModal, setShowExecutiveBriefModal] = React.useState(false);
  
  // Add Fast Refresh debugging in development
  useFastRefreshDebug('ServicesOverview');

  // Action handlers for hero section
  const handleExploreServices = React.useCallback(() => {
    // Scroll to services section
    const servicesSection = document.querySelector(
      '[aria-label="Our services"]'
    );
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleExecutiveBrief = React.useCallback(() => {
    // Open executive brief modal
    setShowExecutiveBriefModal(true);
  }, []);

  // Action handler for CTA section
  const handleContactUs = React.useCallback(async (data?: any) => {
    if (!data) return; // Don't process if no data provided
    
    try {
      // Transform the data to match ContactFormData interface
      const contactData: ContactFormData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        company: data.company || '',
        subject: data.subject || 'General Inquiry',
        message: data.message || 'Contact request from services page',
      };

      const success = await emailService.sendContactForm(contactData);
      
      if (success) {
        console.log('Contact form submitted successfully');
        // You could show a success message here
      } else {
        throw new Error('Failed to send contact form');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      // You could show an error message here
    }
  }, []);

  return (
    <ErrorBoundary>
      <div 
        className='min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100'
        data-testid="services-overview"
      >
        {/* Skip to main content link for screen readers */}
        <a
          href='#main-content'
          className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50'
        >
          Skip to main content
        </a>

        {/* Main content */}
        <main id='main-content' role='main'>
          {/* Hero Section */}
          <HeroSection
            title='Trusted AI for Business Process Transformation'
            subtitle='NovaCoreVectra delivers strategy-led, standards-aligned AI solutions that integrate seamlessly into enterprise operations—securely, responsibly, and at scale.'
            primaryAction={{
              text: 'Explore Our Services',
              onClick: handleExploreServices,
            }}
            secondaryAction={{
              text: 'Executive Brief',
              onClick: handleExecutiveBrief,
            }}
          />

          {/* Services Section */}
          <ServicesSection />

          {/* Standards Section - Lazy loaded */}
          <React.Suspense
            fallback={
              <div className='bg-muted/30 border-t border-border'>
                <div className='max-w-7xl mx-auto px-6 py-20 text-center'>
                  <div className='animate-pulse'>
                    <div className='h-8 bg-muted rounded w-64 mx-auto mb-4'></div>
                    <div className='h-4 bg-muted rounded w-96 mx-auto mb-12'></div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className='h-24 bg-muted rounded-xl'></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            }
          >
            <StandardsSection />
          </React.Suspense>

          {/* CTA Section - Lazy loaded */}
          <React.Suspense
            fallback={
              <div className='max-w-7xl mx-auto px-6 py-20 text-center'>
                <div className='animate-pulse'>
                  <div className='h-8 bg-muted rounded w-80 mx-auto mb-4'></div>
                  <div className='h-4 bg-muted rounded w-96 mx-auto mb-8'></div>
                  <div className='h-12 bg-muted rounded w-32 mx-auto'></div>
                </div>
              </div>
            }
          >
            <CTASection
              variant='demo'
              title='See Our AI Solutions in Action'
              description='Request a personalized demo to see how our AI solutions can address your specific challenges.'
              showLeadCapture={true}
              onAction={handleContactUs}
            />
          </React.Suspense>

          {/* Executive Brief Modal */}
          <ExecutiveBriefModal
            isOpen={showExecutiveBriefModal}
            onClose={() => setShowExecutiveBriefModal(false)}
          />
        </main>
      </div>
    </ErrorBoundary>
  );
};

ServicesOverview.displayName = 'ServicesOverview';

export default ServicesOverview;
