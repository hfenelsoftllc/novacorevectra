import React from 'react';

interface ExecutiveBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const ExecutiveBriefModal: React.FC<ExecutiveBriefModalProps> = ({
  isOpen,
  onClose,
  className,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      firstName: formData.get('firstName') || '',
      lastName: formData.get('lastName') || '',
      email: formData.get('email') || '',
      company: formData.get('company') || '',
      jobTitle: formData.get('jobTitle') || '',
      industry: formData.get('industry') || '',
      message: formData.get('message') || '',
    };
    
    try {
      // Mock the email service call
      const { emailService } = require('@/services/emailService');
      const success = await emailService.sendExecutiveBriefRequest(data);
      
      if (success) {
        setIsSubmitted(true);
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        throw new Error('Failed to send request');
      }
    } catch (error) {
      console.error('Error submitting executive brief request:', error);
      alert('There was an error submitting your request. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto ${className || ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Request Executive Brief
            </h3>
            <p className="text-sm text-gray-500">
              Get our comprehensive AI strategy document
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Request Submitted Successfully!
              </h4>
              <p className="text-gray-600 mb-4">
                Thank you for your interest. Our executive brief will be sent to your email address within 24 hours.
              </p>
              <p className="text-sm text-gray-500">
                This window will close automatically in a few seconds.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-600 text-sm">
                  Our executive brief provides a comprehensive overview of AI strategy, implementation frameworks, and governance best practices. Please fill out the form below and we'll send it to your email address.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label htmlFor="email">Email Address *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label htmlFor="company">Company *</label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label htmlFor="jobTitle">Job Title</label>
                  <input
                    id="jobTitle"
                    name="jobTitle"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label htmlFor="industry">Industry</label>
                  <select
                    id="industry"
                    name="industry"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
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
                  <label htmlFor="message">Additional Information</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting Request...' : 'Request Executive Brief'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By submitting this form, you agree to receive the executive brief document via email. 
                  We will not share your information with third parties.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};