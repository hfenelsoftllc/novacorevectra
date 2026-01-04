import React from 'react';
import { ServiceCard, AnimatedSection } from '@/components';
import { SERVICES } from '@/constants/services';

/**
 * Demo component to showcase the newly created base UI components
 * This demonstrates that ServiceCard and AnimatedSection work correctly
 */
export const ComponentDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <AnimatedSection className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Base UI Components Demo
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
            />
          ))}
        </div>
      </AnimatedSection>
    </div>
  );
};

export default ComponentDemo;