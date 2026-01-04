import { ReactNode } from 'react';

/**
 * Interface for navigation items
 */
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  children?: NavigationItem[];
}

/**
 * Interface for breadcrumb items
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}