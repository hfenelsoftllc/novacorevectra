'use client';

import React from 'react';
import { Industry } from '../../types/industry';
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
    <div className={cn('space-y-8', className)}>
      {/* Industry Header */}
      <div className="text-center space-y-4">
        <h3 className="text-3xl font-bold text-foreground">
          {industry.name} Solutions
        </h3>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {industry.description}
        </p>
      </div>

      {/* Specific Services */}
      {industry.specificServices && industry.specificServices.length > 0 && (
        <div className="space-y-6">
          <h4 className="text-xl font-semibold text-foreground text-center">
            Specialized Services for {industry.name}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {industry.specificServices.map((service) => (
              <div
                key={service.id}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {service.icon && (
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      {service.icon}
                    </div>
                  )}
                  <div className="flex-1">
                    <h5 className="text-lg font-semibold text-foreground mb-2">
                      {service.title}
                    </h5>
                    <p className="text-muted-foreground mb-4">
                      {service.description}
                    </p>
                    <ul className="space-y-1">
                      {service.bullets.map((bullet, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Case Studies */}
      {industry.caseStudies && industry.caseStudies.length > 0 && (
        <div className="space-y-6">
          <h4 className="text-xl font-semibold text-foreground text-center">
            Success Stories
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {industry.caseStudies.map((caseStudy) => (
              <div
                key={caseStudy.id}
                className="bg-muted/30 rounded-lg p-6"
              >
                <h5 className="text-lg font-semibold text-foreground mb-2">
                  {caseStudy.title}
                </h5>
                <p className="text-muted-foreground mb-4">
                  {caseStudy.description}
                </p>
                <div className="space-y-2">
                  <h6 className="text-sm font-medium text-foreground">Key Results:</h6>
                  <ul className="space-y-1">
                    {caseStudy.results.map((result, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        {result}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Requirements */}
      {industry.complianceRequirements && industry.complianceRequirements.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xl font-semibold text-foreground text-center">
            Compliance & Standards
          </h4>
          <div className="flex flex-wrap justify-center gap-3">
            {industry.complianceRequirements.map((requirement, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
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