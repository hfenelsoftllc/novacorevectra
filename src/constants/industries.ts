import { Industry } from '../types/industry';

/**
 * Industry variants configuration with case studies and specific services
 */
export const INDUSTRIES: Industry[] = [
  {
    id: 'aviation',
    name: 'Aviation',
    description: 'AI solutions for safety, efficiency, and regulatory compliance in aviation',
    icon: null, // Will be replaced with actual icon components
    caseStudies: [
      {
        id: 'aviation-maintenance',
        title: 'Predictive Maintenance for Commercial Fleet',
        description: 'Reduced unscheduled maintenance by 40% using AI-powered predictive analytics',
        industry: 'aviation',
        results: [
          '40% reduction in unscheduled maintenance',
          '$2.3M annual cost savings',
          '99.7% fleet availability'
        ]
      }
    ],
    specificServices: [
      {
        id: 'predictive-maintenance',
        icon: null,
        title: 'Predictive Maintenance Systems',
        description: 'AI-powered maintenance scheduling and failure prediction',
        bullets: ['Reduce downtime', 'Optimize maintenance costs', 'Improve safety']
      },
      {
        id: 'flight-optimization',
        icon: null,
        title: 'Flight Operations Optimization',
        description: 'Optimize flight paths, fuel consumption, and scheduling',
        bullets: ['Fuel efficiency', 'Route optimization', 'Schedule management']
      },
      {
        id: 'safety-assessment',
        icon: null,
        title: 'Safety Risk Assessment',
        description: 'AI-driven safety analysis and risk mitigation',
        bullets: ['Risk identification', 'Safety compliance', 'Incident prevention']
      },
      {
        id: 'regulatory-compliance',
        icon: null,
        title: 'Regulatory Compliance Automation',
        description: 'Automated compliance monitoring and reporting',
        bullets: ['Compliance tracking', 'Automated reporting', 'Audit preparation']
      }
    ],
    complianceRequirements: ['FAA regulations', 'EASA standards', 'ICAO guidelines']
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