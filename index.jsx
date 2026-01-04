'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Cpu, Workflow } from 'lucide-react';

export default function ServicesOverview() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100'>
      {/* Skip to main content link for screen readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      {/* Main content */}
      <main id="main-content" role="main">
        {/* Hero */}
        <section 
          className='max-w-7xl mx-auto px-6 py-24 text-center'
          aria-labelledby="hero-title"
          role="banner"
        >
          <motion.h1
            id="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-5xl font-semibold tracking-tight'
          >
            Trusted AI for Business Process Transformation
          </motion.h1>
          <p 
            className='mt-6 text-lg text-slate-300 max-w-3xl mx-auto'
            aria-describedby="hero-title"
          >
            NovaCoreVectra delivers strategy-led, standards-aligned AI solutions
            that integrate seamlessly into enterprise operations—securely,
            responsibly, and at scale.
          </p>
          <div 
            className='mt-10 flex justify-center gap-4'
            role="group"
            aria-label="Hero section actions"
          >
            <Button 
              size='lg'
              aria-label="Explore Our Services - Learn more about our AI solutions"
            >
              Explore Our Services
            </Button>
            <Button 
              size='lg' 
              variant='outline'
              aria-label="Executive Brief - Download our executive summary"
            >
              Executive Brief
            </Button>
          </div>
        </section>

        {/* Services */}
        <section 
          className='max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-8'
          aria-labelledby="services-heading"
          role="region"
          aria-label="Our services"
        >
          <h2 id="services-heading" className="sr-only">Our Services</h2>
          <div role="list" aria-label="List of services offered">
            <div role="listitem">
              <ServiceCard
                icon={<Workflow className='h-8 w-8' aria-hidden="true" />}
                title='Business Process Strategy'
                description='Align AI initiatives with operational priorities through process discovery,
                value-stream optimization, and AI-enabled target operating models.'
                bullets={[
                  'AI opportunity prioritization',
                  'Process redesign & automation',
                  'AI readiness & maturity assessment',
                ]}
              />
            </div>
            <div role="listitem">
              <ServiceCard
                icon={<Cpu className='h-8 w-8' aria-hidden="true" />}
                title='AI Solution Implementation'
                description='Design and deploy production-grade AI solutions built for transparency,
                scalability, and performance.'
                bullets={[
                  'ML, GenAI, RAG & hybrid architectures',
                  'Responsible AI & explainability',
                  'MLOps & lifecycle management',
                ]}
              />
            </div>
            <div role="listitem">
              <ServiceCard
                icon={<ShieldCheck className='h-8 w-8' aria-hidden="true" />}
                title='Enterprise Integration & Governance'
                description='Operationalize AI within enterprise systems while meeting regulatory,
                security, and compliance requirements.'
                bullets={[
                  'ERP, CRM & workflow integration',
                  'Security, privacy & access controls',
                  'Monitoring, audit & risk management',
                ]}
              />
            </div>
          </div>
        </section>

        {/* Standards */}
        <section 
          className='bg-slate-900/60 border-t border-slate-800'
          aria-labelledby="standards-heading"
          role="region"
          aria-label="Compliance standards"
        >
          <div className='max-w-7xl mx-auto px-6 py-20 text-center'>
            <header className="mb-10">
              <h2 id="standards-heading" className='text-3xl font-semibold'>
                Standards-Aligned. Audit-Ready.
              </h2>
              <p className='mt-4 text-slate-300 max-w-2xl mx-auto'>
                Our delivery framework is aligned with globally recognized AI and
                security standards to ensure trust, accountability, and resilience.
              </p>
            </header>
            <div 
              className='mt-10 grid sm:grid-cols-3 gap-6'
              role="list"
              aria-label="List of compliance standards"
            >
              {[
                'NIST AI Risk Management Framework',
                'AIMS / ISO-aligned AI Management System',
                'ISO 27001 & SOC 2 Alignment',
              ].map((item, index) => (
                <Card 
                  key={item} 
                  className='bg-slate-950 border-slate-800'
                  role="listitem"
                  tabIndex={0}
                  aria-label={`Standard: ${item}`}
                >
                  <CardContent className='p-6 text-slate-200'>{item}</CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section 
          className='max-w-7xl mx-auto px-6 py-24 text-center'
          aria-labelledby="cta-heading"
          role="region"
          aria-label="Call to action"
        >
          <motion.h3
            id="cta-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='text-3xl font-semibold'
          >
            Build AI You Can Trust
          </motion.h3>
          <p 
            className='mt-4 text-slate-300 max-w-2xl mx-auto'
            aria-describedby="cta-heading"
          >
            Partner with NovaCoreVectra to transform business processes with
            governed, enterprise-ready AI.
          </p>
          <div className='mt-8'>
            <Button 
              size='lg' 
              className='gap-2'
              aria-label="Contact Us - Get in touch to start your AI transformation"
            >
              Contact Us 
              <ArrowRight className='h-4 w-4' aria-hidden="true" />
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

function ServiceCard({ icon, title, description, bullets }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      role="article"
      tabIndex={0}
      aria-labelledby={`service-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
      aria-describedby={`service-description-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <Card className='h-full bg-slate-950 border-slate-700'>
        <CardContent className='p-8'>
          <div className='mb-4 text-indigo-300' aria-hidden="true">
            {icon}
          </div>
          <h3 
            id={`service-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
            className='text-xl font-semibold text-slate-100'
          >
            {title}
          </h3>
          <p 
            id={`service-description-${title.replace(/\s+/g, '-').toLowerCase()}`}
            className='mt-3 text-slate-200'
          >
            {description}
          </p>
          <ul 
            className='mt-4 space-y-2 text-sm text-slate-200 list-disc list-inside'
            aria-label={`Key features of ${title}`}
          >
            {bullets.map(b => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
