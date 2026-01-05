import { ComplianceFramework } from '../types/compliance';

/**
 * ISO 42001 compliance framework configuration
 */
export const ISO_42001_FRAMEWORK: ComplianceFramework = {
  id: 'iso-42001',
  name: 'ISO/IEC 42001:2023',
  version: '2023',
  certificationLevel: 'Certified',
  clauses: [
    {
      id: 'clause-4',
      clauseNumber: '4',
      title: 'Context of the Organization',
      description: 'Understanding organizational context and stakeholder needs for AI systems',
      requirements: [
        'Identify internal and external issues affecting AI systems',
        'Determine interested parties and their requirements',
        'Define scope of AI management system'
      ],
      mappedServices: ['business-process-strategy'],
      documentationUrl: '/docs/iso-42001-clause-4.pdf'
    },
    {
      id: 'clause-5',
      clauseNumber: '5',
      title: 'Leadership',
      description: 'Leadership commitment and AI governance structure',
      requirements: [
        'Demonstrate leadership commitment to AI management',
        'Establish AI policy and governance structure',
        'Assign roles and responsibilities for AI systems'
      ],
      mappedServices: ['enterprise-integration-governance'],
      documentationUrl: '/docs/iso-42001-clause-5.pdf'
    },
    {
      id: 'clause-6',
      clauseNumber: '6',
      title: 'Planning',
      description: 'Risk management and planning for AI systems',
      requirements: [
        'Identify and assess AI-related risks and opportunities',
        'Plan actions to address risks and opportunities',
        'Set AI objectives and plan to achieve them'
      ],
      mappedServices: ['business-process-strategy'],
      documentationUrl: '/docs/iso-42001-clause-6.pdf'
    },
    {
      id: 'clause-7',
      clauseNumber: '7',
      title: 'Support',
      description: 'Resources, competence, and communication for AI systems',
      requirements: [
        'Provide necessary resources for AI management',
        'Ensure competence of personnel working with AI',
        'Establish communication processes for AI systems'
      ],
      mappedServices: ['enterprise-integration-governance'],
      documentationUrl: '/docs/iso-42001-clause-7.pdf'
    },
    {
      id: 'clause-8',
      clauseNumber: '8',
      title: 'Operation',
      description: 'Operational planning and control of AI systems',
      requirements: [
        'Plan and control AI system operations',
        'Implement AI system lifecycle processes',
        'Manage AI system changes and updates'
      ],
      mappedServices: ['ai-solution-implementation'],
      documentationUrl: '/docs/iso-42001-clause-8.pdf'
    },
    {
      id: 'clause-9',
      clauseNumber: '9',
      title: 'Performance Evaluation',
      description: 'Monitoring, measurement, and evaluation of AI systems',
      requirements: [
        'Monitor and measure AI system performance',
        'Conduct internal audits of AI management system',
        'Review AI management system effectiveness'
      ],
      mappedServices: ['enterprise-integration-governance'],
      documentationUrl: '/docs/iso-42001-clause-9.pdf'
    },
    {
      id: 'clause-10',
      clauseNumber: '10',
      title: 'Improvement',
      description: 'Continuous improvement of AI systems and management',
      requirements: [
        'Address nonconformities in AI systems',
        'Implement corrective actions for AI issues',
        'Continuously improve AI management system'
      ],
      mappedServices: ['ai-solution-implementation'],
      documentationUrl: '/docs/iso-42001-clause-10.pdf'
    }
  ]
};