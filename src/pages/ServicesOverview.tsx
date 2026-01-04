'use client';

import * as React from 'react';
import { HeroSection, ServicesSection, ErrorBoundary } from '@/components';

// Lazy load non-critical components for better performance
const StandardsSection = React.lazy(() =>
  import('@/components').then(module => ({
    default: module.StandardsSection,
  }))
);

const CTASection = React.lazy(() =>
  import('@/components').then(module => ({
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
    // Handle executive brief download/navigation
    console.log('Executive brief requested');
    // TODO: Implement actual download or navigation logic
  }, []);

  // Action handler for CTA section
  const handleContactUs = React.useCallback(() => {
    // Handle contact form or navigation
    console.log('Contact us requested');
    // TODO: Implement actual contact logic
  }, []);

  return (
    <ErrorBoundary>
      <div className='min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100'>
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
              title='Build AI You Can Trust'
              subtitle='Partner with NovaCoreVectra to transform business processes with governed, enterprise-ready AI.'
              action={{
                text: 'Contact Us',
                onClick: handleContactUs,
              }}
            />
          </React.Suspense>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default ServicesOverview;
