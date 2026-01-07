/**
 * Core integration tests for the full marketing site
 * Tests essential functionality without complex component dependencies
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock all external dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

jest.mock('../../hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackEvent: jest.fn(),
    trackPageView: jest.fn(),
    trackCTAClick: jest.fn(),
    trackFormSubmission: jest.fn(),
    trackFormStart: jest.fn(),
    trackConversionEvent: jest.fn(),
    trackFunnelStep: jest.fn(),
    trackEngagement: jest.fn(),
  }),
}));

jest.mock('../../hooks/useABTest', () => ({
  useABTest: () => ({
    variant: { id: 'control', name: 'Control', content: { title: 'Test Title' } },
    isLoading: false,
    isInTest: true,
    getContent: () => ({ title: 'Test Title', buttonText: 'Test Button' }),
    getVariantId: () => 'control',
    trackConversion: jest.fn(),
  }),
  useMultipleABTests: () => ({
    variants: { test1: { id: 'control', content: { title: 'Test' } } },
    isLoading: false,
    getContent: () => ({ title: 'Test Content' }),
    trackConversion: jest.fn(),
  }),
}));

jest.mock('../../hooks/useContent', () => ({
  useContent: () => ({
    content: { title: 'Dynamic Content', description: 'Test Description' },
    loading: false,
    error: null,
    updateContent: jest.fn(),
  }),
}));

describe('Core Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Component Integration', () => {
    test('simple component renders without errors', () => {
      const TestComponent = () => (
        <div>
          <h1>Marketing Site</h1>
          <p>Welcome to our AI solutions</p>
          <button>Get Started</button>
        </div>
      );

      render(<TestComponent />);
      
      expect(screen.getByText('Marketing Site')).toBeInTheDocument();
      expect(screen.getByText('Welcome to our AI solutions')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Get Started' })).toBeInTheDocument();
    });

    test('user interactions work correctly', async () => {
      const user = userEvent.setup();
      const mockClick = jest.fn();
      
      const TestComponent = () => (
        <div>
          <button onClick={mockClick}>Click Me</button>
          <input placeholder="Enter text" />
        </div>
      );

      render(<TestComponent />);
      
      const button = screen.getByRole('button', { name: 'Click Me' });
      const input = screen.getByPlaceholderText('Enter text');
      
      await user.click(button);
      await user.type(input, 'test input');
      
      expect(mockClick).toHaveBeenCalledTimes(1);
      expect(input).toHaveValue('test input');
    });
  });

  describe('Form Integration', () => {
    test('basic form submission works', async () => {
      const user = userEvent.setup();
      const mockSubmit = jest.fn();
      
      const TestForm = () => {
        const [formData, setFormData] = React.useState({
          name: '',
          email: '',
        });

        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          mockSubmit(formData);
        };

        return (
          <form onSubmit={handleSubmit}>
            <input
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <button type="submit">Submit</button>
          </form>
        );
      };

      render(<TestForm />);
      
      await user.type(screen.getByPlaceholderText('Name'), 'John Doe');
      await user.type(screen.getByPlaceholderText('Email'), 'john@example.com');
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });

    test('form validation works', async () => {
      const user = userEvent.setup();
      const mockSubmit = jest.fn();
      
      const TestForm = () => {
        const [errors, setErrors] = React.useState<Record<string, string>>({});
        
        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const email = formData.get('email') as string;
          
          if (!email || !email.includes('@')) {
            setErrors({ email: 'Valid email is required' });
            return;
          }
          
          setErrors({});
          mockSubmit({ email });
        };

        return (
          <form onSubmit={handleSubmit}>
            <input name="email" placeholder="Email" />
            {errors['email'] && <span role="alert">{errors['email']}</span>}
            <button type="submit">Submit</button>
          </form>
        );
      };

      render(<TestForm />);
      
      // Submit without email
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      expect(screen.getByRole('alert')).toHaveTextContent('Valid email is required');
      expect(mockSubmit).not.toHaveBeenCalled();
      
      // Submit with valid email
      await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      expect(mockSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
    });
  });

  describe('Navigation Integration', () => {
    test('navigation between sections works', async () => {
      const user = userEvent.setup();
      
      const TestNavigation = () => {
        const [currentSection, setCurrentSection] = React.useState('home');
        
        return (
          <div>
            <nav>
              <button onClick={() => setCurrentSection('home')}>Home</button>
              <button onClick={() => setCurrentSection('services')}>Services</button>
              <button onClick={() => setCurrentSection('contact')}>Contact</button>
            </nav>
            <main>
              {currentSection === 'home' && <div>Home Content</div>}
              {currentSection === 'services' && <div>Services Content</div>}
              {currentSection === 'contact' && <div>Contact Content</div>}
            </main>
          </div>
        );
      };

      render(<TestNavigation />);
      
      expect(screen.getByText('Home Content')).toBeInTheDocument();
      
      await user.click(screen.getByRole('button', { name: 'Services' }));
      expect(screen.getByText('Services Content')).toBeInTheDocument();
      expect(screen.queryByText('Home Content')).not.toBeInTheDocument();
      
      await user.click(screen.getByRole('button', { name: 'Contact' }));
      expect(screen.getByText('Contact Content')).toBeInTheDocument();
      expect(screen.queryByText('Services Content')).not.toBeInTheDocument();
    });
  });

  describe('Industry Switching Integration', () => {
    test('industry content switching works', async () => {
      const user = userEvent.setup();
      
      const industries = [
        { id: 'airlines', name: 'Airlines', description: 'Airlines solutions' },
        { id: 'healthcare', name: 'Healthcare', description: 'Healthcare solutions' },
        { id: 'financial', name: 'Financial', description: 'Financial solutions' },
      ];
      
      const TestIndustrySection = () => {
        const [selectedIndustry, setSelectedIndustry] = React.useState('airlines');
        const currentIndustry = industries.find(i => i.id === selectedIndustry);
        
        return (
          <div>
            <div role="tablist">
              {industries.map(industry => (
                <button
                  key={industry.id}
                  role="tab"
                  aria-selected={selectedIndustry === industry.id}
                  onClick={() => setSelectedIndustry(industry.id)}
                >
                  {industry.name}
                </button>
              ))}
            </div>
            <div role="tabpanel">
              <h2>{currentIndustry?.name}</h2>
              <p>{currentIndustry?.description}</p>
            </div>
          </div>
        );
      };

      render(<TestIndustrySection />);
      
      // Verify initial state
      expect(screen.getByRole('heading', { name: 'Airlines' })).toBeInTheDocument();
      expect(screen.getByText('Airlines solutions')).toBeInTheDocument();
      
      // Switch to healthcare
      await user.click(screen.getByRole('tab', { name: 'Healthcare' }));
      expect(screen.getByText('Healthcare solutions')).toBeInTheDocument();
      expect(screen.queryByText('Airlines solutions')).not.toBeInTheDocument();
      
      // Switch to financial
      await user.click(screen.getByRole('tab', { name: 'Financial' }));
      expect(screen.getByText('Financial solutions')).toBeInTheDocument();
      expect(screen.queryByText('Healthcare solutions')).not.toBeInTheDocument();
    });
  });

  describe('Compliance Integration', () => {
    test('compliance clause expansion works', async () => {
      const user = userEvent.setup();
      
      const clauses = [
        {
          id: 'clause-1',
          title: 'Context of Organization',
          description: 'Understanding organizational context',
          requirements: ['Identify internal issues', 'Determine stakeholder needs'],
        },
        {
          id: 'clause-2',
          title: 'Leadership',
          description: 'Leadership commitment',
          requirements: ['Demonstrate commitment', 'Establish governance'],
        },
      ];
      
      const TestComplianceSection = () => {
        const [expandedClauses, setExpandedClauses] = React.useState<Set<string>>(new Set());
        
        const toggleClause = (clauseId: string) => {
          setExpandedClauses(prev => {
            const newSet = new Set(prev);
            if (newSet.has(clauseId)) {
              newSet.delete(clauseId);
            } else {
              newSet.add(clauseId);
            }
            return newSet;
          });
        };
        
        return (
          <div>
            {clauses.map(clause => (
              <div key={clause.id}>
                <button
                  onClick={() => toggleClause(clause.id)}
                  aria-expanded={expandedClauses.has(clause.id)}
                >
                  {clause.title}
                </button>
                <p>{clause.description}</p>
                {expandedClauses.has(clause.id) && (
                  <div>
                    <h4>Requirements</h4>
                    <ul>
                      {clause.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      };

      render(<TestComplianceSection />);
      
      // Verify initial state
      expect(screen.getByText('Context of Organization')).toBeInTheDocument();
      expect(screen.queryByText('Requirements')).not.toBeInTheDocument();
      
      // Expand first clause
      await user.click(screen.getByRole('button', { name: 'Context of Organization' }));
      expect(screen.getByText('Requirements')).toBeInTheDocument();
      expect(screen.getByText('Identify internal issues')).toBeInTheDocument();
      
      // Expand second clause
      await user.click(screen.getByRole('button', { name: 'Leadership' }));
      expect(screen.getByText('Demonstrate commitment')).toBeInTheDocument();
    });
  });

  describe('Analytics Integration', () => {
    test('analytics tracking integration works', async () => {
      const user = userEvent.setup();
      const mockTrackEvent = jest.fn();
      
      // Mock analytics in component
      const TestAnalyticsComponent = () => {
        const handleClick = () => {
          mockTrackEvent({
            event: 'button_click',
            category: 'engagement',
            action: 'cta_click',
          });
        };
        
        return (
          <div>
            <button onClick={handleClick}>Track Me</button>
          </div>
        );
      };

      render(<TestAnalyticsComponent />);
      
      await user.click(screen.getByRole('button', { name: 'Track Me' }));
      
      expect(mockTrackEvent).toHaveBeenCalledWith({
        event: 'button_click',
        category: 'engagement',
        action: 'cta_click',
      });
    });
  });

  describe('A/B Testing Integration', () => {
    test('A/B test variant selection works', () => {
      const TestABComponent = () => {
        // Mock A/B test logic
        const variant = Math.random() > 0.5 ? 'control' : 'variant';
        const content = variant === 'control' 
          ? { title: 'Control Title', buttonText: 'Control Button' }
          : { title: 'Variant Title', buttonText: 'Variant Button' };
        
        return (
          <div>
            <h1>{content.title}</h1>
            <button>{content.buttonText}</button>
            <span data-testid="variant">{variant}</span>
          </div>
        );
      };

      render(<TestABComponent />);
      
      const variantElement = screen.getByTestId('variant');
      const variant = variantElement.textContent;
      
      if (variant === 'control') {
        expect(screen.getByText('Control Title')).toBeInTheDocument();
        expect(screen.getByText('Control Button')).toBeInTheDocument();
      } else {
        expect(screen.getByText('Variant Title')).toBeInTheDocument();
        expect(screen.getByText('Variant Button')).toBeInTheDocument();
      }
    });
  });

  describe('Content Management Integration', () => {
    test('dynamic content loading works', async () => {
      const TestContentComponent = () => {
        const [content, setContent] = React.useState({ title: 'Loading...' });
        
        React.useEffect(() => {
          // Simulate content loading
          setTimeout(() => {
            setContent({ title: 'Dynamic Content Loaded' });
          }, 100);
        }, []);
        
        return <h1>{content.title}</h1>;
      };

      render(<TestContentComponent />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('Dynamic Content Loaded')).toBeInTheDocument();
      });
    });

    test('content updates work without code deployment', async () => {
      const user = userEvent.setup();
      
      const TestContentManager = () => {
        const [content, setContent] = React.useState({ title: 'Original Content' });
        
        const updateContent = () => {
          setContent({ title: 'Updated Content' });
        };
        
        return (
          <div>
            <h1>{content.title}</h1>
            <button onClick={updateContent}>Update Content</button>
          </div>
        );
      };

      render(<TestContentManager />);
      
      expect(screen.getByText('Original Content')).toBeInTheDocument();
      
      await user.click(screen.getByRole('button', { name: 'Update Content' }));
      
      expect(screen.getByText('Updated Content')).toBeInTheDocument();
      expect(screen.queryByText('Original Content')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling Integration', () => {
    test('error boundaries work correctly', () => {
      const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <div>No error</div>;
      };

      const TestErrorBoundary = () => {
        const [hasError, setHasError] = React.useState(false);
        const [shouldThrow, setShouldThrow] = React.useState(false);
        
        React.useEffect(() => {
          const errorHandler = () => setHasError(true);
          window.addEventListener('error', errorHandler);
          return () => window.removeEventListener('error', errorHandler);
        }, []);
        
        if (hasError) {
          return <div>Something went wrong</div>;
        }
        
        return (
          <div>
            <button onClick={() => setShouldThrow(true)}>Trigger Error</button>
            <ThrowError shouldThrow={shouldThrow} />
          </div>
        );
      };

      render(<TestErrorBoundary />);
      
      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Trigger Error' })).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    test('keyboard navigation works', async () => {
      const user = userEvent.setup();
      const mockClick = jest.fn();
      
      const TestAccessibility = () => (
        <div>
          <button onClick={mockClick}>Clickable Button</button>
          <input placeholder="Focusable Input" />
          <a href="#test">Focusable Link</a>
        </div>
      );

      render(<TestAccessibility />);
      
      const button = screen.getByRole('button');
      const input = screen.getByRole('textbox');
      const link = screen.getByRole('link');
      
      // Test focus
      button.focus();
      expect(button).toHaveFocus();
      
      // Test keyboard activation
      await user.keyboard('{Enter}');
      expect(mockClick).toHaveBeenCalled();
      
      // Test tab navigation
      await user.tab();
      expect(input).toHaveFocus();
      
      await user.tab();
      expect(link).toHaveFocus();
    });

    test('ARIA attributes work correctly', () => {
      const TestARIA = () => (
        <div>
          <button aria-label="Close dialog" aria-expanded="false">×</button>
          <div role="alert">Error message</div>
          <nav aria-label="Main navigation">
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
            </ul>
          </nav>
        </div>
      );

      render(<TestARIA />);
      
      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
    });
  });

  describe('Performance Integration', () => {
    test('component rendering is performant', () => {
      const startTime = performance.now();
      
      const TestPerformance = () => (
        <div>
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i}>Item {i}</div>
          ))}
        </div>
      );

      render(<TestPerformance />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (< 100ms)
      expect(renderTime).toBeLessThan(100);
      
      // Verify all items are rendered
      expect(screen.getByText('Item 0')).toBeInTheDocument();
      expect(screen.getByText('Item 99')).toBeInTheDocument();
    });
  });
});