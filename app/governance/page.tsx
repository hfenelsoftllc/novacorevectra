'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { ErrorBoundary } from '@/components';
import { ISO_42001_FRAMEWORK } from '@/constants';

/**
 * GovernancePage component - AI Governance & Compliance page
 * Displays ISO 42001 compliance mapping and governance information
 * Implements page transitions with Framer Motion
 */
const GovernancePage: React.FC = () => {
  const handleDownloadCompliance = React.useCallback((clauseId: string) => {
    console.log(`Download compliance documentation for clause: ${clauseId}`);
    // TODO: Implement actual download logic
  }, []);

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100"
      >
        <div className="container mx-auto px-4 py-12">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6">
              AI Governance & Compliance
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our comprehensive governance framework ensures responsible AI implementation 
              aligned with international standards and regulatory requirements.
            </p>
          </motion.div>

          {/* ISO 42001 Compliance Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-16"
            aria-labelledby="compliance-title"
          >
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
              <h2 id="compliance-title" className="text-3xl font-semibold text-foreground mb-4">
                {ISO_42001_FRAMEWORK.name} Compliance
              </h2>
              <p className="text-muted-foreground mb-8">
                Certified compliance with the international standard for AI management systems.
                Our services are mapped to specific clauses ensuring comprehensive coverage.
              </p>

              {/* Compliance Clauses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ISO_42001_FRAMEWORK.clauses.map((clause, index) => (
                  <motion.div
                    key={clause.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    className="bg-slate-700/50 rounded-xl p-6 border border-slate-600 hover:border-slate-500 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold text-foreground">
                        Clause {clause.clauseNumber}
                      </h3>
                      <span className="text-sm text-muted-foreground bg-slate-600 px-2 py-1 rounded">
                        {clause.mappedServices.length} services
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-medium text-foreground mb-3">
                      {clause.title}
                    </h4>
                    
                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                      {clause.description}
                    </p>

                    {/* Requirements List */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-foreground mb-2">Key Requirements:</h5>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {clause.requirements.slice(0, 2).map((req, reqIndex) => (
                          <li key={reqIndex} className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            {req}
                          </li>
                        ))}
                        {clause.requirements.length > 2 && (
                          <li className="text-primary text-xs">
                            +{clause.requirements.length - 2} more requirements
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Mapped Services */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-foreground mb-2">Mapped Services:</h5>
                      <div className="flex flex-wrap gap-1">
                        {clause.mappedServices.map((service, serviceIndex) => (
                          <span
                            key={serviceIndex}
                            className="text-xs bg-primary/20 text-primary px-2 py-1 rounded"
                          >
                            {service.replace('-', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Download Link */}
                    {clause.documentationUrl && (
                      <button
                        onClick={() => handleDownloadCompliance(clause.id)}
                        className="text-sm text-primary hover:text-primary/80 transition-colors underline"
                      >
                        Download Documentation
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Trust & Certifications Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-center"
            aria-labelledby="trust-title"
          >
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
              <h2 id="trust-title" className="text-3xl font-semibold text-foreground mb-6">
                Trust & Certifications
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Our commitment to responsible AI is backed by rigorous certifications, 
                regular audits, and transparent governance processes.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-2">ISO 42001</div>
                  <div className="text-sm text-muted-foreground">Certified</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-2">SOC 2</div>
                  <div className="text-sm text-muted-foreground">Type II</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-2">GDPR</div>
                  <div className="text-sm text-muted-foreground">Compliant</div>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </motion.div>
    </ErrorBoundary>
  );
};

export default GovernancePage;