'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { ErrorBoundary, ComplianceSection, CTASection } from '@/components';

/**
 * GovernancePage component - AI Governance & Compliance page
 * Displays ISO 42001 compliance mapping and governance information
 * Implements page transitions with Framer Motion
 */
const GovernancePage: React.FC = () => {
  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-background"
      >
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center py-16 px-4"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6">
            AI Governance & Compliance
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our comprehensive governance framework ensures responsible AI implementation 
            aligned with international standards and regulatory requirements.
          </p>
        </motion.div>

        {/* Compliance Section */}
        <ComplianceSection />

        {/* CTA Section */}
        <CTASection
          variant='whitepaper'
          title='Download Our AI Governance Guide'
          description='Get our comprehensive whitepaper on implementing AI governance frameworks in your organization.'
          showLeadCapture={true}
        />
      </motion.div>
    </ErrorBoundary>
  );
};

export default GovernancePage;