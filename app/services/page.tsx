'use client';

import * as React from 'react';

/**
 * ServicesPage component - Consistent styling
 */
const ServicesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white" style={{color: '#ffffff'}}>
            Our Services
          </h1>
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-white max-w-3xl mx-auto leading-relaxed">
            Comprehensive AI services from strategy development to implementation and governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-white" style={{color: '#ffffff'}}>Business Process Strategy</h3>
            <p className="mb-4 text-sm text-white leading-relaxed">
              Align AI initiatives with operational priorities through process discovery, value-stream optimization, and AI-enabled target operating models.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start text-sm text-white">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400"></span>
                <span>AI opportunity prioritization</span>
              </li>
              <li className="flex items-start text-sm text-white">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400"></span>
                <span>Process redesign & automation</span>
              </li>
              <li className="flex items-start text-sm text-white">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400"></span>
                <span>AI readiness & maturity assessment</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-white" style={{color: '#ffffff'}}>AI Solution Implementation</h3>
            <p className="mb-4 text-sm text-white leading-relaxed">
              Design and deploy production-grade AI solutions built for transparency, scalability, and performance.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start text-sm text-white">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400"></span>
                <span>ML, GenAI, RAG & hybrid architectures</span>
              </li>
              <li className="flex items-start text-sm text-white">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400"></span>
                <span>Responsible AI & explainability</span>
              </li>
              <li className="flex items-start text-sm text-white">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400"></span>
                <span>MLOps & lifecycle management</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-white" style={{color: '#ffffff'}}>Enterprise Integration & Governance</h3>
            <p className="mb-4 text-sm text-white leading-relaxed">
              Operationalize AI within enterprise systems while meeting regulatory, security, and compliance requirements.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start text-sm text-white">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400"></span>
                <span>ERP, CRM & workflow integration</span>
              </li>
              <li className="flex items-start text-sm text-white">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400"></span>
                <span>Security, privacy & access controls</span>
              </li>
              <li className="flex items-start text-sm text-white">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400"></span>
                <span>Monitoring, audit & risk management</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServicesPage;