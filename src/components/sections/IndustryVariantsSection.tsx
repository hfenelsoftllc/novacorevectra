'use client';

import React, { useState } from 'react';
import { Industry } from '../../types/industry';
import { IndustrySelector, IndustryContent } from '../industry';
import { cn } from '../../utils/cn';

interface IndustryVariantsSectionProps {
  industries: Industry[];
  defaultIndustry?: string;
  className?: string;
}

export const IndustryVariantsSection: React.FC<IndustryVariantsSectionProps> = ({
  industries,
  defaultIndustry,
  className
}) => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>(
    defaultIndustry || industries[0]?.id || ''
  );

  const currentIndustry = industries.find(industry => industry.id === selectedIndustry);

  const handleIndustrySelect = (industryId: string) => {
    setSelectedIndustry(industryId);
  };

  if (!currentIndustry) {
    return (
      <section className={cn('py-16 px-4', className)}>
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">No industry data available</p>
        </div>
      </section>
    );
  }

  return (
    <section className={cn('py-16 px-4', className)}>
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-foreground">
            Industry-Specific Solutions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover how our AI solutions are tailored to meet the unique challenges 
            and requirements of your industry
          </p>
        </div>

        {/* Industry Selector */}
        <div className="space-y-6">
          <h3 className="text-center text-lg font-medium text-foreground">
            Select Your Industry
          </h3>
          <IndustrySelector
            industries={industries}
            selectedIndustry={selectedIndustry}
            onIndustrySelect={handleIndustrySelect}
            className="justify-center"
          />
        </div>

        {/* Industry Content */}
        <div className="mt-12" role="tabpanel" aria-labelledby={`tab-${selectedIndustry}`}>
          <IndustryContent
            industry={currentIndustry}
            key={selectedIndustry} // Force re-render when industry changes
          />
        </div>
      </div>
    </section>
  );
};