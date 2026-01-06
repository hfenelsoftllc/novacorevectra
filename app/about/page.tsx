'use client';

import * as React from 'react';

/**
 * AboutPage component - Consistent styling
 */
const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-6" style={{color: '#ffffff'}}>
            About NovaCoreVectra
          </h1>
          <p className="text-lg sm:text-xl text-white max-w-3xl mx-auto leading-relaxed">
            Empowering organizations to lead the AI era through world-class strategy 
            and ethical innovation. We build intelligent systems that transform business operations.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-3xl font-semibold text-white mb-6 text-center" style={{color: '#ffffff'}}>
              Our Mission
            </h2>
            <p className="text-white text-lg leading-relaxed text-center max-w-4xl mx-auto">
              To empower organizations to lead the AI era by fusing world-class strategy with ethical innovation. 
              We believe that artificial intelligence should augment human capabilities, drive business value, 
              and operate within robust governance frameworks that ensure responsible deployment.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-white mb-12 text-center" style={{color: '#ffffff'}}>
            Our Values
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold text-white mb-3" style={{color: '#ffffff'}}>
                Ethical Innovation
              </h3>
              <p className="text-white text-sm leading-relaxed">
                We prioritize responsible AI development that respects human values and societal impact.
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 text-center">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold text-white mb-3" style={{color: '#ffffff'}}>
                Excellence
              </h3>
              <p className="text-white text-sm leading-relaxed">
                We deliver world-class solutions through rigorous standards and continuous improvement.
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-3" style={{color: '#ffffff'}}>
                Transparency
              </h3>
              <p className="text-white text-sm leading-relaxed">
                We believe in open communication and explainable AI systems that build trust.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;