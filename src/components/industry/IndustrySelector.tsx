'use client';

import React from 'react';
import { Industry } from '../../types/industry';
import { cn } from '../../utils/cn';

interface IndustrySelectorProps {
  industries: Industry[];
  selectedIndustry?: string;
  onIndustrySelect: (industryId: string) => void;
  className?: string;
}

export const IndustrySelector: React.FC<IndustrySelectorProps> = ({
  industries,
  selectedIndustry,
  onIndustrySelect,
  className
}) => {
  return (
    <div className={cn('flex flex-wrap gap-3 justify-center', className)}>
      {industries.map((industry) => (
        <button
          key={industry.id}
          onClick={() => onIndustrySelect(industry.id)}
          className={cn(
            'px-6 py-3 rounded-lg font-medium transition-all duration-200',
            'border-2 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50',
            selectedIndustry === industry.id
              ? 'bg-primary text-primary-foreground border-primary shadow-lg'
              : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-primary/5'
          )}
          aria-selected={selectedIndustry === industry.id}
          role="tab"
        >
          <div className="flex items-center gap-2">
            {industry.icon && (
              <span className="flex-shrink-0">
                {industry.icon}
              </span>
            )}
            <span>{industry.name}</span>
          </div>
        </button>
      ))}
    </div>
  );
};