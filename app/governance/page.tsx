'use client';

import * as React from 'react';

/**
 * GovernancePage component - Consistent styling
 */
const GovernancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-6" style={{color: '#ffffff'}}>
            AI Governance & Compliance
          </h1>
          <p className="text-lg sm:text-xl text-white max-w-3xl mx-auto leading-relaxed">
            Our comprehensive governance framework ensures responsible AI implementation 
            aligned with international standards and regulatory requirements.
          </p>
        </div>

        {/* Compliance Section */}
        <section className="mb-16">
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-3xl font-semibold text-white mb-8 text-center" style={{color: '#ffffff'}}>
              ISO 42001 Compliance
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                <h3 className="text-xl font-semibold text-white mb-3" style={{color: '#ffffff'}}>Risk Management</h3>
                <p className="text-white text-sm">
                  Comprehensive AI risk assessment and mitigation strategies aligned with ISO 42001 standards.
                </p>
              </div>

              <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                <h3 className="text-xl font-semibold text-white mb-3" style={{color: '#ffffff'}}>Documentation</h3>
                <p className="text-white text-sm">
                  Complete documentation frameworks for AI system lifecycle management and compliance.
                </p>
              </div>

              <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                <h3 className="text-xl font-semibold text-white mb-3" style={{color: '#ffffff'}}>Monitoring</h3>
                <p className="text-white text-sm">
                  Continuous monitoring and audit capabilities for ongoing compliance assurance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-2xl font-semibold text-white mb-4" style={{color: '#ffffff'}}>
              Download Our AI Governance Guide
            </h2>
            <p className="text-white mb-6">
              Get our comprehensive whitepaper on implementing AI governance frameworks in your organization.
            </p>
            <button 
              onClick={() => console.log('Download whitepaper requested')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium transition-colors"
            >
              Download Whitepaper
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default GovernancePage;