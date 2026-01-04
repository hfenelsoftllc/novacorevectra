'use client';

import * as React from 'react';
import { 
  generateOrganizationStructuredData, 
  generateWebsiteStructuredData,
  generateBreadcrumbStructuredData,
  generateServiceStructuredData,
  BreadcrumbItem
} from '@/utils/seo';

export interface StructuredDataProps {
  type: 'organization' | 'website' | 'breadcrumb' | 'service';
  breadcrumbs?: BreadcrumbItem[];
  service?: {
    name: string;
    description: string;
    provider: string;
    areaServed?: string[];
    serviceType?: string;
  };
}

/**
 * Component for injecting structured data (JSON-LD) into pages
 */
export const StructuredData: React.FC<StructuredDataProps> = ({ 
  type, 
  breadcrumbs = [], 
  service 
}) => {
  const getStructuredData = React.useCallback(() => {
    switch (type) {
      case 'organization':
        return generateOrganizationStructuredData();
      case 'website':
        return generateWebsiteStructuredData();
      case 'breadcrumb':
        return generateBreadcrumbStructuredData(breadcrumbs);
      case 'service':
        if (!service) {
          console.warn('Service data required for service structured data');
          return null;
        }
        return generateServiceStructuredData(service);
      default:
        return null;
    }
  }, [type, breadcrumbs, service]);

  const structuredData = getStructuredData();

  if (!structuredData) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: structuredData }}
    />
  );
};

/**
 * Combined structured data component for common page types
 */
export const PageStructuredData: React.FC<{
  breadcrumbs?: BreadcrumbItem[];
  service?: StructuredDataProps['service'];
}> = ({ breadcrumbs, service }) => {
  return (
    <>
      <StructuredData type="organization" />
      <StructuredData type="website" />
      {breadcrumbs && breadcrumbs.length > 0 && (
        <StructuredData type="breadcrumb" breadcrumbs={breadcrumbs} />
      )}
      {service && (
        <StructuredData type="service" service={service} />
      )}
    </>
  );
};