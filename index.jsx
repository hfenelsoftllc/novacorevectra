'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Cpu, Workflow } from 'lucide-react';

export default function ServicesOverview() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100'>
      {/* Hero */}
      <section className='max-w-7xl mx-auto px-6 py-24 text-center'>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='text-5xl font-semibold tracking-tight'
        >
          Trusted AI for Business Process Transformation
        </motion.h1>
        <p className='mt-6 text-lg text-slate-300 max-w-3xl mx-auto'>
          NovaCoreVectra delivers strategy-led, standards-aligned AI solutions
          that integrate seamlessly into enterprise operations—securely,
          responsibly, and at scale.
        </p>
        <div className='mt-10 flex justify-center gap-4'>
          <Button size='lg'>Explore Our Services</Button>
          <Button size='lg' variant='outline'>
            Executive Brief
          </Button>
        </div>
      </section>

      {/* Services */}
      <section className='max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-8'>
        <ServiceCard
          icon={<Workflow className='h-8 w-8' />}
          title='Business Process Strategy'
          description='Align AI initiatives with operational priorities through process discovery,
          value-stream optimization, and AI-enabled target operating models.'
          bullets={[
            'AI opportunity prioritization',
            'Process redesign & automation',
            'AI readiness & maturity assessment',
          ]}
        />
        <ServiceCard
          icon={<Cpu className='h-8 w-8' />}
          title='AI Solution Implementation'
          description='Design and deploy production-grade AI solutions built for transparency,
          scalability, and performance.'
          bullets={[
            'ML, GenAI, RAG & hybrid architectures',
            'Responsible AI & explainability',
            'MLOps & lifecycle management',
          ]}
        />
        <ServiceCard
          icon={<ShieldCheck className='h-8 w-8' />}
          title='Enterprise Integration & Governance'
          description='Operationalize AI within enterprise systems while meeting regulatory,
          security, and compliance requirements.'
          bullets={[
            'ERP, CRM & workflow integration',
            'Security, privacy & access controls',
            'Monitoring, audit & risk management',
          ]}
        />
      </section>

      {/* Standards */}
      <section className='bg-slate-900/60 border-t border-slate-800'>
        <div className='max-w-7xl mx-auto px-6 py-20 text-center'>
          <h2 className='text-3xl font-semibold'>
            Standards-Aligned. Audit-Ready.
          </h2>
          <p className='mt-4 text-slate-300 max-w-2xl mx-auto'>
            Our delivery framework is aligned with globally recognized AI and
            security standards to ensure trust, accountability, and resilience.
          </p>
          <div className='mt-10 grid sm:grid-cols-3 gap-6'>
            {[
              'NIST AI Risk Management Framework',
              'AIMS / ISO-aligned AI Management System',
              'ISO 27001 & SOC 2 Alignment',
            ].map(item => (
              <Card key={item} className='bg-slate-950 border-slate-800'>
                <CardContent className='p-6 text-slate-200'>{item}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='max-w-7xl mx-auto px-6 py-24 text-center'>
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-3xl font-semibold'
        >
          Build AI You Can Trust
        </motion.h3>
        <p className='mt-4 text-slate-300 max-w-2xl mx-auto'>
          Partner with NovaCoreVectra to transform business processes with
          governed, enterprise-ready AI.
        </p>
        <div className='mt-8'>
          <Button size='lg' className='gap-2'>
            Contact Us <ArrowRight className='h-4 w-4' />
          </Button>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ icon, title, description, bullets }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className='h-full bg-slate-950 border-slate-700'>
        <CardContent className='p-8'>
          <div className='mb-4 text-indigo-300'>{icon}</div>
          <h3 className='text-xl font-semibold text-slate-100'>{title}</h3>
          <p className='mt-3 text-slate-200'>{description}</p>
          <ul className='mt-4 space-y-2 text-sm text-slate-200 list-disc list-inside'>
            {bullets.map(b => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
