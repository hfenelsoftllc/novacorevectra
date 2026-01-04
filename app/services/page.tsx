'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import ServicesOverview from '@/pages/ServicesOverview';
import { PageStructuredData } from '@/components/common';

/**
 * ServicesPage component - Dedicated services page
 * Implements page transitions with Framer Motion
 */
const ServicesPage: React.FC = () => {
  const serviceBreadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
  ];

  const serviceData = {
    name: 'AI Consulting Services',
    description: 'Comprehensive AI services from strategy development to implementation and governance',
    provider: 'NovaCoreVectra',
    areaServed: ['US', 'CA', 'EU'],
    serviceType: 'AI Consulting',
  };

  return (
    <>
      <PageStructuredData 
        breadcrumbs={serviceBreadcrumbs}
        service={serviceData}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <ServicesOverview />
      </motion.div>
    </>
  );
};

export default ServicesPage;