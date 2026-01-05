import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { ErrorFallback } from '../../components/common/ErrorFallback';
import { OptimizedImage } from '../../components/ui/optimized-image';
import { 
  ComplianceSection,
  IndustryVariantsSection,
  CTASection,
  ProcessLifecycleSection
} from '../../components/sections';
import { ISO_42001_FRAMEWORK } from '../../constants/compliance';
import { INDUSTRIES } from '../../constants/industries';
import { PROCESS_STEPS } from '../../constants/processes';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, onLoad, onError, ...props }: any) => (
    <img
      src={src}
      alt={alt}
      onLoad={onLoad}
      onError={onError}
      {...props}
    />
  ),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Component that throws an error for testing ErrorBoundary
const ThrowError = ({ shouldThrow, message = 'Test error' }: { shouldThrow: boolean; message?: string }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>No error</div>;
};

// Component that throws async error
const AsyncErrorComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  React.useEffect(() => {
    if (shouldThrow) {
      setTimeout(() => {
        throw new Error('Async error');
      }, 100);
    }
  }, [shouldThrow]);

  return <div>Async component</div>;
};

describe('Accessibility and Error Handling Tests', () => {
  describe('ErrorBoundary Advanced Scenarios', () => {
    test('should handle multiple error types gracefully', async () => {
      const onError = jest.fn();
      
      const { rerender } = render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Initially no error
      expect(screen.getByText('No error')).toBeInTheDocument();

      // Trigger error
      rerender(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} message="Network error" />
        </ErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Network error' }),
        expect.any(Object)
      );
    });

    test('should provide proper keyboard navigation in error state', async () => {
      const user = userEvent.setup();
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      const homeLink = screen.getByRole('link', { name: /go to home page/i });

      // Try Again button should be focused by default
      expect(tryAgainButton).toHaveFocus();

      // Tab to home link
      await user.tab();
      expect(homeLink).toHaveFocus();

      // Shift+Tab back to try again button
      await user.tab({ shift: true });
      expect(tryAgainButton).toHaveFocus();

      // Enter key should trigger try again
      const resetSpy = jest.fn();
      tryAgainButton.onclick = resetSpy;
      await user.keyboard('{Enter}');
      expect(resetSpy).toHaveBeenCalled();
    });

    test('should handle escape key to reset error', async () => {
      const user = userEvent.setup();
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Press escape key
      await user.keyboard('{Escape}');
      
      // Error should be reset (component re-renders)
      await waitFor(() => {
        expect(screen.getByText('No error')).toBeInTheDocument();
      });
    });

    test('should announce error state to screen readers', async () => {
      const announceToScreenReader = jest.fn();
      
      // Mock the accessibility announcer
      jest.doMock('../../components/common/AccessibilityAnnouncer', () => ({
        announceToScreenReader
      }));

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should have proper ARIA attributes
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });

    test('should have no accessibility violations in error state', async () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ErrorFallback Advanced Scenarios', () => {
    test('should handle custom error messages and titles', () => {
      const mockReset = jest.fn();
      
      render(
        <ErrorFallback 
          error={new Error('Custom error message')} 
          resetError={mockReset}
          title="Custom Error Title"
          description="Custom error description"
          showHomeLink={false}
        />
      );

      expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
      expect(screen.getByText('Custom error description')).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /go to home page/i })).not.toBeInTheDocument();
    });

    test('should show development error details in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Development error');
      error.stack = 'Error stack trace';

      render(
        <ErrorFallback 
          error={error} 
          resetError={jest.fn()} 
        />
      );

      const details = screen.getByText('Error details (development only)');
      expect(details).toBeInTheDocument();

      // Click to expand details
      fireEvent.click(details);
      expect(screen.getByText('Development error')).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    test('should handle keyboard navigation properly', async () => {
      const user = userEvent.setup();
      const mockReset = jest.fn();
      
      render(
        <ErrorFallback 
          error={new Error('Test error')} 
          resetError={mockReset}
        />
      );

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      const homeLink = screen.getByRole('link', { name: /go to home page/i });

      // Try Again button should be focused by default
      expect(tryAgainButton).toHaveFocus();

      // Tab navigation should work
      await user.tab();
      expect(homeLink).toHaveFocus();

      // Space key should activate buttons
      await user.tab({ shift: true });
      expect(tryAgainButton).toHaveFocus();
      await user.keyboard(' ');
      expect(mockReset).toHaveBeenCalled();
    });
  });

  describe('OptimizedImage Error Handling', () => {
    test('should handle image load errors gracefully', async () => {
      render(
        <OptimizedImage
          src="/invalid-image.jpg"
          alt="Test image"
          fallbackSrc="/fallback-image.jpg"
          errorClassName="custom-error-class"
        />
      );

      const image = screen.getByRole('img');
      
      // Simulate image load error
      fireEvent.error(image);

      await waitFor(() => {
        expect(screen.getByText(/failed to load image/i)).toBeInTheDocument();
      });
    });

    test('should provide proper ARIA attributes for image states', () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image description"
          showLoadingState={true}
        />
      );

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', 'Test image description');
    });

    test('should have no accessibility violations', async () => {
      const { container } = render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ComplianceSection Keyboard Navigation', () => {
    test('should support keyboard navigation for clause expansion', async () => {
      const user = userEvent.setup();
      
      render(
        <ComplianceSection 
          framework={ISO_42001_FRAMEWORK}
          mappedServices={[]}
        />
      );

      // Find first expandable clause
      const expandButtons = screen.getAllByRole('button', { name: /expand details/i });
      const firstButton = expandButtons[0];

      // Should be focusable
      firstButton.focus();
      expect(firstButton).toHaveFocus();

      // Enter key should expand
      await user.keyboard('{Enter}');
      expect(firstButton).toHaveAttribute('aria-expanded', 'true');

      // Space key should also work
      await user.keyboard(' ');
      expect(firstButton).toHaveAttribute('aria-expanded', 'false');
    });

    test('should provide proper ARIA attributes for clauses', () => {
      render(
        <ComplianceSection 
          framework={ISO_42001_FRAMEWORK}
          mappedServices={[]}
        />
      );

      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();

      const clauseList = screen.getByRole('list');
      expect(clauseList).toBeInTheDocument();
    });

    test('should have no accessibility violations', async () => {
      const { container } = render(
        <ComplianceSection 
          framework={ISO_42001_FRAMEWORK}
          mappedServices={[]}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('IndustryVariantsSection Keyboard Navigation', () => {
    test('should support keyboard navigation for industry selection', async () => {
      const user = userEvent.setup();
      
      render(
        <IndustryVariantsSection 
          industries={INDUSTRIES}
          defaultIndustry="aviation"
        />
      );

      // Should have proper tabpanel role
      const tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel).toBeInTheDocument();

      // Industry selector should be keyboard navigable
      const industryTabs = screen.getAllByRole('tab');
      if (industryTabs.length > 0) {
        const firstTab = industryTabs[0];
        firstTab.focus();
        expect(firstTab).toHaveFocus();

        // Arrow keys should navigate between industries
        await user.keyboard('{ArrowRight}');
        // Next tab should be focused (if exists)
        if (industryTabs.length > 1) {
          expect(industryTabs[1]).toHaveFocus();
        }
      }
    });

    test('should have no accessibility violations', async () => {
      const { container } = render(
        <IndustryVariantsSection 
          industries={INDUSTRIES}
          defaultIndustry="aviation"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('CTASection Keyboard Navigation', () => {
    test('should support keyboard navigation for CTA interactions', async () => {
      const user = userEvent.setup();
      const mockAction = jest.fn();
      
      render(
        <CTASection 
          variant="consultation"
          onAction={mockAction}
        />
      );

      const ctaButton = screen.getByRole('button');
      
      // Should be focusable
      ctaButton.focus();
      expect(ctaButton).toHaveFocus();

      // Enter key should trigger action
      await user.keyboard('{Enter}');
      expect(mockAction).toHaveBeenCalled();

      // Space key should also work
      mockAction.mockClear();
      await user.keyboard(' ');
      expect(mockAction).toHaveBeenCalled();
    });

    test('should provide proper ARIA attributes', () => {
      render(
        <CTASection 
          variant="demo"
          onAction={jest.fn()}
        />
      );

      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
    });

    test('should have no accessibility violations', async () => {
      const { container } = render(
        <CTASection 
          variant="consultation"
          onAction={jest.fn()}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ProcessLifecycleSection Keyboard Navigation', () => {
    test('should support keyboard navigation for process steps', async () => {
      const user = userEvent.setup();
      
      render(
        <ProcessLifecycleSection 
          processes={PROCESS_STEPS}
        />
      );

      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();

      // Process steps should be keyboard navigable
      const focusableElements = section.querySelectorAll('[tabindex="0"], button, a, input, select, textarea');
      
      if (focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement;
        firstElement.focus();
        expect(firstElement).toHaveFocus();

        // Tab should move to next focusable element
        await user.tab();
        if (focusableElements.length > 1) {
          expect(focusableElements[1]).toHaveFocus();
        }
      }
    });

    test('should have no accessibility violations', async () => {
      const { container } = render(
        <ProcessLifecycleSection 
          processes={PROCESS_STEPS}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Global Keyboard Navigation Patterns', () => {
    test('should support skip links for main content', () => {
      render(
        <div>
          <a href="#main-content" className="sr-only focus:not-sr-only">
            Skip to main content
          </a>
          <main id="main-content">
            <h1>Main Content</h1>
          </main>
        </div>
      );

      const skipLink = screen.getByRole('link', { name: /skip to main content/i });
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    test('should handle focus management during error recovery', async () => {
      const user = userEvent.setup();
      
      const TestComponent = () => {
        const [hasError, setHasError] = React.useState(false);
        
        return (
          <div>
            <button onClick={() => setHasError(true)}>Trigger Error</button>
            <ErrorBoundary>
              <ThrowError shouldThrow={hasError} />
            </ErrorBoundary>
          </div>
        );
      };

      render(<TestComponent />);

      const triggerButton = screen.getByRole('button', { name: /trigger error/i });
      await user.click(triggerButton);

      // Error boundary should be shown
      expect(screen.getByRole('alert')).toBeInTheDocument();
      
      // Try again button should be focused
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      expect(tryAgainButton).toHaveFocus();
    });

    test('should respect reduced motion preferences', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <ProcessLifecycleSection 
          processes={PROCESS_STEPS}
        />
      );

      // Component should render without motion-dependent features
      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Error Recovery Scenarios', () => {
    test('should handle component remounting after error', async () => {
      const TestWrapper = () => {
        const [key, setKey] = React.useState(0);
        const [shouldError, setShouldError] = React.useState(false);
        
        return (
          <div>
            <button onClick={() => {
              setKey(k => k + 1);
              setShouldError(false);
            }}>
              Remount Component
            </button>
            <button onClick={() => setShouldError(true)}>
              Trigger Error
            </button>
            <ErrorBoundary key={key}>
              <ThrowError shouldThrow={shouldError} />
            </ErrorBoundary>
          </div>
        );
      };

      const user = userEvent.setup();
      render(<TestWrapper />);

      // Initially no error
      expect(screen.getByText('No error')).toBeInTheDocument();

      // Trigger error
      await user.click(screen.getByRole('button', { name: /trigger error/i }));
      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Remount component
      await user.click(screen.getByRole('button', { name: /remount component/i }));
      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    test('should handle nested error boundaries', () => {
      render(
        <ErrorBoundary>
          <div>
            <h1>Outer Content</h1>
            <ErrorBoundary>
              <ThrowError shouldThrow={true} message="Inner error" />
            </ErrorBoundary>
          </div>
        </ErrorBoundary>
      );

      // Inner error boundary should catch the error
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      
      // Outer content should still be visible
      expect(screen.getByText('Outer Content')).toBeInTheDocument();
    });
  });
});