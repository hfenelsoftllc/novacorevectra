/**
 * Integration tests for compliance page functionality
 * Tests ISO 42001 compliance mapping, clause interactions, and documentation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComplianceSection } from '../../components/sections/ComplianceSection';
import GovernancePage from '../../../app/governance/page';
import { ISO_42001_FRAMEWORK } from '../../constants/compliance';
import { SERVICES } from '../../constants/services';
import { useAnalytics } from '../../hooks/useAnalytics';

// Mock analytics hook
jest.mock('../../hooks/useAnalytics', () => ({
  useAnalytics: jest.fn(),
}));

// Mock performance hook
jest.mock('../../hooks/usePerformance', () => ({
  usePerformance: () => ({
    calculateAnimationDelay: (index: number) => index * 0.1,
    prefersReducedMotion: false,
  }),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('Compliance Functionality Integration Tests', () => {
  const mockAnalytics = {
    trackEvent: jest.fn(),
    trackEngagement: jest.fn(),
    trackConversionEvent: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAnalytics as jest.Mock).mockReturnValue(mockAnalytics);
  });

  describe('Compliance Section Rendering', () => {
    test('renders all ISO 42001 clauses correctly', () => {
      render(<ComplianceSection />);
      
      // Verify section header
      expect(screen.getByText(/Trust & Compliance/i)).toBeInTheDocument();
      expect(screen.getByText(/ISO\/IEC 42001:2023/i)).toBeInTheDocument();
      
      // Verify all clauses are rendered
      ISO_42001_FRAMEWORK.clauses.forEach(clause => {
        expect(screen.getByText(clause.title)).toBeInTheDocument();
        expect(screen.getByText(`Clause ${clause.clauseNumber}`)).toBeInTheDocument();
        expect(screen.getByText(clause.description)).toBeInTheDocument();
      });
      
      // Verify certification badge
      expect(screen.getByText(/Certified/i)).toBeInTheDocument();
    });

    test('displays compliance framework information correctly', () => {
      render(<ComplianceSection framework={ISO_42001_FRAMEWORK} />);
      
      // Verify framework details
      expect(screen.getByText(ISO_42001_FRAMEWORK.name)).toBeInTheDocument();
      expect(screen.getByText(`(${ISO_42001_FRAMEWORK.version})`)).toBeInTheDocument();
      
      if (ISO_42001_FRAMEWORK.certificationLevel) {
        expect(screen.getByText(ISO_42001_FRAMEWORK.certificationLevel)).toBeInTheDocument();
      }
    });

    test('shows audit-ready documentation section', () => {
      render(<ComplianceSection showDownloadLinks={true} />);
      
      // Verify documentation section
      expect(screen.getByText(/Audit-Ready Documentation/i)).toBeInTheDocument();
      expect(screen.getByText(/comprehensive documentation, audit trails/i)).toBeInTheDocument();
      
      // Verify download links
      expect(screen.getByText(/Compliance Overview/i)).toBeInTheDocument();
      expect(screen.getByText(/Audit Checklist/i)).toBeInTheDocument();
    });
  });

  describe('Clause Interaction Functionality', () => {
    test('clause expansion and collapse works correctly', async () => {
      const user = userEvent.setup();
      
      render(<ComplianceSection />);
      
      // Find first clause
      const firstClause = ISO_42001_FRAMEWORK.clauses[0];
      const clauseCard = screen.getByText(firstClause.title).closest('[role="region"]') || 
                        screen.getByText(firstClause.title).closest('div');
      
      // Verify clause is initially collapsed
      expect(screen.queryByText('Requirements')).not.toBeInTheDocument();
      
      // Find and click expand button
      const expandButton = screen.getByLabelText(`Expand details for ${firstClause.title}`);
      await user.click(expandButton);
      
      // Verify clause expands
      await waitFor(() => {
        expect(screen.getByText('Requirements')).toBeInTheDocument();
        
        // Verify requirements are displayed
        firstClause.requirements.forEach(requirement => {
          expect(screen.getByText(requirement)).toBeInTheDocument();
        });
      });
      
      // Verify analytics tracking
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'clause_interaction',
          category: 'compliance',
          action: 'expand_clause',
          label: firstClause.id,
        })
      );
      
      // Click collapse button
      const collapseButton = screen.getByLabelText(`Collapse details for ${firstClause.title}`);
      await user.click(collapseButton);
      
      // Verify clause collapses
      await waitFor(() => {
        expect(screen.queryByText('Requirements')).not.toBeInTheDocument();
      });
    });

    test('multiple clauses can be expanded simultaneously', async () => {
      const user = userEvent.setup();
      
      render(<ComplianceSection />);
      
      // Expand first two clauses
      const firstClause = ISO_42001_FRAMEWORK.clauses[0];
      const secondClause = ISO_42001_FRAMEWORK.clauses[1];
      
      const firstExpandButton = screen.getByLabelText(`Expand details for ${firstClause.title}`);
      const secondExpandButton = screen.getByLabelText(`Expand details for ${secondClause.title}`);
      
      await user.click(firstExpandButton);
      await user.click(secondExpandButton);
      
      // Verify both clauses are expanded
      await waitFor(() => {
        // Should see requirements sections for both clauses
        const requirementsSections = screen.getAllByText('Requirements');
        expect(requirementsSections).toHaveLength(2);
        
        // Verify specific requirements from both clauses
        firstClause.requirements.forEach(requirement => {
          expect(screen.getByText(requirement)).toBeInTheDocument();
        });
        
        secondClause.requirements.forEach(requirement => {
          expect(screen.getByText(requirement)).toBeInTheDocument();
        });
      });
    });

    test('keyboard navigation works for clause interaction', async () => {
      const user = userEvent.setup();
      
      render(<ComplianceSection />);
      
      const firstClause = ISO_42001_FRAMEWORK.clauses[0];
      const expandButton = screen.getByLabelText(`Expand details for ${firstClause.title}`);
      
      // Focus and activate with keyboard
      expandButton.focus();
      expect(expandButton).toHaveFocus();
      
      await user.keyboard('{Enter}');
      
      // Verify clause expands
      await waitFor(() => {
        expect(screen.getByText('Requirements')).toBeInTheDocument();
      });
    });
  });

  describe('Service Mapping Integration', () => {
    test('displays mapped services correctly for each clause', async () => {
      const user = userEvent.setup();
      
      render(<ComplianceSection />);
      
      // Test each clause's service mapping
      for (const clause of ISO_42001_FRAMEWORK.clauses) {
        const expandButton = screen.getByLabelText(`Expand details for ${clause.title}`);
        await user.click(expandButton);
        
        await waitFor(() => {
          if (clause.mappedServices.length > 0) {
            expect(screen.getByText('Mapped Services')).toBeInTheDocument();
            
            // Verify mapped services are displayed
            clause.mappedServices.forEach(serviceId => {
              const service = SERVICES.find(s => s.id === serviceId);
              if (service) {
                expect(screen.getByText(service.title)).toBeInTheDocument();
              }
            });
          }
        });
        
        // Collapse clause before testing next one
        const collapseButton = screen.getByLabelText(`Collapse details for ${clause.title}`);
        await user.click(collapseButton);
        
        await waitFor(() => {
          expect(screen.queryByText('Mapped Services')).not.toBeInTheDocument();
        });
      }
    });

    test('handles missing service mappings gracefully', async () => {
      const user = userEvent.setup();
      
      // Create a clause with invalid service mappings
      const testFramework = {
        ...ISO_42001_FRAMEWORK,
        clauses: [
          {
            ...ISO_42001_FRAMEWORK.clauses[0],
            mappedServices: ['invalid-service-id', 'another-invalid-id'],
          },
        ],
      };
      
      render(<ComplianceSection framework={testFramework} />);
      
      const expandButton = screen.getByLabelText(`Expand details for ${testFramework.clauses[0].title}`);
      await user.click(expandButton);
      
      await waitFor(() => {
        // Should still show the section but handle missing services gracefully
        expect(screen.getByText('Requirements')).toBeInTheDocument();
        // The component should not crash and should handle missing services
      });
    });

    test('service mapping completeness across all clauses', () => {
      render(<ComplianceSection />);
      
      // Verify that all clauses have service mappings
      ISO_42001_FRAMEWORK.clauses.forEach(clause => {
        expect(clause.mappedServices).toBeDefined();
        expect(Array.isArray(clause.mappedServices)).toBe(true);
        
        // Each clause should have at least one mapped service
        expect(clause.mappedServices.length).toBeGreaterThan(0);
        
        // Verify mapped services exist in SERVICES constant
        clause.mappedServices.forEach(serviceId => {
          const service = SERVICES.find(s => s.id === serviceId);
          expect(service).toBeDefined();
        });
      });
    });
  });

  describe('Documentation Download Functionality', () => {
    test('documentation download links work correctly', async () => {
      const user = userEvent.setup();
      
      render(<ComplianceSection showDownloadLinks={true} />);
      
      // Test clause-specific documentation
      const firstClause = ISO_42001_FRAMEWORK.clauses[0];
      const expandButton = screen.getByLabelText(`Expand details for ${firstClause.title}`);
      await user.click(expandButton);
      
      await waitFor(() => {
        if (firstClause.documentationUrl) {
          const downloadButton = screen.getByLabelText(`Download documentation for ${firstClause.title}`);
          expect(downloadButton).toBeInTheDocument();
          expect(downloadButton).toHaveAttribute('href', firstClause.documentationUrl);
          expect(downloadButton).toHaveAttribute('download');
          expect(downloadButton).toHaveAttribute('target', '_blank');
        }
      });
      
      // Test general documentation downloads
      const complianceOverviewLink = screen.getByText(/Compliance Overview/i).closest('a');
      const auditChecklistLink = screen.getByText(/Audit Checklist/i).closest('a');
      
      expect(complianceOverviewLink).toHaveAttribute('href', '/docs/compliance-overview.pdf');
      expect(auditChecklistLink).toHaveAttribute('href', '/docs/audit-checklist.pdf');
      
      // Test download tracking
      await user.click(complianceOverviewLink!);
      
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'document_download',
          category: 'compliance',
          action: 'download',
          label: 'compliance-overview',
        })
      );
    });

    test('download links can be disabled', () => {
      render(<ComplianceSection showDownloadLinks={false} />);
      
      // Verify download links are not shown
      expect(screen.queryByText(/Compliance Overview/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Audit Checklist/i)).not.toBeInTheDocument();
    });
  });

  describe('Full Governance Page Integration', () => {
    test('governance page renders compliance section correctly', () => {
      render(<GovernancePage />);
      
      // Verify page structure
      expect(screen.getByText(/AI Governance & Compliance/i)).toBeInTheDocument();
      expect(screen.getByText(/comprehensive governance framework/i)).toBeInTheDocument();
      
      // Verify compliance section is present
      expect(screen.getByText(/Trust & Compliance/i)).toBeInTheDocument();
      
      // Verify CTA section is present
      expect(screen.getByText(/Download Our AI Governance Guide/i)).toBeInTheDocument();
    });

    test('page navigation and compliance interaction work together', async () => {
      const user = userEvent.setup();
      
      render(<GovernancePage />);
      
      // Interact with compliance section
      const firstClause = ISO_42001_FRAMEWORK.clauses[0];
      const expandButton = screen.getByLabelText(`Expand details for ${firstClause.title}`);
      await user.click(expandButton);
      
      // Verify compliance interaction works within page context
      await waitFor(() => {
        expect(screen.getByText('Requirements')).toBeInTheDocument();
      });
      
      // Interact with CTA section
      const ctaButton = screen.getByText(/Download Our AI Governance Guide/i);
      expect(ctaButton).toBeInTheDocument();
      
      // Verify page maintains state during interactions
      expect(screen.getByText('Requirements')).toBeInTheDocument();
    });
  });

  describe('Performance and Accessibility', () => {
    test('compliance section loads performantly with all clauses', () => {
      const startTime = performance.now();
      render(<ComplianceSection />);
      const renderTime = performance.now() - startTime;
      
      // Verify render time is reasonable (< 100ms)
      expect(renderTime).toBeLessThan(100);
      
      // Verify all clauses are rendered
      expect(ISO_42001_FRAMEWORK.clauses.length).toBeGreaterThan(0);
      ISO_42001_FRAMEWORK.clauses.forEach(clause => {
        expect(screen.getByText(clause.title)).toBeInTheDocument();
      });
    });

    test('compliance section is accessible', async () => {
      const user = userEvent.setup();
      
      render(<ComplianceSection />);
      
      // Verify semantic structure
      expect(screen.getByRole('region', { name: /compliance and trust information/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Trust & Compliance/i })).toBeInTheDocument();
      
      // Verify clause cards have proper ARIA attributes
      const firstClause = ISO_42001_FRAMEWORK.clauses[0];
      const expandButton = screen.getByLabelText(`Expand details for ${firstClause.title}`);
      
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');
      
      // Test keyboard navigation
      expandButton.focus();
      expect(expandButton).toHaveFocus();
      
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(expandButton).toHaveAttribute('aria-expanded', 'true');
      });
    });

    test('compliance content is properly structured for screen readers', () => {
      render(<ComplianceSection />);
      
      // Verify heading hierarchy
      const mainHeading = screen.getByRole('heading', { level: 2, name: /Trust & Compliance/i });
      expect(mainHeading).toBeInTheDocument();
      
      const subHeading = screen.getByRole('heading', { level: 3, name: /Compliance Framework Mapping/i });
      expect(subHeading).toBeInTheDocument();
      
      // Verify list structure
      const clausesList = screen.getByRole('list', { name: /List of compliance clauses/i });
      expect(clausesList).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles missing compliance framework gracefully', () => {
      const emptyFramework = {
        id: 'empty',
        name: 'Empty Framework',
        version: '1.0',
        clauses: [],
      };
      
      render(<ComplianceSection framework={emptyFramework} />);
      
      // Should still render basic structure
      expect(screen.getByText(/Trust & Compliance/i)).toBeInTheDocument();
      expect(screen.getByText('Empty Framework')).toBeInTheDocument();
      
      // Should handle empty clauses gracefully
      expect(screen.getByText(/Compliance Framework Mapping/i)).toBeInTheDocument();
    });

    test('handles malformed clause data gracefully', () => {
      const malformedFramework = {
        ...ISO_42001_FRAMEWORK,
        clauses: [
          {
            id: 'malformed',
            clauseNumber: '',
            title: '',
            description: '',
            requirements: [],
            mappedServices: [],
          },
        ],
      };
      
      render(<ComplianceSection framework={malformedFramework} />);
      
      // Should not crash and should render what it can
      expect(screen.getByText(/Trust & Compliance/i)).toBeInTheDocument();
    });

    test('handles network errors for documentation downloads gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock fetch to simulate network error
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      
      render(<ComplianceSection showDownloadLinks={true} />);
      
      const downloadLink = screen.getByText(/Compliance Overview/i).closest('a');
      await user.click(downloadLink!);
      
      // Should track the attempt even if download fails
      expect(mockAnalytics.trackEvent).toHaveBeenCalled();
      
      // Restore original fetch
      global.fetch = originalFetch;
    });
  });
});