'use client';

import React from 'react';
import { Industry } from '../../types/industry';
import { cn } from '../../utils/cn';

interface IndustrySelectorProps {
  industries: Industry[];
  selectedIndustry: string;
  onIndustrySelect: (industryId: string) => void;
  className?: string;
}

export const IndustrySelector: React.FC<IndustrySelectorProps> = ({
  industries,
  selectedIndustry,
  onIndustrySelect,
  className
}) => {
  const handleKeyDown = (event: React.KeyboardEvent, industryId: string, index: number) => {
    if (event.key === 'ArrowRight' && index < industries.length - 1) {
      event.preventDefault();
      onIndustrySelect(industries[index + 1].id);
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      onIndustrySelect(industries[index - 1].id);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onIndustrySelect(industryId);
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      {industries.map((industry, index) => (
        <button
          key={industry.id}
          role="tab"
          aria-selected={selectedIndustry === industry.id}
          tabIndex={selectedIndustry === industry.id ? 0 : -1}
          onClick={() => onIndustrySelect(industry.id)}
          onKeyDown={(e) => handleKeyDown(e, industry.id, index)}
          className={cn(
            'px-6 py-3 rounded-lg font-medium transition-all duration-200 border-2 hover:scale-105',
            'focus:outline-none focus:ring-2 focus:ring-primary/50',
            selectedIndustry === industry.id
              ? 'bg-primary text-primary-foreground border-primary shadow-lg'
              : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-primary/5'
          )}
        >
          <div className="flex items-center gap-2">
            <span>{industry.name}</span>
          </div>
        </button>
      ))}
    </div>
  );
};