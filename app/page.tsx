'use client';

import * as React from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

/**
 * HomePage component - Consistent styling with other pages
 */
const HomePage: React.FC = () => {
  const analytics = useAnalytics();

  React.useEffect(() => {
    // Track landing page visit
    analytics.trackFunnelStep('landing', '/', {});
  }, [analytics]);

  const handleExploreServices = () => {
    // Track CTA click
    analytics.trackCTAClick({
      variant: 'consultation',
      position: 'hero',
      page: '/',
    });
    
    // Track funnel step
    analytics.trackFunnelStep('cta_click', '/', {
      cta_type: 'explore_services'
    });
    
    window.location.href = '/services';
  };

  const handleExecutiveBrief = () => {
    // Track CTA click
    analytics.trackCTAClick({
      variant: 'whitepaper',
      position: 'hero',
      page: '/',
    });
    
    console.log('Executive brief requested');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <main className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white" style={{color: '#ffffff'}}>
          Trusted AI for Business Process Transformation
        </h1>
        <p className="mt-6 text-base sm:text-lg lg:text-xl text-white max-w-3xl mx-auto leading-relaxed">
          NovaCoreVectra delivers strategy-led, standards-aligned AI solutions that integrate seamlessly into enterprise operations—securely, responsibly, and at scale.
        </p>
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={handleExploreServices}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium transition-colors"
          >
            Explore Our Services
          </button>
          <button 
            onClick={handleExecutiveBrief}
            className="border border-white text-white hover:bg-slate-800 px-8 py-3 rounded-md font-medium transition-colors"
          >
            Executive Brief
          </button>
        </div>
        
        {/* Additional content for CTA section */}
        <section className="mt-20">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Build AI You Can Trust
          </h2>
          <p className="text-white/80 mb-6">
            Get started with our comprehensive AI solutions today.
          </p>
        </section>
      </main>
    </div>
  );
};

export default HomePage;