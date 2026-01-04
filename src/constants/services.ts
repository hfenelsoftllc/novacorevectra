import * as React from 'react';
import { Workflow, Cpu, ShieldCheck } from 'lucide-react';
import { Service } from '../types/services';

/**
 * Service offerings data
 */
export const SERVICES: Service[] = [
  {
    id: 'business-process-strategy',
    icon: React.createElement(Workflow, { className: 'h-8 w-8' }),
    title: 'Business Process Strategy',
    description:
      'Align AI initiatives with operational priorities through process discovery, value-stream optimization, and AI-enabled target operating models.',
    bullets: [
      'AI opportunity prioritization',
      'Process redesign & automation',
      'AI readiness & maturity assessment',
    ],
  },
  {
    id: 'ai-solution-implementation',
    icon: React.createElement(Cpu, { className: 'h-8 w-8' }),
    title: 'AI Solution Implementation',
    description:
      'Design and deploy production-grade AI solutions built for transparency, scalability, and performance.',
    bullets: [
      'ML, GenAI, RAG & hybrid architectures',
      'Responsible AI & explainability',
      'MLOps & lifecycle management',
    ],
  },
  {
    id: 'enterprise-integration-governance',
    icon: React.createElement(ShieldCheck, { className: 'h-8 w-8' }),
    title: 'Enterprise Integration & Governance',
    description:
      'Operationalize AI within enterprise systems while meeting regulatory, security, and compliance requirements.',
    bullets: [
      'ERP, CRM & workflow integration',
      'Security, privacy & access controls',
      'Monitoring, audit & risk management',
    ],
  },
];
