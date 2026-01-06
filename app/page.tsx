'use client';

import * as React from 'react';

/**
 * HomePage component - Consistent styling with other pages
 */
const HomePage: React.FC = () => {
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
            onClick={() => window.location.href = '/services'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium transition-colors"
          >
            Explore Our Services
          </button>
          <button 
            onClick={() => console.log('Executive brief requested')}
            className="border border-white text-white hover:bg-slate-800 px-8 py-3 rounded-md font-medium transition-colors"
          >
            Executive Brief
          </button>
        </div>
      </main>
    </div>
  );
};

export default HomePage;