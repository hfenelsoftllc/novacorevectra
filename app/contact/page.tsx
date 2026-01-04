'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { ErrorBoundary, CTASection } from '@/components';

/**
 * ContactPage component - Contact information and lead capture forms
 * Implements page transitions with Framer Motion
 */
const ContactPage: React.FC = () => {
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    jobTitle: '',
    industry: '',
    projectType: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = React.useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // TODO: Implement actual form submission logic
      console.log('Form submitted:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        jobTitle: '',
        industry: '',
        projectType: '',
        message: ''
      });
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

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
              Contact Us
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Ready to transform your business with responsible AI? Let&apos;s discuss how 
              NovaCoreVectra can help you achieve your goals.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              aria-labelledby="contact-form-title"
            >
              <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
                <h2 id="contact-form-title" className="text-2xl font-semibold text-foreground mb-6">
                  Get in Touch
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="john.doe@company.com"
                    />
                  </div>

                  {/* Company and Job Title */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                        Company *
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Your Company"
                      />
                    </div>
                    <div>
                      <label htmlFor="jobTitle" className="block text-sm font-medium text-foreground mb-2">
                        Job Title
                      </label>
                      <input
                        type="text"
                        id="jobTitle"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Your Role"
                      />
                    </div>
                  </div>

                  {/* Industry and Project Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="industry" className="block text-sm font-medium text-foreground mb-2">
                        Industry
                      </label>
                      <select
                        id="industry"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Select Industry</option>
                        <option value="aviation">Aviation</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="financial">Financial Services</option>
                        <option value="public-sector">Public Sector</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="projectType" className="block text-sm font-medium text-foreground mb-2">
                        Project Type
                      </label>
                      <select
                        id="projectType"
                        name="projectType"
                        value={formData.projectType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Select Project Type</option>
                        <option value="strategy">AI Strategy</option>
                        <option value="implementation">Implementation</option>
                        <option value="governance">Governance</option>
                        <option value="consultation">General Consultation</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
                      placeholder="Tell us about your project or questions..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>

                  {/* Status Messages */}
                  {submitStatus === 'success' && (
                    <div className="text-green-400 text-sm text-center">
                      Thank you! Your message has been sent successfully.
                    </div>
                  )}
                  {submitStatus === 'error' && (
                    <div className="text-red-400 text-sm text-center">
                      Sorry, there was an error sending your message. Please try again.
                    </div>
                  )}
                </form>
              </div>
            </motion.section>

            {/* Contact Information */}
            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              aria-labelledby="contact-info-title"
            >
              <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 h-fit">
                <h2 id="contact-info-title" className="text-2xl font-semibold text-foreground mb-6">
                  Let&apos;s Connect
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Response Time</h3>
                    <p className="text-muted-foreground">
                      We typically respond to inquiries within 24 hours during business days.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">What to Expect</h3>
                    <ul className="text-muted-foreground space-y-2">
                      <li className="flex items-start">
                        <span className="text-primary mr-2 mt-1">•</span>
                        Initial consultation to understand your needs
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2 mt-1">•</span>
                        Customized proposal based on your requirements
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2 mt-1">•</span>
                        Clear timeline and next steps
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Industries We Serve</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Aviation', 'Healthcare', 'Financial Services', 'Public Sector'].map((industry) => (
                        <span
                          key={industry}
                          className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full"
                        >
                          {industry}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-700">
                    <h3 className="text-lg font-medium text-foreground mb-4">Ready to Get Started?</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Schedule a consultation to discuss your AI transformation journey.
                    </p>
                    <button
                      onClick={() => {
                        // TODO: Implement calendar booking
                        console.log('Schedule consultation clicked');
                      }}
                      className="w-full bg-slate-700 text-foreground px-4 py-2 rounded-lg font-medium hover:bg-slate-600 transition-colors border border-slate-600"
                    >
                      Schedule Consultation
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>

          {/* Newsletter CTA Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-16"
          >
            <CTASection
              variant='newsletter'
              title='Stay Updated on AI Trends'
              description='Subscribe to our newsletter for the latest insights on AI governance, trends, and best practices.'
              showLeadCapture={true}
            />
          </motion.section>
        </div>
      </motion.div>
    </ErrorBoundary>
  );
};

export default ContactPage;