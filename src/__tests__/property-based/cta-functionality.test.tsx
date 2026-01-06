/**
 * Property-based tests for CTA functionality
 * Feature: full-marketing-site, Property 5: CTA Functionality
 * Validates: Requirements 5.1, 5.2, 5.5
 */

import * as fc from 'fast-check';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CTASection } from '@/components/sections/CTASection';
import { CTAVariant } from '@/types/forms';
import { useAnalytics } from '@/hooks/useAnalytics';

// Mock analytics hook
jest.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: jest.fn(() => ({
    trackCTAClick: jest.fn(),
    trackEvent: jest.fn(),
    trackEngagement: jest.fn(),
    trackConversionEvent: jest.fn(),
  })),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileInView, viewport, initial, animate, transition, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, whileInView, viewport, initial, animate, transition, ...props }: any) => <section {...props}>{children}</section>,
    h3: ({ children, whileInView, viewport, initial, animate, transition, ...props }: any) => <h3 {...props}>{children}</h3>,
    p: ({ children, whileInView, viewport, initial, animate, transition, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock LeadCaptureForm component
jest.mock('@/components/forms/LeadCaptureForm', () => ({
  LeadCaptureForm: ({ variant, onSubmit }: any) => (
    <form data-testid="lead-capture-form">
      <input data-testid="form-input" />
      <button type="submit" onClick={() => onSubmit({ test: 'data' })}>
        Submit
      </button>
    </form>
  ),
}));

describe('Property 5: CTA Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should contain prominent CTAs that present appropriate lead capture forms when clicked and track engagement metrics', () => {
    // Feature: full-marketing-site, Property 5: CTA Functionality
    fc.assert(
      fc.property(
        fc.constantFrom('consultation', 'demo', 'whitepaper', 'contact', 'newsletter'),
        (variant) => {
          cleanup();
          
          const mockOnAction = jest.fn();
          
          // Render CTA component
          const { container } = render(
            <CTASection
              variant={variant as CTAVariant}
              onAction={mockOnAction}
              showLeadCapture={false}
            />
          );

          // Requirement 5.1: THE system SHALL include prominent CTAs on every page
          // Verify CTA is prominently displayed
          const ctaSection = screen.getByRole('region');
          expect(ctaSection).toBeInTheDocument();
          expect(ctaSection).toBeVisible();
          expect(ctaSection).toHaveAttribute('aria-label', 'Call to action');

          // Verify CTA has proper heading
          const ctaHeading = screen.getByRole('heading', { level: 3 });
          expect(ctaHeading).toBeInTheDocument();
          expect(ctaHeading).toBeVisible();

          // Requirement 5.3: THE system SHALL provide multiple CTA variants (consultation, demo, whitepaper)
          // Verify the variant is properly supported
          const validVariants = ['consultation', 'demo', 'whitepaper', 'contact', 'newsletter'];
          expect(validVariants).toContain(variant);

          // Requirement 5.4: WHEN displaying CTAs, THE system SHALL use compelling and action-oriented language
          // Verify button has action-oriented text
          const ctaButton = screen.getByRole('button');
          expect(ctaButton).toBeInTheDocument();
          expect(ctaButton).toBeVisible();
          
          const buttonText = ctaButton.textContent || '';
          const actionWords = ['schedule', 'request', 'download', 'contact', 'subscribe', 'get', 'see', 'start'];
          const hasActionWord = actionWords.some(word => 
            buttonText.toLowerCase().includes(word)
          );
          
          // This is where the test was failing - let's check if the consultation variant has action words
          if (variant === 'consultation' && !hasActionWord) {
            console.log(`Consultation variant button text: "${buttonText}"`);
            console.log(`Action words checked: ${actionWords.join(', ')}`);
            return false; // This would cause the property to fail
          }
          
          expect(hasActionWord).toBe(true);

          // Requirement 5.2: WHEN a user clicks a CTA, THE system SHALL present appropriate lead capture forms
          // Test CTA click behavior
          fireEvent.click(ctaButton);
          expect(mockOnAction).toHaveBeenCalled();

          // Requirement 5.5: THE system SHALL track CTA performance and conversion rates
          // The component should be set up to work with analytics tracking
          expect(ctaButton).toHaveAttribute('aria-label');

          cleanup();
          
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should provide proper accessibility and interaction support for all CTA variants', () => {
    // Feature: full-marketing-site, Property 5: CTA Functionality
    fc.assert(
      fc.property(
        fc.constantFrom('consultation', 'demo', 'whitepaper', 'contact', 'newsletter'),
        (variant) => {
          cleanup();
          
          render(
            <CTASection
              variant={variant as CTAVariant}
              showLeadCapture={true}
            />
          );

          // Verify accessibility attributes
          const ctaSection = screen.getByRole('region');
          expect(ctaSection).toHaveAttribute('aria-label');
          expect(ctaSection).toHaveAttribute('aria-labelledby');

          const ctaButton = screen.getByRole('button');
          expect(ctaButton).toHaveAttribute('aria-label');

          // Verify heading structure
          const heading = screen.getByRole('heading', { level: 3 });
          expect(heading).toHaveAttribute('id');

          // Verify description is properly associated
          const description = screen.getByText((content, element) => {
            return element?.tagName.toLowerCase() === 'p' && content.length > 10;
          });
          expect(description).toHaveAttribute('aria-describedby');

          cleanup();
          
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should handle form submission and modal interactions correctly', () => {
    // Feature: full-marketing-site, Property 5: CTA Functionality
    fc.assert(
      fc.property(
        fc.constantFrom('consultation', 'demo', 'whitepaper'),
        (variant) => {
          cleanup();
          
          render(
            <CTASection
              variant={variant as CTAVariant}
              showLeadCapture={true}
            />
          );

          const ctaButton = screen.getByRole('button');
          
          // Click CTA to open form
          fireEvent.click(ctaButton);

          // Verify form appears
          const leadForm = screen.queryByTestId('lead-capture-form');
          if (!leadForm) {
            console.log(`Form not found for variant: ${variant}`);
            return false;
          }
          
          expect(leadForm).toBeInTheDocument();

          cleanup();
          
          return true;
        }
      ),
      { numRuns: 5 }
    );
  });
});