import { ReactNode } from 'react';
import { Service } from './services';

/**
 * Interface for case studies
 */
export interface CaseStudy {
  id: string;
  title: string;
  description: string;
  industry: string;
  results: string[];
  image?: string;
}

/**
 * Interface for industry variants
 */
export interface Industry {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  caseStudies: CaseStudy[];
  specificServices: Service[];
  complianceRequirements: string[];
}