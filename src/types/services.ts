import { ReactNode } from 'react';

/**
 * Interface for a service offering
 */
export interface Service {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
  bullets: string[];
}

/**
 * Interface for a compliance standard
 */
export interface Standard {
  id: string;
  name: string;
  description?: string;
}
