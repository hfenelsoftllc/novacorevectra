import { Industry } from '../types/industry';

/**
 * Industry variants configuration with case studies and specific services
 */
export const INDUSTRIES: Industry[] = [
  {
    id: 'airlines',
    name: 'Airlines',
    description: 'AI solutions for operational excellence, passenger experience, and regulatory compliance in airline operations',
    icon: null, // Will be replaced with actual icon components
    caseStudies: [
      {
        id: 'airlines-operations',
        title: 'Operational Excellence for Major Airline',
        description: 'Enhanced operational efficiency by 35% through AI-driven process optimization and compliance automation',
        industry: 'airlines',
        results: [
          '35% improvement in operational efficiency',
          '$4.2M annual cost savings',
          '98.5% on-time performance'
        ]
      }
    ],
    specificServices: [
      {
        id: 'operational-optimization',
        icon: null,
        title: 'Operational Excellence Systems',
        description: 'AI-powered operational optimization and performance monitoring',
        bullets: ['Enhance efficiency', 'Optimize resource allocation', 'Improve service quality']
      },
      {
        id: 'passenger-experience',
        icon: null,
        title: 'Passenger Experience Enhancement',
        description: 'Personalized services, booking optimization, and customer journey improvement',
        bullets: ['Personalized services', 'Journey optimization', 'Customer satisfaction']
      },
      {
        id: 'compliance-management',
        icon: null,
        title: 'Regulatory Compliance Management',
        description: 'Comprehensive compliance monitoring and industry standard adherence',
        bullets: ['Standards compliance', 'Regulatory reporting', 'Audit readiness']
      },
      {
        id: 'revenue-optimization',
        icon: null,
        title: 'Revenue Management Optimization',
        description: 'Dynamic pricing, capacity management, and revenue maximization',
        bullets: ['Dynamic pricing', 'Capacity optimization', 'Revenue growth']
      }
    ],
    complianceRequirements: ['IATA standards', 'DOT regulations', 'ICAO compliance', 'Industry best practices']
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'HIPAA-compliant AI solutions for patient care and operational efficiency',
    icon: null, // Will be replaced with actual icon components
    caseStudies: [
      {
        id: 'healthcare-diagnostics',
        title: 'AI-Powered Diagnostic Support System',
        description: 'Improved diagnostic accuracy by 25% while reducing time to diagnosis',
        industry: 'healthcare',
        results: [
          '25% improvement in diagnostic accuracy',
          '30% reduction in diagnosis time',
          '95% physician satisfaction rate'
        ]
      }
    ],
    specificServices: [
      {
        id: 'clinical-decision-support',
        icon: null,
        title: 'Clinical Decision Support',
        description: 'AI-assisted clinical decision making and diagnosis',
        bullets: ['Diagnostic accuracy', 'Treatment recommendations', 'Risk assessment']
      },
      {
        id: 'medical-imaging',
        icon: null,
        title: 'Medical Imaging Analysis',
        description: 'AI-powered medical image analysis and interpretation',
        bullets: ['Image analysis', 'Pattern recognition', 'Automated reporting']
      },
      {
        id: 'patient-flow',
        icon: null,
        title: 'Patient Flow Optimization',
        description: 'Optimize patient scheduling and resource allocation',
        bullets: ['Schedule optimization', 'Resource management', 'Wait time reduction']
      },
      {
        id: 'drug-discovery',
        icon: null,
        title: 'Drug Discovery Acceleration',
        description: 'AI-accelerated drug discovery and development',
        bullets: ['Compound identification', 'Clinical trial optimization', 'Safety analysis']
      }
    ],
    complianceRequirements: ['HIPAA', 'FDA regulations', 'HL7 standards']
  },
  {
    id: 'financial',
    name: 'Financial Services',
    description: 'Secure AI solutions for risk management, fraud detection, and customer experience',
    icon: null, // Will be replaced with actual icon components
    caseStudies: [
      {
        id: 'financial-fraud',
        title: 'Real-time Fraud Detection System',
        description: 'Reduced fraud losses by 60% with AI-powered transaction monitoring',
        industry: 'financial',
        results: [
          '60% reduction in fraud losses',
          '0.1% false positive rate',
          '99.9% system uptime'
        ]
      }
    ],
    specificServices: [
      {
        id: 'fraud-detection',
        icon: null,
        title: 'Fraud Detection and Prevention',
        description: 'Real-time fraud detection and prevention systems',
        bullets: ['Real-time monitoring', 'Pattern recognition', 'Risk scoring']
      },
      {
        id: 'risk-modeling',
        icon: null,
        title: 'Risk Assessment and Modeling',
        description: 'Advanced risk modeling and assessment tools',
        bullets: ['Credit risk assessment', 'Market risk analysis', 'Regulatory compliance']
      },
      {
        id: 'algorithmic-trading',
        icon: null,
        title: 'Algorithmic Trading Optimization',
        description: 'AI-optimized trading strategies and execution',
        bullets: ['Strategy optimization', 'Market analysis', 'Execution efficiency']
      },
      {
        id: 'customer-personalization',
        icon: null,
        title: 'Customer Experience Personalization',
        description: 'Personalized financial services and recommendations',
        bullets: ['Product recommendations', 'Customer insights', 'Experience optimization']
      }
    ],
    complianceRequirements: ['SOX', 'PCI DSS', 'Basel III', 'GDPR']
  },
  {
    id: 'public-sector',
    name: 'Public Sector',
    description: 'Transparent and accountable AI solutions for government and public services',
    icon: null, // Will be replaced with actual icon components
    caseStudies: [
      {
        id: 'public-services',
        title: 'Citizen Services Optimization',
        description: 'Improved service delivery efficiency by 45% through AI-powered process automation',
        industry: 'public-sector',
        results: [
          '45% improvement in service delivery',
          '70% reduction in processing time',
          '90% citizen satisfaction rate'
        ]
      }
    ],
    specificServices: [
      {
        id: 'service-automation',
        icon: null,
        title: 'Public Service Automation',
        description: 'Automated public service processes and workflows',
        bullets: ['Process automation', 'Efficiency improvement', 'Cost reduction']
      },
      {
        id: 'citizen-engagement',
        icon: null,
        title: 'Citizen Engagement Platforms',
        description: 'AI-powered citizen engagement and communication platforms',
        bullets: ['Digital services', 'Communication optimization', 'Feedback analysis']
      },
      {
        id: 'resource-allocation',
        icon: null,
        title: 'Resource Allocation Optimization',
        description: 'Optimize allocation of public resources and services',
        bullets: ['Resource optimization', 'Budget planning', 'Service distribution']
      },
      {
        id: 'transparency-tools',
        icon: null,
        title: 'Transparency and Accountability Tools',
        description: 'Tools for government transparency and accountability',
        bullets: ['Data transparency', 'Performance tracking', 'Public reporting']
      }
    ],
    complianceRequirements: ['FISMA', 'Section 508', 'Privacy Act', 'FOIA']
  }
];

/**
 * Industry data configuration for content management
 */
export const INDUSTRY_DATA = INDUSTRIES;