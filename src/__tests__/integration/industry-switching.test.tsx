/**
 * Integration tests for industry switching functionality
 * Tests industry content switching, consistency, and user experience
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IndustrySelector } from '../../components/industry/IndustrySelector';
import { IndustryContent } from '../../components/industry/IndustryContent';
import { IndustryVariantsSection } from '../../components/sections/IndustryVariantsSection';
import { INDUSTRIES } from '../../constants/industries';
import { useAnalytics } from '../../hooks/useAnalytics';

// Mock analytics hook
jest.mock('../../hooks/useAnalytics', () => ({
  useAnalytics: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('Industry Switching Integration Tests', () => {
  const mockAnalytics = {
    trackEvent: jest.fn(),
    trackEngagement: jest.fn(),
    trackFunnelStep: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAnalytics as jest.Mock).mockReturnValue(mockAnalytics);
  });

  describe('Industry Selector Functionality', () => {
    test('renders all available industries correctly', () => {
      const mockOnSelect = jest.fn();
      
      render(
        <IndustrySelector
          industries={INDUSTRIES}
          selectedIndustry="aviation"
          onIndustrySelect={mockOnSelect}
        />
      );
      
      // Verify all industries are rendered
      INDUSTRIES.forEach(industry => {
        expect(screen.getByText(industry.name)).toBeInTheDocument();
      });
      
      // Verify selected industry is highlighted
      const aviationButton = screen.getByText('Aviation');
      expect(aviationButton).toHaveAttribute('aria-selected', 'true');
    });

    test('industry selection triggers callback and analytics', async () => {
      const user = userEvent.setup();
      const mockOnSelect = jest.fn();
      
      render(
        <IndustrySelector
          industries={INDUSTRIES}
          selectedIndustry="aviation"
          onIndustrySelect={mockOnSelect}
        />
      );
      
      // Click on healthcare industry
      const healthcareButton = screen.getByText('Healthcare');
      await user.click(healthcareButton);
      
      // Verify callback is called
      expect(mockOnSelect).toHaveBeenCalledWith('healthcare');
      
      // Verify analytics tracking
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'industry_selection',
          category: 'engagement',
          action: 'industry_switch',
          label: 'healthcare',
        })
      );
    });

    test('keyboard navigation works for industry selection', async () => {
      const user = userEvent.setup();
      const mockOnSelect = jest.fn();
      
      render(
        <IndustrySelector
          industries={INDUSTRIES}
          selectedIndustry="aviation"
          onIndustrySelect={mockOnSelect}
        />
      );
      
      // Focus on healthcare button and press Enter
      const healthcareButton = screen.getByText('Healthcare');
      healthcareButton.focus();
      await user.keyboard('{Enter}');
      
      expect(mockOnSelect).toHaveBeenCalledWith('healthcare');
    });
  });

  describe('Industry Content Display', () => {
    test('displays correct content for selected industry', () => {
      const aviationIndustry = INDUSTRIES.find(i => i.id === 'aviation')!;
      
      render(
        <IndustryContent
          industry={aviationIndustry}
          showCaseStudies={true}
          showServices={true}
        />
      );
      
      // Verify industry-specific content
      expect(screen.getByText(aviationIndustry.name)).toBeInTheDocument();
      expect(screen.getByText(aviationIndustry.description)).toBeInTheDocument();
      
      // Verify case studies are displayed
      aviationIndustry.caseStudies.forEach(caseStudy => {
        expect(screen.getByText(caseStudy.title)).toBeInTheDocument();
      });
      
      // Verify specific services are displayed
      aviationIndustry.specificServices.forEach(service => {
        expect(screen.getByText(service)).toBeInTheDocument();
      });
    });

    test('handles missing industry data gracefully', () => {
      const incompleteIndustry = {
        id: 'test',
        name: 'Test Industry',
        description: 'Test description',
        icon: null,
        caseStudies: [],
        specificServices: [],
        complianceRequirements: [],
      };
      
      render(
        <IndustryContent
          industry={incompleteIndustry}
          showCaseStudies={true}
          showServices={true}
        />
      );
      
      // Should still render basic information
      expect(screen.getByText('Test Industry')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
  });

  describe('Industry Variants Section Integration', () => {
    test('complete industry switching workflow', async () => {
      const user = userEvent.setup();
      
      const TestIndustrySection = () => {
        const [selectedIndustry, setSelectedIndustry] = React.useState('aviation');
        
        return (
          <IndustryVariantsSection
            industries={INDUSTRIES}
            selectedIndustry={selectedIndustry}
            onIndustrySelect={setSelectedIndustry}
          />
        );
      };
      
      render(<TestIndustrySection />);
      
      // Verify initial state (aviation selected)
      const aviationIndustry = INDUSTRIES.find(i => i.id === 'aviation')!;
      expect(screen.getByText(aviationIndustry.name)).toBeInTheDocument();
      
      // Switch to healthcare
      const healthcareButton = screen.getByText('Healthcare');
      await user.click(healthcareButton);
      
      // Verify content switches
      await waitFor(() => {
        const healthcareIndustry = INDUSTRIES.find(i => i.id === 'healthcare')!;
        expect(screen.getByText(healthcareIndustry.description)).toBeInTheDocument();
      });
      
      // Verify analytics tracking for content switch
      expect(mockAnalytics.trackEngagement).toHaveBeenCalledWith(
        'content_switch',
        'industry_variants',
        expect.any(Number),
        expect.objectContaining({
          from_industry: 'aviation',
          to_industry: 'healthcare',
        })
      );
    });

    test('maintains layout consistency across industry switches', async () => {
      const user = userEvent.setup();
      
      const TestIndustrySection = () => {
        const [selectedIndustry, setSelectedIndustry] = React.useState('aviation');
        
        return (
          <IndustryVariantsSection
            industries={INDUSTRIES}
            selectedIndustry={selectedIndustry}
            onIndustrySelect={setSelectedIndustry}
          />
        );
      };
      
      render(<TestIndustrySection />);
      
      // Get initial layout measurements
      const initialContainer = screen.getByRole('region', { name: /industry variants/i });
      const initialHeight = initialContainer.getBoundingClientRect().height;
      
      // Switch industries multiple times
      for (const industry of INDUSTRIES) {
        const industryButton = screen.getByText(industry.name);
        await user.click(industryButton);
        
        await waitFor(() => {
          expect(screen.getByText(industry.description)).toBeInTheDocument();
        });
        
        // Verify layout remains consistent
        const currentContainer = screen.getByRole('region', { name: /industry variants/i });
        expect(currentContainer).toBeInTheDocument();
        
        // Verify all required elements are present
        expect(screen.getByText(industry.name)).toBeInTheDocument();
        expect(screen.getByText(industry.description)).toBeInTheDocument();
      }
    });

    test('case study display works correctly across industries', async () => {
      const user = userEvent.setup();
      
      const TestIndustrySection = () => {
        const [selectedIndustry, setSelectedIndustry] = React.useState('aviation');
        
        return (
          <IndustryVariantsSection
            industries={INDUSTRIES}
            selectedIndustry={selectedIndustry}
            onIndustrySelect={setSelectedIndustry}
            showCaseStudies={true}
          />
        );
      };
      
      render(<TestIndustrySection />);
      
      // Test each industry's case studies
      for (const industry of INDUSTRIES) {
        const industryButton = screen.getByText(industry.name);
        await user.click(industryButton);
        
        await waitFor(() => {
          // Verify case studies are displayed
          industry.caseStudies.forEach(caseStudy => {
            expect(screen.getByText(caseStudy.title)).toBeInTheDocument();
            expect(screen.getByText(caseStudy.description)).toBeInTheDocument();
            
            // Verify results are displayed
            caseStudy.results.forEach(result => {
              expect(screen.getByText(result)).toBeInTheDocument();
            });
          });
        });
      }
    });
  });

  describe('Industry-Specific Services Integration', () => {
    test('services update correctly when industry changes', async () => {
      const user = userEvent.setup();
      
      const TestIndustrySection = () => {
        const [selectedIndustry, setSelectedIndustry] = React.useState('aviation');
        
        return (
          <IndustryVariantsSection
            industries={INDUSTRIES}
            selectedIndustry={selectedIndustry}
            onIndustrySelect={setSelectedIndustry}
            showServices={true}
          />
        );
      };
      
      render(<TestIndustrySection />);
      
      // Verify aviation services are shown initially
      const aviationIndustry = INDUSTRIES.find(i => i.id === 'aviation')!;
      aviationIndustry.specificServices.forEach(service => {
        expect(screen.getByText(service)).toBeInTheDocument();
      });
      
      // Switch to financial services
      const financialButton = screen.getByText('Financial Services');
      await user.click(financialButton);
      
      await waitFor(() => {
        const financialIndustry = INDUSTRIES.find(i => i.id === 'financial')!;
        
        // Verify financial services are now shown
        financialIndustry.specificServices.forEach(service => {
          expect(screen.getByText(service)).toBeInTheDocument();
        });
        
        // Verify aviation services are no longer shown
        aviationIndustry.specificServices.forEach(service => {
          expect(screen.queryByText(service)).not.toBeInTheDocument();
        });
      });
    });

    test('compliance requirements update with industry selection', async () => {
      const user = userEvent.setup();
      
      const TestIndustrySection = () => {
        const [selectedIndustry, setSelectedIndustry] = React.useState('healthcare');
        
        return (
          <IndustryVariantsSection
            industries={INDUSTRIES}
            selectedIndustry={selectedIndustry}
            onIndustrySelect={setSelectedIndustry}
            showCompliance={true}
          />
        );
      };
      
      render(<TestIndustrySection />);
      
      // Verify healthcare compliance requirements
      const healthcareIndustry = INDUSTRIES.find(i => i.id === 'healthcare')!;
      healthcareIndustry.complianceRequirements.forEach(requirement => {
        expect(screen.getByText(requirement)).toBeInTheDocument();
      });
      
      // Switch to public sector
      const publicSectorButton = screen.getByText('Public Sector');
      await user.click(publicSectorButton);
      
      await waitFor(() => {
        const publicSectorIndustry = INDUSTRIES.find(i => i.id === 'public-sector')!;
        
        // Verify public sector compliance requirements are shown
        publicSectorIndustry.complianceRequirements.forEach(requirement => {
          expect(screen.getByText(requirement)).toBeInTheDocument();
        });
      });
    });
  });

  describe('Performance and Accessibility', () => {
    test('industry switching is performant with large datasets', async () => {
      const user = userEvent.setup();
      
      // Create a large dataset to test performance
      const largeIndustryDataset = Array.from({ length: 20 }, (_, i) => ({
        id: `industry-${i}`,
        name: `Industry ${i}`,
        description: `Description for industry ${i}`,
        icon: null,
        caseStudies: Array.from({ length: 5 }, (_, j) => ({
          id: `case-${i}-${j}`,
          title: `Case Study ${j}`,
          description: `Case study description ${j}`,
          industry: `industry-${i}`,
          results: [`Result ${j}A`, `Result ${j}B`],
        })),
        specificServices: [`Service ${i}A`, `Service ${i}B`],
        complianceRequirements: [`Requirement ${i}A`],
      }));
      
      const TestLargeIndustrySection = () => {
        const [selectedIndustry, setSelectedIndustry] = React.useState('industry-0');
        
        return (
          <IndustryVariantsSection
            industries={largeIndustryDataset}
            selectedIndustry={selectedIndustry}
            onIndustrySelect={setSelectedIndustry}
          />
        );
      };
      
      const startTime = performance.now();
      render(<TestLargeIndustrySection />);
      const renderTime = performance.now() - startTime;
      
      // Verify initial render is reasonably fast (< 100ms)
      expect(renderTime).toBeLessThan(100);
      
      // Test switching performance
      const switchStartTime = performance.now();
      const industryButton = screen.getByText('Industry 5');
      await user.click(industryButton);
      
      await waitFor(() => {
        expect(screen.getByText('Description for industry 5')).toBeInTheDocument();
      });
      
      const switchTime = performance.now() - switchStartTime;
      
      // Verify switching is reasonably fast (< 50ms)
      expect(switchTime).toBeLessThan(50);
    });

    test('industry switching maintains accessibility', async () => {
      const user = userEvent.setup();
      
      const TestIndustrySection = () => {
        const [selectedIndustry, setSelectedIndustry] = React.useState('aviation');
        
        return (
          <IndustryVariantsSection
            industries={INDUSTRIES}
            selectedIndustry={selectedIndustry}
            onIndustrySelect={setSelectedIndustry}
          />
        );
      };
      
      render(<TestIndustrySection />);
      
      // Verify ARIA attributes are correct
      const aviationButton = screen.getByText('Aviation');
      expect(aviationButton).toHaveAttribute('aria-selected', 'true');
      expect(aviationButton).toHaveAttribute('role', 'tab');
      
      // Test keyboard navigation
      const healthcareButton = screen.getByText('Healthcare');
      healthcareButton.focus();
      expect(healthcareButton).toHaveFocus();
      
      // Test Enter key activation
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(healthcareButton).toHaveAttribute('aria-selected', 'true');
        expect(aviationButton).toHaveAttribute('aria-selected', 'false');
      });
      
      // Verify content is properly labeled
      const contentRegion = screen.getByRole('region');
      expect(contentRegion).toHaveAttribute('aria-label');
    });

    test('industry content is properly announced to screen readers', async () => {
      const user = userEvent.setup();
      
      const TestIndustrySection = () => {
        const [selectedIndustry, setSelectedIndustry] = React.useState('aviation');
        
        return (
          <IndustryVariantsSection
            industries={INDUSTRIES}
            selectedIndustry={selectedIndustry}
            onIndustrySelect={setSelectedIndustry}
          />
        );
      };
      
      render(<TestIndustrySection />);
      
      // Switch industry
      const healthcareButton = screen.getByText('Healthcare');
      await user.click(healthcareButton);
      
      await waitFor(() => {
        // Verify content has proper headings for screen readers
        const industryHeading = screen.getByRole('heading', { name: /Healthcare/i });
        expect(industryHeading).toBeInTheDocument();
        
        // Verify content structure is semantic
        const caseStudyHeadings = screen.getAllByRole('heading', { level: 3 });
        expect(caseStudyHeadings.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling', () => {
    test('handles invalid industry selection gracefully', async () => {
      const user = userEvent.setup();
      const mockOnSelect = jest.fn();
      
      render(
        <IndustrySelector
          industries={INDUSTRIES}
          selectedIndustry="invalid-industry"
          onIndustrySelect={mockOnSelect}
        />
      );
      
      // Should still render all industries
      INDUSTRIES.forEach(industry => {
        expect(screen.getByText(industry.name)).toBeInTheDocument();
      });
      
      // No industry should be marked as selected
      const industryButtons = screen.getAllByRole('tab');
      industryButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-selected', 'false');
      });
    });

    test('handles missing industry data gracefully', () => {
      const incompleteIndustries = [
        {
          id: 'incomplete',
          name: 'Incomplete Industry',
          description: '',
          icon: null,
          caseStudies: [],
          specificServices: [],
          complianceRequirements: [],
        },
      ];
      
      const mockOnSelect = jest.fn();
      
      render(
        <IndustrySelector
          industries={incompleteIndustries}
          selectedIndustry="incomplete"
          onIndustrySelect={mockOnSelect}
        />
      );
      
      // Should still render the industry
      expect(screen.getByText('Incomplete Industry')).toBeInTheDocument();
    });
  });
});