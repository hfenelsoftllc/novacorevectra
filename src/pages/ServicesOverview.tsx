'use client';

import * as React from 'react';
import { HeroSection } from '@/components/sections/HeroSection';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { StandardsSection } from '@/components/sections/StandardsSection';
import { CTASection } from '@/components/sections/CTASection';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

/**
 * ServicesOverview component - Main landing page for NovaCoreVectra's AI services
 * Refactored from monolithic component to use proper component composition
 * with TypeScript interfaces and error boundary for graceful error handling
 */
const ServicesOverview: React.FC = () => {
  // Action handlers for hero section
  const handleExploreServices = React.useCallback(() => {
    // Scroll to services section
    const servicesSection = document.querySelector('[aria-label="Our services"]');
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
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
        >
          Skip to main content
        </a>

        {/* Main content */}
        <main id="main-content" role="main">
          {/* Hero Section */}
          <HeroSection
            title="Trusted AI for Business Process Transformation"
            subtitle="NovaCoreVectra delivers strategy-led, standards-aligned AI solutions that integrate seamlessly into enterprise operations—securely, responsibly, and at scale."
            primaryAction={{
              text: "Explore Our Services",
              onClick: handleExploreServices,
            }}
            secondaryAction={{
              text: "Executive Brief",
              onClick: handleExecutiveBrief,
            }}
          />

          {/* Services Section */}
          <ServicesSection />

          {/* Standards Section */}
          <StandardsSection />

          {/* CTA Section */}
          <CTASection
            title="Build AI You Can Trust"
            subtitle="Partner with NovaCoreVectra to transform business processes with governed, enterprise-ready AI."
            action={{
              text: "Contact Us",
              onClick: handleContactUs,
            }}
          />
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default ServicesOverview;