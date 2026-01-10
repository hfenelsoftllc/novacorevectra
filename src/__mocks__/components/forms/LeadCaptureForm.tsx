import React from 'react';

interface LeadCaptureFormProps {
  variant: string;
  onSubmit: (data: any) => Promise<void>;
  showProgressiveFields?: boolean;
  className?: string;
  existingData?: any;
}

export const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({
  variant,
  onSubmit,
  showProgressiveFields = false,
  className,
  existingData,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = {};
    
    // Extract form data based on variant
    if (variant === 'newsletter') {
      data.firstName = formData.get('firstName') || '';
      data.email = formData.get('email') || '';
      data.interests = formData.getAll('interests') || [];
      data.frequency = formData.get('frequency') || '';
    } else if (variant === 'contact') {
      data.firstName = formData.get('firstName') || '';
      data.lastName = formData.get('lastName') || '';
      data.email = formData.get('email') || '';
      data.company = formData.get('company') || '';
      data.subject = formData.get('subject') || '';
      data.message = formData.get('message') || undefined;
    } else {
      // Lead capture, demo, consultation variants
      data.firstName = formData.get('firstName') || '';
      data.lastName = formData.get('lastName') || '';
      data.email = formData.get('email') || '';
      data.company = formData.get('company') || '';
      data.jobTitle = formData.get('jobTitle') || '';
      data.industry = formData.get('industry') || '';
      data.projectType = formData.get('projectType') || '';
      data.budget = formData.get('budget') || '';
      data.timeline = formData.get('timeline') || '';
      data.message = formData.get('message') || undefined;
    }
    
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getButtonText = () => {
    if (isSubmitting) return 'Submitting...';
    switch (variant) {
      case 'newsletter': return 'Subscribe';
      case 'contact': return 'Send Message';
      case 'demo': return 'Request Demo';
      case 'consultation': return 'Schedule Consultation';
      default: return 'Submit';
    }
  };

  return (
    <div data-testid="lead-capture-form" className={className}>
      <form onSubmit={handleSubmit}>
        {/* Newsletter Form */}
        {variant === 'newsletter' && (
          <>
            <div>
              <label htmlFor="firstName">First Name *</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                defaultValue={existingData?.firstName || ''}
                data-testid="firstName-input"
              />
            </div>
            <div>
              <label htmlFor="email">Email Address *</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={existingData?.email || ''}
                data-testid="email-input"
              />
            </div>
            <div>
              <label>Interests</label>
              <label>
                <input type="checkbox" name="interests" value="ai-governance" data-testid="interests-ai-governance" />
                AI Governance
              </label>
              <label>
                <input type="checkbox" name="interests" value="industry-trends" data-testid="interests-industry-trends" />
                Industry Trends
              </label>
            </div>
            <div>
              <label htmlFor="frequency">Email Frequency</label>
              <select id="frequency" name="frequency" data-testid="frequency-select">
                <option value="">Select frequency</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
          </>
        )}

        {/* Contact Form */}
        {variant === 'contact' && (
          <>
            <div>
              <label htmlFor="firstName">First Name *</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                defaultValue={existingData?.firstName || ''}
                data-testid="firstName-input"
              />
            </div>
            <div>
              <label htmlFor="lastName">Last Name *</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                defaultValue={existingData?.lastName || ''}
                data-testid="lastName-input"
              />
            </div>
            <div>
              <label htmlFor="email">Email Address *</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={existingData?.email || ''}
                data-testid="email-input"
              />
            </div>
            <div>
              <label htmlFor="company">Company *</label>
              <input
                id="company"
                name="company"
                type="text"
                required
                defaultValue={existingData?.company || ''}
                data-testid="company-input"
              />
            </div>
            <div>
              <label htmlFor="subject">Subject *</label>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                defaultValue={existingData?.subject || ''}
                data-testid="subject-input"
              />
            </div>
            <div>
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                required
                defaultValue={existingData?.message || ''}
                data-testid="message-textarea"
              />
            </div>
          </>
        )}

        {/* Lead Capture, Demo, Consultation Forms */}
        {(variant === 'lead-capture' || variant === 'demo' || variant === 'consultation') && (
          <>
            <div>
              <label htmlFor="firstName">First Name *</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                defaultValue={existingData?.firstName || ''}
                data-testid="firstName-input"
              />
            </div>
            <div>
              <label htmlFor="lastName">Last Name *</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                defaultValue={existingData?.lastName || ''}
                data-testid="lastName-input"
              />
            </div>
            <div>
              <label htmlFor="email">Email Address *</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={existingData?.email || ''}
                data-testid="email-input"
              />
            </div>
            <div>
              <label htmlFor="company">Company *</label>
              <input
                id="company"
                name="company"
                type="text"
                required
                defaultValue={existingData?.company || ''}
                data-testid="company-input"
              />
            </div>
            <div>
              <label htmlFor="jobTitle">Job Title *</label>
              <input
                id="jobTitle"
                name="jobTitle"
                type="text"
                required
                defaultValue={existingData?.jobTitle || ''}
                data-testid="jobTitle-input"
              />
            </div>
            <div>
              <label htmlFor="industry">Industry *</label>
              <select id="industry" name="industry" required data-testid="industry-select">
                <option value="">Select industry</option>
                <option value="airlines">Airlines</option>
                <option value="healthcare">Healthcare</option>
                <option value="financial">Financial Services</option>
                <option value="public-sector">Public Sector</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="technology">Technology</option>
                <option value="retail">Retail</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="projectType">Project Type *</label>
              <select id="projectType" name="projectType" required data-testid="projectType-select">
                <option value="">Select project type</option>
                <option value="ai-strategy">AI Strategy & Planning</option>
                <option value="ai-implementation">AI Implementation</option>
                <option value="ai-governance">AI Governance</option>
                <option value="risk-assessment">Risk Assessment</option>
                <option value="compliance">Compliance & Auditing</option>
                <option value="training">Training & Development</option>
                <option value="other">Other</option>
              </select>
            </div>
            {showProgressiveFields && (
              <>
                <div>
                  <label htmlFor="budget">Budget Range</label>
                  <select id="budget" name="budget" data-testid="budget-select">
                    <option value="">Select budget range</option>
                    <option value="under-50k">Under $50,000</option>
                    <option value="50k-100k">$50,000 - $100,000</option>
                    <option value="100k-250k">$100,000 - $250,000</option>
                    <option value="250k-500k">$250,000 - $500,000</option>
                    <option value="over-500k">Over $500,000</option>
                    <option value="not-sure">Not sure yet</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="timeline">Timeline</label>
                  <select id="timeline" name="timeline" data-testid="timeline-select">
                    <option value="">Select timeline</option>
                    <option value="immediate">Immediate (within 1 month)</option>
                    <option value="1-3-months">1-3 months</option>
                    <option value="3-6-months">3-6 months</option>
                    <option value="6-12-months">6-12 months</option>
                    <option value="over-12-months">Over 12 months</option>
                    <option value="exploring">Just exploring options</option>
                  </select>
                </div>
              </>
            )}
            <div>
              <label htmlFor="message">Additional Information</label>
              <textarea
                id="message"
                name="message"
                defaultValue={existingData?.message || ''}
                data-testid="message-textarea"
              />
            </div>
          </>
        )}

        <button type="submit" disabled={isSubmitting} data-testid="submit-button">
          {getButtonText()}
        </button>

        <p data-testid="privacy-notice">
          By submitting this form, you agree to our privacy policy and terms of service.
          We will never share your information with third parties.
        </p>
      </form>
    </div>
  );
};