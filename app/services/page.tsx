'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import ServicesOverview from '@/pages/ServicesOverview';

/**
 * ServicesPage component - Dedicated services page
 * Implements page transitions with Framer Motion
 */
const ServicesPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <ServicesOverview />
    </motion.div>
  );
};

export default ServicesPage;