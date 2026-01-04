'use client';

import React from 'react';
import { CaseStudy } from '../../types/industry';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../utils/cn';

interface IndustryCardProps {
  caseStudy: CaseStudy;
  className?: string;
}

export const IndustryCard: React.FC<IndustryCardProps> = ({
  caseStudy,
  className
}) => {
  return (
    <Card className={cn('h-full hover:shadow-lg transition-shadow duration-200', className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">
          {caseStudy.title}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {caseStudy.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-2">Key Results:</h4>
            <ul className="space-y-2">
              {caseStudy.results.map((result, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1 flex-shrink-0">•</span>
                  <span className="text-sm text-muted-foreground">{result}</span>
                </li>
              ))}
            </ul>
          </div>
          {caseStudy.image && (
            <div className="mt-4">
              <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground text-sm">
                  Case Study Image Placeholder
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};