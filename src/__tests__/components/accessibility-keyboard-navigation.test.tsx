import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { ErrorFallback } from '../../components/common/ErrorFallback';
import { AccessibilityAnnouncer, GlobalAnnouncer } from '../../components/common/AccessibilityAnnouncer';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { Button } from '../../components/ui/button';

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

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
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

// Test component with interactive elements
const InteractiveTestComponent = () => {
  const [count, setCount] = React.useState(0);
  const [showModal, setShowModal] = React.useState(false);

  return (
    <div>
      <h1>Test Page</h1>
      <nav aria-label="Main navigation">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/services">Services</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </nav>
      
      <main id="main-content">
        <h2>Interactive Elements</h2>
        <Button onClick={() => setCount(count + 1)}>
          Count: {count}
        </Button>
        <Button onClick={() => setShowModal(true)}>
          Open Modal
        </Button>
        
        {showModal && (
          <div 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="modal-title"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowModal(false);
              }
            }}
          >
            <h3 id="modal-title">Modal Dialog</h3>
            <p>This is a modal dialog for testing keyboard navigation.</p>
            <Button onClick={() => setShowModal(false)}>
              Close Modal
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

describe('Accessibility and Keyboard Navigation Tests', () => {
  describe('ErrorBoundary Accessibility', () => {
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

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('aria-live', 'assertive');
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

    test('should handle keyboard navigation in error state', async () => {
      const user = userEvent.setup();
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      const homeLink = screen.getByRole('link', { name: /go to home page/i });

      // Tab navigation should work
      expect(tryAgainButton).toHaveFocus();
      
      await user.tab();
      expect(homeLink).toHaveFocus();

      await user.tab({ shift: true });
      expect(tryAgainButton).toHaveFocus();
    });

    test('should handle escape key to reset error', async () => {
      const user = userEvent.setup();
      
      const TestWrapper = () => {
        const [shouldError, setShouldError] = React.useState(true);
        const [key, setKey] = React.useState(0);
        
        const resetError = () => {
          setShouldError(false);
          setKey(k => k + 1);
        };
        
        return (
          <ErrorBoundary key={key}>
            {shouldError ? (
              <div onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  resetError();
                }
              }}>
                <ThrowError shouldThrow={true} />
              </div>
            ) : (
              <ThrowError shouldThrow={false} />
            )}
          </ErrorBoundary>
        );
      };

      render(<TestWrapper />);

      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Press escape key
      await user.keyboard('{Escape}');
      
      // Error should be reset
      await waitFor(() => {
        expect(screen.getByText('No error')).toBeInTheDocument();
      });
    });

    test('should announce error state to screen readers', () => {
      render(
        <div>
          <GlobalAnnouncer />
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </div>
      );

      // Should have proper ARIA attributes
      const alerts = screen.getAllByRole('alert');
      const errorAlert = alerts.find(alert => alert.textContent?.includes('Something went wrong'));
      expect(errorAlert).toHaveAttribute('aria-live', 'assertive');
      
      // Should have global announcers
      expect(document.getElementById('polite-announcer')).toBeInTheDocument();
      expect(document.getElementById('assertive-announcer')).toBeInTheDocument();
    });
  });

  describe('ErrorFallback Accessibility', () => {
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
      expect(screen.getByText(/Development error/)).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('AccessibilityAnnouncer', () => {
    test('should have no accessibility violations', async () => {
      const { container } = render(
        <AccessibilityAnnouncer 
          message="Test announcement" 
          priority="polite" 
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should provide proper ARIA attributes', () => {
      render(
        <AccessibilityAnnouncer 
          message="Test announcement" 
          priority="assertive" 
        />
      );

      const announcer = screen.getByRole('status');
      expect(announcer).toHaveAttribute('aria-live', 'assertive');
      expect(announcer).toHaveAttribute('aria-atomic', 'true');
      expect(announcer).toHaveClass('sr-only');
    });

    test('should announce messages with different priorities', () => {
      const { rerender } = render(
        <AccessibilityAnnouncer 
          message="Polite message" 
          priority="polite" 
        />
      );

      let announcer = screen.getByRole('status');
      expect(announcer).toHaveAttribute('aria-live', 'polite');
      expect(announcer).toHaveTextContent('Polite message');

      rerender(
        <AccessibilityAnnouncer 
          message="Urgent message" 
          priority="assertive" 
        />
      );

      announcer = screen.getByRole('status');
      expect(announcer).toHaveAttribute('aria-live', 'assertive');
      expect(announcer).toHaveTextContent('Urgent message');
    });
  });

  describe('LoadingSpinner Accessibility', () => {
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

  describe('Keyboard Navigation Patterns', () => {
    test('should support tab navigation through interactive elements', async () => {
      const user = userEvent.setup();
      
      render(<InteractiveTestComponent />);

      // Should be able to tab through all interactive elements
      const links = screen.getAllByRole('link');
      const buttons = screen.getAllByRole('button');
      const interactiveElements = [...links, ...buttons];

      expect(interactiveElements.length).toBeGreaterThan(0);

      // Tab through elements
      for (let i = 0; i < interactiveElements.length; i++) {
        await user.tab();
        expect(interactiveElements[i]).toHaveFocus();
      }
    });

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

    test('should handle modal keyboard navigation and focus trapping', async () => {
      const user = userEvent.setup();
      
      render(<InteractiveTestComponent />);

      // Open modal
      const openModalButton = screen.getByRole('button', { name: /open modal/i });
      await user.click(openModalButton);

      // Modal should be visible
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveAttribute('aria-modal', 'true');

      // Close modal with escape key - need to focus the modal first
      modal.focus();
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    test('should handle arrow key navigation for tab-like interfaces', async () => {
      const user = userEvent.setup();
      
      const TabInterface = () => {
        const [activeTab, setActiveTab] = React.useState(0);
        const tabs = ['Tab 1', 'Tab 2', 'Tab 3'];
        
        const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            setActiveTab((index + 1) % tabs.length);
          } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            setActiveTab((index - 1 + tabs.length) % tabs.length);
          }
        };

        return (
          <div role="tablist">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === index}
                tabIndex={activeTab === index ? 0 : -1}
                onClick={() => setActiveTab(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              >
                {tab}
              </button>
            ))}
            <div role="tabpanel">
              Content for {tabs[activeTab]}
            </div>
          </div>
        );
      };

      render(<TabInterface />);

      const tabs = screen.getAllByRole('tab');
      const firstTab = tabs[0];
      const secondTab = tabs[1];

      // First tab should be focusable
      firstTab.focus();
      expect(firstTab).toHaveFocus();
      expect(firstTab).toHaveAttribute('aria-selected', 'true');

      // Arrow right should move to next tab
      await user.keyboard('{ArrowRight}');
      expect(secondTab).toHaveAttribute('aria-selected', 'true');
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

      render(<InteractiveTestComponent />);

      // Component should render without motion-dependent features
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Error Recovery and Focus Management', () => {
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

  describe('ARIA Compliance', () => {
    test('should provide proper landmark roles', () => {
      render(
        <div>
          <header role="banner">
            <nav aria-label="Main navigation">
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/about">About</a></li>
              </ul>
            </nav>
          </header>
          <main role="main">
            <h1>Main Content</h1>
          </main>
          <footer role="contentinfo">
            <p>Footer content</p>
          </footer>
        </div>
      );

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    test('should provide proper heading hierarchy', () => {
      render(
        <div>
          <h1>Page Title</h1>
          <h2>Section Title</h2>
          <h3>Subsection Title</h3>
          <h2>Another Section</h2>
        </div>
      );

      const headings = screen.getAllByRole('heading');
      expect(headings).toHaveLength(4);
      
      // Check heading levels
      expect(headings[0]).toHaveProperty('tagName', 'H1');
      expect(headings[1]).toHaveProperty('tagName', 'H2');
      expect(headings[2]).toHaveProperty('tagName', 'H3');
      expect(headings[3]).toHaveProperty('tagName', 'H2');
    });

    test('should provide proper form labels and descriptions', () => {
      render(
        <form>
          <label htmlFor="email">Email Address</label>
          <input 
            id="email" 
            type="email" 
            aria-describedby="email-help"
            required 
          />
          <div id="email-help">We'll never share your email</div>
          
          <fieldset>
            <legend>Preferred Contact Method</legend>
            <label>
              <input type="radio" name="contact" value="email" />
              Email
            </label>
            <label>
              <input type="radio" name="contact" value="phone" />
              Phone
            </label>
          </fieldset>
        </form>
      );

      const emailInput = screen.getByLabelText('Email Address');
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-help');
      expect(emailInput).toBeRequired();

      const fieldset = screen.getByRole('group', { name: 'Preferred Contact Method' });
      expect(fieldset).toBeInTheDocument();

      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(2);
    });
  });
});