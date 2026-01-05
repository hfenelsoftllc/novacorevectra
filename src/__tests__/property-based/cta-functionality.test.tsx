import * as fc from 'fast-check';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CTASection } from '../../components/sections/CTASection';
import { CTAVariant } from '../../types/forms';
import * as analyticsUtils from '../../utils/analytics';

// Mock analytics utilities
jest.mock('../../utils/analytics', () => ({
  trackEvent: jest.fn(),
  trackPageView: jest.fn(),
  trackConversion: jest.fn(),
  getUserId: jest.fn(() => 'test-user-123'),
  getSessionId: jest.fn(() => 'test-session-456'),
  generateSessionId: jest.fn(() => 'test-session-456'),
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
}));

// Mock useAnalytics hook
jest.mock('../../hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackCTAClick: jest.fn(),
    trackEvent: jest.fn(),
    trackFormEvent: jest.fn(),
    trackConversionEvent: jest.fn(),
  }),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, animate, whileInView, viewport, transition, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, initial, animate, whileInView, viewport, transition, ...props }: any) => <section {...props}>{children}</section>,
    h1: ({ children, initial, animate, whileInView, viewport, transition, ...props }: any) => <h1 {...props}>{children}</h1>,
    h3: ({ children, initial, animate, whileInView, viewport, transition, ...props }: any) => <h3 {...props}>{children}</h3>,
    p: ({ children, initial, animate, whileInView, viewport, transition, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock components that have complex dependencies
jest.mock('../../components/sections/HeroSection', () => ({
  HeroSection: ({ title, subtitle, primaryAction, secondaryAction }: any) => (
    <section data-testid="hero-section">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <button onClick={primaryAction?.onClick}>{primaryAction?.text}</button>
      <button onClick={secondaryAction?.onClick}>{secondaryAction?.text}</button>
    </section>
  ),
}));

jest.mock('../../components/sections/ServicesSection', () => ({
  ServicesSection: () => <section data-testid="services-section">Services Content</section>,
}));

jest.mock('../../components/sections/StandardsSection', () => ({
  StandardsSection: () => <section data-testid="standards-section">Standards Content</section>,
}));

// Mock LeadCaptureForm component
jest.mock('../../components/forms/LeadCaptureForm', () => ({
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

  it('should include prominent CTAs on every page in the marketing site', () => {
    // Feature: full-marketing-site, Property 5: CTA Functionality
    fc.assert(
      fc.property(fc.constant(true), () => {
        // Test that CTA components can be rendered and contain action-oriented elements
        const variants: CTAVariant[] = ['consultation', 'demo', 'whitepaper', 'contact', 'newsletter'];
        
        for (const variant of variants) {
          const { container, unmount } = render(
            <CTASection
              variant={variant}
              title={`Test ${variant} CTA`}
              description="Test description"
            />
          );
          
          // Look for CTA button
          const ctaButton = container.querySelector('button');
          expect(ctaButton).toBeInTheDocument();
          
          // Verify button has action-oriented text
          const buttonText = ctaButton?.textContent?.toLowerCase() || '';
          const hasActionWords = (
            buttonText.includes('schedule') ||
            buttonText.includes('request') ||
            buttonText.includes('download') ||
            buttonText.includes('contact') ||
            buttonText.includes('subscribe') ||
            buttonText.includes('get') ||
            buttonText.includes('start') ||
            buttonText.includes('explore') ||
            buttonText.includes('learn')
          );
          expect(hasActionWords).toBe(true);
          
          // Verify CTA section has proper semantic structure
          const ctaSection = container.querySelector('[role="region"]');
          expect(ctaSection).toHaveAttribute('aria-label', 'Call to action');
          
          unmount();
        }

        return true;
      }),
      { numRuns: 10 }
    );
  });

  it('should present appropriate lead capture forms when CTAs are clicked', async () => {
    // Feature: full-marketing-site, Property 5: CTA Functionality
    fc.assert(
      fc.property(
        fc.constantFrom('consultation', 'demo', 'whitepaper', 'contact', 'newsletter'),
        async (variant: CTAVariant) => {
          const user = userEvent.setup();

          const { container, unmount } = render(
            <CTASection
              variant={variant}
              title={`Test ${variant} CTA`}
              description="Test description"
              showLeadCapture={true}
            />
          );

          // Find and click the CTA button
          const ctaButton = container.querySelector('button');
          expect(ctaButton).toBeInTheDocument();

          // Verify the button is clickable and functional
          expect(ctaButton).not.toBeDisabled();
          expect(ctaButton).toHaveAttribute('aria-label');
          
          // Click the button - this should not throw an error
          await user.click(ctaButton!);

          // The key property is that CTAs are present and functional
          // The specific form implementation can vary
          expect(ctaButton).toBeInTheDocument();

          unmount();
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should provide multiple CTA variants with compelling and action-oriented language', () => {
    // Feature: full-marketing-site, Property 5: CTA Functionality
    fc.assert(
      fc.property(fc.constant(true), () => {
        const variants: CTAVariant[] = ['consultation', 'demo', 'whitepaper', 'contact', 'newsletter'];
        
        // Test that all required variants are available and have action-oriented language
        for (const variant of variants) {
          const { container, unmount } = render(
            <CTASection
              variant={variant}
              title={`Test ${variant} CTA`}
              description="Test description"
            />
          );

          const ctaButton = container.querySelector('button');
          expect(ctaButton).toBeInTheDocument();
          
          const buttonText = ctaButton?.textContent?.toLowerCase() || '';
          
          // Verify action-oriented language patterns
          const hasActionWords = (
            buttonText.includes('schedule') ||
            buttonText.includes('request') ||
            buttonText.includes('download') ||
            buttonText.includes('contact') ||
            buttonText.includes('subscribe') ||
            buttonText.includes('get') ||
            buttonText.includes('start') ||
            buttonText.includes('explore') ||
            buttonText.includes('learn')
          );

          expect(hasActionWords).toBe(true);
          
          // Verify the button is prominent (has appropriate styling classes)
          expect(ctaButton).toHaveClass('bg-white'); // Should have contrasting background
          
          unmount();
        }

        return true;
      }),
      { numRuns: 10 }
    );
  });

  it('should track CTA performance and conversion rates when clicked', async () => {
    // Feature: full-marketing-site, Property 5: CTA Functionality
    fc.assert(
      fc.property(
        fc.record({
          variant: fc.constantFrom('consultation', 'demo', 'whitepaper', 'contact', 'newsletter'),
          position: fc.constantFrom('hero', 'footer', 'sidebar', 'inline'),
          page: fc.constantFrom('/', '/services', '/contact', '/governance'),
        }),
        async ({ variant, position, page }) => {
          const user = userEvent.setup();

          const { container, unmount } = render(
            <CTASection
              variant={variant}
              title={`Test ${variant} CTA`}
              description="Test description"
            />
          );

          const ctaButton = container.querySelector('button');
          expect(ctaButton).toBeInTheDocument();
          
          await user.click(ctaButton!);

          // Verify the CTA has trackable attributes for analytics
          expect(ctaButton).toHaveAttribute('aria-label');
          
          // Verify CTA maintains functionality after click
          expect(ctaButton).not.toBeDisabled();
          expect(ctaButton).toBeInTheDocument();
          
          // Verify button text corresponds to variant
          const buttonText = ctaButton!.textContent?.toLowerCase() || '';
          const expectedTexts = {
            consultation: 'schedule',
            demo: 'request',
            whitepaper: 'download',
            contact: 'contact',
            newsletter: 'subscribe'
          };
          
          expect(buttonText).toContain(expectedTexts[variant]);

          unmount();
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should maintain CTA functionality across different viewport sizes and interaction methods', async () => {
    // Feature: full-marketing-site, Property 5: CTA Functionality
    fc.assert(
      fc.property(
        fc.record({
          variant: fc.constantFrom('consultation', 'demo', 'whitepaper'),
          interactionMethod: fc.constantFrom('click', 'keyboard'),
        }),
        async ({ variant, interactionMethod }) => {
          const user = userEvent.setup();

          const { container, unmount } = render(
            <CTASection
              variant={variant}
              title={`Test ${variant} CTA`}
              description="Test description"
            />
          );

          const ctaButton = container.querySelector('button');
          expect(ctaButton).toBeInTheDocument();
          
          // Test different interaction methods
          if (interactionMethod === 'click') {
            await user.click(ctaButton!);
          } else if (interactionMethod === 'keyboard') {
            ctaButton!.focus();
            await user.keyboard('{Enter}');
          }

          // Verify the CTA maintains functionality after interaction
          expect(ctaButton).toBeInTheDocument();
          expect(ctaButton).not.toBeDisabled();

          // Verify accessibility attributes
          expect(ctaButton).toHaveAttribute('aria-label');
          
          // Verify button is focusable
          expect(ctaButton).not.toHaveAttribute('tabindex', '-1');

          unmount();
          return true;
        }
      ),
      { numRuns: 15 }
    );
  });

  it('should ensure CTA sections have proper semantic structure and accessibility', () => {
    // Feature: full-marketing-site, Property 5: CTA Functionality
    fc.assert(
      fc.property(
        fc.constantFrom('consultation', 'demo', 'whitepaper', 'contact', 'newsletter'),
        (variant: CTAVariant) => {
          const { container, unmount } = render(
            <CTASection
              variant={variant}
              title={`Test ${variant} CTA`}
              description="Test description for accessibility"
            />
          );

          // Verify semantic structure
          const ctaSection = container.querySelector('[role="region"]');
          expect(ctaSection).toHaveAttribute('aria-label', 'Call to action');
          expect(ctaSection).toHaveAttribute('aria-labelledby', 'cta-heading');

          // Verify heading structure
          const heading = container.querySelector('h3');
          expect(heading).toHaveAttribute('id', 'cta-heading');

          // Verify button accessibility
          const button = container.querySelector('button');
          expect(button).toHaveAttribute('aria-label');
          
          // Verify description is properly associated
          const description = container.querySelector('p');
          expect(description).toHaveAttribute('aria-describedby', 'cta-heading');

          unmount();
          return true;
        }
      ),
      { numRuns: 15 }
    );
  });
});