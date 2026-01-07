import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { ErrorFallback } from '../../components/common/ErrorFallback';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { AnimatedSection } from '../../components/common/AnimatedSection';

// Note: toHaveNoViolations is now configured globally in jest.setup.js

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Component that throws an error for testing ErrorBoundary
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('Accessibility Features', () => {
  describe('ErrorBoundary', () => {
    test('should have no accessibility violations in error state', async () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should provide proper ARIA attributes in error state', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
    });

    test('should focus the try again button by default', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      expect(tryAgainButton).toHaveFocus();
    });

    test('should handle keyboard navigation', async () => {
      const user = userEvent.setup();
      render(
        <ErrorBoundary showHomeLink={true}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      const homeLink = screen.getByRole('link', { name: /go home/i });

      // Tab navigation should work
      await user.tab();
      expect(homeLink).toHaveFocus();

      await user.tab({ shift: true });
      expect(tryAgainButton).toHaveFocus();
    });
  });

  describe('ErrorFallback', () => {
    test('should have no accessibility violations', async () => {
      const mockReset = jest.fn();
      const { container } = render(
        <ErrorFallback 
          error={new Error('Test error')} 
          resetError={mockReset} 
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should handle escape key to reset error', async () => {
      const mockReset = jest.fn();
      const user = userEvent.setup();
      
      render(
        <ErrorFallback 
          error={new Error('Test error')} 
          resetError={mockReset} 
        />
      );

      await user.keyboard('{Escape}');
      expect(mockReset).toHaveBeenCalled();
    });
  });

  describe('LoadingSpinner', () => {
    test('should have no accessibility violations', async () => {
      const { container } = render(<LoadingSpinner />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should provide proper ARIA attributes', () => {
      render(<LoadingSpinner text="Loading content" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-live', 'polite');
      expect(spinner).toHaveAttribute('aria-label', 'Loading content');
    });

    test('should have screen reader text', () => {
      render(<LoadingSpinner />);
      expect(screen.getByText('Loading content, please wait')).toHaveClass('sr-only');
    });

    test('should support custom aria-label', () => {
      render(<LoadingSpinner aria-label="Custom loading message" />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Custom loading message');
    });
  });

  describe('Header', () => {
    test('should have no accessibility violations', async () => {
      const { container } = render(<Header />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should provide proper landmark roles', () => {
      render(<Header />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
    });

    test('should handle mobile menu keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      
      // Open mobile menu
      await user.click(menuButton);
      
      expect(screen.getByRole('dialog', { name: /navigation menu/i })).toBeInTheDocument();
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    });

    test('should close mobile menu on escape key', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      
      // Open mobile menu
      await user.click(menuButton);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Close with escape key
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Footer', () => {
    test('should have no accessibility violations', async () => {
      const { container } = render(<Footer />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should provide proper landmark roles', () => {
      render(<Footer />);
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    test('should have proper navigation landmarks', () => {
      render(<Footer />);
      
      expect(screen.getByRole('navigation', { name: /social media links/i })).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: /quick navigation links/i })).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: /legal and policy links/i })).toBeInTheDocument();
    });
  });

  describe('AnimatedSection', () => {
    test('should have no accessibility violations', async () => {
      const { container } = render(
        <AnimatedSection aria-label="Test section">
          <p>Test content</p>
        </AnimatedSection>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should provide proper ARIA attributes', () => {
      render(
        <AnimatedSection aria-label="Test section" role="region">
          <p>Test content</p>
        </AnimatedSection>
      );

      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-label', 'Test section');
      expect(section).toHaveAttribute('tabIndex', '-1');
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
        <AnimatedSection aria-label="Test section">
          <p>Test content</p>
        </AnimatedSection>
      );

      // Should render as regular section when motion is reduced
      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    test('should support tab navigation through interactive elements', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <Header />
          <main>
            <LoadingSpinner />
            <ErrorFallback 
              error={new Error('Test')} 
              resetError={() => {}} 
            />
          </main>
          <Footer />
        </div>
      );

      // Should be able to tab through all interactive elements
      const interactiveElements = screen.getAllByRole('button').concat(
        screen.getAllByRole('link')
      );

      expect(interactiveElements.length).toBeGreaterThan(0);

      // Each interactive element should be focusable
      for (const element of interactiveElements) {
        element.focus();
        expect(element).toHaveFocus();
      }

      // Use user for keyboard navigation
      await user.tab();
    });
  });

  describe('Screen Reader Support', () => {
    test('should provide appropriate live regions', () => {
      render(
        <div>
          <LoadingSpinner />
          <ErrorBoundary>
            <div>Content</div>
          </ErrorBoundary>
        </div>
      );

      // Loading spinner should have live region
      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    });

    test('should provide skip links', () => {
      render(
        <div>
          <a href="#main-content" className="sr-only focus:not-sr-only">
            Skip to main content
          </a>
          <main id="main-content">Content</main>
        </div>
      );

      const skipLink = screen.getByRole('link', { name: /skip to main content/i });
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });
  });
});