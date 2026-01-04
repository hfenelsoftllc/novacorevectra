'use client';

import React from 'react';
import { Industry } from '../../types/industry';
import { IndustryCard } from './IndustryCard';
import { ServiceCard } from '../cards/ServiceCard';
import { cn } from '../../utils/cn';

interface IndustryContentProps {
  industry: Industry;
  className?: string;
}

export const IndustryContent: React.FC<IndustryContentProps> = ({
  industry,
  className
}) => {
  return (
    <div className={cn('space-y-12', className)}>
      {/* Industry Overview */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          {industry.icon && (
            <span className="text-primary">
              {industry.icon}
            </span>
          )}
          <h2 className="text-3xl font-bold text-foreground">
            {industry.name} Solutions
          </h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          {industry.description}
        </p>
      </div>

      {/* Industry-Specific Services */}
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-foreground mb-4">
            Specialized Services for {industry.name}
          </h3>
          <p className="text-muted-foreground">
            Tailored AI solutions designed specifically for {industry.name.toLowerCase()} industry challenges
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industry.specificServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              className="h-full"
            />
          ))}
        </div>
      </div>

      {/* Case Studies */}
      {industry.caseStudies.length > 0 && (
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-foreground mb-4">
              Success Stories
            </h3>
            <p className="text-muted-foreground">
              Real-world results from our {industry.name.toLowerCase()} implementations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industry.caseStudies.map((caseStudy) => (
              <IndustryCard
                key={caseStudy.id}
                caseStudy={caseStudy}
                className="h-full"
              />
            ))}
          </div>
        </div>
      )}

      {/* Compliance Requirements */}
      {industry.complianceRequirements.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-foreground mb-4">
              Compliance & Standards
            </h3>
            <p className="text-muted-foreground">
              We ensure compliance with industry-specific regulations and standards
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {industry.complianceRequirements.map((requirement, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20"
              >
                {requirement}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};