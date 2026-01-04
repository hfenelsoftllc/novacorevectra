'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { HeroSection, ServicesSection, StandardsSection, CTASection, ErrorBoundary } from '@/components';
import { PageStructuredData } from '@/components/common';

/**
 * HomePage component - Main landing page with hero section and key content
 * Implements page transitions with Framer Motion
 */
const HomePage: React.FC = () => {
  // Action handlers for hero section
  const handleExploreServices = React.useCallback(() => {
    // Navigate to services page
    window.location.href = '/services';
  }, []);

  const handleExecutiveBrief = React.useCallback(() => {
    // Handle executive brief download/navigation
    console.log('Executive brief requested');
    // TODO: Implement actual download logic
  }, []);

  // Action handler for CTA section
  const handleContactUs = React.useCallback(() => {
    // Navigate to contact page
    window.location.href = '/contact';
  }, []);

  return (
    <ErrorBoundary>
      <PageStructuredData />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className='min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100'
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
              variant='consultation'
              title='Build AI You Can Trust'
              description='Partner with NovaCoreVectra to transform business processes with governed, enterprise-ready AI.'
              showLeadCapture={true}
              onAction={handleContactUs}
            />
          </React.Suspense>
        </main>
      </motion.div>
    </ErrorBoundary>
  );
};

export default HomePage;