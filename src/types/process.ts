import { ReactNode } from 'react';

/**
 * Interface for process lifecycle steps
 */
export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  details: string[];
  duration?: string;
}