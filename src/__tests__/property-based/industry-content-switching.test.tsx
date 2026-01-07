import * as fc from 'fast-check';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { IndustryVariantsSection } from '../../components/sections/IndustryVariantsSection';
import { IndustrySelector } from '../../components/industry/IndustrySelector';
import { IndustryContent } from '../../components/industry/IndustryContent';
import { INDUSTRIES } from '../../constants/industries';

describe('Property 3: Industry Content Switching', () => {
  // Generator for valid industry IDs
  const industryIdArbitrary = fc.constantFrom(...INDUSTRIES.map(i => i.id));
  
  // Generator for industry subsets
  const industrySubsetArbitrary = fc.subarray(INDUSTRIES, { minLength: 1 });

  afterEach(() => {
    cleanup();
  });

  it('should display industry-specific content for any selected industry', () => {
    // Feature: full-marketing-site, Property 3: Industry Content Switching
    fc.assert(
      fc.property(industryIdArbitrary, (selectedIndustryId) => {
        const selectedIndustry = INDUSTRIES.find(i => i.id === selectedIndustryId);
        if (!selectedIndustry) return true; // Skip if industry not found
        
        const { unmount } = render(
          <IndustryVariantsSection 
            industries={INDUSTRIES} 
            defaultIndustry={selectedIndustryId}
          />
        );
        
        // Verify industry-specific content is displayed
        expect(screen.getAllByText(`${selectedIndustry.name} Solutions`)[0]).toBeInTheDocument();
        expect(screen.getByText(selectedIndustry.description)).toBeInTheDocument();
        
        // Verify industry-specific services are shown
        selectedIndustry.specificServices.forEach(service => {
          expect(screen.getByText(service.title)).toBeInTheDocument();
        });
        
        // Verify case studies are shown if they exist
        selectedIndustry.caseStudies.forEach(caseStudy => {
          expect(screen.getAllByText(caseStudy.title)[0]).toBeInTheDocument();
        });
        
        // Verify compliance requirements are shown if they exist
        if (selectedIndustry.complianceRequirements.length > 0) {
          selectedIndustry.complianceRequirements.forEach(requirement => {
            expect(screen.getByText(requirement)).toBeInTheDocument();
          });
        }
        
        unmount();
        return true;
      }),
      { numRuns: 20 }
    );
  });

  it('should maintain consistent layout across all industry variants', () => {
    // Feature: full-marketing-site, Property 3: Industry Content Switching
    fc.assert(
      fc.property(industrySubsetArbitrary, (industries) => {
        if (industries.length === 0) return true;
        
        industries.forEach(industry => {
          const { unmount } = render(
            <IndustryContent industry={industry} />
          );
          
          // Verify consistent structure elements exist
          expect(screen.getAllByText(`${industry.name} Solutions`)[0]).toBeInTheDocument();
          expect(screen.getByText(industry.description)).toBeInTheDocument();
          expect(screen.getByText(`Specialized Services for ${industry.name}`)).toBeInTheDocument();
          
          // Verify services section exists
          industry.specificServices.forEach(service => {
            expect(screen.getByText(service.title)).toBeInTheDocument();
            expect(screen.getByText(service.description)).toBeInTheDocument();
          });
          
          // Verify case studies section exists if there are case studies
          if (industry.caseStudies.length > 0) {
            expect(screen.getByText('Success Stories')).toBeInTheDocument();
          }
          
          // Verify compliance section exists if there are compliance requirements
          if (industry.complianceRequirements.length > 0) {
            expect(screen.getByText('Compliance & Standards')).toBeInTheDocument();
          }
          
          // Clean up for next iteration
          unmount();
        });
        
        return true;
      }),
      { numRuns: 20 }
    );
  });

  it('should provide easy switching between industry variants', () => {
    // Feature: full-marketing-site, Property 3: Industry Content Switching
    fc.assert(
      fc.property(industrySubsetArbitrary, (industries) => {
        if (industries.length < 2) return true; // Need at least 2 industries to test switching
        
        const mockOnSelect = jest.fn();
        const { unmount } = render(
          <IndustrySelector 
            industries={industries}
            selectedIndustry={industries[0]?.id || 'default'}
            onIndustrySelect={mockOnSelect}
          />
        );
        
        // Verify all industry buttons are present and clickable
        industries.forEach(industry => {
          const buttons = screen.getAllByRole('tab', { name: new RegExp(industry.name, 'i') });
          const button = buttons[0]; // Use first match to avoid duplicates
          expect(button).toBeInTheDocument();
          expect(button).toBeEnabled();
          
          // Test clicking the button
          if (button) {
            fireEvent.click(button);
          }
          expect(mockOnSelect).toHaveBeenCalledWith(industry.id);
        });
        
        // Verify proper ARIA attributes for accessibility
        const selectedButtons = screen.getAllByRole('tab', { name: new RegExp(industries[0]?.name || 'default', 'i') });
        expect(selectedButtons[0]).toHaveAttribute('aria-selected', 'true');
        
        unmount();
        return true;
      }),
      { numRuns: 20 }
    );
  });

  it('should show relevant case studies for each industry', () => {
    // Feature: full-marketing-site, Property 3: Industry Content Switching
    fc.assert(
      fc.property(industryIdArbitrary, (industryId) => {
        const industry = INDUSTRIES.find(i => i.id === industryId);
        if (!industry || industry.caseStudies.length === 0) return true;
        
        const { unmount } = render(<IndustryContent industry={industry} />);
        
        // Verify each case study is displayed with correct industry association
        industry.caseStudies.forEach(caseStudy => {
          expect(caseStudy.industry).toBe(industryId);
          expect(screen.getAllByText(caseStudy.title)[0]).toBeInTheDocument();
          expect(screen.getByText(caseStudy.description)).toBeInTheDocument();
          
          // Verify results are displayed
          caseStudy.results.forEach(result => {
            expect(screen.getByText(result)).toBeInTheDocument();
          });
        });
        
        unmount();
        return true;
      }),
      { numRuns: 20 }
    );
  });

  it('should handle industry switching in complete workflow', () => {
    // Feature: full-marketing-site, Property 3: Industry Content Switching
    fc.assert(
      fc.property(
        fc.tuple(industryIdArbitrary, industryIdArbitrary),
        ([initialIndustry, switchToIndustry]) => {
          if (initialIndustry === switchToIndustry) return true; // Skip same industry
          
          const { unmount } = render(
            <IndustryVariantsSection 
              industries={INDUSTRIES}
              defaultIndustry={initialIndustry}
            />
          );
          
          const initialIndustryData = INDUSTRIES.find(i => i.id === initialIndustry);
          const switchToIndustryData = INDUSTRIES.find(i => i.id === switchToIndustry);
          
          if (!initialIndustryData || !switchToIndustryData) {
            unmount();
            return true;
          }
          
          // Verify initial industry content is displayed
          expect(screen.getAllByText(`${initialIndustryData.name} Solutions`)[0]).toBeInTheDocument();
          
          // Switch to different industry
          const switchButtons = screen.getAllByRole('tab', { name: new RegExp(switchToIndustryData.name, 'i') });
          if (switchButtons[0]) {
            fireEvent.click(switchButtons[0]);
          }
          
          // Verify new industry content is displayed
          expect(screen.getAllByText(`${switchToIndustryData.name} Solutions`)[0]).toBeInTheDocument();
          expect(screen.getByText(switchToIndustryData.description)).toBeInTheDocument();
          
          // Verify old industry content is no longer displayed (if descriptions are different)
          if (initialIndustryData.description !== switchToIndustryData.description) {
            expect(screen.queryByText(initialIndustryData.description)).not.toBeInTheDocument();
          }
          
          unmount();
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });
});
