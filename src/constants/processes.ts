import { ProcessStep } from '../types/process';

/**
 * Process lifecycle steps configuration
 */
export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: 'discover',
    title: 'Discover',
    description: 'Understand your business needs and AI opportunities',
    icon: null, // Will be replaced with actual icon components
    details: [
      'Business process analysis',
      'AI readiness assessment',
      'Opportunity identification',
      'Stakeholder interviews'
    ],
    duration: '2-4 weeks'
  },
  {
    id: 'design',
    title: 'Design',
    description: 'Create tailored AI solutions and implementation roadmap',
    icon: null, // Will be replaced with actual icon components
    details: [
      'Solution architecture',
      'Technical specifications',
      'Risk assessment',
      'Implementation planning'
    ],
    duration: '3-6 weeks'
  },
  {
    id: 'deploy',
    title: 'Deploy',
    description: 'Implement and integrate AI solutions into your operations',
    icon: null, // Will be replaced with actual icon components
    details: [
      'System implementation',
      'Integration testing',
      'User training',
      'Go-live support'
    ],
    duration: '4-12 weeks'
  },
  {
    id: 'operate',
    title: 'Operate',
    description: 'Monitor, optimize, and maintain AI systems for ongoing success',
    icon: null, // Will be replaced with actual icon components
    details: [
      'Performance monitoring',
      'Continuous optimization',
      'Compliance maintenance',
      'Support and updates'
    ],
    duration: 'Ongoing'
  }
];