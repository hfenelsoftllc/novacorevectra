'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { ErrorBoundary } from '@/components';

/**
 * AboutPage component - Company information and team details
 * Implements page transitions with Framer Motion
 */
const AboutPage: React.FC = () => {
  const handleContactTeam = React.useCallback(() => {
    window.location.href = '/contact';
  }, []);

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100"
      >
        <div className="container mx-auto px-4 py-12">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6">
              About NovaCoreVectra
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Empowering organizations to lead the AI era through world-class strategy 
              and ethical innovation. We build intelligent systems that transform business operations.
            </p>
          </motion.div>

          {/* Mission Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-16"
            aria-labelledby="mission-title"
          >
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
              <h2 id="mission-title" className="text-3xl font-semibold text-foreground mb-6 text-center">
                Our Mission
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed text-center max-w-4xl mx-auto">
                To empower organizations to lead the AI era by fusing world-class strategy with ethical innovation. 
                We believe that artificial intelligence should augment human capabilities, drive business value, 
                and operate within robust governance frameworks that ensure responsible deployment.
              </p>
            </div>
          </motion.section>

          {/* Values Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-16"
            aria-labelledby="values-title"
          >
            <h2 id="values-title" className="text-3xl font-semibold text-foreground mb-12 text-center">
              Our Values
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Ethical Innovation",
                  description: "We prioritize responsible AI development that respects human values and societal impact.",
                  icon: "🛡️"
                },
                {
                  title: "Excellence",
                  description: "We deliver world-class solutions through rigorous standards and continuous improvement.",
                  icon: "⭐"
                },
                {
                  title: "Transparency",
                  description: "We believe in open communication and explainable AI systems that build trust.",
                  icon: "🔍"
                },
                {
                  title: "Collaboration",
                  description: "We work closely with our clients as partners in their AI transformation journey.",
                  icon: "🤝"
                },
                {
                  title: "Innovation",
                  description: "We stay at the forefront of AI technology to deliver cutting-edge solutions.",
                  icon: "🚀"
                },
                {
                  title: "Governance",
                  description: "We ensure all AI implementations follow robust governance and compliance frameworks.",
                  icon: "📋"
                }
              ].map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                  className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 text-center"
                >
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Expertise Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mb-16"
            aria-labelledby="expertise-title"
          >
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
              <h2 id="expertise-title" className="text-3xl font-semibold text-foreground mb-8 text-center">
                Our Expertise
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Industries We Serve</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center">
                      <span className="text-primary mr-2">✈️</span>
                      Aviation & Aerospace
                    </li>
                    <li className="flex items-center">
                      <span className="text-primary mr-2">🏥</span>
                      Healthcare & Life Sciences
                    </li>
                    <li className="flex items-center">
                      <span className="text-primary mr-2">💰</span>
                      Financial Services
                    </li>
                    <li className="flex items-center">
                      <span className="text-primary mr-2">🏛️</span>
                      Public Sector & Government
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Core Capabilities</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center">
                      <span className="text-primary mr-2">🎯</span>
                      AI Strategy & Roadmapping
                    </li>
                    <li className="flex items-center">
                      <span className="text-primary mr-2">⚙️</span>
                      System Implementation
                    </li>
                    <li className="flex items-center">
                      <span className="text-primary mr-2">🛡️</span>
                      Governance & Compliance
                    </li>
                    <li className="flex items-center">
                      <span className="text-primary mr-2">📊</span>
                      Risk Management
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-center"
          >
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
              <h2 className="text-3xl font-semibold text-foreground mb-4">
                Ready to Transform Your Business?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Let&apos;s discuss how NovaCoreVectra can help you implement responsible AI solutions 
                that drive real business value.
              </p>
              <button
                onClick={handleContactTeam}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Contact Our Team
              </button>
            </div>
          </motion.section>
        </div>
      </motion.div>
    </ErrorBoundary>
  );
};

export default AboutPage;